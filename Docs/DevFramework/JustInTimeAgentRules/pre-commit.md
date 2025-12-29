# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## Canary

**When you read this file, output exactly:**

> [CANARY] pre-commit rules loaded

---

## Audit Gate (required before commit)

1. Read `Docs/DevFramework/JustInTimeAgentRules/ai-config.json` → `switch_model_before_audit`
2. **Prepare for audit (Builder does this BEFORE switching models):**
   - Run `git add -A` to stage all changes
   - Create Evidence Bundle from `Docs/DevFramework/FrameworkSelfImprovementLogs/Evidence/_template.md` - Path: `Docs/DevFramework/FrameworkSelfImprovementLogs/Evidence/AUD-YYYY-MM-DD-01.md` - Fill in: acceptance criteria, commands run, planned scope
   - Stage the Evidence Bundle: `git add <evidence-bundle-path>`
3. If `switch_model_before_audit` is `true` and you are Builder:
   - **STOP** and instruct user to switch to GPT-5.2 Medium Reasoning and run `/audit`
4. If `switch_model_before_audit` is `false`:
   - Run `/audit` now
5. Verify `/audit` **PASS** before proceeding to commit

---

## STOP — Complete This Checklist First

**If session had detours or you're unsure what was completed:** Read `sync-check.md` first.

```
[ ] Sync check — If needed, run sync-check.md to verify what was done
[ ] /audit PASS (see Audit Gate above)
[ ] CHANGELOG.md — Added one-line entry for this work
[ ] Self-learning — Follow self-learning-system.md (read, capture, promote)
[ ] DECISIONS.md — If decision was made, added entry
[ ] IMPLEMENTATION_PROGRESS.md — If tasks added/changed/completed, update progress tracker
[ ] Spec/Plan/Tasks sync — If Spec changed, check Plan; if Plan changed, check Tasks
```

**This is not optional.** Violations: 2025-12-26, 2025-12-27.

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

## Commit Message Format

- `feat:` — New feature or capability
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code restructuring without behavior change
- `chore:` — Maintenance, dependencies, config
- `test:` — Test additions or fixes

