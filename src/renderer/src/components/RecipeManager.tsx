import { useState, useEffect, useCallback } from 'react'
import type { OutputConfig, RecipeSummary } from '../../../shared/types'

interface Props {
  outputs: OutputConfig[]
  onLoad: (outputs: OutputConfig[]) => void
  disabled: boolean
}

export function RecipeManager({ outputs, onLoad, disabled }: Props) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [saving, setSaving] = useState(false)
  const [saveName, setSaveName] = useState('')

  const refreshRecipes = useCallback(async () => {
    const list = await window.api.listRecipes()
    setRecipes(list)
  }, [])

  useEffect(() => {
    refreshRecipes()
  }, [refreshRecipes])

  const handleLoad = async (id: string) => {
    const loaded = await window.api.loadRecipe(id)
    if (loaded) onLoad(loaded)
  }

  const handleSave = async () => {
    if (!saveName.trim()) return
    await window.api.saveRecipe(saveName.trim(), outputs)
    setSaveName('')
    setSaving(false)
    refreshRecipes()
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await window.api.deleteRecipe(id)
    refreshRecipes()
  }

  return (
    <div className="recipe-manager">
      <div className="recipe-controls">
        <select
          onChange={(e) => {
            if (e.target.value) handleLoad(e.target.value)
            e.target.value = ''
          }}
          disabled={disabled}
          defaultValue=""
        >
          <option value="" disabled>
            Load Recipe...
          </option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        {recipes.length > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) handleDelete(new MouseEvent('click') as unknown as React.MouseEvent, e.target.value)
              e.target.value = ''
            }}
            disabled={disabled}
            defaultValue=""
          >
            <option value="" disabled>
              Delete Recipe...
            </option>
            {recipes
              .filter((r) => r.name !== 'Last Session')
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        )}

        {saving ? (
          <div className="recipe-save-form">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Recipe name"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button onClick={handleSave} className="btn btn-sm" disabled={!saveName.trim()}>
              Save
            </button>
            <button onClick={() => setSaving(false)} className="btn btn-sm">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setSaving(true)} disabled={disabled} className="btn btn-sm">
            Save Recipe
          </button>
        )}
      </div>
    </div>
  )
}
