import gm from 'gm'
import { dirname } from 'path'
import { mkdir } from 'fs/promises'
import type { OutputConfig } from '../../shared/types'

const im = gm.subClass({ imageMagick: '7+' })

export async function processImage(
  inputPath: string,
  outputPath: string,
  config: OutputConfig
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })

  return new Promise((resolve, reject) => {
    let chain = im(inputPath)

    // Resize
    if (config.resize.enabled) {
      const { width, height, fitMode, zoom } = config.resize

      if (fitMode === 'fit') {
        chain = chain.resize(width, height, '>')
      } else {
        // cover: fill bounds then center-crop
        chain = chain.resize(width, height, '^').gravity('Center').crop(width, height)
      }

      // Apply zoom if > 1
      if (zoom > 1.0) {
        const zoomedW = Math.round(width * zoom)
        const zoomedH = Math.round(height * zoom)
        chain = chain.resize(zoomedW, zoomedH).gravity('Center').crop(width, height)
      }
    }

    // Color space
    if (config.colorSpace.enabled) {
      const cs = config.colorSpace.value
      switch (cs) {
        case 'sRGB':
          chain = chain.colorspace('sRGB')
          break
        case 'AdobeRGB':
          chain = chain.out('-colorspace', 'RGB')
          break
        case 'DisplayP3':
          chain = chain.out('-colorspace', 'DisplayP3')
          break
        default:
          chain = chain.colorspace(cs)
      }
    }

    // Format
    const formatMap: Record<string, string> = {
      jpg: 'JPEG',
      png: 'PNG',
      webp: 'WEBP',
      avif: 'AVIF',
      tiff: 'TIFF'
    }
    const gmFormat = formatMap[config.format] || config.format.toUpperCase()
    chain = chain.setFormat(gmFormat)

    // Quality for lossy formats
    if (['jpg', 'webp', 'avif'].includes(config.format)) {
      chain = chain.quality(90)
    }

    chain.write(outputPath, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
