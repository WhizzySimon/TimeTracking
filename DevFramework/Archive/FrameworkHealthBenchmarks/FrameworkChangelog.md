# Framework Changelog

Tracks changes to the DevFramework. **Purpose:** Verify self-improvement is working.

**Key field:** `Trigger` — was change initiated by human or system? This tracks whether the framework is improving itself.

---

## Entry Format

| Field   | Description                                          |
| ------- | ---------------------------------------------------- |
| Date    | YYYY-MM-DD                                           |
| Trigger | `human` (user initiated) or `system` (agent noticed) |
| Summary | What changed                                         |

---

## Changelog

## 2026-01-02

### Changed (Trigger: human)

- **mindset.md:** Added "Automatic Sense-Check" principle — question if things make sense before discussing them
- **mindset.md:** Added "The Employer Mindset" principle — think like co-owner, not servant
- **Moved:** `ZOOM_OUT.md` → `JustInTimeAgentRules/AgentLoopRecovery.md` (it's a JIT rule, not task QA)
- **Deleted:** `VERSION.md` (not being used, bureaucratic overhead)
- **Deleted:** `INDEX.md` (redundant — system is self-documenting)
- **Renamed:** `CHANGELOG.md` → `FrameworkChangelog.md`
- **Renamed:** `GTRS.md` → `FrameworkBenchmarks.md`
- **Renamed:** `GTRS-runs/` → `FrameworkBenchmarkRunHistory/`
- **Renamed:** `boxes/` → `DevelopmentTaskChecklists/` → **Moved** to `JustInTimeAgentRules/TaskTypeRules/`
- **JIT map:** Added `AgentLoopRecovery.md` trigger for "Stuck in a loop"
- **Updated:** Path references in `anomaly-detector.cjs`, `bugfix.md`

- **Renamed:** `TaskQualityAssurance/` → `FrameworkHealth/` (reflects actual content)
- **Renamed:** `FrameworkSelfImprovementLogs/Evidence/` → `AuditBundles/` (clearer)
- **Renamed:** `FrameworkSelfImprovementLogs/CHANGELOG.md` → `AllProjectChangesLoggedAtPreCommit.md` (who/when/what)
- **mindset.md:** Added "Continuous Pattern Recognition" principle — find patterns, analyze meaning (general + current purpose), improve
- **JIT map:** Added mindset.md as pre-commit reminder (re-read at end, not just start)

**Rationale:** Self-documenting naming, remove dead files, proper JIT rule placement, separate concerns (framework health vs task rules)

---

## 2025-12-28

### Added (Trigger: human)

- Initial framework structure — VERSION.md, CHANGELOG.md, GTRS.md
- Phase 0 guardrails before implementing code scripts
