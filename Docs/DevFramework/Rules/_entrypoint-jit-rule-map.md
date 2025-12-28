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

| When                             | Read first                                                                 |
| -------------------------------- | -------------------------------------------------------------------------- |
| **Session start**                | `Docs/DevFramework/Rules/session-start.md`                                 |
| **Writing/editing code**         | `Docs/DevFramework/Rules/code-quality.md`                                  |
| **Executing commands (watcher)** | `Docs/DevFramework/Rules/command-execution.md`                             |
| **Working on UI (.svelte)**      | `Docs/DevFramework/Rules/ui-work.md`                                       |
| **Creating/updating spec**       | `Docs/DevFramework/Rules/spec-writing.md`                                  |
| **Creating/updating plan**       | `Docs/DevFramework/Rules/planning.md`                                      |
| **Before implementing**          | `Docs/DevFramework/Rules/implementation.md`                                |
| **Before marking task complete** | Run `/audit` (GPT-5.2 Medium), ensure Evidence Bundle is staged            |
| **Before git commit**            | `Docs/DevFramework/Rules/pre-commit.md`                                    |
| **Starting a task**              | `Docs/DevFramework/TaskQualityAssurance/boxes/<box>.md` (choose box first) |
| **Session end**                  | `Docs/DevFramework/Rules/session-end.md`                                   |
| **Changing framework docs**      | `Docs/DevFramework/Rules/framework-changes.md`                             |

**Each file has a canary marker. Output it to prove you read it.**

---

## Rule Read Logging

When you actually consult/read a rule file to guide your behavior, emit an invisible marker at the end of your response:

```
<!-- RULE_CONSULTED: Docs/DevFramework/Rules/code-quality.md, Docs/DevFramework/Rules/pre-commit.md -->
```

- Use relative paths from repo root
- Comma-separate multiple files
- Only include files you actually opened and read, not just mentioned
- This marker is parsed by hooks for analytics; do not add any other explanation

---

## Quick Reference

| Need to...          | Location                                      |
| ------------------- | --------------------------------------------- |
| Find app spec       | `Docs/AppDocs/Specs/<feature>.md`             |
| Find app plan       | `Docs/AppDocs/Plans/<feature>.md`             |
| Find app tasks      | `Docs/AppDocs/Tasks/<feature>.md`             |
| Find framework spec | `Docs/DevFramework/Specs/<feature>.md`        |
| Log a change        | `Docs/DevFramework/Devlog/CHANGELOG.md`       |
| Log a decision      | `Docs/DevFramework/Devlog/DECISIONS.md`       |
| Capture feedback    | `Docs/DevFramework/Devlog/LEARNINGS-INBOX.md` |
| Check learnings     | `Docs/DevFramework/Devlog/LEARNINGS.md`       |

---

## Source of Truth

- **Doc hierarchy:** `Docs/INDEX.md` (priority order when docs conflict)
