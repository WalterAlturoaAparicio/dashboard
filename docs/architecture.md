# Architecture & Deployment

## System overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Production                                │
│                                                                  │
│   ┌──────────────────────┐       ┌───────────────────────────┐   │
│   │   Railway (API)      │       │   Vercel / Railway (Web)  │   │
│   │                      │       │                           │   │
│   │  NestJS :3001        │◄──────│  Next.js :3000            │   │
│   │  PostgreSQL (addon)  │  HTTP │  Static export or SSR     │   │
│   │  api/v1 prefix       │       │  NEXT_PUBLIC_API_URL      │   │
│   └──────────┬───────────┘       └───────────────────────────┘   │
│              │                                                   │
│              │ baloto.com (scraping)                             │
│              ▼                                                   │
│         baloto.com                                               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  Desktop (optional, offline)                     │
│   Electron + SyncClient → SQLite mirror (every 10 min)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Modules (apps/api)

| Module | Responsibility |
|--------|---------------|
| `DatabaseModule` | TypeORM + PostgreSQL connection (ConfigService) |
| `ScrapingModule` | HTTP scraper for baloto.com via Axios + Cheerio |
| `CronModule` | Scheduled scraping Tue/Thu/Sun at 12:00 |
| `SyncModule` | `GET /api/v1/sync/sorteos` — incremental data sync |
| `AnalysisModule` | Frequency analysis, `getResumen()` |
| `TicketModule` | Weighted random ticket generation |
| `ConnectionModule` | Internet connectivity check |

---

## Railway deployment

### Build command
```
cd apps/api && npm install --legacy-peer-deps && npm run build
```

NestJS compiles TypeScript to `apps/api/dist/`. Nixpacks detects Node.js automatically.

### Start command
```
cd apps/api && node dist/main
```

Equivalent to `npm run start:prod` in `apps/api/`.

### Health check
```
GET /api/v1/status
→ { "online": true, "lastScrape": "2024-06-01T12:00:00.000Z" }
```

Railway polls this path every 30s. If it returns non-2xx for `healthcheckTimeout` seconds (300s), the deployment is marked failed.

### railway.toml
Located at repo root. Railway reads this automatically on every deploy.

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd apps/api && yarn install && yarn build"

[deploy]
startCommand = "cd apps/api && node dist/main"
healthcheckPath = "/api/v1/status"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

---

## CI/CD flow

```
Developer pushes to master
        │
        ▼
GitHub repository
        │
        ├─── Railway auto-deploy triggered (connected to master branch)
        │         │
        │         ├── yarn install && nest build
        │         ├── Healthcheck → /api/v1/status
        │         └── Swap to new deployment (zero-downtime)
        │
        └─── (optional) Vercel auto-deploy for apps/web
```

**Branch strategy:**
- `master` — production; Railway deploys from this branch
- `develop` — integration; features are merged here first
- `feature/*` — new features, branched from `develop`
- `hotfix/*` — urgent fixes, branched from `master`

See [contributing.md](./contributing.md) for full GitFlow details.

---

## Environment variables

### apps/api — required

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` or Railway internal hostname |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `secret` |
| `DB_NAME` | Database name | `baloto` |

Set these in Railway → Service → Variables. Railway auto-injects PostgreSQL addon variables when you add a PostgreSQL service.

### apps/web — optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3001/api/v1` |

In production, set `NEXT_PUBLIC_API_URL=https://your-api.up.railway.app/api/v1`.

---

## TypeORM & database migrations

- **Development**: `synchronize: false` (schema managed manually).
- **Production**: apply migrations before deploying. Generate a migration:

```bash
cd apps/api
yarn typeorm migration:generate src/database/migrations/InitSchema
yarn typeorm migration:run
```

> Note: `synchronize: true` is only used in E2E tests (SQLite in-memory).

---

## CORS

The API allows requests from `http://localhost:3000` by default. For production, update `apps/api/src/main.ts`:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  // ...
})
```

Add `FRONTEND_URL` to Railway environment variables.

---

## Scraping schedule

The cron module (`apps/api/src/cron/cron.service.ts`) runs scraping on the schedule Baloto publishes results:

| Day | Time (local) |
|-----|-------------|
| Tuesday | 12:00 |
| Thursday | 12:00 |
| Sunday | 12:00 |

The schedule uses `@nestjs/schedule` decorators. No external queue is needed.
