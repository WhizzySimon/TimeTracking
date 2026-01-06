# Forward button should be disabled when no forward history available

**Date:** 2026-01-05
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

The forward button is always enabled, even when there is no forward history to navigate to.

## Desired Behavior

The forward button should behave like browser forward buttons:

- Disabled by default (no forward history)
- Enabled after user clicks back button (forward history available)
- Disabled again after reaching the end of forward history

## Analysis

The `ForwardButton` component had no logic for tracking forward history state. It simply called `window.history.forward()` without checking if forward navigation was possible.

## Changes Made

- File(s):
  - `src/lib/components/ForwardButton.svelte` (complete rewrite)
- Changes:
  1. Added `canGoForward` state to track if forward navigation is possible
  2. Added `hasNavigatedBack` state to track if user has used back button
  3. Added `popstate` event listener to detect back navigation
  4. Added `disabled` attribute to button based on `canGoForward` state
  5. Forward button only enables after user navigates back
  6. Forward button disables again after reaching end of forward history

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works via Playwright:
  - Forward button disabled on initial page load
  - Forward button enabled after clicking back button
  - Forward button disabled again after clicking forward to end of history

## Status: VERIFIED

<!-- Update to: DONE → VERIFIED → COMMITTED -->
