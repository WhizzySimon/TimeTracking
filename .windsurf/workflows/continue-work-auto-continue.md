---
description: Continue work autonomously - completes ALL tasks without asking questions
---

## User Setup (before starting)

Tell the User to run: npm run dev

---

## Cascade Workflow (AUTONOMOUS MODE)

**KEY DIFFERENCE:** In this mode, Cascade does NOT ask questions. It makes reasonable decisions and proceeds. If something is truly ambiguous, it documents the assumption and continues.

### Step 1: Setup

1. Check current branch: `git branch --show-current`

### Step 2: Ensure on dev branch

```
git checkout dev
git pull origin dev
```

Then:

3. Read `Docs/Features/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
4. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/Features/Tasks/<feature>.md` file
5. Start implementing the next incomplete task

**DO NOT ASK** which task to work on. Pick the next incomplete task in order.

---

## Task Loop (AUTONOMOUS)

For each task:

1. **Implement** - Write the code
2. **Verify** - Run `npm run verify`, fix errors
3. **Test UI** - Use MCP Playwright if applicable
4. **Update progress** - Mark task complete in `Docs/Features/IMPLEMENTATION_PROGRESS.md`
5. **Session-end** - Follow `DevFramework/JustInTimeAgentRules/pre-commit.md` (changelog, commit, push)
6. **Continue to next task** - Do NOT stop to ask if you should continue

**STOP ONLY when:**

- All tasks in the current phase are complete
- A blocking error cannot be resolved
- User interrupts

---

## After ALL tasks complete

1. Update `Docs/Features/IMPLEMENTATION_PROGRESS.md` with all completed tasks
2. Final commit and push
3. Report summary of what was completed
