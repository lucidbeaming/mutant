import type { SpeedConfig } from '../../../shared/types'
import { VIDEO_FORMATS } from '../../../shared/types'

interface Props {
  speed: SpeedConfig
  format: string
  onChange: (speed: SpeedConfig) => void
  disabled: boolean
}

const SPEED_PRESETS = [0.1, 0.25, 0.5, 1, 2, 4, 8, 16]

function formatFactor(factor: number): string {
  if (factor >= 1) return `${factor}x`
  return `${factor}x (${Math.round(1 / factor)}x slower)`
}

export function SpeedSettings({ speed, format, onChange, disabled }: Props) {
  const isVideo = VIDEO_FORMATS.includes(format)
  if (!isVideo) return null

  const update = (partial: Partial<SpeedConfig>): void => {
    onChange({ ...speed, ...partial })
  }

  return (
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={speed.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          disabled={disabled}
        />
        Speed / Retiming
      </label>

      {speed.enabled && (
        <div className="speed-fields">
          <div className="speed-presets">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset}
                className={`btn btn-sm${speed.factor === preset ? ' btn-active' : ''}`}
                onClick={() => update({ factor: preset })}
                disabled={disabled}
              >
                {preset}x
              </button>
            ))}
          </div>

          <div className="speed-custom">
            <label>
              Speed: {formatFactor(speed.factor)}
              <input
                type="range"
                min={-3}
                max={4.3}
                step={0.01}
                value={Math.log2(speed.factor)}
                onChange={(e) => {
                  const log2 = parseFloat(e.target.value)
                  const factor = Math.round(Math.pow(2, log2) * 100) / 100
                  update({ factor: Math.max(0.05, Math.min(20, factor)) })
                }}
                disabled={disabled}
              />
            </label>
          </div>

          <div className="speed-fps">
            <label>
              Output FPS:
              <input
                type="number"
                min={1}
                max={120}
                value={speed.outputFps}
                onChange={(e) => update({ outputFps: parseInt(e.target.value) || 30 })}
                disabled={disabled}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
