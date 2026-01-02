# Learnings (Distillate)

Proven preferences and patterns. Read at session start. **Max 30 bullets.**

**Update rule:** Promote from LEARNINGS-INBOX.md only when criteria met. See AGENTS.md "Self-Learning System".

---

## Foundational Principle

**Ultimate Goal: Improve quality AND save human time.**

Everything derives from this. Every rule, workflow, learning exists to serve this goal. AI's job is not just to execute tasks but to **creatively look for what can be created, improved, or developed** to get closer to this goal. This is the permanent backdrop for all work.

Reference: `framework-principles.md` "The Ultimate Goal" section.

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
- **[Preference]** Apply zoom-out pattern when noticing issues: fix detail → find pattern → generalize → document rule → apply at all levels.
  - Because: Each zoom level fixes future friction. This is what "proactive" means.
  - Reference: `mindset.md` "The Zoom-Out Pattern" section.
- **[Preference]** Everything must be self-documenting. No documentation ABOUT systems — the system itself is the source of truth.
  - Because: Documentation about systems goes stale. In AI age, live analysis replaces static docs.
  - Applied: UI (frontend-ux-standards.md), naming (naming-conventions.md), structure.
- **[Preference]** Detect inconsistencies as signals: naming mismatches, unexplained complexity, redundancy, friction. These point to systemic issues.
  - Because: AI can't "feel" irritation but CAN detect logical inconsistencies. Use the detection checklist.
  - Reference: `mindset.md` "Inconsistency Detection" section.
- **[Preference]** Automate AND increase quality — never automate at the cost of quality.
  - Because: Speed without quality creates tech debt. The framework exists to achieve both.
  - Reference: `framework-principles.md` "The Ultimate Goal" section.
- **[Preference]** Quality over haste. After substantial user input, re-read and verify full extraction before summarizing.
  - Because: Rushing to "complete" misses value. User prompting twice costs more than careful first-pass.
  - Reference: `mindset.md` "Anti-Pattern: Haste Over Quality" section.
- **[Preference]** Translate human concepts to AI-applicable form. Don't transcribe "irritation" — translate to "inconsistency detection checklist."
  - Because: Human concepts (feelings, intuition) can't be executed by AI. Extract the FUNCTION, design an equivalent.
  - Reference: `mindset.md` "Translate Human Concepts" section, `framework-principles.md` "Translating Human Intelligence to AI".

## Reminders

- **[Reminder]** Mindset is a permanent overlay, not just trigger-based. Even in "extraction mode" or "execution mode", mindset principles still apply.
  - Because: Switching to task-focused mode and forgetting mindset caused the "extraction without evaluation" error.
- **[Reminder]** Telemetry/self-improvement analysis happens at pre-commit, not during work.
  - Because: Cascade doesn't remember to run commands during work; chat analysis is sufficient.

---

**Current count:** 12 / 30
