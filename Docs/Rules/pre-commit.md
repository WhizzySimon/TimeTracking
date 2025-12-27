# Pre-Commit Rules

**Trigger:** Before running `git commit`

---

## STOP — Complete This Checklist First

```
[ ] CHANGELOG.md — Added one-line entry for this work
[ ] LEARNINGS-INBOX.md — Reviewed session for feedback (positive/corrective)
[ ] DECISIONS.md — If decision was made, added entry
```

**This is not optional.** Violations: 2025-12-26, 2025-12-27.

---

## Git Workflow

We use a simple dev/main model:

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

## Command Sequence

After completing a task:

```bash
git add -A
git commit -m "feat: description"
git push
```

That's it. No PRs, no branch protection, no CI blocking.

## Commit Message Format

- `feat:` — New feature or capability
- `fix:` — Bug fix
- `docs:` — Documentation only
- `refactor:` — Code restructuring without behavior change
- `chore:` — Maintenance, dependencies, config
- `test:` — Test additions or fixes

---

**Next:** After session work is complete → Read `Docs/Rules/session-end.md`
