# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## Canary

**When you read this file, output exactly:**

> [CANARY] pre-commit rules loaded

---

## Audit Gate (required before commit)

1. Read `Docs/DevFramework/Rules/ai-config.json` → `switch_model_before_audit`
2. If `true` and you are Builder (Opus):
   - Verify `/audit` was run by GPT-5.2 Medium Reasoning
   - If not: **STOP** and instruct user to switch model and run `/audit`
3. If `false`:
   - Run `/audit` now if not already done
4. Verify `/audit` **PASS** before proceeding to commit

---

## STOP — Complete This Checklist First

```
[ ] /audit PASS (see Audit Gate above)
[ ] CHANGELOG.md — Added one-line entry for this work
[ ] LEARNINGS-INBOX.md — Reviewed session for feedback (positive/corrective)
[ ] DECISIONS.md — If decision was made, added entry
[ ] Learning promotion — Check INBOX for items repeated 2+ times → promote to LEARNINGS.md
[ ] IMPLEMENTATION_PROGRESS.md — If tasks added/changed/completed, update progress tracker
[ ] Spec/Plan/Tasks sync — If Spec changed, check Plan; if Plan changed, check Tasks
[ ] Documentation — After changes, check if Docs/INDEX.md, README, rule files need updating
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

---

**Self-Learning System:** See `Docs/DevFramework/Rules/session-end.md` for learning promotion rules and the two-tier system (Inbox → Distillate).
