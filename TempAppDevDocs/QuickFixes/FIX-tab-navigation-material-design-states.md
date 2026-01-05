# Tab Navigation: Material Design 3 States (Remove Border, Add Background States)

**Date:** 2026-01-05
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

The tab navigation used white borders to indicate hover, pressed, and selected states. This was inconsistent with the Material Design 3 approach used elsewhere in the app (state layers with background overlays).

## Desired Behavior

- **Hover:** Background overlay (like `tt-interactive`)
- **Pressed:** Stronger background overlay
- **Selected:** Completely white background with dark text (no border)
- **No borders** for state indication

## Analysis

The footer navigation tabs used `border-color` changes and `filter: brightness()` for state indication. This should be replaced with Material Design 3 state layers using `color-mix()` for background overlays, consistent with the rest of the app.

## Changes Made

- File(s):
  - `src/lib/styles/tt-design-system.css` (lines 1806-1901)
- Changes:
  1. **Removed border-based states** - replaced with background overlays
  2. **Hover state:** `color-mix()` with 8% overlay on base color
  3. **Pressed state:** `color-mix()` with 12% overlay on base color
  4. **Selected state:** White background (`var(--tt-white)`) + dark text
  5. **Tab-specific overlays:**
     - Day/Week/Month (light colors): Dark overlay (`var(--tt-brand-primary-700)`)
     - Plus/Analysis (dark colors): White overlay (`var(--tt-white)`)
  6. **Selected hover/pressed:** Subtle overlays on white background
  7. **Removed:** `filter: brightness()` and `border-color` transitions

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works via Playwright:
  - Selected tab (Tag) has white background and dark text
  - No borders visible on any state
  - Hover and pressed states use background overlays
  - All 5 tabs (Plus, Tag, Woche, Monat, Auswertung) have correct colors

## Status: VERIFIED

<!-- Update to: DONE → VERIFIED → COMMITTED -->
