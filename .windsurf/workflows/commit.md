---
description: Commit workflow - runs pre-commit checklist then commits and pushes
---

# /commit — Commit Workflow

**Purpose:** Ensure all pre-commit checks are completed before committing.

---

## Model Recommendation

**Recommended:** Sonnet 4.5 (2x credits)

**Why:** Pre-commit checklist execution is straightforward — verify docs, run commands, format output. No complex reasoning needed.

**Use current model:** This workflow doesn't require model switching.

---

## Step 0 — Setup

1. Read `.windsurf/rules/always-on.md` (loads JIT rule map)

---

## Step 1 — Pre-Commit Checklist

**Read and follow:** `DevFramework/JustInTimeAgentRules/pre-commit.md`

This includes:

- Sync check (if needed)
- /audit PASS
- CHANGELOG.md entry
- DECISIONS.md (if decision made)
- Self-learning & improvement workflow (Parts A, B, C)
- IMPLEMENTATION_PROGRESS.md update (if applicable)
- Spec/Plan/Tasks sync (if applicable)

**Do NOT proceed until checklist is complete.**

---

## Step 2 — Stage All Changes

```bash
git add -A
```

---

## Step 3 — Commit

```bash
git commit -m "<type>: <description>"
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `chore`, `test`

---

## Step 4 — Push

```bash
git push
```

---

## Step 5 — Verify

```bash
git status
git log origin/dev..HEAD --oneline
```

- Working tree should be clean
- No unpushed commits should remain
