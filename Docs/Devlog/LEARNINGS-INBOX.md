# Learnings Inbox

Raw capture of feedback and lessons. Review periodically for promotion to LEARNINGS.md.

**Promotion criteria:**

- Repeated 2+ times across separate sessions/commits, OR
- Explicitly marked by maintainer as durable/high-impact

**Categories for promotion:**

- **Hard Rule** — Must always be followed; candidate for `.windsurf/rules/` promotion
- **Preference** — Preferred approach; deviation OK with reason
- **Reminder** — Easy to forget; helps prevent repeat mistakes

---

## Pending Review

| Date       | Context         | Feedback                                                                                                                                                                                                                                      | Promoted?      |
| ---------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 2025-12-27 | run_command use | CORRECTIVE: Used `run_command` tool instead of Cascade Watcher. User reminded again. Must read `Docs/Rules/command-execution.md` before any command. JIT trigger not followed. | Pending |
| 2025-12-27 | Pre-commit skip | CORRECTIVE: Skipped pre-commit.md trigger before `git commit`. Just-in-time rules only work if I READ them at the trigger point. **3rd violation.** FIX: D5 restructured to single always-on.md → jit-rule-map.md chain. | → Addressed by D5 |
| 2025-12-27 | Lint fix loop   | CORRECTIVE: When lint rule rejects multiple fix attempts, STOP and analyze: (1) Why does the rule exist? (2) Is the implementation pattern correct? (3) Research community solutions. Don't iterate on syntax - understand the problem first. | Pending        |
| 2025-12-27 | D4 cleanup      | CORRECTIVE: Forgot to delete AGENTS.md after test PASS. Said "can delete later" but didn't. When task has "do X after Y passes", execute immediately.                                                                                         | Pending        |
| 2025-12-27 | Watcher fix     | BUG FIX: PowerShell's Start-Process doesn't populate ExitCode immediately after HasExited. Must call $process.WaitForExit() first.                                                                                                            | Pending        |
| 2025-12-27 | Versioning      | CORRECTIVE: Forgot session-end rules (CHANGELOG, DECISIONS, LEARNINGS) until user reminded. Need to internalize this as automatic.                                                                                                            | Pending        |
| 2025-12-27 | Watcher         | BUG: Watcher shows DONE:FAILED with empty exit code for ALL commands, even successful ones. Output shows real result. Watcher exit code capture is broken.                                                                                    | Pending        |
| 2025-12-27 | Versioning      | Netlify does shallow clones without tags. Need `git fetch --tags` before `git describe` for CI/CD environments.                                                                                                                               | Pending        |
| 2025-12-26 | A1 spec phase   | POSITIVE: User praised analysis of P10 conflicts and clarifying questions before spec creation. "Awesome analysis, very good findings, thanks for coming back with the questions."                                                            | Pending        |
| 2025-12-26 | A1 spec phase   | POSITIVE: User reminded to commit docs before starting implementation. Good practice to checkpoint work.                                                                                                                                      | Pending        |
---

## Archive (promoted or rejected)

| Date       | Item                  | Outcome                               |
| ---------- | --------------------- | ------------------------------------- |
| 2025-12-26 | Pre-commit checklist  | Promoted to LEARNINGS.md (Hard Rule)  |
| 2025-12-26 | git stash ban         | Promoted to LEARNINGS.md (Hard Rule)  |
| 2025-12-26 | PowerShell semicolon  | Promoted to LEARNINGS.md (Hard Rule)  |
| 2025-12-26 | Prefer upstream fixes | Promoted to LEARNINGS.md (Preference) |
