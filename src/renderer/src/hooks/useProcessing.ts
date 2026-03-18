import { useState, useEffect, useCallback } from 'react'
import type { MediaFile, OutputConfig, ProcessingProgress } from '../../../shared/types'

export function useProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<ProcessingProgress | null>(null)
  const [result, setResult] = useState<{
    totalOperations: number
    completedOperations: number
    cancelled: boolean
    errors: Array<{ file: string; output: string; error: string }>
  } | null>(null)

  useEffect(() => {
    const removeProgress = window.api.onProgress((p) => {
      setProgress(p)
    })
    const removeComplete = window.api.onComplete((r) => {
      setResult(r)
      setIsProcessing(false)
      setProgress(null)
    })
    return () => {
      removeProgress()
      removeComplete()
    }
  }, [])

  const start = useCallback(async (files: MediaFile[], outputs: OutputConfig[]) => {
    setIsProcessing(true)
    setResult(null)
    setProgress(null)
    await window.api.startProcessing(files, outputs)
  }, [])

  const cancel = useCallback(async () => {
    await window.api.cancelProcessing()
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
  }, [])

  return { isProcessing, progress, result, start, cancel, clearResult }
}
