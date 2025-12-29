---
description: Continue work autonomously - completes ALL tasks without asking questions
---

## User Setup (before starting)

Open two integrated terminals and run:

**Terminal 1 - Dev Server:**

```
npm run dev
```

**Terminal 2 - Cascade Watcher (optional):**

The watcher is only needed as fallback if the integrated terminal doesn't work.
See `Docs/DevFramework/DevFramework/ToolSetup/BOOTSTRAP.md` for watcher setup if needed.

Then tell Cascade "done" to begin.

---

## Cascade Workflow (AUTONOMOUS MODE)

**KEY DIFFERENCE:** In this mode, Cascade does NOT ask questions. It makes reasonable decisions and proceeds. If something is truly ambiguous, it documents the assumption and continues.

### Step 0: Command Execution

Use the integrated PowerShell terminal (`run_command` tool) for all commands.
The watcher system is deprecated and only used as fallback if the terminal doesn't work.

### Step 1: Setup

Run these workflows first:

1. /rules-read-all
2. /read-governance (includes health checks — fix issues automatically in autonomous mode)
3. /read-core-docs-and-code
4. **Check current branch** - Use watcher to run `git branch --show-current`

### Step 2: Ensure on dev branch

```
git checkout dev
git pull origin dev
```

Then:

5. Read `Docs/DevFramework/DevFramework/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
6. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/AppDocs/Features/Tasks/<feature>.md` or `Docs/DevFramework/DevFramework/FrameworkFeatureTasks
/<feature>.md` file
7. Start implementing the next incomplete task

**DO NOT ASK** which task to work on. Pick the next incomplete task in order.

---

## Task Loop (AUTONOMOUS)

For each task:

1. **Implement** - Write the code
2. **Verify** - Run `npm run verify` via watcher, fix errors
3. **Test UI** - Use MCP Playwright if applicable
4. **Update progress** - Mark task complete in `Docs/DevFramework/DevFramework/IMPLEMENTATION_PROGRESS.md`
5. **Session-end** - Follow `Docs/DevFramework/DevFramework/JustInTimeAgentRules/pre-commit.md` (changelog, commit, push)
6. **Continue to next task** - Do NOT stop to ask if you should continue

**STOP ONLY when:**

- All tasks in the current phase are complete
- A blocking error cannot be resolved
- User interrupts

---

## After ALL tasks complete

1. Update `Docs/DevFramework/DevFramework/IMPLEMENTATION_PROGRESS.md` with all completed tasks
2. Final commit and push
3. Report summary of what was completed
