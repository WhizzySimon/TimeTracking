# Self-Learning System

**Trigger:** Before commit (from pre-commit.md)

---

## Pre-Commit Workflow

Execute these steps in order:

### Step 1: Capture New Feedback to INBOX

Review this session for feedback (positive or corrective). Add new entries to `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md`.

**What to capture:**
- **Corrective:** "Don't do X", "Always do Y instead", mistakes to avoid
- **Positive:** "Good job on X", "I like how you did Y" — reinforces good patterns

### Step 2: Promote from INBOX → LEARNINGS.md

Check INBOX for items that meet promotion criteria:
- Repeated 2+ times across sessions, OR
- Explicitly marked by maintainer as high-impact

If criteria met, promote using this format:

```
- **[Category]** Short statement (1-2 lines)
  - Because: one short clause (optional)
```

Categories: **Hard Rule** | **Preference** | **Reminder**

### Step 3: Read LEARNINGS.md

Read `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS.md` to apply proven preferences (now includes any new promotions).

### Step 4: Enforce Hard Rules

When promoting a **Hard Rule**, also add it to the appropriate JIT rule file:

| Rule is about...        | Add to                        |
| ----------------------- | ----------------------------- |
| Session start           | `session-start.md`            |
| Writing specs           | `spec-writing.md`             |
| Creating plans          | `planning.md`                 |
| Implementation/coding   | `implementation.md`           |
| Pre-commit checklist    | `pre-commit.md`               |
| Framework doc changes   | `framework-changes.md`        |
| Always needed           | `.windsurf/rules/`            |
| Core principles         | `_entrypoint-jit-rule-map.md` |

---

## Two-Tier System

- **Inbox:** `LEARNINGS-INBOX.md` — raw capture, unbounded
- **Distillate:** `LEARNINGS.md` — proven preferences, max 30 bullets

---

## Anti-Bloat Rules

- Hard cap: 30 bullets max in Distillate
- Merge duplicates before adding new items
- Prune items not referenced in 10+ sessions
- No ephemeral mood — store actionable guidance only
