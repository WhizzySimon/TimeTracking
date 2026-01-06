# Footer Button Gradient Selected State

**Date:** 2026-01-06
**Type:** [x] Improvement

## Current Behavior

Footer navigation buttons have different colors in normal state with standard hover effects. When selected, it's difficult to pick a background color that works well with the existing color scheme.

## Desired Behavior

Selected buttons should have a visual effect where:

- The top border appears "open"
- A gradient transitions from the button's bottom edge upward to the light gray app background
- Creates a visual effect of the button blending into the app background

## Analysis

**Current Implementation:**

- Footer tabs use different colored backgrounds (accent-100, accent-200, accent-300)
- Selected state: white background with dark text
- Hover: 8% color-mix overlay
- Footer background: brand-primary-500 (dark blue)

**Design Challenge:**
With different base colors per tab, selecting a single background color for the selected state creates visual inconsistency.

**Proposed Solution:**
Create a gradient effect where the selected button appears to "open up" into the app background:

- Remove/transparent top border
- Gradient from button's bottom (transparent) to top (light gray app background)
- Creates visual continuity between button and app content area

**Implementation Approach:**
Use CSS gradient with `linear-gradient()` from transparent to `var(--tt-background-page)` (the light gray). Apply via pseudo-element to avoid interfering with text/content.

## Changes Made

- File(s): `src/routes/dev/styleguide/+page.svelte`
- Change: Added "Footer Button Gradient Experiment" section to style guide with:
  - Demo footer navigation with 4 buttons (Tag, Woche, Monat, Analysis)
  - Gradient effect on selected button using `::before` pseudo-element
  - Gradient: `linear-gradient(180deg, var(--tt-background-page) 0%, var(--tt-background-page) 60%, transparent 100%)`
  - Text positioned above gradient with z-index layering
  - Hover state with subtle color-mix overlay on gradient
  - Transparent top border to create "open" visual effect

## QA Checklist

- [ ] `npm run check` passes
- [ ] Verified change works (manual or Playwright)

## Status: OPEN

<!-- Update to: DONE → VERIFIED → COMMITTED -->
