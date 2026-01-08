# D3: Watcher Framework Improvement — Spec

**Phase:** D3  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Status:** Draft

**Depends on:**

- D1, D2 (completed) — self-documenting and self-learning framework

**Does not depend on:**

- Phase 10, 11, A1-A4 (app features)

---

## 1) Goal / Problem

The current Cascade Watcher system requires users to manually start a separate watcher process for each chat session (Instance A, B, etc.). This is error-prone: users can accidentally start duplicate instances, forget which instance belongs to which chat, or leave orphaned watchers running. We need a more robust system where a single main watcher manages per-chat instances automatically.

## 2) Scope

### In scope

- Single main watcher that manages per-chat watcher instances
- Single-instance protection for main watcher (lockfile)
- Session ID tagging for each spawned watcher
- Dedicated log files per session
- Clean shutdown of spawned watchers
- Troubleshooting output and documentation

### Out of scope

- Network-based watcher (port-based communication)
- GUI for watcher management
- Integration with CI/CD
- Cross-machine watcher coordination

### What we don't want

- Complex orchestration frameworks
- Heavy dependencies (Node.js watcher, etc.)
- Changes to how Cascade writes commands (keep file-based approach)

## 3) Functional Requirements (FR)

- **TT-FR-001**: User starts ONE main watcher in a terminal. Main watcher runs continuously until explicitly stopped.
- **TT-FR-002**: When a Cascade chat needs a watcher instance, it requests one by writing a spawn command to the main watcher. Main watcher spawns a dedicated child watcher with a unique session ID.
- **TT-FR-003**: Each spawned child watcher writes logs to a dedicated log file: `scripts/watcher/logs/<session-id>.log`.
- **TT-FR-004**: Cascade can request shutdown of a specific child watcher by session ID. Main watcher terminates that child cleanly.
- **TT-FR-005**: When main watcher is stopped (Ctrl+C), all child watchers are terminated cleanly.

## 4) Implementation Guarantees (IG)

- **TT-IG-001**: Main watcher is single-instance protected via lockfile (`scripts/watcher/main.lock`). Starting a second main watcher shows error and exits.
- **TT-IG-002**: Each child watcher has a unique session ID (format: `<timestamp>-<random>`, e.g., `20251226-210530-x7k9`).
- **TT-IG-003**: Child watcher process title includes session ID for easy identification in Task Manager.
- **TT-IG-004**: Lockfile is removed on clean shutdown. Stale lockfiles (from crashes) are detected and cleaned up on next start.
- **TT-IG-005**: Instance folders A, B are deprecated. All sessions use dynamic session IDs.

## 5) Design Decisions (DD)

- **TT-DD-001**: Lockfile-based single-instance protection (not port-based). Simpler, no firewall issues.
- **TT-DD-002**: Child watchers are spawned as separate PowerShell processes, not threads. Allows true isolation and independent crash recovery.
- **TT-DD-003**: Session ID format: `YYYYMMDD-HHmmss-xxxx` where xxxx is 4 random alphanumeric chars. Human-readable + unique.
- **TT-DD-004**: Main watcher control file: `scripts/watcher/main-control.txt`. Commands: `SPAWN`, `KILL:<session-id>`, `LIST`, `SHUTDOWN`.
- **TT-DD-005**: Main watcher status file: `scripts/watcher/main-status.txt`. Shows running sessions and their states.

## 6) Edge cases

- **EC-001**: Main watcher crash leaves lockfile → Next start detects stale lock (PID not running) and removes it.
- **EC-002**: Child watcher crash → Main watcher detects via process polling, marks session as DEAD, removes from active list.
- **EC-003**: Cascade writes command to non-existent session → Error written to output file: "Session not found".
- **EC-004**: User tries to spawn when max sessions reached (limit: 10) → Error: "Max sessions reached".
- **EC-005**: SPAWN request while previous spawn still initializing → Queue and process sequentially.

## 7) Data & privacy

- **What is stored?** Lockfile (PID), session logs, command/status/output files per session.
- **Where?** `scripts/watcher/` directory (gitignored).
- **Retention?** Logs persist until manually deleted. Active session files deleted on clean shutdown.
- **Export/delete?** User can delete `scripts/watcher/` folder to reset everything.

## 8) Acceptance checks (testable)

- [ ] AC-001: Starting main watcher twice shows error on second attempt (TT-IG-001)
- [ ] AC-002: `SPAWN` command creates new session with unique ID (TT-FR-002, TT-IG-002)
- [ ] AC-003: Child watcher writes to dedicated log file (TT-FR-003)
- [ ] AC-004: `KILL:<session-id>` terminates specific child (TT-FR-004)
- [ ] AC-005: Ctrl+C on main watcher terminates all children (TT-FR-005)
- [ ] AC-006: Stale lockfile from crash is cleaned up on restart (TT-IG-004)
- [ ] AC-007: Session ID appears in process title (TT-IG-003)
- [ ] AC-008: Old A/B folders ignored, only dynamic sessions work (TT-IG-005)
- [ ] AC-009: Documentation updated with "How to run", "How to stop", "Troubleshooting"

## 9) Change log

**[2025-12-26 21:05]**

- Changed: Removed backward compatibility with A/B instances (user feedback: redundant)
- Changed: TT-IG-005 now deprecates A/B, all sessions use dynamic IDs

**[2025-12-26 21:00]**

- Added: Initial spec created based on user requirements (Option B: main watcher spawns children)

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (TT-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (TT-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
