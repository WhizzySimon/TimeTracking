# Self-Learning & Self-Improvement System

**Trigger:** This file documents the overall system. Execution happens via:

- **Pre-commit:** Process pattern detection only (see `pre-commit.md`)
- **Chat-close:** Learning capture via `/capture-learnings` workflow

---

## System Overview

The self-learning system has two parts:

1. **Process Pattern Detection** — Runs at pre-commit, catches issues like repeated errors, file churn, scope drift
2. **Learning Capture** — Runs at chat-close via `/capture-learnings`, captures all types of learnings

---

## Learning Capture Workflow

**Trigger:** Before closing a chat (or on-demand)

**Workflow:** `.windsurf/workflows/capture-learnings.md`

**Categories scanned:**

1. Behavioral → `mindset.md`
2. UI/UX → `frontend-ui-standards.md` / `frontend-ux-standards.md`
3. Code Quality → `code-quality.md`
4. Backend Patterns → `backend-patterns.md`
5. State & Data → `state-data-patterns.md`
6. Testing → `ProjectSpecific/testing.md`
7. Debugging → `debugging.md`
8. Framework Meta → `framework-principles.md`
9. Process → workflow files or `implementation.md`
10. Task-Type Patterns → `TaskTypeRules/*.md`

---

## Learning Flow (Direct to JIT)

```
Chat session
    ↓
/capture-learnings workflow
    ↓
Deep analysis (goal-tracing, mid-level rules, honesty checks)
    ↓
Present findings with:
  - Observation from chat
  - Existing rule to attach to
  - Example to add
  - Chain to goal
  - Confidence level
    ↓
User approval (REQUIRED)
    ↓
Add example directly to JIT rule file
```

**No INBOX step** — Analysis quality is high enough to go directly from chat to JIT rules after approval.

### Optional: Web Research

For complex or unfamiliar topics, research best practices before presenting:

1. **Search** for best practices on the topic
2. **Summarize** industry standards (3-5 bullet points)
3. **Present both** to user:
   - Your learning from the session
   - Industry best practices
   - Proposed rule (combined/refined)
   - Target JIT file
4. **Wait for approval** before adding to JIT file

---

## Destination Mapping

| Learning Type      | Destination JIT File                     |
| ------------------ | ---------------------------------------- |
| Behavioral         | `mindset.md`                             |
| UI principles      | `frontend-ui-standards.md`               |
| UX principles      | `frontend-ux-standards.md`               |
| CSS patterns       | `frontend-css-architecture.md`           |
| Code quality       | `code-quality.md`                        |
| Backend/API        | `backend-patterns.md`                    |
| State/data         | `state-data-patterns.md`                 |
| Testing            | `ProjectSpecific/testing.md`             |
| Debugging          | `debugging.md`                           |
| Framework meta     | `framework-principles.md`                |
| Process/workflow   | Relevant workflow or `implementation.md` |
| Task-type specific | `TaskTypeRules/<type>.md`                |

---

## LEARNINGS-INBOX.md Format

```markdown
| Date | Category | Context | Learning | Destination | Status |
| YYYY-MM-DD | [category] | [brief context] | [principle + example] | [target file] | Pending / Promoted |
```

---

## LEARNINGS.md Role

**Purpose:** Curated summary of the most important cross-cutting principles (max 30 bullets).

**Not a holding pen** — learnings go directly from INBOX to JIT files after approval.

**LEARNINGS.md is for:**

- Foundational principles that apply across all work
- Cross-cutting rules that don't fit a single JIT file
- "Top 30 things to remember" quick reference at session-start

---

## Anti-Bloat Rules

- Hard cap: 30 bullets max in LEARNINGS.md
- Merge duplicates before adding new items
- Prune items not referenced in 10+ sessions
- No ephemeral mood — store actionable guidance only
- Prefer routing to specific JIT files over adding to LEARNINGS.md
