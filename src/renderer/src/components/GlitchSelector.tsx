import type { GlitchConfig } from '../../../shared/types'
import { VIDEO_FORMATS } from '../../../shared/types'

interface Props {
  glitch: GlitchConfig
  format: string
  onChange: (glitch: GlitchConfig) => void
  disabled: boolean
}

const EFFECT_LABELS: Record<GlitchConfig['effect'], string> = {
  echo: 'Echo / Ghosting',
  'chromatic-aberration': 'Chromatic Aberration',
  displacement: 'Displacement',
  'motion-vectors': 'Motion Vectors'
}

const EFFECT_DESCRIPTIONS: Record<GlitchConfig['effect'], string> = {
  echo: 'Temporal frame averaging — creates ghosting trails',
  'chromatic-aberration': 'RGB channel offset — creates color fringing',
  displacement: 'Self-referencing spatial warp with stereo shift',
  'motion-vectors': 'Visualize inter-frame motion as color data'
}

export function GlitchSelector({ glitch, format, onChange, disabled }: Props) {
  const isVideo = VIDEO_FORMATS.includes(format)
  if (!isVideo) return null

  return (
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={glitch.enabled}
          onChange={(e) => onChange({ ...glitch, enabled: e.target.checked })}
          disabled={disabled}
        />
        Glitch Effect
      </label>

      {glitch.enabled && (
        <div className="glitch-fields">
          <select
            value={glitch.effect}
            onChange={(e) =>
              onChange({ ...glitch, effect: e.target.value as GlitchConfig['effect'] })
            }
            disabled={disabled}
          >
            {(Object.keys(EFFECT_LABELS) as GlitchConfig['effect'][]).map((key) => (
              <option key={key} value={key}>
                {EFFECT_LABELS[key]}
              </option>
            ))}
          </select>

          <p className="glitch-description">{EFFECT_DESCRIPTIONS[glitch.effect]}</p>

          <div className="glitch-intensity">
            <label>
              Intensity: {glitch.intensity}
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={glitch.intensity}
                onChange={(e) => onChange({ ...glitch, intensity: Number(e.target.value) })}
                disabled={disabled}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
