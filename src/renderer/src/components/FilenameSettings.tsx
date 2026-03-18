import type { FilenameOptions } from '../../../shared/types'

interface Props {
  filename: FilenameOptions
  onChange: (filename: FilenameOptions) => void
  disabled: boolean
}

export function FilenameSettings({ filename, onChange, disabled }: Props) {
  const update = (partial: Partial<FilenameOptions>) => {
    onChange({ ...filename, ...partial })
  }

  return (
    <div className="form-group">
      <label>Filename Options</label>
      <div className="filename-fields">
        <div className="filename-row">
          <label>Prepend</label>
          <input
            type="text"
            value={filename.prepend}
            onChange={(e) => update({ prepend: e.target.value })}
            disabled={disabled}
            placeholder="e.g., thumb_"
          />
        </div>
        <div className="filename-row">
          <label>Append</label>
          <input
            type="text"
            value={filename.append}
            onChange={(e) => update({ append: e.target.value })}
            disabled={disabled}
            placeholder="e.g., _web"
          />
        </div>
        <div className="filename-row">
          <label>
            <input
              type="checkbox"
              checked={filename.includeTimestamp}
              onChange={(e) => update({ includeTimestamp: e.target.checked })}
              disabled={disabled}
            />
            Timestamp
          </label>
          {filename.includeTimestamp && (
            <select
              value={filename.timestampPosition}
              onChange={(e) =>
                update({ timestampPosition: e.target.value as 'prepend' | 'append' })
              }
              disabled={disabled}
            >
              <option value="prepend">Before name</option>
              <option value="append">After name</option>
            </select>
          )}
        </div>
        <div className="filename-row">
          <label>
            <input
              type="checkbox"
              checked={filename.includeIncrement}
              onChange={(e) => update({ includeIncrement: e.target.checked })}
              disabled={disabled}
            />
            Incremental number
          </label>
          {filename.includeIncrement && (
            <select
              value={filename.incrementPosition}
              onChange={(e) =>
                update({ incrementPosition: e.target.value as 'prepend' | 'append' })
              }
              disabled={disabled}
            >
              <option value="prepend">Before name</option>
              <option value="append">After name</option>
            </select>
          )}
        </div>
      </div>
    </div>
  )
}
