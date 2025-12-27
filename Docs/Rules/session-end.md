# Session End Rules

**Trigger:** Before ending any session

---

## CRITICAL — Work Must Never Be Lost

Before ending any session, Cascade MUST verify:

1. **Pre-commit checklist completed** (see `Docs/Rules/pre-commit.md`)
2. **Learnings promoted:** Check INBOX for items repeated 2+ times → promote to `Docs/Devlog/LEARNINGS.md`
3. **No uncommitted changes:** Run `git status` — working tree must be clean
4. **No unpushed commits:** Run `git log origin/dev..HEAD --oneline` — must be empty

---

## If Any Check Fails

**DO NOT end the session.** Complete the cycle:

- Feedback given → Add to `Docs/Devlog/LEARNINGS-INBOX.md` (date, context, feedback)
- Duplicates in Inbox → Promote to `Docs/Devlog/LEARNINGS.md`, mark as promoted in Inbox
- Decision made → Add to `Docs/Devlog/DECISIONS.md` (use template)
- Missing changelog → Add one-line entry to `Docs/Devlog/CHANGELOG.md`
- Uncommitted → `git add -A; git commit -m "..."`
- Unpushed → `git push`

---

## Self-Learning System

Cascade learns from maintainer feedback via a two-tier system:

- **Inbox:** `Docs/Devlog/LEARNINGS-INBOX.md` — raw capture, unbounded, not read at session start
- **Distillate:** `Docs/Devlog/LEARNINGS.md` — proven preferences, max 30 bullets, read at session start

### When to Update

- **Inbox:** After each change set if maintainer gave feedback (positive OR corrective)
- **Distillate:** Only when promotion criteria met (repeated 2+ times across sessions OR explicitly marked by maintainer)

### What to Capture

- **Corrective feedback:** "Don't do X", "Always do Y instead", mistakes to avoid
- **Positive feedback:** "Good job on X", "I like how you did Y" — reinforces good patterns

### Distillate Entry Format

```
- **[Category]** Short statement (1-2 lines)
  - Because: one short clause (optional)
```

Categories: **Hard Rule** | **Preference** | **Reminder**

### Promotion → Enforcement

When a Distillate item is categorized as **Hard Rule**, the same commit should also add it to:

- `.windsurf/rules/` (for always-on enforcement), OR
- `RULE_MAP.md` (for process-related rules)

### Anti-Bloat Rules

- Hard cap: 30 bullets max in Distillate
- Merge duplicates before adding new items
- Prune items not referenced in 10+ sessions
- No ephemeral mood — store actionable guidance only

---

**Why this matters:** Unpushed work is lost if the local environment changes. Missing changelog entries make history unrecoverable. Uncaptured learnings mean repeated mistakes.
