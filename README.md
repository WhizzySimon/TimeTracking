# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## Entry points

- Human onboarding: `START_HERE.md`
- Single source of truth + priority order: `Docs/INDEX.md`
- Agent/process rules: `AGENTS.md`

## Start a new Cascade session

**Step 1:** Open three integrated terminals and run:

Terminal 1 - Dev Server:

```
npm run dev
```

Terminal 2 - Cascade Watcher (Instance A):

```
powershell -File scripts/watcher.ps1 -Instance A
```

Terminal 3 - Cascade Watcher (Instance B) - for parallel chat sessions:

```
powershell -File scripts/watcher.ps1 -Instance B
```

**Step 2:** Start a new chat with:

```
/new-task
```

Tell Cascade which watcher instance to use (A or B). Each chat session should use a different instance.

**Step 3:** Describe your task. Cascade will read docs and begin working.

## Scripts

| Script                            | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `scripts/watcher.ps1 -Instance X` | Multi-instance watcher for Cascade commands (A or B)  |
| `scripts/build/verify-code.ps1`   | Runs format, check, lint (called by `npm run verify`) |

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
