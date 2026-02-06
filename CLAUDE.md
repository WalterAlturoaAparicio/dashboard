# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baloto Generator is a Colombian lottery (Baloto) analysis and ticket generation application. It scrapes lottery results from baloto.com, stores them in a database, analyzes number frequencies, and generates weighted random tickets based on historical data.

## Architecture

The project consists of three components:

- **backend/** - NestJS API server (port 3001) with TypeORM/PostgreSQL
- **baloto-dashboard/** - Next.js 15 frontend dashboard (port 3000) with shadcn/ui components
- **main.js** - Electron wrapper that launches both backend and frontend

### Backend Structure

- `baloto.service.ts` - Core business logic: web scraping, frequency analysis, ticket generation
- `baloto.cron.service.ts` - Scheduled scraping (Tues/Thurs/Sun at 12:00)
- `app.controller.ts` - REST endpoints: `/conteo`, `/recent-draws`, `/generar`, `/load`, `/refresh`
- `database/sorteo.entity.ts` - TypeORM entity for lottery results (Sorteo table)

### Key Concepts

- **Sorteo**: A lottery draw record with date, type (baloto/revancha), 5 numbers, and superbalota
- **Tipo**: Either 'baloto' or 'revancha' (two lottery variants)
- **Superbalota**: The 6th bonus number in each draw
- Ticket generation uses weighted pools based on historical frequency

## Development Commands

### Backend (from `backend/` directory)
```bash
yarn install
yarn start:dev      # Development with watch mode
yarn build          # Build for production
yarn start:prod     # Run production build
yarn test           # Run unit tests
yarn test:watch     # Run tests in watch mode
yarn test:e2e       # Run e2e tests
yarn lint           # ESLint with auto-fix
yarn format         # Prettier formatting
```

### Frontend (from `baloto-dashboard/` directory)
```bash
pnpm install
pnpm dev            # Development server
pnpm build          # Production build
pnpm lint           # ESLint
```

### Electron (from root directory)
```bash
yarn install
```

## Environment Configuration

Backend requires `.env` file with PostgreSQL connection:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/conteo` | GET | Get frequency counts (params: `tipo`, `fecha`) |
| `/recent-draws` | GET | Get recent draws (params: `tipo`, `cantidad`) |
| `/generar` | GET | Generate tickets (params: `tipo`, `fecha`, `tickets`) |
| `/load` | PUT | Load all historical data (initial scrape) |
| `/refresh` | POST | Scrape new results incrementally |
