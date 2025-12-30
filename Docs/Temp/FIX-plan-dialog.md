# Plan ändern dialog bugs

**Date:** 2025-12-30
**Type:** [x] Bug

## Current Behavior
1. Cannot click/select Free plan when current plan is Pro - clicks do nothing
2. Dialog background is transparent instead of white

## Desired Behavior
1. Should be able to click Free plan to select it, then click Apply/OK to change
2. Dialog background should be white (opaque)

## Analysis

**Bug 1 - Cannot select Free plan:**
- Lines 111-113: Only shows "Pro freischalten" button when current plan is Free
- No button or click handler for switching from Pro to Free
- Need to add buttons for all plan changes, not just upgrades

**Bug 2 - Transparent background:**
- Line 138: Uses `background: var(--card)` which may be transparent in some themes
- Should use explicit white/opaque background or `var(--surface)` which is guaranteed opaque

## Changes Made
- File(s): `src/lib/components/PlanComparison.svelte`
- Changes:
  1. Renamed `handleUpgrade()` to `handleSelectPlan(planName)` to handle any plan selection
  2. Changed condition from `plan.name === 'Pro' && $userPlan === 'free'` to `!plan.comingSoon && $userPlan !== plan.name.toLowerCase()` - shows button for all non-current, available plans
  3. Changed button text from "Pro freischalten" to "{plan.name} wählen" (dynamic)
  4. Changed modal background from `var(--card)` to `var(--surface)` for guaranteed opacity
  5. Renamed CSS class from `upgrade-btn` to `select-plan-btn` 

## QA Checklist
- [x] `npm run check` passes
- [ ] Verified change works (manual test)

## Status: DONE
<!-- Update to: DONE → VERIFIED → COMMITTED -->
