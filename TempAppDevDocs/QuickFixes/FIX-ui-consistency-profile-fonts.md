# UI Consistency: Profile Button, Menu Spacing, Font Unification

**Date:** 2026-01-03
**Type:** [x] Improvement

## Current Behavior

1. **Profile button** (upper right corner) has circular border - doesn't match app's rectangular style
2. **Settings menu** - "Einstellungen" text too close to gear icon, no proper gap
3. **Font inconsistency** - different fonts visible across pages

## Desired Behavior

1. Profile button should use rectangular border radius (consistent with app style)
2. Menu items should have unified spacing between icon and text (via shared classes/variables)
3. Single font family across entire app, set via CSS variable

## Analysis

### 1. Profile Button Border Radius

- **Location:** `@/src/routes/+layout.svelte:737`
- **Issue:** Uses `border-radius: 50%` (circular) instead of rectangular
- **Root Cause:** Hardcoded value, not using CSS variable
- **Expected:** Should use `var(--tt-radius-button)` (6px) for consistency
- **CSS Variable Exists:** Yes - `--tt-radius-button` defined in `tt-design-system-v2.css:126`

### 2. Menu Icon-Text Spacing

- **Location:** `@/src/routes/+layout.svelte:779-485` (menu-item class)
- **Current:** Uses `gap: var(--tt-space-10)`
- **Issue:** User reports text too close to icon
- **Recommendation:** Increase to `var(--tt-space-12)` for better breathing room
- **Already uses unified variable:** ✓ Good practice

### 3. Font Consistency

- **Design System Variable:** `--tt-font-family` does NOT exist in tt-design-system-v2.css
- **Theme.css has:** `--font-family` (line 26) set to system-ui stack
- **Body uses:** `var(--tt-font-family)` in layout.svelte:643
- **Issue:** Variable mismatch - body references `--tt-font-family` but only `--font-family` is defined
- **Solution:** Add `--tt-font-family` to design system OR update body to use `--font-family`

## Changes Made

### 1. Profile Button Border Radius

- **File:** `src/routes/+layout.svelte:737`
- **Change:** `border-radius: 50%` → `border-radius: var(--tt-radius-button)`
- **Result:** Profile button now uses rectangular border (6px) consistent with app style

### 2. Menu Icon-Text Spacing

- **File:** `src/routes/+layout.svelte:782`
- **Change:** `gap: var(--tt-space-10)` → `gap: var(--tt-space-12)`
- **Result:** Increased spacing from 0.625rem to 0.75rem for better readability

### 3. Font Family Variable

- **File:** `src/lib/styles/tt-design-system-v2.css:131`
- **Change:** Added `--tt-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
- **Result:** Design system now defines font variable that layout.svelte references

## QA Checklist

- [x] `npm run check` passes (0 errors, 5 warnings - unrelated to changes)
- [ ] Verified change works (manual - requires visual inspection in browser)

## Status: DONE

**Note:** Manual verification recommended to confirm:

1. Profile button now has rectangular corners (not circular)
2. Menu items have better spacing between icon and text
3. Font consistency across all pages

<!-- Update to: DONE → VERIFIED → COMMITTED -->
