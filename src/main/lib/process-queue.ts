import { BrowserWindow } from 'electron'
import { join, basename, extname } from 'path'
import { access } from 'fs/promises'
import { processImage } from '../services/image-processor'
import { processVideo } from '../services/video-processor'
import type { MediaFile, OutputConfig, ProcessingProgress, FilenameOptions } from '../../shared/types'
import { IMAGE_FORMATS } from '../../shared/types'

let cancelled = false

export function cancelProcessing(): void {
  cancelled = true
}

function buildFilename(
  originalName: string,
  options: FilenameOptions,
  format: string,
  increment: number
): string {
  const base = basename(originalName, extname(originalName))

  const prependParts: string[] = []
  const appendParts: string[] = []

  // Custom text
  if (options.prepend) prependParts.push(options.prepend)
  if (options.append) appendParts.push(options.append)

  // Timestamp
  if (options.includeTimestamp) {
    const ts = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
    if (options.timestampPosition === 'prepend') {
      prependParts.unshift(ts)
    } else {
      appendParts.push(ts)
    }
  }

  // Increment
  if (options.includeIncrement) {
    const inc = String(increment).padStart(3, '0')
    if (options.incrementPosition === 'prepend') {
      prependParts.unshift(inc)
    } else {
      appendParts.push(inc)
    }
  }

  const prefix = prependParts.length > 0 ? prependParts.join('_') + '_' : ''
  const suffix = appendParts.length > 0 ? '_' + appendParts.join('_') : ''

  // Map format to file extension
  const extMap: Record<string, string> = {
    jpg: '.jpg',
    png: '.png',
    webp: '.webp',
    avif: '.avif',
    tiff: '.tiff',
    'h264-web': '.mp4',
    prores: '.mov',
    webm: '.webm',
    'mov-h264': '.mov'
  }
  const ext = extMap[format] || '.' + format

  return `${prefix}${base}${suffix}${ext}`
}

async function resolveCollision(outputPath: string): Promise<string> {
  let candidate = outputPath
  let counter = 1
  const ext = extname(outputPath)
  const base = outputPath.slice(0, -ext.length)

  while (true) {
    try {
      await access(candidate)
      candidate = `${base}_${counter}${ext}`
      counter++
    } catch {
      return candidate
    }
  }
}

export async function processQueue(
  files: MediaFile[],
  outputs: OutputConfig[],
  mainWindow: BrowserWindow
): Promise<void> {
  cancelled = false
  const totalOperations = files.length * outputs.length
  let completedOperations = 0
  let incrementCounter = 1
  const errors: ProcessingProgress['errors'] = []

  const sendProgress = (currentFile: string, currentOutput: string): void => {
    const progress: ProcessingProgress = {
      totalFiles: files.length,
      totalOutputs: outputs.length,
      completedOperations,
      totalOperations,
      currentFile,
      currentOutput,
      percent: totalOperations > 0 ? (completedOperations / totalOperations) * 100 : 0,
      errors
    }
    mainWindow.webContents.send('processing:progress', progress)
  }

  for (const file of files) {
    if (cancelled) break

    for (const output of outputs) {
      if (cancelled) break

      const filename = buildFilename(file.name, output.filename, output.format, incrementCounter)
      incrementCounter++

      const outputDir = output.outputDir || join(file.path, '..')
      let outputPath = join(outputDir, filename)
      outputPath = await resolveCollision(outputPath)

      sendProgress(file.name, `${output.format} → ${filename}`)

      try {
        const isImageOutput = IMAGE_FORMATS.includes(output.format)

        if (file.type === 'image' && isImageOutput) {
          await processImage(file.path, outputPath, output)
        } else if (file.type === 'video' && !isImageOutput) {
          await processVideo(file.path, outputPath, output, (pct) => {
            sendProgress(file.name, `${output.format} → ${filename} (${Math.round(pct)}%)`)
          })
        } else if (file.type === 'image' && !isImageOutput) {
          // Skip: can't convert image to video format
          errors.push({
            file: file.name,
            output: output.format,
            error: 'Cannot convert image to video format'
          })
        } else {
          // video → image: skip for now
          errors.push({
            file: file.name,
            output: output.format,
            error: 'Video to image conversion not supported'
          })
        }
      } catch (err) {
        errors.push({
          file: file.name,
          output: output.format,
          error: err instanceof Error ? err.message : String(err)
        })
      }

      completedOperations++
      sendProgress(file.name, `${output.format} → ${filename}`)
    }
  }

  mainWindow.webContents.send('processing:complete', {
    totalOperations,
    completedOperations,
    cancelled,
    errors
  })
}
