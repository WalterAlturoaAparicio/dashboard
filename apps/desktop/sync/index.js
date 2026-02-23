/**
 * Desktop Sync Client — módulo standalone para Electron.
 *
 * Gestiona sincronización unidireccional: API (PostgreSQL) → local SQLite.
 * No requiere NestJS. Usa better-sqlite3 directamente y fetch nativo.
 *
 * Uso en main.js:
 *   const { SyncClient } = require('./apps/desktop/sync')
 *   const client = new SyncClient(dbPath, serverUrl)
 *   await client.init()
 *   await client.sync()
 */

const Database = require('better-sqlite3')

function openDb(dbPath) {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS sorteo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      numeros TEXT NOT NULL,
      superbalota INTEGER NOT NULL,
      fuente TEXT,
      timestamp_guardado TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(fecha, tipo)
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  return db
}

class SyncClient {
  constructor(dbPath, serverUrl) {
    this.dbPath = dbPath
    this.serverUrl = serverUrl.replace(/\/$/, '')
    this.db = null
    this.syncing = false
  }

  async init() {
    this.db = openDb(this.dbPath)
  }

  getLastSyncedAt() {
    if (!this.db) return null
    const row = this.db.prepare('SELECT value FROM sync_meta WHERE key = ?').get('lastSyncedAt')
    return row?.value ?? null
  }

  isSyncing() {
    return this.syncing
  }

  async sync() {
    if (this.syncing) return { inserted: 0, error: 'Sync en progreso' }
    if (!this.db) return { inserted: 0, error: 'DB no inicializada' }

    this.syncing = true
    try {
      const after = this.getLastSyncedAt() ?? '2000-01-01T00:00:00.000Z'
      const url = `${this.serverUrl}/api/v1/sync/sorteos?after=${encodeURIComponent(after)}`

      const response = await fetch(url, {
        signal: AbortSignal.timeout(15_000),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText)
        return { inserted: 0, error: `HTTP ${response.status}: ${text}` }
      }

      const data = await response.json()
      let inserted = 0

      const upsert = this.db.prepare(
        `INSERT OR IGNORE INTO sorteo (fecha, tipo, numeros, superbalota, fuente, timestamp_guardado)
         VALUES (?, ?, ?, ?, ?, ?)`
      )

      const insertMany = this.db.transaction((sorteos) => {
        let count = 0
        for (const s of sorteos) {
          const result = upsert.run(
            s.fecha,
            s.tipo,
            JSON.stringify(s.numeros),
            s.superbalota,
            s.fuente ?? 'sync',
            s.timestampGuardado,
          )
          if (result.changes > 0) count++
        }
        return count
      })

      inserted = insertMany(data.sorteos)

      // Persistir lastSyncedAt en tabla sync_meta
      this.db.prepare('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)').run('lastSyncedAt', data.syncedAt)

      console.log(`[SyncClient] Sync completado: ${inserted} nuevos sorteos insertados`)
      return { inserted }
    } catch (err) {
      const msg = err?.message ?? 'Error desconocido'
      console.error(`[SyncClient] Error en sync: ${msg}`)
      return { inserted: 0, error: msg }
    } finally {
      this.syncing = false
    }
  }

  close() {
    this.db?.close()
    this.db = null
  }
}

module.exports = { SyncClient }
