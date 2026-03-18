import { useState, useEffect, useCallback } from 'react'
import { randomUUID } from './utils'
import { useToolStatus } from './hooks/useToolStatus'
import { useProcessing } from './hooks/useProcessing'
import { ToolStatusBar } from './components/ToolStatusBar'
import { DropZone } from './components/DropZone'
import { FileList } from './components/FileList'
import { RecipeManager } from './components/RecipeManager'
import { OutputList } from './components/OutputList'
import { ProcessButton } from './components/ProcessButton'
import { ProgressIndicator } from './components/ProgressIndicator'
import type { MediaFile, OutputConfig } from '../../shared/types'
import { DEFAULT_OUTPUT_CONFIG } from '../../shared/types'

function createOutputConfig(): OutputConfig {
  return {
    ...DEFAULT_OUTPUT_CONFIG,
    id: randomUUID(),
    resize: { ...DEFAULT_OUTPUT_CONFIG.resize },
    colorSpace: { ...DEFAULT_OUTPUT_CONFIG.colorSpace },
    glitch: { ...DEFAULT_OUTPUT_CONFIG.glitch },
    speed: { ...DEFAULT_OUTPUT_CONFIG.speed },
    imageSequence: { ...DEFAULT_OUTPUT_CONFIG.imageSequence },
    filename: { ...DEFAULT_OUTPUT_CONFIG.filename }
  }
}

export default function App() {
  const { status, loading: toolsLoading, allReady } = useToolStatus()
  const { isProcessing, progress, result, start, cancel, clearResult } = useProcessing()
  const [files, setFiles] = useState<MediaFile[]>([])
  const [outputs, setOutputs] = useState<OutputConfig[]>([createOutputConfig()])

  // Load Last Session on mount
  useEffect(() => {
    window.api.listRecipes().then((recipes) => {
      const lastSession = recipes.find((r) => r.name === 'Last Session')
      if (lastSession) {
        window.api.loadRecipe(lastSession.id).then((loaded) => {
          if (loaded && loaded.length > 0) setOutputs(loaded)
        })
      }
    })
  }, [])

  const handleFilesScanned = useCallback((scanned: MediaFile[]) => {
    setFiles((prev) => {
      const existingPaths = new Set(prev.map((f) => f.path))
      const newFiles = scanned.filter((f) => !existingPaths.has(f.path))
      return [...prev, ...newFiles]
    })
  }, [])

  const handleRemoveFile = useCallback((path: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== path))
  }, [])

  const handleClearFiles = useCallback(() => {
    setFiles([])
  }, [])

  const handleAddOutput = useCallback(() => {
    setOutputs((prev) => [...prev, createOutputConfig()])
  }, [])

  const handleUpdateOutput = useCallback((id: string, updated: OutputConfig) => {
    setOutputs((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }, [])

  const handleRemoveOutput = useCallback((id: string) => {
    setOutputs((prev) => (prev.length <= 1 ? prev : prev.filter((o) => o.id !== id)))
  }, [])

  const handleLoadRecipe = useCallback((loaded: OutputConfig[]) => {
    setOutputs(loaded)
  }, [])

  const handleProcess = useCallback(() => {
    if (files.length === 0 || outputs.length === 0) return
    start(files, outputs)
  }, [files, outputs, start])

  const canProcess = allReady && files.length > 0 && outputs.length > 0 && outputs.every((o) => o.outputDir) && !isProcessing

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mutant</h1>
        <ToolStatusBar status={status} loading={toolsLoading} />
      </header>

      <main className="app-main">
        <section className="input-section">
          <DropZone onFilesScanned={handleFilesScanned} disabled={isProcessing} />
          <FileList files={files} onRemove={handleRemoveFile} onClear={handleClearFiles} disabled={isProcessing} />
        </section>

        <section className="output-section">
          <div className="output-section-header">
            <h2>Output Configuration</h2>
            <RecipeManager outputs={outputs} onLoad={handleLoadRecipe} disabled={isProcessing} />
          </div>
          <OutputList
            outputs={outputs}
            onAdd={handleAddOutput}
            onUpdate={handleUpdateOutput}
            onRemove={handleRemoveOutput}
            disabled={isProcessing}
          />
        </section>

        <section className="process-section">
          {progress && <ProgressIndicator progress={progress} />}
          {result && (
            <div className={`result-banner ${result.errors.length > 0 ? 'has-errors' : 'success'}`}>
              <p>
                {result.cancelled
                  ? 'Processing cancelled.'
                  : `Done! ${result.completedOperations}/${result.totalOperations} operations completed.`}
                {result.errors.length > 0 && ` (${result.errors.length} errors)`}
              </p>
              {result.errors.length > 0 && (
                <ul className="error-list">
                  {result.errors.map((e, i) => (
                    <li key={i}>
                      {e.file} → {e.output}: {e.error}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={clearResult} className="btn btn-sm">
                Dismiss
              </button>
            </div>
          )}
          <ProcessButton
            canProcess={canProcess}
            isProcessing={isProcessing}
            onProcess={handleProcess}
            onCancel={cancel}
            fileCount={files.length}
            outputCount={outputs.length}
          />
        </section>
      </main>
    </div>
  )
}
