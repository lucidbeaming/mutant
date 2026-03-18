interface Props {
  canProcess: boolean
  isProcessing: boolean
  onProcess: () => void
  onCancel: () => void
  fileCount: number
  outputCount: number
}

export function ProcessButton({
  canProcess,
  isProcessing,
  onProcess,
  onCancel,
  fileCount,
  outputCount
}: Props) {
  if (isProcessing) {
    return (
      <button onClick={onCancel} className="btn btn-cancel">
        Cancel Processing
      </button>
    )
  }

  return (
    <button onClick={onProcess} disabled={!canProcess} className="btn btn-process">
      Process {fileCount} file{fileCount !== 1 ? 's' : ''} × {outputCount} output
      {outputCount !== 1 ? 's' : ''} ({fileCount * outputCount} operations)
    </button>
  )
}
