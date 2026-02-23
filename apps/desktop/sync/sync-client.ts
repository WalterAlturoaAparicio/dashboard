import Database from 'better-sqlite3'
import { openDb, getLastSyncedAt, saveLastSyncedAt, upsertSorteo } from './db'

interface SorteoDto {
  id: number
  fecha: string
  tipo: string
  numeros: number[]
  superbalota: number
  fuente?: string
  timestampGuardado: string
}

interface SyncResponseDto {
  sorteos: SorteoDto[]
  syncedAt: string
  count: number
}

export class SyncClient {
  private db: Database.Database | null = null
  private syncing = false

  constructor(
    private readonly dbPath: string,
    private readonly serverUrl: string,
  ) {}

  async init(): Promise<void> {
    this.db = openDb(this.dbPath)
  }

  getLastSyncedAt(): string | null {
    if (!this.db) return null
    return getLastSyncedAt(this.db)
  }

  isSyncing(): boolean {
    return this.syncing
  }

  async sync(): Promise<{ inserted: number; error?: string }> {
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

      const data: SyncResponseDto = await response.json()
      let inserted = 0

      for (const sorteo of data.sorteos) {
        const wasInserted = upsertSorteo(this.db, {
          fecha: sorteo.fecha,
          tipo: sorteo.tipo,
          numeros: sorteo.numeros,
          superbalota: sorteo.superbalota,
          fuente: sorteo.fuente ?? 'sync',
          timestampGuardado: sorteo.timestampGuardado,
        })
        if (wasInserted) inserted++
      }

      saveLastSyncedAt(this.db, data.syncedAt)
      console.log(`[SyncClient] Sync completado: ${inserted} nuevos sorteos`)
      return { inserted }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      console.error(`[SyncClient] Error en sync: ${msg}`)
      return { inserted: 0, error: msg }
    } finally {
      this.syncing = false
    }
  }

  close(): void {
    this.db?.close()
    this.db = null
  }
}
