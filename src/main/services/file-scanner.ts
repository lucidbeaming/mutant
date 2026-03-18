import { readdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../shared/types'
import type { MediaFile } from '../../shared/types'

const ALL_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]

async function walkDir(dirPath: string): Promise<string[]> {
  const results: string[] = []
  const entries = await readdir(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      const sub = await walkDir(fullPath)
      results.push(...sub)
    } else if (entry.isFile()) {
      results.push(fullPath)
    }
  }
  return results
}

export async function scanFiles(paths: string[]): Promise<MediaFile[]> {
  const files: MediaFile[] = []

  for (const p of paths) {
    const s = await stat(p)
    if (s.isDirectory()) {
      const allFiles = await walkDir(p)
      for (const f of allFiles) {
        const file = await classifyFile(f)
        if (file) files.push(file)
      }
    } else if (s.isFile()) {
      const file = await classifyFile(p)
      if (file) files.push(file)
    }
  }

  return files
}

async function classifyFile(filePath: string): Promise<MediaFile | null> {
  const ext = extname(filePath).toLowerCase()
  if (!ALL_EXTENSIONS.includes(ext)) return null

  const s = await stat(filePath)
  const type = IMAGE_EXTENSIONS.includes(ext) ? 'image' : 'video'

  return {
    path: filePath,
    name: basename(filePath),
    size: s.size,
    type,
    extension: ext
  }
}
