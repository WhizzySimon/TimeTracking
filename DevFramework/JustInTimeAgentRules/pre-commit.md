# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] pre-commit rules loaded

---

## Formatting (required before commit)

1. Run `npm run format:staged` to format staged files (fast)
2. Run `git add -A` to stage formatting changes

**Note:** Use `npm run format` for full repo formatting (rare, e.g., after Prettier config changes)

**Note:** Audit bundles are created at **task-file completion**, not per-commit. See task file template for audit trigger.

---

## STOP — Complete This Checklist First

**If session had detours or you're unsure what was completed:** Read `sync-check.md` first.

**EXECUTE IN ORDER — do not skip ahead.**

**You MUST output this checklist with status for each step before committing:**

```
## Pre-Commit Checklist

[x] 1. Sync check — Not needed (no detours) / Ran sync-check.md
[x] 2. AllProjectChangesLoggedAtPreCommit.md — Added entry for <task>
[N/A] 3. DECISIONS.md — No decisions / Added entry
[x] 4. IMPLEMENTATION_PROGRESS.md — Updated <task> status
[N/A] 5. Spec/Plan/Tasks sync — No changes / Synced
[x] 6. Process pattern check — No issues / Logged to INBOX
```

**Steps:**

1. **Sync check** — If needed, run sync-check.md to verify what was done
2. **AllProjectChangesLoggedAtPreCommit.md** — Add one-line entry for this work
3. **DECISIONS.md** — If decision was made, add entry
4. **IMPLEMENTATION_PROGRESS.md** — If tasks added/changed/completed, update tracker
5. **Spec/Plan/Tasks sync** — If Spec changed, check Plan; if Plan changed, check Tasks
6. **Process pattern check** — Detect issues (see below), log to LEARNINGS-INBOX.md if found

**Note:** Learning capture (behavioral, UI, technical) is done via `/capture-learnings` workflow at chat-close, not at pre-commit.

**This is not optional.** Show your work.

---

## Process Pattern Detection

Check for these issues and log to LEARNINGS-INBOX.md if found:

| Pattern         | Threshold                  | Action                                    |
| --------------- | -------------------------- | ----------------------------------------- |
| Repeated errors | Same error 3+ times        | Log with root cause                       |
| File churn      | Same file edited 5+ times  | Log, consider refactoring approach        |
| Scope drift     | Files touched outside plan | Log, verify intentional                   |
| Long session    | >2 hours on single task    | Log, consider breaking into smaller tasks |

---

## Final Verification Gate (MANDATORY)

**Before running `git commit`, output this exact block:**

```
═══════════════════════════════════════════════════════════
                    FINAL VERIFICATION GATE
═══════════════════════════════════════════════════════════

## Pre-Commit Checklist
[x] 1. Sync check — <status>
[x] 2. AllProjectChangesLoggedAtPreCommit.md — <status>
[x] 3. DECISIONS.md — <status>
[x] 4. IMPLEMENTATION_PROGRESS.md — <status>
[x] 5. Spec/Plan/Tasks sync — <status>
[x] 6. Process pattern check — <status>

## Verification Commands Run
- npm run verify: <result>
- UI tested: <yes/no, method>

═══════════════════════════════════════════════════════════
                      OK TO COMMIT
═══════════════════════════════════════════════════════════
```

**Rules:**

1. This block MUST appear as a single, uninterrupted output
2. Do NOT run `git commit` in the same tool call — wait for the gate to be visible
3. Only proceed to commit if ALL items show success status

---

## Git Workflow

We use a simple dev/main model:

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

**BANNED:** Never use `git stash` — causes data loss. Use WIP commits instead:

```bash
git add -A && git commit -m "WIP: description"
```

## Command Sequence

After completing a task:

```bash
git add -A
git commit -m "feat: description"
git push
```

**Push is mandatory.** Unpushed work is lost if the local environment changes.

## Post-Push Verification

After pushing, verify:

1. **Working tree clean:** `git status` shows nothing to commit
2. **No unpushed commits:** `git log origin/dev..HEAD --oneline` is empty

If either check fails, fix before ending the session.

## Post-Push Success Message (REQUIRED)

After successful push, ALWAYS output:

```
═══════════════════════════════════════════════════════════
✅ ALL PASSED — Task Complete
═══════════════════════════════════════════════════════════

## What was implemented
[1-2 sentence summary of the changes]

## How to test (if UI-related)
- [Step 1: Navigate to X]
- [Step 2: Click Y]
- [Step 3: Verify Z]
═══════════════════════════════════════════════════════════
```

If not UI-related, omit the "How to test" section.

## Commit Message Format

- `feat:` — New feature or capability
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code restructuring without behavior change
- `chore:` — Maintenance, dependencies, config
- `test:` — Test additions or fixes
