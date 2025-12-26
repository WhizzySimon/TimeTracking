---
description: Continue work autonomously - completes ALL tasks without asking questions
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

## Cascade Workflow (AUTONOMOUS MODE)

**KEY DIFFERENCE:** In this mode, Cascade does NOT ask questions. It makes reasonable decisions and proceeds. If something is truly ambiguous, it documents the assumption and continues.

### Step 0: Watcher Instance

If the user specified an instance (e.g., `/continue-work-auto-continue B`), use that instance.
Otherwise, **try Instance A first**. If Instance A is not responding (status stuck on RUNNING for >30 seconds), **automatically switch to Instance B**.

Remember the instance for this entire session:

- Instance A: `scripts/watcher/A/command.txt`, `scripts/watcher/A/status.txt`, `scripts/watcher/A/output.txt`
- Instance B: `scripts/watcher/B/command.txt`, `scripts/watcher/B/status.txt`, `scripts/watcher/B/output.txt`

### Step 1: Setup

Run these workflows first:

1. /rules-read-all
2. /read-governance (includes health checks — fix issues automatically in autonomous mode)
3. /read-core-docs-and-code
4. **Check current branch** - Use watcher to run `git branch --show-current`

### Step 2: Branch Decision

**New chat session = new branch.** Create a branch directly from current position:

```
git checkout -b feat/<task-name>
```

**Do NOT go to main first.** See `Docs/Tooling/GIT_WORKFLOW.md` section "Anti-Pattern 1" for why.

Then:

5. Read `Docs/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
6. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/Tasks/<feature>.md` file
7. Start implementing the next incomplete task

**DO NOT ASK** which task to work on. Pick the next incomplete task in order.

---

## Task Loop (AUTONOMOUS)

For each task:

1. **Implement** - Write the code
2. **Verify** - Run `npm run verify` via watcher, fix errors
3. **Test UI** - Use MCP Playwright if applicable
4. **Commit** - `git add -A` then `git commit -m "feat: description"`
5. **Push** - `powershell -File scripts/git/pr.ps1`
6. **Update progress** - Mark task complete in `Docs/IMPLEMENTATION_PROGRESS.md`
7. **Continue to next task** - Do NOT stop to ask if you should continue

**STOP ONLY when:**

- All tasks in the current phase are complete
- A blocking error cannot be resolved
- User interrupts

---

## After ALL tasks complete

1. Update `Docs/IMPLEMENTATION_PROGRESS.md` with all completed tasks
2. Final commit and push
3. Report summary of what was completed
