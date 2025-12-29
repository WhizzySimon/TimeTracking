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

| When                                                              | Read first                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------- |
| **Session start**                                                 | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/session-start.md`                  |
| **Writing/editing code**                                          | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/code-quality.md`                   |
| **Executing commands (watcher)**                                  | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/command-execution.md`              |
| **Working on UI (.svelte)**                                       | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/ui-work.md`                        |
| **Creating folders/files/docs**                                   | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/naming-conventions.md`             |
| **Creating/updating spec**                                        | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/spec-writing.md`                   |
| **Creating/updating plan**                                        | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/planning.md`                       |
| **Before implementing**                                           | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/implementation.md`                 |
| **Before marking task complete**                                  | Run `/audit` (GPT-5.2 Medium), ensure Evidence Bundle is staged |
| **Before git commit**                                             | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/pre-commit.md`                     |
| **Starting a task**                                               | `Docs/DevFramework/ToolSetup                                    |
| Framework/TaskQualityAssurance/boxes/<box>.md` (choose box first) |
| **Session end**                                                   | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/session-end.md`                    |
| **Changing framework docs**                                       | `Docs/DevFramework/ToolSetup                                    |
| Framework/JustInTimeAgentRules/framework-changes.md`              |

**Each file has a canary marker. Output it to prove you read it.**

---

## Rule Read Logging

When you actually consult/read a rule file to guide your behavior, emit an invisible marker at the end of your response:

```
<!-- RULE_CONSULTED: Docs/DevFramework/JustInTimeAgentRules/code-quality.md, Docs/DevFramework/JustInTimeAgentRules/pre-commit.md -->
```

- Use relative paths from repo root
- Comma-separate multiple files
- Only include files you actually opened and read, not just mentioned
- This marker is parsed by hooks for analytics; do not add any other explanation

---

## Quick Reference

| Need to...          | Location                                   |
| ------------------- | ------------------------------------------ |
| Find app spec       | `Docs/AppDocs/Features/Specs/<feature>.md` |
| Find app plan       | `Docs/AppDocs/Features/Plans/<feature>.md` |
| Find app tasks      | `Docs/AppDocs/Features/Tasks/<feature>.md` |
| Find framework spec | `Docs/DevFramework/ToolSetup               |

Framework/FrameworkFeatureSpecs
/<feature>.md`       |
| Log a change        |`Docs/DevFramework/FrameworkSelfImprovementLogs
/CHANGELOG.md`      |
| Log a decision      |`Docs/DevFramework/FrameworkSelfImprovementLogs
/DECISIONS.md`      |
| Capture feedback    |`Docs/DevFramework/FrameworkSelfImprovementLogs
/LEARNINGS-INBOX.md`|
| Check learnings     |`Docs/DevFramework/FrameworkSelfImprovementLogs
/LEARNINGS.md` |

---
