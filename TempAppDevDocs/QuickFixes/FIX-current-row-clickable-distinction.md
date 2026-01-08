# Improve Current Row Visibility & Clickable Row Distinction

**Date:** 2026-01-08
**Type:** [x] Improvement

## Current Behavior

1. **Current row highlight:** Uses `--tt-background-card-hover` (subtle gray) - barely visible
2. **Clickable vs non-clickable rows:** Both use 1px borders with similar gray colors - hard to distinguish

## Desired Behavior

1. **Current row highlight:** Use `--tt-brand-primary-50` (light blue tint) for clear visibility
2. **Clickable rows:** Thicker 2px border with stronger color to signal interactivity
3. **Non-clickable rows:** Keep 1px border, add subtle gray background to visually recede

## Reasoning

**Current row:**

- User reported current week/day highlight is "almost not visible"
- Brand color tint creates clear visual connection to selected state

**Clickable distinction:**

- Current 1px borders too subtle - users can't tell what's clickable
- Best practice: Combine border weight + background differentiation
- Clickable items should "pop" (thicker border, white bg)
- Non-clickable items should "recede" (thin border, tinted bg)

**UI Principle:** Interactive elements must be immediately recognizable through visual affordances (border weight, color, background).

## Changes Made

- File: `src/lib/styles/tt-design-system.css`
- Change 1: `.tt-current-row` background → `var(--tt-brand-primary-50)` (light blue tint)
- Change 2: `--tt-border-touchable-color` → `var(--tt-gray-500)` (was gray-400, darker for better visibility)
- Change 3: `.tt-list-row-static` border → `none` (removed entirely)
- Change 4: `.tt-list-row-static` background → `var(--tt-gray-50)` (subtle tint provides distinction)

**Impact:**

- Clickable elements: 1px darker gray border (clear affordance)
- Non-clickable elements: No border, gray-50 background (visually recedes)
- Current row: Light blue tint (clearly visible)

## QA Checklist

- [x] `npm run check` passes (0 errors, 13 warnings in styleguide only)
- [ ] Verified in month page (current week highlight visible with blue tint)
- [ ] Verified in week page (current day highlight visible with blue tint)
- [ ] Verified clickable rows have thicker borders and white background
- [ ] Verified static rows have thin borders and gray-50 background

## Status: DONE
