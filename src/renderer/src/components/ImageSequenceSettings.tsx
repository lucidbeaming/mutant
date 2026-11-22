import type { ImageSequenceConfig } from '../../../shared/types'
import { VIDEO_FORMATS } from '../../../shared/types'

interface Props {
  imageSequence: ImageSequenceConfig
  format: string
  onChange: (imageSequence: ImageSequenceConfig) => void
  disabled: boolean
}

const DURATION_PRESETS = [
  { label: '1/24s', value: 1 / 24 },
  { label: '0.5s', value: 0.5 },
  { label: '1s', value: 1 },
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 }
]

export function ImageSequenceSettings({
  imageSequence,
  format,
  onChange,
  disabled
}: Props) {
  const isVideo = VIDEO_FORMATS.includes(format)
  if (!isVideo) return null

  const update = (partial: Partial<ImageSequenceConfig>): void => {
    onChange({ ...imageSequence, ...partial })
  }

  return (
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={imageSequence.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          disabled={disabled}
        />
        Image Sequence Mode
      </label>

      {imageSequence.enabled && (
        <div className="sequence-fields">
          <p className="sequence-description">
            Combines all loaded images into a single video. Each image becomes a frame held for the
            specified duration.
          </p>

          <div className="sequence-duration">
            <label>Time per frame:</label>
            <div className="speed-presets">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={`btn btn-sm${imageSequence.frameDuration === preset.value ? ' btn-active' : ''}`}
                  onClick={() => update({ frameDuration: preset.value })}
                  disabled={disabled}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="sequence-custom-duration">
              <input
                type="number"
                min={0.04}
                max={30}
                step={0.1}
                value={imageSequence.frameDuration}
                onChange={(e) =>
                  update({ frameDuration: Math.max(0.04, parseFloat(e.target.value) || 3) })
                }
                disabled={disabled}
              />
              <span>seconds</span>
            </div>
          </div>

          <div className="speed-fps">
            <label>
              Output FPS:
              <input
                type="number"
                min={1}
                max={120}
                value={imageSequence.outputFps}
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
