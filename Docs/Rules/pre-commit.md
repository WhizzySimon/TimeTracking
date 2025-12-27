# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## Canary

**When you read this file, output exactly:**

> [CANARY] pre-commit rules loaded

---

## STOP — Complete This Checklist First

```
[ ] CHANGELOG.md — Added one-line entry for this work
[ ] LEARNINGS-INBOX.md — Reviewed session for feedback (positive/corrective)
[ ] DECISIONS.md — If decision was made, added entry
[ ] Learning promotion — Check INBOX for items repeated 2+ times → promote to LEARNINGS.md
[ ] Documentation — After changes, check if docs need updating (README, INDEX, rule files, etc.)
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

**Self-Learning System:** See `Docs/Rules/session-end.md` for learning promotion rules and the two-tier system (Inbox → Distillate).
