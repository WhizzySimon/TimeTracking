# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## Dev Framework

This project uses a **Just-in-Time (JIT) rule system** for AI-assisted development with Windsurf/Cascade.

**How it works:**

```
┌─────────────────────────────────────────────────────────────┐
│  .windsurf/rules/always-on.md   ← THE ONLY always-on rule  │
│         │                                                   │
│         ▼                                                   │
│  Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md       │
│         │                                                   │
│         ├──► session-start.md, code-quality.md             │
│         ├──► command-execution.md, pre-commit.md           │
│         └──► ... (10 JIT rules with canary markers)        │
│                                                             │
│  .windsurf/workflows/                                       │
│         ├── entrypoints/  (/new-task, /continue-work, ...) │
│         └── helpers/      (rules-read-all, read-governance) │
└─────────────────────────────────────────────────────────────┘
```

**Key files:**

- **Docs/INDEX.md** — Doc hierarchy, priority order
- **Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md** — When to read which rule
- **Docs/DevFramework/ToolSetup
Framework/ToolSetup
/BOOTSTRAP.md** — Tooling setup

**Trigger points:** session-start, writing code, executing commands, pre-commit, session-end, etc.

Each rule file has a **canary marker** — Cascade outputs it to prove the rule was read.

## Start a new Cascade session

**Step 1:** Open two integrated terminals:

Terminal 1 - Dev Server:

```
npm run dev
```

Terminal 2 - Cascade Watcher (optional fallback):

The integrated PowerShell terminal works directly. The watcher is only needed as fallback if `run_command` fails.

See `Docs/DevFramework/ToolSetup
Framework/ToolSetup
/BOOTSTRAP.md` for watcher setup if needed.

**Step 2:** Start a new chat with:

```
/new-task
```

**Step 3:** Describe your task. Cascade will read docs and begin working.

## Git Workflow

Simple dev/main model:

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

```bash
# After completing work
git add -A
git commit -m "feat: description"
git push
```

No PRs, no branch protection, no CI blocking. Just commit and push.

## Scripts

| Script                          | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `scripts/watcher-main.ps1`      | Main watcher orchestrator (start once)                |
| `scripts/watcher.ps1`           | Child watcher (spawned automatically by main)         |
| `scripts/build/verify-code.ps1` | Runs format, check, lint (called by `npm run verify`) |

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

See `Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/` for detailed testing guides.

## Developer Guide

### Versioning

TimeTracker uses a 4-part version: `X.Y.Z.B`

- `X.Y.Z` = Semantic version (major.minor.patch)
- `B` = Build number (auto-increments, resets on version bump)

The version is derived from git tags using `git describe`. Each build includes:

- Version string (e.g., `1.0.0.5`)
- Commit hash for traceability
- Build timestamp

### Version Management Scripts

Located in `scripts/git/`:

```bash
# Bump version (creates git tag, resets build number)
node scripts/git/bump-version.js patch   # 1.0.0 → 1.0.1
node scripts/git/bump-version.js minor   # 1.0.1 → 1.1.0
node scripts/git/bump-version.js major   # 1.1.0 → 2.0.0

# Release to production (merges dev → main, creates GitHub release)
node scripts/git/release.js
```

See `scripts/git/README.md` for detailed documentation.
