# TimeTracker

Offline-first time tracking app (SvelteKit PWA).

## DevFramework

This project uses a **Just-in-Time (JIT) rule system** for AI-assisted development with Windsurf/Cascade.

### The Problem This Solves

AI agents have a fundamental limitation: **rules loaded as context don't automatically get applied mid-task.** Even with rules in the system prompt, memories, and always-on files, the agent focuses on the immediate task and doesn't reliably consult rules at decision points.

### The Solution: `/next` Workflow

The `/next` workflow makes rule-loading part of the **TASK itself** (not just background context):

```
/next [your task description]
    │
    ▼
Step 1: Read JIT rule map → Identify which rules apply
    │
    ▼
Step 2: Load rules → Output [RULE-LOADED] markers
    │
    ▼
Step 3: Execute task with rules in active consideration
    │
    ▼
Step 4: Output MANDATORY Rule Compliance section
        - Rules loaded
        - Decision points
        - Rules applied
        - Rules missed (honest reflection)
```

**Why this works:**
- Rules become TASK (Step 1), not just context
- Output requirement forces active consideration
- "Rules missed" section builds in honesty check
- User can verify if agent is actually following rules

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  .windsurf/rules/always-on.md   ← Points to JIT rule map   │
│         │                                                   │
│         ▼                                                   │
│  DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md │
│         │                                                   │
│         ├──► mindset.md (core behavior: Be Honest, etc.)   │
│         ├──► code-quality.md, pre-commit.md                │
│         ├──► frontend-*.md, debugging.md                   │
│         └──► ... (20+ JIT rules with canary markers)       │
│                                                             │
│  .windsurf/workflows/                                       │
│         ├── next.md          ← Universal entry point       │
│         ├── capture-learnings.md                           │
│         ├── new-task.md, new-feature.md                    │
│         └── commit.md, audit.md, test-app.md               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| JIT rules (not always-on) | Reduce context bloat; load only what's needed |
| Canary markers | Proof that rule was actually read |
| `/next` as entry point | Makes rule-loading part of task, not context |
| Mandatory compliance output | Forces agent to actively consider rules |
| Direct-to-JIT learnings | Skip INBOX; faster evolution after approval |
| Goal-tracing in capture | Every learning must connect to: quality + speed + human time |

### Self-Learning System

Learnings are captured via `/capture-learnings` workflow at chat-close:

1. **Analysis** — Deep reasoning with goal-tracing (not surface extraction)
2. **Approval** — User reviews before adding to rules
3. **Integration** — Added directly to JIT rule files as examples

No intermediate INBOX — analysis quality is high enough to go directly to rules.

## Start a new Cascade session

**Step 1:** Start dev server:

```
npm run dev
```

**Step 2:** Start a new chat with:

```
/next [describe your task]
```

The agent will read the JIT rule map, load applicable rules, and include a Rule Compliance section in responses.

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

## Cloud Sync

### Last-Write-Wins (LWW) Merge

When syncing local and cloud data, conflicts are resolved automatically using entry-level LWW:

- Each entity (TimeEntry, Category, DayType, etc.) has an `updatedAt` timestamp
- On conflict, entries are compared by ID — the one with higher `updatedAt` wins
- Result: Both local and cloud changes are preserved; no manual conflict dialog needed

**Implementation:** `src/lib/backup/cloud.ts` → `mergeSnapshots()`

---

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
