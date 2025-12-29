# Self-Learning System

**Reference document** — loaded from pre-commit when promoting learnings.

---

## Two-Tier System

Cascade learns from maintainer feedback via:

- **Inbox:** `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md` — raw capture, unbounded, not read at session start
- **Distillate:** `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS.md` — proven preferences, max 30 bullets, read at session start

---

## What to Capture

- **Corrective feedback:** "Don't do X", "Always do Y instead", mistakes to avoid
- **Positive feedback:** "Good job on X", "I like how you did Y" — reinforces good patterns

---

## Promotion Criteria

Promote from Inbox → Distillate when:
- Repeated 2+ times across sessions, OR
- Explicitly marked by maintainer

---

## Distillate Entry Format

```
- **[Category]** Short statement (1-2 lines)
  - Because: one short clause (optional)
```

Categories: **Hard Rule** | **Preference** | **Reminder**

---

## Hard Rule → Enforcement

When a Distillate item is **Hard Rule**, add it to the appropriate JIT rule file:

| Rule is about...        | Add to                                   |
| ----------------------- | ---------------------------------------- |
| Session start           | `session-start.md`                       |
| Writing specs           | `spec-writing.md`                        |
| Creating plans          | `planning.md`                            |
| Implementation/coding   | `implementation.md`                      |
| Pre-commit checklist    | `pre-commit.md`                          |
| Framework doc changes   | `framework-changes.md`                   |
| Always needed           | `.windsurf/rules/`                       |
| Core principles         | `_entrypoint-jit-rule-map.md`            |

**Route rules to specific trigger files** — do not add to general locations.

---

## Anti-Bloat Rules

- Hard cap: 30 bullets max in Distillate
- Merge duplicates before adding new items
- Prune items not referenced in 10+ sessions
- No ephemeral mood — store actionable guidance only
