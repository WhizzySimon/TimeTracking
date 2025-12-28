# D3: Watcher Framework Improvement — Tasks

**Phase:** D3  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Based on Spec:** `Docs/Specs/D3-watcher-framework-improvement.md`  
**Based on Plan:** `Docs/Plans/D3-watcher-framework-improvement.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task D3.1 — Create Main Watcher Script (Core)

- **Files:**
  - `scripts/watcher-main.ps1` (new)
- **Done when:**
  - Main watcher script exists with:
    - Lockfile creation/checking
    - Stale lock detection (PID check)
    - Main loop polling control file
    - Clean shutdown on Ctrl+C
  - Script starts and shows banner with status
- **Verify:**
  - Start script → lockfile created
  - Start second instance → error shown, exits
  - Ctrl+C → lockfile removed
- **Guardrails:**
  - Do not modify existing `watcher.ps1` yet
- **Estimated:** 1h

---

## Task D3.2 — Implement SPAWN Command

- **Files:**
  - `scripts/watcher-main.ps1`
- **Done when:**
  - Writing `SPAWN` to `main-control.txt` spawns a child watcher
  - Child gets unique session ID (YYYYMMDD-HHmmss-xxxx)
  - Session folder created with command/status/output files
  - Child PID tracked in main watcher
  - `main-status.txt` updated with new session
- **Verify:**
  - Write `SPAWN` → new session folder appears
  - Session ID format correct
  - Child process visible in Task Manager
- **Guardrails:**
  - Max 10 sessions enforced
- **Estimated:** 1h

---

## Task D3.3 — Implement KILL and LIST Commands

- **Files:**
  - `scripts/watcher-main.ps1`
- **Done when:**
  - `KILL:<session-id>` terminates specific child, cleans up
  - `LIST` writes current sessions to `main-status.txt`
  - `SHUTDOWN` terminates all children and main watcher
- **Verify:**
  - KILL → child process terminated, session removed from status
  - LIST → status file shows all sessions
  - SHUTDOWN → all processes terminated, lockfile removed
- **Guardrails:**
  - KILL on non-existent session writes error, doesn't crash
- **Estimated:** 1h

---

## Task D3.4 — Update Child Watcher for Session Support

- **Files:**
  - `scripts/watcher.ps1`
- **Done when:**
  - Accepts `-SessionId` parameter (required)
  - Sets window title to include session ID
  - Writes startup/shutdown to `logs/<session-id>.log`
  - Old `-Instance` parameter removed
- **Verify:**
  - Start with `-SessionId test123` → title shows session ID
  - Log file created in `scripts/watcher/logs/`
  - Start without `-SessionId` → error shown
- **Guardrails:**
  - Remove old A/B code paths completely
- **Estimated:** 0.5h

---

## Task D3.5 — Child Health Monitoring

- **Files:**
  - `scripts/watcher-main.ps1`
- **Done when:**
  - Main watcher polls child PIDs every 2 seconds
  - Dead children detected and marked in status
  - Dead sessions cleaned up from tracking (but folder kept for debugging)
- **Verify:**
  - Kill child via Task Manager → main watcher detects, updates status
  - Status shows "DEAD" for crashed session
- **Guardrails:**
  - Don't auto-restart crashed children (user should investigate)
- **Estimated:** 0.5h

---

## Task D3.6 — Update Documentation

- **Files:**
  - `Docs/Tooling/CASCADE_WATCHER.md`
  - `.windsurf/rules/command-execution-rules.md` (if needed)
- **Done when:**
  - Documentation includes:
    - "How to run" (start main watcher)
    - "How to stop" (Ctrl+C or SHUTDOWN)
    - "Troubleshooting" section (stale lock, dead sessions)
  - Old A/B documentation removed
- **Verify:**
  - Documentation is clear and complete
  - New user can follow instructions
- **Guardrails:**
  - Remove all references to old A/B system
- **Estimated:** 0.5h

---

## Task D3.7 — Update Progress Tracker and Commit

- **Files:**
  - `Docs/IMPLEMENTATION_PROGRESS.md`
  - `Docs/Devlog/CHANGELOG.md`
- **Done when:**
  - D3 marked as COMPLETE in progress tracker
  - Changelog entry added
  - All changes committed and pushed
- **Verify:**
  - `npm run verify` passes
  - Git status clean
- **Guardrails:**
  - Follow session-end rules from AGENTS.md
- **Estimated:** 0.5h

---

## Summary

| Task      | Description                   | Est.   |
| --------- | ----------------------------- | ------ |
| D3.1      | Main watcher core (lockfile)  | 1h     |
| D3.2      | SPAWN command                 | 1h     |
| D3.3      | KILL, LIST, SHUTDOWN commands | 1h     |
| D3.4      | Child watcher session support | 0.5h   |
| D3.5      | Child health monitoring       | 0.5h   |
| D3.6      | Update documentation          | 0.5h   |
| D3.7      | Progress tracker and commit   | 0.5h   |
| **Total** |                               | **5h** |
