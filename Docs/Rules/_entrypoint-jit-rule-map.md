# Just-in-Time Rule Map

**This is the ONLY always-on rule.** Keep this table in mind.

**Before EVERY action:**

1. Re-read this file
2. Check if your next action matches a trigger below
3. If yes → read ONLY that specific rule file, output its canary
4. If no → proceed

**Do NOT read all rules at once.** Load rules just-in-time, one at a time, when the trigger fires.

---

## Canary

**When you read this file, output exactly:**

> [CANARY] jit-rule-map loaded

---

## Trigger Points

| When                             | Read first                                  |
| -------------------------------- | ------------------------------------------- |
| **Session start**                | `Docs/Rules/session-start.md`               |
| **Writing/editing code**         | `Docs/Rules/code-quality.md`                |
| **Executing commands (watcher)** | `Docs/Rules/command-execution.md`           |
| **Working on UI (.svelte)**      | `Docs/Rules/ui-work.md`                     |
| **Creating/updating spec**       | `Docs/Rules/spec-writing.md`                |
| **Creating/updating plan**       | `Docs/Rules/planning.md`                    |
| **Before implementing**          | `Docs/Rules/implementation.md`              |
| **Before git commit**            | `Docs/Rules/pre-commit.md`                  |
| **Starting a task**              | `Docs/AI/boxes/<box>.md` (choose box first) |
| **Session end**                  | `Docs/Rules/session-end.md`                 |
| **Changing framework docs**      | `Docs/Rules/framework-changes.md`           |

**Each file has a canary marker. Output it to prove you read it.**

---

## Rule Read Logging

When you actually consult/read a rule file to guide your behavior, emit an invisible marker at the end of your response:

```
<!-- RULE_CONSULTED: Docs/Rules/code-quality.md, Docs/Rules/pre-commit.md -->
```

- Use relative paths from repo root
- Comma-separate multiple files
- Only include files you actually opened and read, not just mentioned
- This marker is parsed by hooks for analytics; do not add any other explanation

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

## Source of Truth

- **Doc hierarchy:** `Docs/INDEX.md` (priority order when docs conflict)
