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

```
powershell -File scripts/cascade-watcher.ps1
```

Then tell Cascade "done" to begin.

---

## Cascade Workflow

Run these workflows first:

1. /rules-read-all
2. /read-governance
3. /read-core-docs-and-code

Then:

4. Read `Docs/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
5. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/Tasks/<feature>.md` file (e.g., `quick-start-ux.md`, `timetracker-v1-implementation.md`)
6. Start implementing the next incomplete task following the Task-Workflow from `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md`

Report:

- Current phase
- Next task to implement
- Begin implementation immediately

---

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification

Write `npm run verify` to `scripts/cascade-command.txt`, poll status, fix any errors.

### 2. UI Testing

Use MCP Playwright browser to test the implemented functionality.

### 3. Git Commit & Push (REQUIRED)

```
git add -A; git commit -m "feat: description of changes"; git push
```

Write this to `scripts/cascade-command.txt` and confirm success.

**Never end a session without committing AND pushing completed work. Push triggers CI/CD for immediate feedback.**

### 4. Check CI Status (OPTIONAL but recommended)

After push, check if CI passes:

```
powershell -File scripts/check-ci.ps1 -Wait -Logs
```

This will:

- Wait for the GitHub Actions run to complete
- Show PASSED/FAILED status
- Display failed job logs if CI fails

If CI fails, read the logs and fix the issues before ending the session.
