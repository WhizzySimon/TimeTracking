# Self-Learning & Self-Improvement System

**Trigger:** Before commit (from pre-commit.md)

This unified system handles both:
- **Self-Learning:** Behavioral feedback from user
- **Self-Improvement:** Process patterns from session analysis

---

## Execution Logging

**Log file:** `Docs/DevFramework/FrameworkSelfImprovementLogs/SELF-LEARNING-LOG.md`

At the START of workflow, create a new log entry header:
```
## YYYY-MM-DD HH:MM

| Step | Result | Notes |
|------|--------|-------|
```

After EACH step, immediately add a row to the log entry.

---

## Pre-Commit Workflow

Execute ALL steps in order:

---

### Part A: Self-Learning (Behavioral)

#### Step A1: Capture User Feedback

Review the chat for user feedback. Add entries to `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md`.

**What to capture:**
- **Corrective:** "Don't do X", "Always do Y instead", mistakes to avoid
- **Positive (specific only):** "Good job on X", "I like how you did Y" — where X/Y is identifiable behavior
  - Skip vague praise: "ok", "good", "thanks", "well done" (no actionable content)

**Log:** `| A1: Capture feedback | X items added | or "none" |`

---

### Part B: Self-Improvement (Process Patterns)

#### Step B1: Detect Repeated Errors

Scan the chat for errors that occurred 3+ times. If found, add to INBOX:
```
| Date | Context | Feedback | Status |
| YYYY-MM-DD | repeated-error | Error X occurred N times - investigate root cause | Pending |
```

**Log:** `| B1: Repeated errors | X detected | or "none" |`

#### Step B2: Detect File Churn

Run: `git diff --stat`

If any file was edited 5+ times in this session (visible in chat), add to INBOX:
```
| YYYY-MM-DD | file-churn | File X edited N times - consider refactoring approach | Pending |
```

**Log:** `| B2: File churn | X files | or "none" |`

#### Step B3: Detect Scope Drift

Compare changed files (`git diff --name-only`) against the plan/task file.

If files were touched outside planned scope, add to INBOX:
```
| YYYY-MM-DD | scope-drift | File X not in plan - scope creep detected | Pending |
```

**Log:** `| B3: Scope drift | X files | or "none", or "no plan" |`

#### Step B4: Session Duration Check

Note approximate session duration from chat timestamps (first message → now).

If session exceeded 2 hours on a single task, add to INBOX:
```
| YYYY-MM-DD | long-session | Task X took >2h - consider breaking into smaller tasks | Pending |
```

**Log:** `| B4: Session duration | ~Xh Xm | normal / long |`

---

### Part C: Promotion & Enforcement

#### Step C1: Promote from INBOX → LEARNINGS.md

Check INBOX for items that meet promotion criteria:
- Repeated 2+ times across sessions, OR
- Explicitly marked by maintainer as high-impact

If criteria met, promote using this format:

```
- **[Category]** Short statement (1-2 lines)
  - Because: one short clause (optional)
```

Categories: **Hard Rule** | **Preference** | **Reminder**

**Log:** `| C1: Promotions | X promoted | list what was promoted, or "none" |`

#### Step C2: Read LEARNINGS.md

Read `Docs/DevFramework/FrameworkSelfImprovementLogs/LEARNINGS.md` to apply proven preferences.

**Log:** `| C2: Read LEARNINGS | ✓ read | X items in file |`

#### Step C3: Enforce Hard Rules (APPROVAL REQUIRED)

When promoting a **Hard Rule** to a JIT rule file, **user approval is mandatory**.

**Process:**
1. Propose the rule and target JIT file to the user
2. Explain: why needed, what it improves, when it triggers
3. **STOP and wait for explicit "yes"**
4. Only after approval, add to the JIT file

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

**Log:** `| C3: Hard Rule → JIT | proposed / approved / none | target file if any |`

**Note:** Promotion to LEARNINGS.md does NOT require approval. Only JIT integration does.

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
