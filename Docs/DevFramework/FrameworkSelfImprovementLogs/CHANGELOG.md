# Changelog (Everything Log)

All notable changes to this project. One line per commit/session. Most recent first.

**Update rule:** Add an entry before each `git push`. See RULE_MAP.md → Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md.

---

| Date       | Type     | Summary                                                                                              | Ref     |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------- | ------- |
| 2025-12-28 | feat     | A2.4: Employer store + CRUD operations (employers.ts) + backup snapshot integration                  | —       |
| 2025-12-28 | feat     | A2.2: Add employerId field to TimeEntry, Category, WorkTimeModel interfaces                          | —       |
| 2025-12-28 | refactor | Scripts cleanup: e2e→AutomatedUITests, ai→CascadeAgentTools, validate-tags→build, eslint .cjs fix    | —       |
| 2025-12-28 | docs     | Add template references to planning.md (Plans + Tasks templates)                                     | —       |
| 2025-12-28 | feat     | A2.1: IndexedDB employers store + Employer type (Phase A2 Multi-Arbeitgeber start)                   | —       |
| 2025-12-28 | docs     | Fix doc paths after restructure (AppDocs/DevFramework/ToolSetup
Framework), run_command primary + watcher fallback       | —       |
| 2025-12-28 | docs     | Auditor system: /audit workflow + Evidence Bundle template + Audit Report template + JIT trigger     | —       |
| 2025-12-28 | feat     | D5 COMPLETE: Autonomy Stack v2 — telemetry, anomaly detection, evidence bundles, learning extraction | —       |
| 2025-12-28 | docs     | D5 Phase 0: Framework Evolution Guardrails — VERSION.md, CHANGELOG.md, GTRS.md (10 golden tasks)     | —       |
| 2025-12-28 | feat     | Rule read logging: Windsurf hooks + post_read_code evidence-based logging + working_directory fix    | —       |
| 2025-12-27 | feat     | D5: Autonomy Stack v2 — task boxes, telemetry JSONL, anomaly detection, evidence bundles             | —       |
| 2025-12-27 | docs     | D5.3: Document dev framework in README with diagram, add doc-check to pre-commit                     | —       |
| 2025-12-27 | refactor | D5.2: Migrate global_rules to JIT system, delete 6 redundant memories, add canaries                  | —       |
| 2025-12-27 | refactor | D5.1: Rename jit-rule-map → \_entrypoint-jit-rule-map, delete START_HERE, update README/INDEX        | —       |
| 2025-12-27 | refactor | D5: JIT rule system — single always-on.md pointer to jit-rule-map.md, delete 4 old                   | —       |
| 2025-12-27 | feat     | Running task banner: add Beenden button for today's tasks, click navigates to edit                   | 8d812fd |
| 2025-12-27 | refactor | Guidance system v2: pointer files, canary marker, AGENTS.md refs fixed                               | —       |
| 2025-12-27 | docs     | A2-A6: Specs + Plans for Multi-AG, Kleine Änderungen, UX, UI, Bugs                                   | —       |
| 2025-12-27 | test     | A1.13: E2E tests for subscription plans (Free/Pro gating)                                            | —       |
| 2025-12-27 | feat     | A1.5: PDF export module with jspdf + jspdf-autotable                                                 | —       |
| 2025-12-27 | docs     | Self-learning: route Hard Rules to specific trigger files, not general locations                     | —       |
| 2025-12-27 | fix      | Watcher exit code — use System.Diagnostics.Process for reliable capture                              | 5e7c2d8 |
| 2025-12-27 | fix      | Watcher exit code bug — add WaitForExit() before reading ExitCode                                    | —       |
| 2025-12-27 | chore    | Delete AGENTS.md — replaced by RULE_MAP.md + Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/                                             | —       |
| 2025-12-27 | feat     | D4: Just-in-time rules system — RULE_MAP.md + Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/ (7 trigger files)                          | —       |
| 2025-12-27 | docs     | Escalate pre-commit checklist to AGENTS.md after 2 violations                                        | —       |
| 2025-12-27 | feat     | Versioning: git describe format (v1.0.0-N-ghash), bump-version + release scripts                     | 12e0bd9 |
| 2025-12-27 | feat     | A1.12: PlanComparison modal with Free/Pro/Premium comparison                                         | —       |
| 2025-12-27 | feat     | A1.10-A1.11: Settings Daten section + ExportDialog integration                                       | —       |
| 2025-12-27 | feat     | A1.7-A1.8: JSON import module + index.ts (Excel already existed)                                     | —       |
| 2025-12-27 | feat     | A1.6: ExportDialog component with format selection + Pro gating                                      | —       |
| 2025-12-27 | feat     | A1.3-A1.5: Export modules (JSON, CSV, PDF placeholder)                                               | —       |
| 2025-12-27 | feat     | A1.2: Cloud backup Pro gating + watcher command clearing fix                                         | —       |
| 2025-12-26 | feat     | A1.1: ProPaywall component + watcher heartbeat for real-time observability                           | —       |
| 2025-12-26 | docs     | A1: Subscription Plans spec/plan/tasks + self-learning captures positive feedback                    | —       |
| 2025-12-26 | docs     | Fix watcher docs: cmd.exe uses &&, update README, gitignore                                          | ee44211 |
| 2025-12-26 | feat     | D3: Watcher Framework Improvement — main watcher orchestrator + dynamic sessions                     | 535f485 |
| 2025-12-26 | docs     | D1+D2: Complete session-end rules (learnings, promotion, decisions, changelog)                       | —       |
| 2025-12-26 | docs     | D2: Add learnings review to session-end rules (before every commit)                                  | —       |
| 2025-12-26 | docs     | D2: Integrate LEARNINGS.md into session-start workflow                                               | b3e31e7 |
| 2025-12-26 | docs     | Phase D2: Self-learning dev framework (LEARNINGS + LEARNINGS-INBOX)                                  | f861f6d |
| 2025-12-26 | docs     | Enhance AGENTS.md with complete single-source-of-truth table and rules                               | —       |
| 2025-12-26 | docs     | Update workflows to reference AGENTS.md session-end rules (single source of truth)                   | —       |
| 2025-12-26 | docs     | Phase D1: Self-documenting dev framework (CHANGELOG + DECISIONS)                                     | f268bfd |
| 2025-12-26 | docs     | Remove snapshot reference, simplify archive links                                                    | ea71377 |
| 2025-12-26 | docs     | Archive and trim IMPLEMENTATION_PROGRESS.md                                                          | 8aaaefe |
| 2025-12-26 | docs     | Update all docs for simple dev/main workflow                                                         | 3cdd208 |
| 2025-12-26 | chore    | Remove CI workflow and simplify to dev/main model                                                    | 1e6d95b |
| 2025-12-26 | docs     | Archive CI workflow before removing                                                                  | f7fdd55 |
| 2025-12-26 | refactor | Add manual-source-control scripts for human commits                                                  | 67a1615 |
| 2025-12-26 | feat     | Add auto-cleanup of local branches to session-start workflows                                        | eafb25b |
| 2025-12-26 | feat     | Add cleanup-branches.ps1 for local branch cleanup after merge                                        | 30f1738 |

---

## Type Tags

| Tag        | Use for                                            |
| ---------- | -------------------------------------------------- |
| `feat`     | New feature or capability                          |
| `fix`      | Bug fix                                            |
| `docs`     | Documentation only                                 |
| `refactor` | Code restructuring without behavior change         |
| `chore`    | Maintenance, dependencies, config                  |
| `test`     | Test additions or fixes                            |
| `attempt`  | Tried something that didn't work (learning record) |
| `revert`   | Reverted a previous change                         |
