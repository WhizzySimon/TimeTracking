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
5. Read `Docs/Tasks/timetracker-v1-implementation.md` to find the next incomplete task
6. Start implementing the next task following the Automated Task Workflow from COMMAND_EXECUTION_RULES.md

Report:

- Current phase
- Next task to implement
- Begin implementation immediately
