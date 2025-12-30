# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## Canary

**When you read this file, output exactly:**

> [CANARY] pre-commit rules loaded

---

## Audit Gate (required before commit)

1. Read `DevFramework/JustInTimeAgentRules/ai-config.json` → `switch_model_before_audit`
2. **Prepare for audit (Builder does this BEFORE switching models):**
   - Run `git add -A` to stage all changes
   - Create Evidence Bundle from `DevFramework/FrameworkSelfImprovementLogs/Evidence/_template.md` - Path: `DevFramework/FrameworkSelfImprovementLogs/Evidence/AUD-YYYY-MM-DD-01.md` - Fill in: acceptance criteria, commands run, planned scope
   - Stage the Evidence Bundle: `git add <evidence-bundle-path>`
3. If `switch_model_before_audit` is `true` and you are Builder:
   - **STOP** and instruct user to switch to GPT-5.2 Medium Reasoning and run `/audit`
4. If `switch_model_before_audit` is `false`:
   - Run `/audit` now
5. Verify `/audit` **PASS** before proceeding to commit

---

## STOP — Complete This Checklist First

> **⚠️ Multiple Commits in One Chat?**
>
> - **User reminder:** Prefer one commit per chat to avoid duplicate self-learning entries
> - **Agent rule:** If a "Pre-Commit Checklist" block already exists in this chat, skip self-learning steps (A1, B1-B4) — they were already captured

**If session had detours or you're unsure what was completed:** Read `sync-check.md` first.

**EXECUTE IN ORDER — do not skip ahead.**

**You MUST output this checklist with status for each step before committing:**

```
## Pre-Commit Checklist

[x] 1. Sync check — Not needed (no detours) / Ran sync-check.md
[x] 2. Self-learning & improvement — Followed self-learning-system.md
[x] 3. CHANGELOG.md — Added entry for <task>
[N/A] 4. DECISIONS.md — No decisions / Added entry
[x] 5. IMPLEMENTATION_PROGRESS.md — Updated <task> status
[N/A] 6. Spec/Plan/Tasks sync — No changes / Synced
[x] 7. /audit PASS — Verdict: PASS
```

**Steps:**

1. **Sync check** — If needed, run sync-check.md to verify what was done
2. **Self-learning & improvement** — Follow self-learning-system.md (Parts A, B, C)
3. **CHANGELOG.md** — Add one-line entry for this work
4. **DECISIONS.md** — If decision was made, add entry
5. **IMPLEMENTATION_PROGRESS.md** — If tasks added/changed/completed, update tracker
6. **Spec/Plan/Tasks sync** — If Spec changed, check Plan; if Plan changed, check Tasks
7. **/audit PASS** — Run audit (see Audit Gate above); requires steps 1-6 complete

**This is not optional.** Show your work.

---

## Final Verification Gate (MANDATORY)

**Before running `git commit`, output this exact block:**

```
═══════════════════════════════════════════════════════════
                    FINAL VERIFICATION GATE
═══════════════════════════════════════════════════════════

## Audit Summary
- Evidence Bundle: <path>
- Verdict: PASS / FAIL
- Risk: low / medium / high

## Pre-Commit Checklist
[x] 1. Sync check — <status>
[x] 2. Self-learning — <status>
[x] 3. CHANGELOG.md — <status>
[x] 4. DECISIONS.md — <status>
[x] 5. IMPLEMENTATION_PROGRESS.md — <status>
[x] 6. Spec/Plan/Tasks sync — <status>
[x] 7. /audit PASS — <status>

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
