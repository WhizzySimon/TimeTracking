---
description: Fix a bug or make a behavior change - lightweight QA with temp ticket
---

# Fix or Change Workflow

For bugs, behavior changes, and small improvements.

---

## Step 0: Mindset & Model Selection

1. Read `.windsurf/rules/always-on.md` (loads JIT rule map)
2. Read `DevFramework/JustInTimeAgentRules/mindset.md`

**Agent: After user describes the issue, analyze and output:**

> **Model Recommendation:** [Sonnet 4.5 / Opus 4 / Opus 4 Thinking]
> 
> **Reasoning:** [1-line based on criteria below]

| Complexity | Model | Credits | Criteria |
|------------|-------|---------|----------|
| **Simple** | Sonnet 4.5 | 2x | Typo, wrong value, missing import, obvious fix |
| **Moderate** | Opus 4 | 4x | Multi-file change, needs judgment, clear root cause |
| **Complex** | Opus 4 Thinking | 5x | Unclear root cause, multi-step debugging, architectural |

**Wait for user to confirm model selection before proceeding.**

---

## Step 1: Create Ticket (AUTOMATIC)

// turbo
**Agent: Create this file immediately when /fixOrChange is invoked:**

```
Docs/Temp/FIX-<short-name>.md
```

With content:

```markdown
# <short description from user>

**Date:** <date>
**Type:** [ ] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior
<what happens now>

## Desired Behavior
<what should happen>

## Analysis
<!-- Fill after investigation -->

## Changes Made
<!-- Fill after implementation -->
- File(s): 
- Change: 

## QA Checklist
- [ ] `npm run check` passes
- [ ] Verified change works (manual or Playwright)

## Status: OPEN
<!-- Update to: DONE → VERIFIED → COMMITTED -->
```

**Keep this file open during the work.**

---

## Quick Fix Mode (Optional)

For trivial one-liner changes where analysis is obvious:
- Skip "Analysis" section
- Mark `[x] Quick fix - no investigation needed` in ticket
- Still require QA checklist completion

---

## Step 2: Analyze

1. Understand current behavior
2. Identify what needs to change
3. Update "Analysis" in ticket

---

## Step 3: Implement

1. Make minimal change
2. Update "Changes Made" in ticket
3. Run `npm run check`

---

## Step 4: Verify (REQUIRED)

Choose one:
- **Manual test:** Confirm new behavior works
- **Playwright test:** Run relevant test or write spot-check

Update verification checkboxes in ticket.

---

## Step 5: Commit

1. Mark ticket status as VERIFIED
2. Stage ticket with your changes
3. Run `/commit` workflow
4. After successful commit: delete ticket (or move to `Docs/Archive/`)

---

## Multiple Items in One Session

Create separate tickets:
- `Docs/Temp/FIX-paywall-price.md`
- `Docs/Temp/FIX-employer-dropdown.md`

Each tracks its own verification status.
