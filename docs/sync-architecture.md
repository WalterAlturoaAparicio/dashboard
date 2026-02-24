# Sync Architecture — Offline-First Design

## Overview

Baloto Generator uses a **unidirectional, offline-first sync model**. The PostgreSQL database on the API server is the single source of truth. A desktop client (Electron + SQLite) mirrors a local copy for offline use.

```
┌─────────────────────────────────────────────────────┐
│                   API (Railway)                      │
│  NestJS  ─────  PostgreSQL                          │
│  :3001           (source of truth)                  │
│                       │                             │
│           GET /api/v1/sync/sorteos?after=...        │
│                       │                             │
└───────────────────────┼─────────────────────────────┘
                        │ SyncResponseDto (JSON)
                        ▼
┌─────────────────────────────────────────────────────┐
│               Desktop Client (Electron)              │
│  SyncClient  ────  SQLite                           │
│  (10 min poll)     (local mirror)                   │
│                    apps/desktop/sync/               │
└─────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| **API** | NestJS + PostgreSQL | Scrape baloto.com, store draws, expose sync endpoint |
| **Web frontend** | Next.js 15 | Read-only UI — queries API directly (no local DB) |
| **Desktop sync** | Node.js + better-sqlite3 | Mirror API data locally for offline access |

**Rule**: data only flows **API → Desktop**. The desktop never writes back to the API.

---

## Sync Endpoint

```
GET /api/v1/sync/sorteos?after=<ISO_DATE>
```

### Query parameter
- `after` — ISO 8601 datetime string. Returns all sorteos with `timestamp_guardado > after`.
- Example: `?after=2024-06-01T00:00:00.000Z`

### Response — `SyncResponseDto`

```json
{
  "sorteos": [
    {
      "id": 1,
      "fecha": "2024-06-01",
      "tipo": "baloto",
      "numeros": [3, 15, 22, 33, 41],
      "superbalota": 7,
      "fuente": "baloto.com",
      "timestampGuardado": "2024-06-01T12:30:00.000Z"
    }
  ],
  "syncedAt": "2024-06-02T00:00:00.000Z",
  "count": 1
}
```

### Rate limiting
- **5 minutes** per IP address on the sync endpoint.
- Returns `429 Too Many Requests` if called within the window.

---

## SyncClient — `apps/desktop/sync/index.js`

```js
const client = new SyncClient(dbPath, serverUrl)

await client.init()   // Opens SQLite, creates tables
await client.sync()   // Fetches from API, upserts into SQLite
```

### Internal flow of `sync()`

1. Read `lastSyncedAt` from `sync_meta` table (persisted across restarts).
2. Call `GET /api/v1/sync/sorteos?after=<lastSyncedAt>`.
3. For each sorteo in response, run:
   ```sql
   INSERT INTO sorteo (fecha, tipo, numeros, superbalota, fuente, timestamp_guardado)
   VALUES (?, ?, ?, ?, ?, ?)
   ON CONFLICT(fecha, tipo) DO NOTHING
   ```
4. Save `response.syncedAt` to `sync_meta` as new `lastSyncedAt`.

### SQLite schema

```sql
CREATE TABLE IF NOT EXISTS sorteo (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha            TEXT NOT NULL,
  tipo             TEXT NOT NULL,
  numeros          TEXT NOT NULL,   -- JSON array e.g. "[3,15,22,33,41]"
  superbalota      INTEGER NOT NULL,
  fuente           TEXT,
  timestamp_guardado TEXT NOT NULL,
  UNIQUE(fecha, tipo)
);

CREATE TABLE IF NOT EXISTS sync_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Row: key='lastSyncedAt', value='2024-06-01T00:00:00.000Z'
```

### Sync schedule (Electron)

- **On startup**: `syncClient.sync()` called immediately after `app.whenReady()`.
- **Periodic**: every 10 minutes via `setInterval`.

---

## PostgreSQL — Index for incremental sync

The `timestampGuardado` column has a database index for efficient incremental queries:

```typescript
// apps/api/src/database/sorteo.entity.ts
@Index()
@CreateDateColumn({ name: 'timestamp_guardado' })
timestampGuardado: Date
```

This ensures `WHERE timestamp_guardado > $1` scans the index rather than the full table.

---

## Error handling

- Sync errors are caught and logged; they do not crash the desktop app.
- If the server is unreachable, `lastSyncedAt` is **not** updated — the next sync will retry from the same checkpoint.
- If the rate limit is hit (429), the error is logged and the next scheduled sync will succeed.
