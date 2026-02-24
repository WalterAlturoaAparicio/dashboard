# Getting Started — Local Development

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org) |
| yarn | >= 1.22 | `npm install -g yarn` |
| pnpm | >= 8 | `npm install -g pnpm` |
| PostgreSQL | >= 14 | Local instance or Docker |
| Git | any | |

---

## 1. Clone the repository

```bash
git clone https://github.com/WalterAlturoaAparicio/dashboard.git baloto-generator
cd baloto-generator
```

---

## 2. Set up the API (NestJS + PostgreSQL)

### 2a. Create the database

```bash
psql -U postgres -c "CREATE DATABASE baloto;"
```

### 2b. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=baloto
```

### 2c. Install dependencies and run migrations

```bash
cd apps/api
yarn install
```

TypeORM runs schema sync automatically in development (`synchronize: false` in production — apply migrations manually if needed).

### 2d. Start the API in dev mode

```bash
yarn start:dev
```

The API starts at **http://localhost:3001**. All routes are prefixed with `/api/v1`.

Verify it's running:
```bash
curl http://localhost:3001/api/v1/status
# → { "online": true, "lastScrape": null }
```

---

## 3. Set up the web frontend (Next.js)

```bash
cd apps/web
pnpm install
pnpm dev
```

The frontend starts at **http://localhost:3000**. It connects to the API at `http://localhost:3001/api/v1`.

---

## 4. Load historical lottery data

Once the API is running, trigger a full scrape:

```bash
curl -X PUT http://localhost:3001/api/v1/load
```

This scrapes all historical draws from baloto.com and stores them in PostgreSQL. This may take a few minutes.

To scrape only new results incrementally:

```bash
curl -X POST http://localhost:3001/api/v1/refresh
```

---

## 5. Running tests

```bash
# Unit tests (47 tests)
cd apps/api && yarn test

# E2E tests (16 tests — requires no running API on port 3001)
cd apps/api && yarn test:e2e

# Frontend lint
cd apps/web && pnpm lint
```

---

## Project structure

```
baloto-generator/
├── apps/
│   ├── api/            ← NestJS API (port 3001)
│   │   ├── src/
│   │   │   ├── analysis/       ← Frequency analysis
│   │   │   ├── common/         ← DTOs, pipes, filters
│   │   │   ├── connection/     ← Connectivity check
│   │   │   ├── cron/           ← Scheduled scraping
│   │   │   ├── database/       ← TypeORM entity + module
│   │   │   ├── scraping/       ← Web scraper (baloto.com)
│   │   │   ├── sync/           ← Sync endpoint (GET /sync/sorteos)
│   │   │   └── ticket/         ← Ticket generation
│   │   └── test/               ← E2E tests
│   ├── web/            ← Next.js 15 frontend (port 3000)
│   └── desktop/        ← Electron sync module (offline-first)
│       └── sync/       ← SyncClient (better-sqlite3)
├── libs/
│   └── shared/         ← Shared TypeScript types
├── docs/               ← Technical documentation
├── railway.toml        ← Railway deployment config
└── package.json        ← Root scripts (delegates to apps/api)
```

---

## API endpoints reference

All routes use the `/api/v1` prefix.

| Method | Path | Description | Key params |
|--------|------|-------------|-----------|
| GET | `/api/v1/status` | Server health | — |
| GET | `/api/v1/conteo` | Frequency counts | `tipo`, `fecha` |
| GET | `/api/v1/recent-draws` | Recent draws | `tipo`, `cantidad` |
| GET | `/api/v1/generar` | Generate tickets | `tipo`, `fecha`, `tickets` |
| PUT | `/api/v1/load` | Full historical scrape | — |
| POST | `/api/v1/refresh` | Incremental scrape | — |
| GET | `/api/v1/sync/sorteos` | Sync endpoint | `after` (ISO date) |

---

## Common issues

**API won't start — `connection refused` on PostgreSQL**
→ Make sure PostgreSQL is running and `.env` credentials are correct.

**`yarn test:e2e` fails — port already in use**
→ Stop the running API (`Ctrl+C`) before running E2E tests.

**Frontend shows "Offline"**
→ The API isn't running. Start it first with `yarn start:dev` in `apps/api/`.

**Scraping returns 0 results**
→ The baloto.com site may have changed. Check `apps/api/src/scraping/scraping.service.ts` selectors.
