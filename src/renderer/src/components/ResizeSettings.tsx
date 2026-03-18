interface ResizeConfig {
  enabled: boolean
  width: number
  height: number
  fitMode: 'fit' | 'cover'
  zoom: number
}

interface Props {
  resize: ResizeConfig
  onChange: (resize: ResizeConfig) => void
  disabled: boolean
}

export function ResizeSettings({ resize, onChange, disabled }: Props) {
  const update = (partial: Partial<ResizeConfig>) => {
    onChange({ ...resize, ...partial })
  }

  return (
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={resize.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          disabled={disabled}
        />
        Resize / Scale
      </label>

      {resize.enabled && (
        <div className="resize-fields">
          <div className="resize-dimensions">
            <input
              type="number"
              value={resize.width}
              onChange={(e) => update({ width: parseInt(e.target.value) || 0 })}
              disabled={disabled}
              min={1}
              placeholder="Width"
            />
            <span>×</span>
            <input
              type="number"
              value={resize.height}
              onChange={(e) => update({ height: parseInt(e.target.value) || 0 })}
              disabled={disabled}
              min={1}
              placeholder="Height"
            />
          </div>

          <div className="resize-fit-mode">
            <label>
              <input
                type="radio"
                name={`fitMode-${resize.width}-${resize.height}`}
                value="fit"
                checked={resize.fitMode === 'fit'}
                onChange={() => update({ fitMode: 'fit' })}
                disabled={disabled}
              />
              Fit Within
            </label>
            <label>
              <input
                type="radio"
                name={`fitMode-${resize.width}-${resize.height}`}
                value="cover"
                checked={resize.fitMode === 'cover'}
                onChange={() => update({ fitMode: 'cover' })}
                disabled={disabled}
              />
              Cover
            </label>
          </div>

          <div className="resize-zoom">
            <label>Zoom: {Math.round(resize.zoom * 100)}%</label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.1}
              value={resize.zoom}
              onChange={(e) => update({ zoom: parseFloat(e.target.value) })}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}
