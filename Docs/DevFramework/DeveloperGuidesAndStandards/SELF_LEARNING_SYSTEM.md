# Self-Learning & Self-Improvement System

## Overview

The Self-Learning System enables Cascade to improve its behavior over time by capturing feedback, detecting patterns, and promoting proven learnings into enforceable rules.

---

## Why It Exists

**Problem:** Cascade makes the same mistakes repeatedly across sessions because it has no persistent memory of corrections.

**Solution:** A file-based feedback loop that:
1. Captures corrections and positive feedback
2. Detects process patterns (errors, churn, drift)
3. Promotes proven learnings to permanent rules
4. Enforces rules via JIT triggers

---

## How It Works

### Two Systems, One Workflow

| System | What it analyzes | Purpose |
|--------|------------------|---------|
| **Self-Learning** | User feedback in chat | Behavioral corrections |
| **Self-Improvement** | Session patterns (errors, churn) | Process improvements |

Both feed into the same pipeline: **INBOX → LEARNINGS → JIT Rules**

### The Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     DURING SESSION                          │
│  User says "Don't do X"  ──►  Cascade notes feedback        │
│  Error occurs 3+ times   ──►  Cascade detects pattern       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     PRE-COMMIT TRIGGER                      │
│  1. Capture feedback      ──►  LEARNINGS-INBOX.md           │
│  2. Detect patterns       ──►  LEARNINGS-INBOX.md           │
│  3. Check promotion       ──►  LEARNINGS.md (if criteria)   │
│  4. Enforce Hard Rules    ──►  JIT files (with approval)    │
│  5. Log execution         ──►  SELF-LEARNING-LOG.md         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AUDIT VERIFICATION                      │
│  /audit checks:                                             │
│  - SELF-LEARNING-LOG.md is staged                           │
│  - Entry exists for today's date                            │
└─────────────────────────────────────────────────────────────┘
```

---

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| **Workflow rules** | `JustInTimeAgentRules/self-learning-system.md` | Step-by-step execution instructions |
| **Inbox** | `FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md` | Raw capture, pending review |
| **Distillate** | `FrameworkSelfImprovementLogs/LEARNINGS.md` | Proven rules (max 30) |
| **Execution log** | `FrameworkSelfImprovementLogs/SELF-LEARNING-LOG.md` | Audit trail of each run |
| **This overview** | `DeveloperGuidesAndStandards/SELF_LEARNING_SYSTEM.md` | Conceptual documentation |

---

## Categories

Learnings are categorized when promoted:

| Category | Meaning | Enforcement |
|----------|---------|-------------|
| **Hard Rule** | Must always follow | Added to JIT rule files (requires user approval) |
| **Preference** | Preferred approach | In LEARNINGS.md only |
| **Reminder** | Easy to forget | In LEARNINGS.md only |

---

## Promotion Criteria

Items move from INBOX → LEARNINGS when:
- Repeated 2+ times across sessions, OR
- Explicitly marked by maintainer as high-impact

---

## Approval Gate

**Hard Rules → JIT integration requires user approval.**

Cascade must:
1. Propose the rule and target file
2. Explain: why needed, what it improves, when it triggers
3. **STOP and wait for explicit "yes"**
4. Only then add to JIT file

---

## Audit Integration

The `/audit` workflow verifies self-learning execution:

| Check | What it verifies |
|-------|------------------|
| **E) Log staged** | SELF-LEARNING-LOG.md is in staged changes |
| **F) Today's entry** | Most recent entry has today's date |

If either fails, audit FAILs with remediation instructions.

---

## Anti-Bloat Rules

- **Max 30 items** in LEARNINGS.md (distillate)
- Merge duplicates before adding
- Prune items not referenced in 10+ sessions
- No ephemeral mood — actionable guidance only

---

## Related Documentation

- **JIT Rule Map:** `JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Pre-commit rules:** `JustInTimeAgentRules/pre-commit.md`
- **Audit workflow:** `.windsurf/workflows/audit.md`
