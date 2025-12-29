---
description: Check what tasks are open and sync chat with documentation
---

# Sync Check Workflow

Run this when you lose track of what you were doing, or after fixing bugs/detours.

## Steps

### 1. Summarize This Chat Session

Review the current chat from the beginning. Create a table:

| Time (approx) | Activity           | Status   |
| ------------- | ------------------ | -------- |
| ...           | What was attempted | ✅/❌/⏳ |

Identify:

- What task was originally assigned (if any)
- What detours/bugs were fixed
- What remains incomplete

### 2. Check IMPLEMENTATION_PROGRESS.md

```
Read: Docs/DevFramework/ToolSetup
Framework/IMPLEMENTATION_PROGRESS.md
```

Extract:

- Current focus phase (from "Current Focus" line)
- All tasks with status PENDING or "Not started" in that phase
- Any BLOCKING items

### 3. Check Task Files (if needed)

If the current phase has a Tasks file, read it:

- `Docs/AppDocs/Features/Tasks/<phase-name>.md` or `Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureTasks
/<phase-name>.md`

### 4. Cross-Reference Chat vs Docs

Create a sync status table:

| Area                       | In Sync? | Action Needed              |
| -------------------------- | -------- | -------------------------- |
| CHANGELOG.md               | ✅/❌    | Add entry if work was done |
| IMPLEMENTATION_PROGRESS.md | ✅/❌    | Update if tasks completed  |
| LEARNINGS-INBOX.md         | ✅/❌    | Add lessons if any         |

### 5. Report Next Actions

Output:

1. **Unfinished from this chat**: List any incomplete tasks from this session
2. **Next documented task**: The next pending task per IMPLEMENTATION_PROGRESS.md
3. **Options**: Give user 2-3 options to proceed

## Example Output

```
# Sync Check Complete

## This Session
- Started: /new-task
- Detour: Fixed X bug (committed)
- Original task: Not assigned

## Next Documented Task
D5.0a - VERSION.md (Phase 0 blocker)

## Options
1. Continue with D5.0a
2. Pick different phase (A2-A6)
3. Something else
```
