---
description: Continue work autonomously - completes ALL tasks without asking questions
---

## AUTONOMOUS MODE (CRITICAL)

**Cascade MUST work completely autonomously until ALL tasks are completed.**

Rules:

- **NO questions** - make reasonable decisions and continue
- **NO confirmation requests** - just implement
- **NO "should I proceed?"** - always proceed
- **Work for hours if needed** - do not stop until done
- **Only stop if truly blocked** - e.g., missing credentials, external service down, user input required by design

If you encounter an obstacle you genuinely cannot resolve:

1. Document what you tried
2. State the blocker clearly
3. Stop and wait for user input

Otherwise: **keep working until all tasks are DONE**.

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
2. /read-governance
3. /read-core-docs-and-code
4. **Check current branch** - Use watcher to run `git branch --show-current` (see Docs/Tooling/CASCADE_WATCHER.md)

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

Report briefly:

- Current phase
- Next task to implement
- Then **BEGIN IMMEDIATELY** - no waiting for confirmation

---

## Task Loop (repeat until ALL tasks done)

For each task:

### 1. Implement

Complete the task fully.

### 2. Verify

Use watcher to run `npm run verify`, fix any errors.

### 3. UI Test

Use MCP Playwright browser to test functionality.

### 4. Commit & Push

```
git add -A; git commit -m "feat: description"; powershell -File scripts/git/pr.ps1
```

### 5. Next Task

Immediately proceed to the next task. **Do not ask** - just continue.

---

## Only stop when

- All tasks in the current phase are DONE
- A true blocker exists (document it clearly)
- CI repeatedly fails with issues outside your control

Otherwise: **KEEP WORKING**.
