import type { ProcessingProgress } from '../../../shared/types'

interface Props {
  progress: ProcessingProgress
}

export function ProgressIndicator({ progress }: Props) {
  return (
    <div className="progress-indicator">
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${Math.min(100, progress.percent)}%` }} />
      </div>
      <div className="progress-info">
        <span>
          {progress.completedOperations} / {progress.totalOperations} operations
        </span>
        <span>{Math.round(progress.percent)}%</span>
      </div>
      <div className="progress-current">
        {progress.currentFile} → {progress.currentOutput}
      </div>
      {progress.errors.length > 0 && (
        <div className="progress-errors">{progress.errors.length} error(s)</div>
      )}
    </div>
  )
}
