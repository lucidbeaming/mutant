interface Props {
  outputDir: string
  onChange: (dir: string) => void
  disabled: boolean
}

export function OutputDirPicker({ outputDir, onChange, disabled }: Props) {
  const handlePick = async () => {
    const dir = await window.api.selectOutputDir()
    if (dir) onChange(dir)
  }

  return (
    <div className="form-group">
      <label>Output Directory</label>
      <div className="dir-picker">
        <input
          type="text"
          value={outputDir}
          readOnly
          placeholder="Select output directory..."
          className="dir-input"
        />
        <button onClick={handlePick} disabled={disabled} className="btn btn-sm">
          Browse
        </button>
      </div>
    </div>
  )
}
