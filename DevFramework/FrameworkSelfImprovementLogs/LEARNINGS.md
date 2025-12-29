# Learnings (Distillate)

Proven preferences and patterns. Read at session start. **Max 30 bullets.**

**Update rule:** Promote from LEARNINGS-INBOX.md only when criteria met. See AGENTS.md "Self-Learning System".

---

## Hard Rules (enforce in .windsurf/rules/ or AGENTS.md)

**Placement rule:** Items here MUST have `[Hard Rule]` tag. Other categories go in their respective sections.

- **[Hard Rule]** Never use `git stash` — causes data loss. Use WIP commits instead.
  - Because: Multiple incidents of lost work. See GIT_WORKFLOW.md.
- **[Hard Rule]** Don't just avoid; understand. When something fails, question the system and understand WHY instead of adding avoidance rules.
  - Because: Avoidance rules accumulate without understanding. Understanding prevents root issues.
- **[Hard Rule]** Before every commit, update CHANGELOG.md and review session for LEARNINGS-INBOX.md
  - Because: Easy to forget in the flow of implementation.
  - **ESCALATED:** Added mandatory pre-commit checklist to AGENTS.md after violations on 2025-12-26 and 2025-12-27.

## Preferences

- **[Preference]** Prefer minimal upstream fixes over downstream workarounds.
  - Because: Root cause fixes prevent repeat issues.

## Reminders

- **[Reminder]** Telemetry/self-improvement analysis happens at pre-commit, not during work.
  - Because: Cascade doesn't remember to run commands during work; chat analysis is sufficient.

---

**Current count:** 5 / 30
