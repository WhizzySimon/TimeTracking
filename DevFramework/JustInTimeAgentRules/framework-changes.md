# Framework Changes Rules

**Trigger:** When adding or modifying dev framework documentation

---

## Rules for Adding/Changing DevFramework Content

1. **Never duplicate** — If content exists in one location, reference it, don't copy it
2. **Workflows only orchestrate** — Workflows tell Cascade which docs to read. They must NOT contain rules or commands that could go stale
3. **Process rules go in _entrypoint-jit-rule-map.md** — Not in workflows, not in guidelines
4. **Always-on rules go in `.windsurf/rules/`** — These auto-load every session

---

## Single Source of Truth

| Content Type        | Canonical Location                                           | Notes                                              |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| **Process rules**   | `JustInTimeAgentRules/_entrypoint-jit-rule-map.md`           | Session workflow, git rules, verification          |
| **Always-on rules** | `.windsurf/rules/*.md`                                       | Auto-loaded every session                          |
| **Workflows**       | `.windsurf/workflows/`                                       | ONLY orchestrate — reference docs, never duplicate |
| **Tooling docs**    | `DevFramework/DeveloperGuidesAndStandards/`             | Git workflow, coding standards                     |
| **App specs**       | `Docs/Features/Specs/`, `Plans/`, `Tasks/`                   | Per-feature app documentation                      |
| **Framework specs** | `DevFramework/FrameworkFeatureSpecs/`                   | Per-feature framework documentation                |
| **Dev history**     | `FrameworkSelfImprovementLogs/CHANGELOG.md`                  | One line per commit                                |
| **Decisions**       | `FrameworkSelfImprovementLogs/DECISIONS.md`                  | Architecture/policy decisions (ADR-light)          |
| **Learnings**       | `FrameworkSelfImprovementLogs/LEARNINGS.md`                  | Proven preferences (max 30 bullets)                |
| **Learnings Inbox** | `FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md`            | Raw feedback capture                               |
| **Trigger rules**   | `JustInTimeAgentRules/*.md`                                  | Just-in-time rules at specific triggers            |

---

**CRITICAL:** When adding new process rules (e.g., "always do X after task completion"), add them to the appropriate `DevFramework/JustInTimeAgentRules/*.md` file, NOT to individual workflow files. Workflows should reference docs, not duplicate content.
