# Naming Conventions Rules

**Trigger:** When creating folders, files, docs, or scripts (anything non-code)

---

## Canary

**When you read this file, output exactly:**

> [CANARY] naming-conventions rules loaded

---

## Core Principle

All names must be **self-explanatory without opening the item**.

---

## Folder & File Naming

1. **Descriptive over short** — `FrameworkSelfImprovementLogs/` not `Logs/`
2. **Max 5 words** — `JustInTimeAgentRules` ✓, `RulesForAgentsThatAreLoadedJustInTime` ✗
3. **Specific over generic** — `DeveloperGuidesAndStandards/` not `Guidelines/`
4. **No abbreviations** — `FrameworkHealth/` not `FH/`
5. **Name explains content** — like function naming in code

---

## Examples

| ❌ Generic | ✓ Self-Explanatory                              |
| ---------- | ----------------------------------------------- |
| `docs/`    | `DevFramework/`                                 |
| `rules/`   | `JustInTimeAgentRules/`                         |
| `logs/`    | `FrameworkSelfImprovementLogs/`                 |
| `utils/`   | `scripts/CascadeAgentTools/` (purpose-specific) |
| `misc/`    | Never use — find the actual purpose             |

---

## CSS Naming Conventions

**The same self-explanatory naming principle applies to CSS variables and classes.**

### CSS Variables

Pattern: `--tt-{category}-{property}-{variant}`

| ❌ Cryptic              | ✓ Self-Explanatory     |
| ----------------------- | ---------------------- |
| `--tt-c-p`              | `--tt-brand-primary`   |
| `--tt-bg`               | `--tt-background-card` |
| `--tt-s-8`              | `--tt-space-8`         |
| `--tt-r-card`           | `--tt-radius-card`     |
| `--tt-color-text-muted` | `--tt-text-muted`      |

### CSS Classes

Pattern: `.tt-{component}-{variant}` or `.tt-{component}__{element}`

| ❌ Cryptic           | ✓ Self-Explanatory         |
| -------------------- | -------------------------- |
| `.tt-row--nav`       | `.tt-list-row-clickable`   |
| `.tt-badge--no-work` | `.tt-inline-label-no-work` |
| `.tt-btn--sm`        | `.tt-button-small`         |
| `.tt-row__end`       | `.tt-list-row__actions`    |

### Rules

1. **Full words over abbreviations** — `button` not `btn`, `primary` not `pri`
2. **Describe behavior, not implementation** — `clickable` not `nav` (nav implies chevron)
3. **Category prefix** — All TimeTracker CSS uses `tt-` prefix
4. **Element names describe purpose** — `__actions` not `__end`, `__time` not `__title`

---

## Note

This JIT rule is the single source of truth for naming conventions. No separate reference document exists.
