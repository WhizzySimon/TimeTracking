# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## Entry points

- Human onboarding: `START_HERE.md`
- Single source of truth + priority order: `Docs/INDEX.md`
- Agent/process rules: `AGENTS.md`

## Start a new Cascade session

**Step 1:** Open two integrated terminals and run:

Terminal 1 - Dev Server:

```
npm run dev
```

Terminal 2 - Cascade Watcher:

```
powershell -File scripts/cascade-watcher.ps1
```

**Step 2:** Start a new chat with:

```
/continue-work
```

**Step 3:** Say "done" when Cascade asks, then it continues automatically.

## Scripts

| Script                        | Purpose                                               |
| ----------------------------- | ----------------------------------------------------- |
| `scripts/cascade-watcher.ps1` | Watches for commands from Cascade                     |
| `scripts/verify-code.ps1`     | Runs format, check, lint (called by `npm run verify`) |

## Commands

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start dev server                     |
| `npm run verify`    | Run format + TypeScript check + lint |
| `npm run test:unit` | Run unit tests (Vitest)              |
| `npm run test:e2e`  | Run E2E tests (Playwright)           |
| `npm run build`     | Build for production                 |

## Testing

### Before/After Making Changes

Run these commands to catch regressions:

```bash
npm run test:unit    # Fast logic tests (57 tests, ~1.4s)
npm run verify       # Format + TypeScript + Lint
npm run test:e2e     # Browser tests (9 tests, ~30s)
```

### What Each Test Suite Covers

**Unit tests** (`npm run test:unit`):

- Calculation logic: Ist, Soll, Saldo, formatHours
- Date utilities: formatDate, parseDate, getWeekNumber, addDays
- Files: `src/lib/utils/calculations.test.ts`, `src/lib/utils/date.test.ts`

**E2E tests** (`npm run test:e2e`):

- App load and navigation
- Add/edit tasks
- Category management (system vs user categories)
- Data persistence across reload
- Files: `e2e/basic-flow.test.ts`, `e2e/milestone1.test.ts`

### Testing Documentation

See `Docs/Testing/` for detailed testing guides.
