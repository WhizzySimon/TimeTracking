---
description: Capture UI improvement reasoning for design system learning
---

# Capture UI Improvement Reasoning

**Purpose:** When making UI changes, capture the reasoning behind decisions to build design principles and improve future UI work.

---

## When to Use This Workflow

Trigger this workflow when:

- User explains WHY a UI element should be changed/removed/added
- User provides reasoning about visual hierarchy, information density, or UX principles
- A UI improvement reveals a pattern that could become a guideline

---

## Step 1: Extract the UI Principle

From the user's explanation, identify:

1. **The specific change** (what was modified)
2. **The reasoning** (why it was modified)
3. **The underlying principle** (the general rule that applies beyond this case)

Example from session:

- **Change:** Remove days count label from month page week rows
- **Reasoning:** Date range already communicates span; count adds noise without value
- **Principle:** Remove elements that don't add clear value when information is already conveyed

---

## Step 2: Check Existing UI Guidelines

Read these files to see if the principle already exists:

- `DevFramework/JustInTimeAgentRules/frontend-ui-standards.md`
- `DevFramework/JustInTimeAgentRules/frontend-ux-standards.md`

If the principle exists → skip to Step 4 (just log the example)
If the principle is new → proceed to Step 3

---

## Step 3: Add Principle to Guidelines

Determine which file fits best:

- **UI Standards** → Visual design, layout, spacing, typography, components
- **UX Standards** → User flows, interaction patterns, information architecture

Add the principle with:

- Clear title
- Explanation
- Example from this session
- When to apply it

---

## Step 4: Log the Example

Add to `DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md`:

```markdown
## UI Improvement: [Short Title]

**Date:** [YYYY-MM-DD]
**Principle:** [Name of principle]
**Change:** [What was changed]
**Reasoning:** [Why it was changed]
**File:** [Path to guideline if new principle was added]
```

---

## Step 5: Summary

Report to user:

- Whether principle was new or existing
- Where it was documented
- What was logged

---

## Notes

- This workflow captures **reasoning**, not just changes
- Focus on **transferable principles**, not one-off fixes
- Keep principles **actionable** and **specific**
- Examples make principles concrete and memorable
