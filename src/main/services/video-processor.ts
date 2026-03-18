import ffmpeg from 'fluent-ffmpeg'
import { dirname, join } from 'path'
import { mkdir, writeFile, rm } from 'fs/promises'
import { tmpdir } from 'os'
import type { OutputConfig } from '../../shared/types'

export interface VideoProgressCallback {
  (percent: number): void
}

function buildBaseFilters(config: OutputConfig): string[] {
  const filters: string[] = []

  if (config.resize.enabled) {
    const { width, height, fitMode, zoom } = config.resize

    if (zoom > 1.0) {
      const zoomedW = Math.round(width * zoom)
      const zoomedH = Math.round(height * zoom)
      filters.push(`scale=${zoomedW}:${zoomedH}:force_original_aspect_ratio=increase`)
      filters.push(`crop=${width}:${height}`)
    } else if (fitMode === 'fit') {
      filters.push(
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`
      )
    } else {
      filters.push(
        `scale=${width}:${height}:force_original_aspect_ratio=increase`,
        `crop=${width}:${height}`
      )
    }
  }

  if (config.colorSpace.enabled) {
    const cs = config.colorSpace.value
    if (cs === 'bt709') {
      filters.push('colorspace=bt709:iall=bt601-6-625:fast=1')
    } else if (cs === 'bt2020') {
      filters.push('colorspace=bt2020nc:iall=bt709:fast=1')
    }
  }

  return filters
}

function needsComplexFilter(config: OutputConfig): boolean {
  if (!config.glitch?.enabled) return false
  return config.glitch.effect === 'displacement' || config.glitch.effect === 'motion-vectors'
}

function buildComplexFilterGraph(config: OutputConfig, baseFilters: string[]): string {
  const glitch = config.glitch
  const baseChain = baseFilters.length > 0 ? baseFilters.join(',') : null

  switch (glitch.effect) {
    case 'displacement': {
      const blur = Math.max(1, Math.round(1 + (glitch.intensity / 10) * 15))
      const parts: string[] = []
      if (baseChain) {
        parts.push(`[0:v]${baseChain}[base]`)
        parts.push(`[base]split=3[src][xmap][ymap]`)
      } else {
        parts.push(`[0:v]split=3[src][xmap][ymap]`)
      }
      parts.push(`[xmap]boxblur=${blur}[xm]`)
      parts.push(`[ymap]negate,boxblur=${blur}[ym]`)
      parts.push(`[src][xm][ym]displace=edge=wrap[displaced]`)
      parts.push(`[displaced]stereo3d=abl:mr[out]`)
      return parts.join(';')
    }

    case 'motion-vectors': {
      const contrast = 3 + (glitch.intensity / 10) * 7
      const brightness = -0.1 - (glitch.intensity / 10) * 0.3
      const parts: string[] = []
      if (baseChain) {
        parts.push(`[0:v]${baseChain}[base]`)
        parts.push(`[base]split[original][forcodec]`)
      } else {
        parts.push(`[0:v]split[original][forcodec]`)
      }
      parts.push(`[forcodec]codecview=mv=pf+bf+bb[vectors]`)
      parts.push(
        `[vectors][original]blend=all_mode=difference128,eq=contrast=${contrast.toFixed(1)}:brightness=${brightness.toFixed(1)}[out]`
      )
      return parts.join(';')
    }

    default:
      return ''
  }
}

function buildAtempoChain(factor: number): string[] {
  const filters: string[] = []
  let remaining = factor
  while (remaining > 2.0) {
    filters.push('atempo=2.0')
    remaining /= 2.0
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5')
    remaining /= 0.5
  }
  filters.push(`atempo=${remaining.toFixed(4)}`)
  return filters
}

function applyCodecSettings(cmd: ffmpeg.FfmpegCommand, config: OutputConfig): ffmpeg.FfmpegCommand {
  switch (config.format) {
    case 'h264-web':
      cmd = cmd
        .format('mp4')
        .videoCodec('libx264')
        .outputOptions(['-movflags', '+faststart', '-crf', '23', '-preset', 'medium'])
        .audioCodec('aac')
      break
    case 'prores':
      {
        const profileMap: Record<string, string> = {
          proxy: '0',
          lt: '1',
          '422': '2',
          '422hq': '3',
          '4444': '4'
        }
        const profile = profileMap[config.proresProfile || '422'] || '2'
        cmd = cmd
          .format('mov')
          .videoCodec('prores_ks')
          .outputOptions(['-profile:v', profile])
          .audioCodec('pcm_s16le')
      }
      break
    case 'webm':
      cmd = cmd.format('webm').videoCodec('libvpx-vp9').audioCodec('libopus')
      break
    case 'mov-h264':
      cmd = cmd.format('mov').videoCodec('libx264').audioCodec('aac')
      break
  }
  return cmd
}

function attachProgressAndRun(
  cmd: ffmpeg.FfmpegCommand,
  outputPath: string,
  onProgress?: VideoProgressCallback
): Promise<void> {
  return new Promise((resolve, reject) => {
    cmd
      .on('progress', (progress) => {
        if (onProgress) {
          const pct =
            typeof progress.percent === 'number' && !isNaN(progress.percent)
              ? progress.percent
              : 0
          onProgress(pct)
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

export async function processVideo(
  inputPath: string,
  outputPath: string,
  config: OutputConfig,
  onProgress?: VideoProgressCallback
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })

  let cmd = ffmpeg(inputPath)

  const baseFilters = buildBaseFilters(config)
  const useComplexFilter = needsComplexFilter(config)

  if (useComplexFilter) {
    if (config.glitch.effect === 'motion-vectors') {
      cmd = cmd.inputOptions(['-flags2', '+export_mvs'])
    }

    const graph = buildComplexFilterGraph(config, baseFilters)
    cmd = cmd.complexFilter(graph, 'out')
  } else {
    const filters = [...baseFilters]

    if (config.glitch?.enabled) {
      switch (config.glitch.effect) {
        case 'echo': {
          const frames = Math.round(3 + (config.glitch.intensity / 10) * 12)
          const weights = Array(frames).fill('1').join(' ')
          filters.push(`tmix=frames=${frames}:weights=${weights}`)
          break
        }
        case 'chromatic-aberration': {
          const offset = Math.round(2 + (config.glitch.intensity / 10) * 28)
          const vOffset = Math.round(offset / 3)
          filters.push(`rgbashift=rh=${-offset}:bh=${offset}:rv=${vOffset}:bv=${-vOffset}`)
          break
        }
      }
    }

    // Speed: setpts for video
    if (config.speed?.enabled && config.speed.factor !== 1) {
      const ptsFactor = 1 / config.speed.factor
      filters.push(`setpts=${ptsFactor.toFixed(6)}*PTS`)
    }

    if (filters.length > 0) {
      cmd = cmd.videoFilters(filters)
    }
  }

  // Speed: atempo chain for audio
  if (config.speed?.enabled && config.speed.factor !== 1) {
    const atempoFilters = buildAtempoChain(config.speed.factor)
    cmd = cmd.audioFilters(atempoFilters)
  }

  // Constant output framerate
  if (config.speed?.enabled && config.speed.outputFps > 0) {
    cmd = cmd.outputOptions(['-r', String(config.speed.outputFps)])
  }

  cmd = applyCodecSettings(cmd, config)

  return attachProgressAndRun(cmd, outputPath, onProgress)
}

export async function processImageSequence(
  imagePaths: string[],
  outputPath: string,
  config: OutputConfig,
  onProgress?: VideoProgressCallback
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })

  const seq = config.imageSequence
  const duration = seq.frameDuration

  // Build concat demuxer list file
  const tmpDir = join(tmpdir(), `mutant-seq-${Date.now()}`)
  await mkdir(tmpDir, { recursive: true })
  const listFile = join(tmpDir, 'list.txt')

  const lines: string[] = []
  for (const p of imagePaths) {
    const escaped = p.replace(/'/g, "'\\''" )
    lines.push(`file '${escaped}'`)
    lines.push(`duration ${duration}`)
  }
  // Concat demuxer requires repeating the last entry for it to get its full duration
  if (imagePaths.length > 0) {
    const lastEscaped = imagePaths[imagePaths.length - 1].replace(/'/g, "'\\''")
    lines.push(`file '${lastEscaped}'`)
  }
  await writeFile(listFile, lines.join('\n'))

  try {
    let cmd = ffmpeg()
      .input(listFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])

    // Build filters: resize + ensure even dimensions for encoding
    const filters = buildBaseFilters(config)

    // Ensure pixel format compatibility and even dimensions
    if (filters.length === 0) {
      // Even without resize, ensure dimensions are even for h264/vp9
      filters.push('scale=trunc(iw/2)*2:trunc(ih/2)*2')
    }

    cmd = cmd.videoFilters(filters)
    cmd = cmd.outputOptions(['-r', String(seq.outputFps), '-pix_fmt', 'yuv420p'])

    // No audio for image sequences
    cmd = cmd.noAudio()

    cmd = applyCodecSettings(cmd, config)

    await attachProgressAndRun(cmd, outputPath, onProgress)
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
