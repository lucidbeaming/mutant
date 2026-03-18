import type { ToolStatus, MediaFile, OutputConfig, ProcessingProgress, RecipeSummary } from '../shared/types'
import type { ElectronAPI } from '@electron-toolkit/preload'

interface MutantAPI {
  detectTools(): Promise<ToolStatus>
  scanFiles(paths: string[]): Promise<MediaFile[]>
  selectOutputDir(): Promise<string | null>
  startProcessing(files: MediaFile[], outputs: OutputConfig[]): Promise<void>
  cancelProcessing(): Promise<void>
  onProgress(callback: (progress: ProcessingProgress) => void): () => void
  onComplete(
    callback: (result: {
      totalOperations: number
      completedOperations: number
      cancelled: boolean
      errors: Array<{ file: string; output: string; error: string }>
    }) => void
  ): () => void
  listRecipes(): Promise<RecipeSummary[]>
  loadRecipe(id: string): Promise<OutputConfig[] | null>
  saveRecipe(name: string, outputs: OutputConfig[]): Promise<string>
  deleteRecipe(id: string): Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: MutantAPI
  }
}
