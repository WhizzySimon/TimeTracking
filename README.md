# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## Entry points

- Human onboarding: `START_HERE.md`
- Single source of truth + priority order: `Docs/INDEX.md`
- Agent/process rules: `AGENTS.md`

## Start a new Cascade session

**Step 1:** Start the development environment:
```
.\scripts\start-session.ps1
```
This opens two windows:
- Dev server (`npm run dev`)
- Cascade watcher (enables autonomous command execution)

**Step 2:** Start a new chat with:
```
/continue-work
```

**Step 3:** Say "done" when Cascade asks, then it continues automatically.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/start-session.ps1` | Start dev server + watcher (run before each session) |
| `scripts/cascade-watcher.ps1` | Watches for commands from Cascade |
| `scripts/verify-code.ps1` | Runs format, check, lint (called by `npm run verify`) |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run verify` | Run format + TypeScript check + lint |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run build` | Build for production |
