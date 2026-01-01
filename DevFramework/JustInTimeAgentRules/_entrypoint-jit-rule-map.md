# Just-in-Time Rule Map

**This is the ONLY always-on rule.** Keep this table in mind.

---

## When You Read This File

**Immediately scan your current context** (task file, workflow, user request) and identify which triggers from the table below will apply. **Read those rule files NOW**, before proceeding.

Example: If you're about to implement a task, you will be writing code and committing. Pre-load:

- `code-quality.md` (writing code trigger)
- `implementation.md` (before implementing trigger)
- `pre-commit.md` (before commit trigger)

**This prevents forgetting rules mid-task.** Front-load what you'll need.

---

## During Execution

If a NEW trigger fires that you didn't anticipate, read that rule file before the action.

---

## Canary

**When you read this file, output exactly:**

> [CANARY] jit-rule-map loaded

---

## Trigger Points

| When                        | Read first                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------ |
| **Session start**           | `session-start.md`                                                                   |
| **Writing/editing code**    | `code-quality.md`                                                                    |
| **Executing commands**      | `command-execution.md`                                                               |
| **Working on UI (.svelte)** | `frontend-ui-standards.md`, `frontend-ux-standards.md`, `frontend-code-standards.md` |
| **Creating folders/files**  | `naming-conventions.md`                                                              |
| **Creating/updating spec**  | `spec-writing.md`                                                                    |
| **Creating/updating plan**  | `planning.md`                                                                        |
| **Before implementing**     | `implementation.md`                                                                  |
| **Debugging/troubleshooting** | `debugging.md`, `mindset.md`                                                       |
| **Before marking complete** | Run `/audit`, ensure Evidence Bundle is staged                                       |
| **Before git commit**       | `pre-commit.md`                                                                      |
| **Before commit (detours)** | `sync-check.md`                                                                      |
| **Starting a task**         | `DevFramework/TaskQualityAssurance/boxes/<box>.md`                                   |
| **Changing framework docs** | `framework-changes.md`                                                               |

**Each file has a canary marker. Output it to prove you read it.**

---

## Rule Read Logging

When you actually consult/read a rule file to guide your behavior, emit an invisible marker at the end of your response:

```
<!-- RULE_CONSULTED: DevFramework/JustInTimeAgentRules/code-quality.md, DevFramework/JustInTimeAgentRules/pre-commit.md -->
```

- Use relative paths from repo root
- Comma-separate multiple files
- Only include files you actually opened and read, not just mentioned
- This marker is parsed by hooks for analytics; do not add any other explanation

---

## Quick Reference

| Need to...          | Location                                                       |
| ------------------- | -------------------------------------------------------------- |
| Find app spec       | `Docs/AppDocs/Features/Specs/<feature>.md`                     |
| Find app plan       | `Docs/AppDocs/Features/Plans/<feature>.md`                     |
| Find app tasks      | `Docs/Features/Tasks/<feature>.md`                             |
| Find framework spec | `DevFramework/FrameworkFeatureSpecs/<feature>.md`              |
| Log a change        | `DevFramework/FrameworkSelfImprovementLogs/CHANGELOG.md`       |
| Log a decision      | `DevFramework/FrameworkSelfImprovementLogs/DECISIONS.md`       |
| Capture feedback    | `DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md` |
| Check learnings     | `DevFramework/FrameworkSelfImprovementLogs/LEARNINGS.md`       |

---
