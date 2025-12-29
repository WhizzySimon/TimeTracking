# Autonomy Stack Framework Version

**FRAMEWORK_VERSION: 0.1.0**

---

## Versioning Rules

This version tracks the **Autonomy Stack framework** (Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/, scripts/CascadeAgentTools/), NOT the TimeTracker app.

### Semantic Versioning

| Component | When to bump                                                          |
| --------- | --------------------------------------------------------------------- |
| **Major** | Breaking changes to box contracts, telemetry schema, or CLI interface |
| **Minor** | New boxes, new scripts, new fields (backward compatible)              |
| **Patch** | Bug fixes, doc clarifications, no behavioral changes                  |

### Examples

- `0.1.0 → 0.2.0`: Added new box type
- `0.2.0 → 0.2.1`: Fixed typo in ZOOM_OUT.md
- `0.2.1 → 1.0.0`: Changed telemetry JSONL schema (breaking)

---

## Tagging Workflow

1. Update `FRAMEWORK_VERSION` in this file
2. Add entry to `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/CHANGELOG.md`
3. Commit with message: `chore(ai): bump framework to X.Y.Z`
4. Tag: `git tag ai-vX.Y.Z`
5. Push: `git push origin ai-vX.Y.Z`

**Note:** Framework tags use `ai-v` prefix to distinguish from app version tags.

---

## Version History

| Version | Date       | Summary                                     |
| ------- | ---------- | ------------------------------------------- |
| 0.1.0   | 2025-12-28 | Initial framework structure (Phase 0 setup) |

---

## Related Files

- `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/CHANGELOG.md` — Detailed change log
- `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/GTRS.md` — Golden Task Regression Suite
- `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/INDEX.md` — Framework entry point
