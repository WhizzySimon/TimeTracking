---
description: Continue work on TimeTracker - reads all context and finds next task automatically
---

## User Setup (before starting)

Open three integrated terminals and run:

**Terminal 1 - Dev Server:**

```
npm run dev
```

**Terminal 2 - Cascade Watcher (Instance A):**

```
powershell -File scripts/watcher.ps1 -Instance A
```

**Terminal 3 - Cascade Watcher (Instance B) - for parallel chat sessions:**

```
powershell -File scripts/watcher.ps1 -Instance B
```

Then tell Cascade "done" to begin.

---

## Cascade Workflow

### Step 0: Watcher Instance (CRITICAL)

If the user specified an instance (e.g., `/continue-work A`), use that instance.
Otherwise, ask: **"Which watcher instance are you using? (A or B)"**

Remember the instance for this entire session:

- Instance A: `scripts/watcher/A/command.txt`, `scripts/watcher/A/status.txt`, `scripts/watcher/A/output.txt`
- Instance B: `scripts/watcher/B/command.txt`, `scripts/watcher/B/status.txt`, `scripts/watcher/B/output.txt`

### Step 1: Setup

Run these workflows first:

1. /rules-read-all
2. /read-governance
3. /read-core-docs-and-code
4. **Check current branch** - Use watcher to run `git branch --show-current`

### Step 2: Branch Decision (CRITICAL)

**New chat session = new branch.** Create a branch directly from current position:

```
git checkout -b feat/<task-name>
```

**Do NOT go to main first.** See `Docs/Tooling/GIT_WORKFLOW.md` section "Anti-Pattern 1" for why.

**Exception:** If continuing related work in the same chat, you may stay on the current branch and make multiple PRs.

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
