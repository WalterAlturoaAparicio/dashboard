import Database from 'better-sqlite3'

export function openDb(dbPath: string): Database.Database {
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

export function getLastSyncedAt(db: Database.Database): string | null {
  const row = db.prepare('SELECT value FROM sync_meta WHERE key = ?').get('lastSyncedAt') as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function saveLastSyncedAt(db: Database.Database, ts: string): void {
  db.prepare('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)').run('lastSyncedAt', ts)
}

export function upsertSorteo(
  db: Database.Database,
  sorteo: {
    fecha: string
    tipo: string
    numeros: number[]
    superbalota: number
    fuente?: string
    timestampGuardado: string
  },
): boolean {
  const result = db
    .prepare(
      `INSERT OR IGNORE INTO sorteo (fecha, tipo, numeros, superbalota, fuente, timestamp_guardado)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      sorteo.fecha,
      sorteo.tipo,
      JSON.stringify(sorteo.numeros),
      sorteo.superbalota,
      sorteo.fuente ?? 'sync',
      sorteo.timestampGuardado,
    )
  return result.changes > 0
}
