import { IMAGE_FORMATS, VIDEO_FORMATS } from '../../../shared/types'

interface Props {
  format: string
  proresProfile?: string
  onChange: (format: string, proresProfile?: string) => void
  disabled: boolean
}

const FORMAT_LABELS: Record<string, string> = {
  jpg: 'JPEG',
  png: 'PNG',
  webp: 'WebP',
  avif: 'AVIF',
  tiff: 'TIFF',
  'h264-web': 'H.264 Web (MP4)',
  prores: 'ProRes (MOV)',
  webm: 'WebM (VP9)',
  'mov-h264': 'H.264 (MOV)'
}

export function FormatSelector({ format, proresProfile, onChange, disabled }: Props) {
  return (
    <div className="form-group">
      <label>Format</label>
      <div className="format-selector">
        <select
          value={format}
          onChange={(e) => onChange(e.target.value, e.target.value === 'prores' ? proresProfile || '422' : undefined)}
          disabled={disabled}
        >
          <optgroup label="Image">
            {IMAGE_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Video">
            {VIDEO_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </optgroup>
        </select>

        {format === 'prores' && (
          <select
            value={proresProfile || '422'}
            onChange={(e) => onChange(format, e.target.value)}
            disabled={disabled}
          >
            <option value="proxy">Proxy</option>
            <option value="lt">LT</option>
            <option value="422">422</option>
            <option value="422hq">422 HQ</option>
            <option value="4444">4444</option>
          </select>
        )}
      </div>
    </div>
  )
}
