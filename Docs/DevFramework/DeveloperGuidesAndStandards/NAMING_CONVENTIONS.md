# Naming Conventions

**Last Updated:** 2025-12-24

This document defines file and folder naming conventions for the TimeTracker repository.

---

## General Principles

1. **One convention per folder** — All files in a folder use the same naming style
2. **No spaces** — Use underscores or hyphens instead
3. **Descriptive names** — Name should indicate content without opening the file
4. **Consistent casing** — Either ALL_CAPS or all-lowercase within a folder

---

## Semantic Naming Principles

Names must be **self-documenting** — no README needed to understand purpose.

1. **Descriptive over short** — `FrameworkSelfImprovementLogs/` not `Logs/`
2. **Max 5 words** — `JustInTimeAgentRules` ✓, `RulesForAgentsThatAreLoadedJustInTime` ✗
3. **Specific over generic** — `DeveloperGuidesAndStandards/` not `Guidelines/`
4. **No abbreviations** — `TaskQualityAssurance/` not `TQA/`
5. **Name explains content** — like function naming in code
6. **Never use generic names** — `misc/`, `utils/`, `stuff/` → find the actual purpose

### Examples

| ❌ Generic | ✓ Self-Explanatory                  |
| ---------- | ----------------------------------- |
| `docs/`    | `Docs/DevFramework/ToolSetup
Framework/`                |
| `rules/`   | `JustInTimeAgentRules/`             |
| `logs/`    | `FrameworkSelfImprovementLogs/`     |
| `utils/`   | `scripts/CascadeAgentTools/` (purpose-specific)    |
| `misc/`    | Never use — find the actual purpose |

---

## Folder-Specific Conventions

### Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/

**Convention:** `SCREAMING_SNAKE_CASE.md`

**Pattern:** `<TOPIC>_<SUBTOPIC>.md` or `<TOPIC>.md`

**Examples:**

- `DEVELOPMENT_GUIDELINES.md`
- `SPEC_DRIVEN_DEVELOPMENT.md`
- `TECHNICAL_GUIDELINE_V1.md`

**Rationale:** Authoritative documents with high visibility. Uppercase signals "read this first".

---

### Docs/Features/Specs/, Docs/Features/Plans/, Docs/Features/Tasks/

**Convention:** `kebab-case.md`

**Pattern:** `<feature-slug>.md`

**Examples:**

- `quick-start-ux.md`
- `cloud-sync.md`
- `time-entry-validation.md`

**Rationale:** Feature-specific documents. Lowercase slug matches URL conventions and is easy to type.

---

### Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/

**Convention:** `PREFIX-YYYYMMDD-HHMM__description.md`

**Pattern:** `DL-YYYYMMDD-HHMM__<short-description>.md`

**Examples:**

- `DL-20251224-0324__pwa-scaffolding.md`
- `DL-20251222-1430__auth-flow-fix.md`

**Rationale:** Timestamped for chronological sorting. Double underscore separates date from description.

---

### Docs/SDD/Profiles/

**Convention:** `SDD_PROFILE__<NAME>.md`

**Pattern:** `SDD_PROFILE__<TARGET_NAME>.md`

**Examples:**

- `SDD_PROFILE__TIMETRACKER.md`
- `SDD_PROFILE__ANTHROPIC.md`
- `SDD_PROFILE__TEMPLATE.md`

**Rationale:** Consistent prefix enables filtering. Double underscore separates prefix from name. ALL_CAPS for uniformity.

---

### .windsurf/workflows/

**Convention:** `kebab-case.md`

**Pattern:** `<action-name>.md`

**Examples:**

- `project-start.md`
- `new-feature.md`
- `continue-work.md`

**Rationale:** Slash-command friendly (`/project-start`). Lowercase is standard for CLI-style commands.

---

### .windsurf/rules/

**Convention:** `kebab-case.md`

**Pattern:** `<rule-domain>-rules.md`

**Examples:**

- `code-quality-rules.md`
- `command-execution-rules.md`
- `ui-design-rules.md`

**Rationale:** Matches workflow convention. Agent-friendly, easy to reference in prompts.

---

## Special Prefixes

| Prefix           | Meaning                   | Example                                        |
| ---------------- | ------------------------- | ---------------------------------------------- |
| `_` (underscore) | Template or internal file | `_template.md`                                 |
| `DL-`            | Devlog entry              | `DL-20251224-0324__topic.md`                   |
| `SDD_PROFILE__`  | SDD profile document      | `SDD_PROFILE__OPENAI.md`                       |
| `AUDIT-`         | Audit document            | `AUDIT-2025-12-24__spec-driven-development.md` |

---

## Version Suffixes

When a document has versions, append `_V<N>` or `-v<n>` matching the folder convention:

- Guidelines: `TECHNICAL_GUIDELINE_V1.md`, `TECHNICAL_GUIDELINE_V2.md`
- Specs: `quick-start-ux-v2.md`

---

## Change Log

**[2025-12-28 22:18]**

- Added: Semantic Naming Principles section (self-documenting, max 5 words, no abbreviations)
- Added: Examples table for generic vs self-explanatory names

**[2025-12-24 13:50]**

- Added: Initial naming conventions document
