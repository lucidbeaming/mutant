import type { ToolStatus } from '../../../shared/types'

interface Props {
  status: ToolStatus | null
  loading: boolean
}

export function ToolStatusBar({ status, loading }: Props) {
  if (loading) return <div className="tool-status-bar">Detecting tools...</div>

  if (!status) return <div className="tool-status-bar error">Failed to detect tools</div>

  return (
    <div className="tool-status-bar">
      <span className={`tool-badge ${status.ffmpeg.found ? 'found' : 'missing'}`}>
        ffmpeg {status.ffmpeg.found ? status.ffmpeg.version : 'not found'}
      </span>
      <span className={`tool-badge ${status.imagemagick.found ? 'found' : 'missing'}`}>
        imagemagick {status.imagemagick.found ? status.imagemagick.version : 'not found'}
      </span>
    </div>
  )
}
