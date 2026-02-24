# Baloto Generator

Colombian lottery (Baloto) analysis and ticket generation. Scrapes results from baloto.com, stores them in PostgreSQL, analyzes number frequencies, and generates weighted random tickets based on historical data.

## Apps

| App | Tech | Description |
|-----|------|-------------|
| `apps/api` | NestJS + PostgreSQL | REST API, scraping, cron, sync |
| `apps/web` | Next.js 15 + shadcn/ui | Dashboard frontend |
| `apps/desktop` | Electron + SQLite | Offline-first desktop sync client |

## Quick start

```bash
# API (port 3001)
cd apps/api && npm install && npm run start:dev

# Web (port 3000)
cd apps/web && pnpm install && pnpm dev
```

See [docs/getting-started.md](docs/getting-started.md) for full setup instructions.

## Documentation

- [Getting Started](docs/getting-started.md) — local setup, running tests, project structure
- [Architecture](docs/architecture.md) — Railway deployment, CI/CD, environment variables
- [Sync Architecture](docs/sync-architecture.md) — offline-first sync flow, SyncClient, SQLite schema
- [Contributing](docs/contributing.md) — GitFlow branch strategy, PR conventions

## Deploy

Deployed on Railway using `railway.toml` at the repo root.

```
Build:  cd apps/api && npm install --legacy-peer-deps && npm run build
Start:  cd apps/api && node dist/main
Health: GET /api/v1/status
```

## Tests

```bash
cd apps/api
npm test          # 47 unit tests
npm run test:e2e  # 16 E2E tests
```
