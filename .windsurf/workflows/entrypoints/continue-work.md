---
description: Continue work on TimeTracker - reads all context and finds next task automatically
---

## User Setup (before starting)

Open two integrated terminals and run:

**Terminal 1 - Dev Server:**

```
npm run dev
```

**Terminal 2 - Cascade Watcher:**

See `Docs/Tooling/BOOTSTRAP.md` for watcher setup instructions.

Then tell Cascade "done" to begin.

---

## Cascade Workflow

### Step 1: Read rules and docs

1. /rules-read-all
2. /read-governance
3. /read-core-docs-and-code

### Step 2: Ensure on dev branch

Run via watcher:

```
git checkout dev
git pull origin dev
```

### Step 3: Find and start next task

Then:

5. Read `Docs/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
6. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/Tasks/<feature>.md` file (e.g., `quick-start-ux.md`, `timetracker-v1-implementation.md`)
7. Start implementing the next incomplete task following the Task-Workflow from `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md`

Report:

- Current phase
- Next task to implement
- Begin implementation immediately

---

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification

Use watcher to run `npm run verify`, poll status, fix any errors. See `Docs/Tooling/CASCADE_WATCHER.md`.

### 2. UI Testing

Use MCP Playwright browser to test the implemented functionality.

### 3. Git Commit & Push (REQUIRED)

See AGENTS.md "Git workflow" section:

```
git add -A
git commit -m "feat: description"
git push
```
