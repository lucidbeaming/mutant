import { IMAGE_FORMATS } from '../../../shared/types'

interface ColorSpaceConfig {
  enabled: boolean
  value: string
}

interface Props {
  colorSpace: ColorSpaceConfig
  format: string
  onChange: (colorSpace: ColorSpaceConfig) => void
  disabled: boolean
}

const IMAGE_COLOR_SPACES = ['sRGB', 'AdobeRGB', 'DisplayP3']
const VIDEO_COLOR_SPACES = ['bt709', 'bt2020']

export function ColorSpaceSelector({ colorSpace, format, onChange, disabled }: Props) {
  const isImage = IMAGE_FORMATS.includes(format)
  const options = isImage ? IMAGE_COLOR_SPACES : VIDEO_COLOR_SPACES

  return (
    <div className="form-group">
      <label>
        <input
          type="checkbox"
          checked={colorSpace.enabled}
          onChange={(e) => onChange({ ...colorSpace, enabled: e.target.checked })}
          disabled={disabled}
        />
        Color Space
      </label>

      {colorSpace.enabled && (
        <select
          value={colorSpace.value}
          onChange={(e) => onChange({ ...colorSpace, value: e.target.value })}
          disabled={disabled}
        >
          {options.map((cs) => (
            <option key={cs} value={cs}>
              {cs}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
