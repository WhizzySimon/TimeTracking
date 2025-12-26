# Learnings (Distillate)

Proven preferences and patterns. Read at session start. **Max 30 bullets.**

**Update rule:** Promote from LEARNINGS-INBOX.md only when criteria met. See AGENTS.md "Self-Learning System".

---

## Hard Rules (enforce in .windsurf/rules/ or AGENTS.md)

- **[Hard Rule]** Never use `git stash` — causes data loss. Use WIP commits instead.
  - Because: Multiple incidents of lost work. See GIT_WORKFLOW.md.
- **[Hard Rule]** Use `&&` not `;` for watcher command chaining.
  - Because: Watcher executes via cmd.exe, which uses `&&` (not PowerShell's `;`).
- **[Hard Rule]** Before every commit, update CHANGELOG.md and review session for LEARNINGS-INBOX.
  - Because: Easy to forget in the flow of implementation. User caught missed updates.

## Preferences

- **[Preference]** Prefer minimal upstream fixes over downstream workarounds.
  - Because: Root cause fixes prevent repeat issues.

## Reminders

- (none yet)

---

**Current count:** 4 / 30
