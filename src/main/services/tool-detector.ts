import { execFile } from 'child_process'
import { promisify } from 'util'
import type { ToolStatus } from '../../shared/types'

const execFileAsync = promisify(execFile)

async function detectFfmpeg(): Promise<{ found: boolean; version: string }> {
  try {
    const { stdout } = await execFileAsync('ffmpeg', ['-version'])
    const match = stdout.match(/ffmpeg version (\S+)/)
    return { found: true, version: match ? match[1] : 'unknown' }
  } catch {
    return { found: false, version: '' }
  }
}

async function detectImageMagick(): Promise<{ found: boolean; version: string }> {
  // Try ImageMagick 7 first (magick command)
  try {
    const { stdout } = await execFileAsync('magick', ['-version'])
    const match = stdout.match(/ImageMagick (\S+)/)
    return { found: true, version: match ? match[1] : 'unknown' }
  } catch {
    // Fall back to ImageMagick 6 (convert command)
    try {
      const { stdout } = await execFileAsync('convert', ['-version'])
      const match = stdout.match(/ImageMagick (\S+)/)
      return { found: true, version: match ? match[1] : 'unknown' }
    } catch {
      return { found: false, version: '' }
    }
  }
}

export async function detectTools(): Promise<ToolStatus> {
  const [ffmpeg, imagemagick] = await Promise.all([detectFfmpeg(), detectImageMagick()])
  return { ffmpeg, imagemagick }
}
