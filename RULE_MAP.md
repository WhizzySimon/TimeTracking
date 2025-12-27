# Rule Map

Navigation for just-in-time rule loading. Read the right rules at the right time.

---

## Trigger Points

| When                        | Read first                        |
| --------------------------- | --------------------------------- |
| **Session start**           | `Docs/Rules/session-start.md`     |
| **Creating/updating spec**  | `Docs/Rules/spec-writing.md`      |
| **Creating/updating plan**  | `Docs/Rules/planning.md`          |
| **Before implementing**     | `Docs/Rules/implementation.md`    |
| **Before git commit**       | `Docs/Rules/pre-commit.md`        |
| **Session end**             | `Docs/Rules/session-end.md`       |
| **Changing framework docs** | `Docs/Rules/framework-changes.md` |

---

## Core Principles (always in mind)

- **Source of truth:** `Docs/INDEX.md` (priority order when docs conflict)
- **Never use git stash** — causes data loss, use WIP commits instead
- **Use `&&` for watcher commands** — watcher uses cmd.exe, not PowerShell

---

## Quick Reference

| Need to...       | Location                         |
| ---------------- | -------------------------------- |
| Find a spec      | `Docs/Specs/<feature>.md`        |
| Find a plan      | `Docs/Plans/<feature>.md`        |
| Find tasks       | `Docs/Tasks/<feature>.md`        |
| Log a change     | `Docs/Devlog/CHANGELOG.md`       |
| Log a decision   | `Docs/Devlog/DECISIONS.md`       |
| Capture feedback | `Docs/Devlog/LEARNINGS-INBOX.md` |
| Check learnings  | `Docs/Devlog/LEARNINGS.md`       |

---

## Communication Style

When responding in chat, output in this structure:

1. What you understood (bullets)
2. What you will change (files + bullets)
3. Implementation notes (only what matters)
4. Verification you ran (exact commands) + results
5. Any spec/plan/tasks updates required
