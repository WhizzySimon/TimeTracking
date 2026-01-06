# Add dismissible close button to install banner

**Date:** 2026-01-06
**Type:** [x] Improvement

## Current Behavior

The install banner appears at the top of the app with "App installieren" button when PWA is not installed. There is no way to dismiss it except by installing the app.

## Desired Behavior

- Add an X button on the right side of the install banner
- Clicking X dismisses the banner on all pages except settings
- On settings page, banner always shows when app is not installed
- Dismissal state persists across sessions (localStorage)

## Analysis

Current implementation in `src/routes/+layout.svelte`:
- Banner shows when `canInstall` is true (lines 483-486)
- No dismissal logic exists
- Need to add:
  1. localStorage key to track dismissal
  2. X button with icon
  3. Click handler to set dismissal state
  4. Logic to check current route (show on /settings regardless of dismissal)

## Changes Made

- File: `src/routes/+layout.svelte`
- Changes:
  1. Added `installBannerDismissed` state variable
  2. Added `dismissInstallBanner()` function to set dismissal in localStorage
  3. Modified banner condition to check dismissal state and current route
  4. Added X button with SVG icon (only shown on non-settings pages)
  5. Added localStorage loading in onMount
  6. Added CSS for close button with hover effects

## QA Checklist

- [x] `npm run check` passes (0 errors, 11 warnings - pre-existing)
- [ ] Verified banner can be dismissed on non-settings pages
- [ ] Verified banner persists on settings page even when dismissed
- [ ] Verified dismissal state persists across page reloads

## Status: DONE

<!-- Update to: DONE → VERIFIED → COMMITTED -->
