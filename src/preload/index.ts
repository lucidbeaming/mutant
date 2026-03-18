import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { MediaFile, OutputConfig, ProcessingProgress, RecipeSummary } from '../shared/types'

const api = {
  detectTools: () => ipcRenderer.invoke('tools:detect'),
  scanFiles: (paths: string[]) => ipcRenderer.invoke('files:scan', paths),
  selectOutputDir: () => ipcRenderer.invoke('dialog:selectOutputDir'),
  startProcessing: (files: MediaFile[], outputs: OutputConfig[]) =>
    ipcRenderer.invoke('processing:start', files, outputs),
  cancelProcessing: () => ipcRenderer.invoke('processing:cancel'),
  onProgress: (callback: (progress: ProcessingProgress) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, progress: ProcessingProgress) =>
      callback(progress)
    ipcRenderer.on('processing:progress', handler)
    return () => ipcRenderer.removeListener('processing:progress', handler)
  },
  onComplete: (
    callback: (result: {
      totalOperations: number
      completedOperations: number
      cancelled: boolean
      errors: Array<{ file: string; output: string; error: string }>
    }) => void
  ) => {
    const handler = (_event: Electron.IpcRendererEvent, result: unknown) =>
      callback(result as Parameters<typeof callback>[0])
    ipcRenderer.on('processing:complete', handler)
    return () => ipcRenderer.removeListener('processing:complete', handler)
  },
  listRecipes: (): Promise<RecipeSummary[]> => ipcRenderer.invoke('recipes:list'),
  loadRecipe: (id: string): Promise<OutputConfig[] | null> =>
    ipcRenderer.invoke('recipes:load', id),
  saveRecipe: (name: string, outputs: OutputConfig[]): Promise<string> =>
    ipcRenderer.invoke('recipes:save', name, outputs),
  deleteRecipe: (id: string): Promise<void> => ipcRenderer.invoke('recipes:delete', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error global augmentation
  window.electron = electronAPI
  // @ts-expect-error global augmentation
  window.api = api
}
