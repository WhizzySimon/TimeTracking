# Changelog (Everything Log)

All notable changes to this project. One line per commit/session. Most recent first.

**Update rule:** Add an entry before each `git push`. See RULE_MAP.md → Docs/Rules/pre-commit.md.

---

| Date       | Type     | Summary                                                                            | Ref     |
| ---------- | -------- | ---------------------------------------------------------------------------------- | ------- |
| 2025-12-27 | fix      | Watcher exit code bug — add WaitForExit() before reading ExitCode                  | —       |
| 2025-12-27 | chore    | Delete AGENTS.md — replaced by RULE_MAP.md + Docs/Rules/                           | —       |
| 2025-12-27 | feat     | D4: Just-in-time rules system — RULE_MAP.md + Docs/Rules/ (7 trigger files)        | —       |
| 2025-12-27 | docs     | Escalate pre-commit checklist to AGENTS.md after 2 violations                      | —       |
| 2025-12-27 | feat     | Versioning: git describe format (v1.0.0-N-ghash), bump-version + release scripts   | 12e0bd9 |
| 2025-12-27 | feat     | A1.12: PlanComparison modal with Free/Pro/Premium comparison                       | —       |
| 2025-12-27 | feat     | A1.10-A1.11: Settings Daten section + ExportDialog integration                     | —       |
| 2025-12-27 | feat     | A1.7-A1.8: JSON import module + index.ts (Excel already existed)                   | —       |
| 2025-12-27 | feat     | A1.6: ExportDialog component with format selection + Pro gating                    | —       |
| 2025-12-27 | feat     | A1.3-A1.5: Export modules (JSON, CSV, PDF placeholder)                             | —       |
| 2025-12-27 | feat     | A1.2: Cloud backup Pro gating + watcher command clearing fix                       | —       |
| 2025-12-26 | feat     | A1.1: ProPaywall component + watcher heartbeat for real-time observability         | —       |
| 2025-12-26 | docs     | A1: Subscription Plans spec/plan/tasks + self-learning captures positive feedback  | —       |
| 2025-12-26 | docs     | Fix watcher docs: cmd.exe uses &&, update README, gitignore                        | ee44211 |
| 2025-12-26 | feat     | D3: Watcher Framework Improvement — main watcher orchestrator + dynamic sessions   | 535f485 |
| 2025-12-26 | docs     | D1+D2: Complete session-end rules (learnings, promotion, decisions, changelog)     | —       |
| 2025-12-26 | docs     | D2: Add learnings review to session-end rules (before every commit)                | —       |
| 2025-12-26 | docs     | D2: Integrate LEARNINGS.md into session-start workflow                             | b3e31e7 |
| 2025-12-26 | docs     | Phase D2: Self-learning dev framework (LEARNINGS + LEARNINGS-INBOX)                | f861f6d |
| 2025-12-26 | docs     | Enhance AGENTS.md with complete single-source-of-truth table and rules             | —       |
| 2025-12-26 | docs     | Update workflows to reference AGENTS.md session-end rules (single source of truth) | —       |
| 2025-12-26 | docs     | Phase D1: Self-documenting dev framework (CHANGELOG + DECISIONS)                   | f268bfd |
| 2025-12-26 | docs     | Remove snapshot reference, simplify archive links                                  | ea71377 |
| 2025-12-26 | docs     | Archive and trim IMPLEMENTATION_PROGRESS.md                                        | 8aaaefe |
| 2025-12-26 | docs     | Update all docs for simple dev/main workflow                                       | 3cdd208 |
| 2025-12-26 | chore    | Remove CI workflow and simplify to dev/main model                                  | 1e6d95b |
| 2025-12-26 | docs     | Archive CI workflow before removing                                                | f7fdd55 |
| 2025-12-26 | refactor | Add manual-source-control scripts for human commits                                | 67a1615 |
| 2025-12-26 | feat     | Add auto-cleanup of local branches to session-start workflows                      | eafb25b |
| 2025-12-26 | feat     | Add cleanup-branches.ps1 for local branch cleanup after merge                      | 30f1738 |

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
