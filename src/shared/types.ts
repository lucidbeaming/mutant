export interface ToolStatus {
  ffmpeg: { found: boolean; version: string }
  imagemagick: { found: boolean; version: string }
}

export interface MediaFile {
  path: string
  name: string
  size: number
  type: 'image' | 'video'
  extension: string
}

export interface FilenameOptions {
  prepend: string
  append: string
  includeTimestamp: boolean
  includeIncrement: boolean
  timestampPosition: 'prepend' | 'append'
  incrementPosition: 'prepend' | 'append'
}

export interface OutputConfig {
  id: string
  format: string
  proresProfile?: 'proxy' | 'lt' | '422' | '422hq' | '4444'
  resize: {
    enabled: boolean
    width: number
    height: number
    fitMode: 'fit' | 'cover'
    zoom: number
  }
  colorSpace: {
    enabled: boolean
    value: string
  }
  outputDir: string
  filename: FilenameOptions
}

export interface ProcessingProgress {
  totalFiles: number
  totalOutputs: number
  completedOperations: number
  totalOperations: number
  currentFile: string
  currentOutput: string
  percent: number
  errors: Array<{ file: string; output: string; error: string }>
}

export interface RecipeSummary {
  id: string
  name: string
  updatedAt: string
}

export const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.bmp', '.gif'
]

export const VIDEO_EXTENSIONS = [
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.mxf', '.prores'
]

export const IMAGE_FORMATS = ['jpg', 'png', 'webp', 'avif', 'tiff']
export const VIDEO_FORMATS = ['h264-web', 'prores', 'webm', 'mov-h264']

export const DEFAULT_FILENAME_OPTIONS: FilenameOptions = {
  prepend: '',
  append: '',
  includeTimestamp: false,
  includeIncrement: false,
  timestampPosition: 'prepend',
  incrementPosition: 'append'
}

export const DEFAULT_OUTPUT_CONFIG: Omit<OutputConfig, 'id'> = {
  format: 'jpg',
  resize: {
    enabled: false,
    width: 1920,
    height: 1080,
    fitMode: 'fit',
    zoom: 1.0
  },
  colorSpace: {
    enabled: false,
    value: 'sRGB'
  },
  outputDir: '',
  filename: DEFAULT_FILENAME_OPTIONS
}
