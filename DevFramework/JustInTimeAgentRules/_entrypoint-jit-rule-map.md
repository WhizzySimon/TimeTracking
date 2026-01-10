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

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] jit-rule-map loaded

---

## Trigger Points

| When                                           | Read first                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Session start**                              | `session-start.md`                                                                   |
| **Writing/editing code**                       | `code-quality.md`                                                                    |
| **Executing commands**                         | `command-execution.md`                                                               |
| **Working on UI (.svelte)**                    | `frontend-ui-standards.md`, `frontend-ux-standards.md`, `frontend-code-standards.md` |
| **New UI component patterns**                  | `frontend-ui-standards.md` → Design System Foundation section                        |
| **CSS refactoring / design system work**       | `frontend-css-architecture.md`                                                       |
| **Designing UX flows (multi-screen features)** | `ux-flow-design.md`                                                                  |
| **Creating folders/files**                     | `naming-conventions.md`                                                              |
| **Creating/updating spec**                     | `spec-writing.md`                                                                    |
| **Creating/updating plan**                     | `planning.md`                                                                        |
| **Before implementing**                        | `implementation.md`                                                                  |
| **Debugging/troubleshooting**                  | `debugging.md`, `mindset.md`                                                         |
| **Stuck in a loop**                            | `AgentLoopRecovery.md`                                                               |
| **Running Playwright tests**                   | `ProjectSpecific/testing.md`                                                         |
| **Working on API/auth/sync**                   | `backend-patterns.md`                                                                |
| **Working on state/caching/persistence**       | `state-data-patterns.md`                                                             |
| **Framework decisions**                        | `framework-principles.md`                                                            |
| **Working on rule files (JIT rules)**          | `rule-structure.md`                                                                  |
| **Before marking complete**                    | Follow Task N in task file (E2E regression + audit) — simple tasks: just commit      |
| **Before git commit**                          | `pre-commit.md`, `mindset.md` (reminder)                                             |
| **Before commit (detours)**                    | `sync-check.md`                                                                      |
| **Starting a task**                            | `TaskTypeRules/<task-type>.md`                                                       |
| **Closing a chat**                             | Run `/capture-learnings` workflow                                                    |

**Each file has a canary marker. Output it to prove you read it.**

---

## Rule Read Logging

### Autonomous vs Explicit Reads

**Autonomous read:** You recognized a trigger and decided to read the rule yourself.
**Explicit read:** A workflow or user explicitly instructed you to read the rule.

### Logging Rules

1. **Visible marker** (`> [RULE-LOADED] ...`) — Output for ALL reads (proves the rule was read)

2. **Autonomous read marker** — ONLY emit when you autonomously recognized a trigger:

   ```
   <!-- AUTONOMOUS_RULE: DevFramework/JustInTimeAgentRules/frontend-ui-standards.md -->
   ```

   **Emit this when:**
   - User says "fix this hover color" → you recognize "Working on UI" trigger → you read the rule
   - You're about to commit → you recognize "Before git commit" trigger → you read pre-commit.md

   **Do NOT emit when:**
   - A workflow says "Read `pre-commit.md`" → this is explicit, not autonomous
   - User says "read the UI standards" → this is explicit instruction

3. **Format:** One line per autonomous read, at end of response. Include the trigger you recognized:
   ```
   <!-- AUTONOMOUS_RULE: frontend-ui-standards.md | trigger: Working on UI -->
   ```

---

## Quick Reference

| Need to...          | Location                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| Find app spec       | `TempAppDevDocs/Features/Specs/<feature>.md`                                      |
| Find app plan       | `TempAppDevDocs/Features/Plans/<feature>.md`                                      |
| Find app tasks      | `TempAppDevDocs/Features/Tasks/<feature>.md`                                      |
| Find framework spec | `DevFramework/FrameworkFeatureSpecs/<feature>.md`                                 |
| Log a change        | `DevFramework/FrameworkSelfImprovementLogs/AllProjectChangesLoggedAtPreCommit.md` |
| Log a decision      | `DevFramework/FrameworkSelfImprovementLogs/DECISIONS.md`                          |
| Capture learnings   | Run `/capture-learnings` workflow at chat-close                                   |

---
