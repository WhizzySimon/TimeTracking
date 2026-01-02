# Sync Check Rules

**Trigger:** Before commit, especially if session had detours or you're unsure what was completed

---

## Canary

**When you read this file, output exactly:**

> [CANARY] sync-check rules loaded

---

## When to Run

- Session had bug fixes or detours from original task
- Unsure what work was actually completed
- Before commit if session was long or complex

---

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
Read: TempAppDevDocs/Features/IMPLEMENTATION_PROGRESS.md
```

Extract:

- Current focus phase (from "Current Focus" line)
- All tasks with status PENDING or "Not started" in that phase
- Any BLOCKING items

### 3. Check Task Files (if needed)

If the current phase has a Tasks file, read it:

- `TempAppDevDocs/Features/Tasks/<phase-name>.md`

### 4. Cross-Reference Chat vs Docs

Create a sync status table:

| Area                                  | In Sync? | Action Needed              |
| ------------------------------------- | -------- | -------------------------- |
| AllProjectChangesLoggedAtPreCommit.md | ✅/❌    | Add entry if work was done |
| IMPLEMENTATION_PROGRESS.md            | ✅/❌    | Update if tasks completed  |
| LEARNINGS-INBOX.md                    | ✅/❌    | Add lessons if any         |

### 5. Report Summary

Output:

1. **Completed this session**: List completed work
2. **Unfinished**: List any incomplete tasks
3. **Ready to commit**: Yes/No with reason

---

## Example Output

```
# Sync Check Complete

## This Session
- Started: /new-task
- Detour: Fixed X bug
- Completed: Bug fix committed

## Sync Status
| Area                       | In Sync? |
| -------------------------- | -------- |
| AllProjectChangesLoggedAtPreCommit.md | ✅ |
| IMPLEMENTATION_PROGRESS.md | ✅       |
| LEARNINGS-INBOX.md         | ✅       |

## Ready to Commit
Yes — all docs in sync, work complete.
```
