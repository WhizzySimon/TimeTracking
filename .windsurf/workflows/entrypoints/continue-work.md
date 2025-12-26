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

Run these workflows first:

1. /rules-read-all
2. /read-governance (includes health checks for orphaned branches + pending PRs)
3. /read-core-docs-and-code
4. **Check current branch** - Use watcher to run `git branch --show-current`

### Branch Rule (CRITICAL)

Before starting any work:

- If on `main`: Create a new feature branch for the next task (e.g., `feat/P10-monetising`)
- If on a feature branch: Verify no other chat is using this branch
- **Each chat session MUST use its own unique branch**
- See `Docs/Tooling/GIT_WORKFLOW.md` section "Parallel Chat Sessions" for details

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

See AGENTS.md "Definition of done for a task" for the commit & push workflow.

### 4. Check CI Status (OPTIONAL but recommended)

After push, check if CI passes:

```
powershell -File scripts/git/check-ci.ps1 -Wait -Logs
# See Docs/Tooling/GIT_WORKFLOW.md for script locations
```

This will:

- Wait for the GitHub Actions run to complete
- Show PASSED/FAILED status
- Display failed job logs if CI fails

If CI fails, read the logs and fix the issues before ending the session.
