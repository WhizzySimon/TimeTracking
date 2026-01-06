# Highlight current week text in month page with bold brand color

**Date:** 2026-01-06
**Type:** [x] Bug

## Current Behavior

In the month page, the current week row has a background highlight, but the "KW {number}" text is not bold or colored. The design system CSS rule exists but is being overridden by local component CSS.

## Desired Behavior

Current week's "KW {number}" text should be:
- Bold (font-weight: bold)
- Brand primary 500 color
- Match the exact same styling as today's date in the week page

## Analysis

**Root cause:** Local CSS in `src/routes/month/+page.svelte` was overriding the global design system rule.

The design system already has the correct rule at `src/lib/styles/tt-design-system.css:411-415`:
```css
.tt-current-row .week-row__title {
    font-weight: var(--tt-font-weight-bold);
    color: var(--tt-brand-primary-500);
}
```

But the month page had local CSS with higher specificity:
```css
.week-row__title {
    font-weight: var(--tt-font-weight-normal);
    color: var(--tt-text-primary);
    white-space: nowrap;
}
```

## Changes Made

- File: `src/routes/month/+page.svelte`
- Change: Removed `font-weight` and `color` properties from `.week-row__title` local CSS, keeping only `white-space: nowrap`
- This allows the design system's `.tt-current-row .week-row__title` rule to apply correctly

## QA Checklist

- [x] `npm run check` passes (0 errors, 11 warnings - pre-existing)
- [ ] Verified current week "KW {number}" is bold and brand colored in month page
- [ ] Verified styling matches today's date styling in week page

## Status: DONE

<!-- Update to: DONE → VERIFIED → COMMITTED -->
