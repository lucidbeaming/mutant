import type { OutputConfig } from '../../../shared/types'
import { OutputCard } from './OutputCard'

interface Props {
  outputs: OutputConfig[]
  onAdd: () => void
  onUpdate: (id: string, config: OutputConfig) => void
  onRemove: (id: string) => void
  disabled: boolean
}

export function OutputList({ outputs, onAdd, onUpdate, onRemove, disabled }: Props) {
  return (
    <div className="output-list">
      {outputs.map((output, index) => (
        <OutputCard
          key={output.id}
          config={output}
          index={index}
          onUpdate={(updated) => onUpdate(output.id, updated)}
          onRemove={() => onRemove(output.id)}
          canRemove={outputs.length > 1}
          disabled={disabled}
        />
      ))}
      <button onClick={onAdd} disabled={disabled} className="btn btn-add-output">
        + Add Output
      </button>
    </div>
  )
}
