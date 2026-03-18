import { useState } from 'react'
import type { OutputConfig } from '../../../shared/types'
import { FormatSelector } from './FormatSelector'
import { ResizeSettings } from './ResizeSettings'
import { ColorSpaceSelector } from './ColorSpaceSelector'
import { OutputDirPicker } from './OutputDirPicker'
import { FilenameSettings } from './FilenameSettings'

interface Props {
  config: OutputConfig
  index: number
  onUpdate: (config: OutputConfig) => void
  onRemove: () => void
  canRemove: boolean
  disabled: boolean
}

export function OutputCard({ config, index, onUpdate, onRemove, canRemove, disabled }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="output-card">
      <div className="output-card-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="output-card-title">
          Output {index + 1}: {config.format.toUpperCase()}
          {config.resize.enabled && ` — ${config.resize.width}×${config.resize.height}`}
        </span>
        <div className="output-card-actions">
          {canRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              disabled={disabled}
              className="btn btn-sm btn-danger"
            >
              Remove
            </button>
          )}
          <span className="collapse-indicator">{collapsed ? '▸' : '▾'}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="output-card-body">
          <FormatSelector
            format={config.format}
            proresProfile={config.proresProfile}
            onChange={(format, proresProfile) => onUpdate({ ...config, format, proresProfile })}
            disabled={disabled}
          />

          <ResizeSettings
            resize={config.resize}
            onChange={(resize) => onUpdate({ ...config, resize })}
            disabled={disabled}
          />

          <ColorSpaceSelector
            colorSpace={config.colorSpace}
            format={config.format}
            onChange={(colorSpace) => onUpdate({ ...config, colorSpace })}
            disabled={disabled}
          />

          <OutputDirPicker
            outputDir={config.outputDir}
            onChange={(outputDir) => onUpdate({ ...config, outputDir })}
            disabled={disabled}
          />

          <FilenameSettings
            filename={config.filename}
            onChange={(filename) => onUpdate({ ...config, filename })}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}
