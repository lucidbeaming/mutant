import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { OutputConfig, RecipeSummary } from '../../shared/types'

let db: Database.Database

export function initDb(): void {
  const dbPath = join(app.getPath('userData'), 'mutant.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      outputs TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
}

export function listRecipes(): RecipeSummary[] {
  const rows = db
    .prepare('SELECT id, name, updated_at FROM recipes ORDER BY updated_at DESC')
    .all() as Array<{ id: string; name: string; updated_at: string }>
  return rows.map((r) => ({ id: r.id, name: r.name, updatedAt: r.updated_at }))
}

export function loadRecipe(id: string): OutputConfig[] | null {
  const row = db.prepare('SELECT outputs FROM recipes WHERE id = ?').get(id) as
    | { outputs: string }
    | undefined
  if (!row) return null
  return JSON.parse(row.outputs)
}

export function saveRecipe(name: string, outputs: OutputConfig[]): string {
  const now = new Date().toISOString()
  const json = JSON.stringify(outputs)

  const existing = db.prepare('SELECT id FROM recipes WHERE name = ?').get(name) as
    | { id: string }
    | undefined

  if (existing) {
    db.prepare('UPDATE recipes SET outputs = ?, updated_at = ? WHERE id = ?').run(
      json,
      now,
      existing.id
    )
    return existing.id
  }

  const id = randomUUID()
  db.prepare('INSERT INTO recipes (id, name, outputs, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    name,
    json,
    now,
    now
  )
  return id
}

export function deleteRecipe(id: string): void {
  db.prepare('DELETE FROM recipes WHERE id = ?').run(id)
}
