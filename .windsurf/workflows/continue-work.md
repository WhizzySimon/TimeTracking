---
description: Continue work on TimeTracker - reads all context and finds next task automatically
---

## User Setup (before starting)

Tell the user to run: `npm run dev`

---

## Cascade Workflow

### Step 1: Setup

1. Ensure on dev branch:

```
git checkout dev && git pull origin dev
```

### Step 2: Find and start next task

3. Read `Docs/Features/IMPLEMENTATION_PROGRESS.md` to find current phase and completed tasks
4. Find the relevant Tasks file:
   - Check "Current Phase" in IMPLEMENTATION_PROGRESS.md
   - Read the corresponding `Docs/Features/Tasks/<feature>.md` file

Report:

- Current phase
- Next task to implement
- Begin implementation immediately

---

## After task completion (MANDATORY - DO NOT SKIP)

### 1. Verification

Run `npm run verify`, fix any errors until ALL PASSED.

### 2. UI Testing

Use MCP Playwright browser to test the implemented functionality.

### 3. Git Commit & Push (REQUIRED)

**Follow `DevFramework/JustInTimeAgentRules/pre-commit.md`** — includes changelog update, commit, and push.
