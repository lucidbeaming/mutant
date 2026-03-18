import ffmpeg from 'fluent-ffmpeg'
import { dirname } from 'path'
import { mkdir } from 'fs/promises'
import type { OutputConfig } from '../../shared/types'

export interface VideoProgressCallback {
  (percent: number): void
}

export async function processVideo(
  inputPath: string,
  outputPath: string,
  config: OutputConfig,
  onProgress?: VideoProgressCallback
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath)

    // Build video filters
    const filters: string[] = []

    if (config.resize.enabled) {
      const { width, height, fitMode, zoom } = config.resize

      if (zoom > 1.0) {
        // Scale up by zoom, then crop to target
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
        // cover
        filters.push(
          `scale=${width}:${height}:force_original_aspect_ratio=increase`,
          `crop=${width}:${height}`
        )
      }
    }

    // Color space
    if (config.colorSpace.enabled) {
      const cs = config.colorSpace.value
      if (cs === 'bt709') {
        filters.push('colorspace=bt709:iall=bt601-6-625:fast=1')
      } else if (cs === 'bt2020') {
        filters.push('colorspace=bt2020nc:iall=bt709:fast=1')
      }
    }

    if (filters.length > 0) {
      cmd = cmd.videoFilters(filters)
    }

    // Format and codec
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

    cmd
      .on('progress', (progress) => {
        if (onProgress) {
          const pct = typeof progress.percent === 'number' && !isNaN(progress.percent)
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
