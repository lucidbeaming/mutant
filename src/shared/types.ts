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

export interface GlitchConfig {
  enabled: boolean
  effect: 'echo' | 'chromatic-aberration' | 'displacement' | 'motion-vectors'
  intensity: number // 1-10
}

export interface SpeedConfig {
  enabled: boolean
  factor: number // 0.05 to 20 (1 = normal, 2 = 2x faster, 0.5 = half speed)
  outputFps: number // constant output framerate (1-120)
}

export interface ImageSequenceConfig {
  enabled: boolean
  frameDuration: number // seconds each frame is displayed (0.04 to 30)
  outputFps: number // output video framerate (1-120)
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
  glitch: GlitchConfig
  speed: SpeedConfig
  imageSequence: ImageSequenceConfig
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

export const DEFAULT_GLITCH_CONFIG: GlitchConfig = {
  enabled: false,
  effect: 'echo',
  intensity: 5
}

export const DEFAULT_SPEED_CONFIG: SpeedConfig = {
  enabled: false,
  factor: 1,
  outputFps: 30
}

export const DEFAULT_IMAGE_SEQUENCE_CONFIG: ImageSequenceConfig = {
  enabled: false,
  frameDuration: 3,
  outputFps: 30
}

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
  glitch: DEFAULT_GLITCH_CONFIG,
  speed: DEFAULT_SPEED_CONFIG,
  imageSequence: DEFAULT_IMAGE_SEQUENCE_CONFIG,
  outputDir: '',
  filename: DEFAULT_FILENAME_OPTIONS
}
