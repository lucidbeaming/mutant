import type { MediaFile } from '../../../shared/types'
import { formatBytes } from '../utils'

interface Props {
  files: MediaFile[]
  onRemove: (path: string) => void
  onClear: () => void
  disabled: boolean
}

export function FileList({ files, onRemove, onClear, disabled }: Props) {
  if (files.length === 0) return null

  const imageCount = files.filter((f) => f.type === 'image').length
  const videoCount = files.filter((f) => f.type === 'video').length

  return (
    <div className="file-list">
      <div className="file-list-header">
        <span>
          {files.length} file{files.length !== 1 ? 's' : ''} ({imageCount} image
          {imageCount !== 1 ? 's' : ''}, {videoCount} video{videoCount !== 1 ? 's' : ''})
        </span>
        <button onClick={onClear} disabled={disabled} className="btn btn-sm btn-danger">
          Clear All
        </button>
      </div>
      <ul className="file-list-items">
        {files.map((file) => (
          <li key={file.path} className="file-item">
            <span className={`file-type-badge ${file.type}`}>{file.type}</span>
            <span className="file-name" title={file.path}>
              {file.name}
            </span>
            <span className="file-size">{formatBytes(file.size)}</span>
            <button
              onClick={() => onRemove(file.path)}
              disabled={disabled}
              className="btn btn-sm btn-icon"
              title="Remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
