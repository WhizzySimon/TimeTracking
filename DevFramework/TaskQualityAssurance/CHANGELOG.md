# Autonomy Stack Framework Changelog

This changelog tracks changes to the **Autonomy Stack framework** (DevFramework/TaskQualityAssurance/, scripts/CascadeAgentTools/).

**Format:** Append new entries at top (newest first).

---

## Entry Format

Each entry must include:

| Field     | Required | Description                                          |
| --------- | -------- | ---------------------------------------------------- |
| Version   | Yes      | Semantic version (X.Y.Z)                             |
| Date      | Yes      | ISO date (YYYY-MM-DD)                                |
| Category  | Yes      | `added`, `changed`, `fixed`, `removed`, `deprecated` |
| Summary   | Yes      | One-line description                                 |
| Rationale | Yes      | Why this change was made                             |
| Risk      | No       | `low`, `medium`, `high` — only if non-trivial        |
| Evidence  | No       | Link to task, evidence bundle, or GTRS run           |

### Entry Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Category

- **Summary:** One-line description
- **Rationale:** Why this change was made
- **Risk:** low | medium | high (if applicable)
- **Evidence:** Link to related task or evidence (if applicable)
```

---

## Changelog

## [0.1.0] - 2025-12-28

### Added

- **Summary:** Initial framework structure — VERSION.md, CHANGELOG.md, GTRS.md
- **Rationale:** Phase 0 guardrails required before implementing code scripts
- **Risk:** low
- **Evidence:** Task D5.0a, D5.0b, D5.0c in `Docs/Features/Tasks/autonomy-stack-v2.md`
