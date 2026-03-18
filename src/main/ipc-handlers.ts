import { ipcMain, dialog, BrowserWindow } from 'electron'
import { detectTools } from './services/tool-detector'
import { scanFiles } from './services/file-scanner'
import { processQueue, cancelProcessing } from './lib/process-queue'
import { initDb, listRecipes, loadRecipe, saveRecipe, deleteRecipe } from './services/recipe-store'
import type { OutputConfig, MediaFile } from '../shared/types'

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  initDb()

  ipcMain.handle('tools:detect', async () => {
    return detectTools()
  })

  ipcMain.handle('files:scan', async (_event, paths: string[]) => {
    return scanFiles(paths)
  })

  ipcMain.handle('dialog:selectOutputDir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle(
    'processing:start',
    async (_event, files: MediaFile[], outputs: OutputConfig[]) => {
      // Auto-save as "Last Session"
      saveRecipe('Last Session', outputs)
      return processQueue(files, outputs, mainWindow)
    }
  )

  ipcMain.handle('processing:cancel', () => {
    cancelProcessing()
  })

  ipcMain.handle('recipes:list', () => {
    return listRecipes()
  })

  ipcMain.handle('recipes:load', (_event, id: string) => {
    return loadRecipe(id)
  })

  ipcMain.handle('recipes:save', (_event, name: string, outputs: OutputConfig[]) => {
    return saveRecipe(name, outputs)
  })

  ipcMain.handle('recipes:delete', (_event, id: string) => {
    return deleteRecipe(id)
  })
}
