# Framework Changes Rules

**Trigger:** When adding or modifying dev framework documentation

---

## Rules for Adding/Changing Dev Framework Content

1. **Never duplicate** — If content exists in one location, reference it, don't copy it
2. **Workflows only orchestrate** — Workflows tell Cascade which docs to read. They must NOT contain rules or commands that could go stale
3. **Process rules go in RULE_MAP.md** — Not in workflows, not in guidelines
4. **Always-on rules go in `.windsurf/rules/`** — These auto-load every session

---

## Single Source of Truth

| Content Type                            | Canonical Location                               | Notes                                                             |
| --------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| **Process rules**                       | `RULE_MAP.md`                                    | Session workflow, git rules, verification, coding rules           |
| **Always-on rules**                     | `.windsurf/rules/*.md`                           | Auto-loaded every session (code-quality, command-execution, etc.) |
| **Workflows**                           | `.windsurf/workflows/`                           | ONLY orchestrate — reference docs, never duplicate content        |
| **Coding standards**                    | `Docs/DevFramework/ToolSetup                     |
| Framework/DeveloperGuidesAndStandards/` | DEVELOPMENT_GUIDELINES, NAMING_CONVENTIONS, etc. |
| **Tooling docs**                        | `Docs/DevFramework/ToolSetup                     |

Framework/ToolSetup
/`                  | Watcher, git workflow, bootstrap                                  |
| **App specs**        |`Docs/AppDocs/Features/Specs/`, `Plans/`, `Tasks/`     | Per-feature app documentation                                     |
| **Framework specs**  |`Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureSpecs
/`, `Plans/`, `Tasks/`| Per-feature framework documentation                               |
| **Dev history**      |`Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/CHANGELOG.md`       | One line per commit                                               |
| **Decisions**        |`Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/DECISIONS.md`       | Architecture/policy decisions (ADR-light)                         |
| **Learnings**        |`Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS.md`       | Proven preferences (max 30 bullets)                               |
| **Learnings Inbox**  |`Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS-INBOX.md` | Raw feedback capture (unbounded, low priority)                    |
| **Trigger rules**    |`Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/` | Just-in-time rules loaded at specific triggers |

---

**CRITICAL:** When adding new process rules (e.g., "always do X after task completion"), add them to the appropriate `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/*.md` file, NOT to individual workflow files. Workflows should reference docs, not duplicate content.
