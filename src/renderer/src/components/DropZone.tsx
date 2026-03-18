import { useState, useCallback } from 'react'
import type { MediaFile } from '../../../shared/types'

interface Props {
  onFilesScanned: (files: MediaFile[]) => void
  disabled: boolean
}

interface ElectronFile extends File {
  path: string
}

export function DropZone({ onFilesScanned, disabled }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (disabled) return

      const paths: string[] = []
      for (const file of Array.from(e.dataTransfer.files)) {
        const electronFile = file as ElectronFile
        if (electronFile.path) {
          paths.push(electronFile.path)
        }
      }

      if (paths.length > 0) {
        setScanning(true)
        try {
          const files = await window.api.scanFiles(paths)
          onFilesScanned(files)
        } catch (err) {
          console.error('Scan failed:', err)
        } finally {
          setScanning(false)
        }
      }
    },
    [onFilesScanned, disabled]
  )

  return (
    <div
      className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {scanning ? (
        <p>Scanning files...</p>
      ) : (
        <p>Drop files or folders here</p>
      )}
    </div>
  )
}
