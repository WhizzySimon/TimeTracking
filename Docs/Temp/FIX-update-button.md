# Update button appears when no update available

**Date:** 2025-12-30
**Type:** [x] Bug

## Current Behavior

The "Update verfügbar - Neuladen" button appears on every page even when the latest version is already loaded. Clicking it reloads the page but nothing changes because the same version is already active.

## Desired Behavior

The update button should only appear when there is actually an older version loaded and a newer version is available.

## Analysis

The issue is in `src/lib/pwa/update.ts` lines 27-31. The code checks `reg.waiting` on every page load and immediately shows the update button. However, this check doesn't verify whether the waiting worker is actually a newer version than what's currently active.

When a user manually reloads the page after a deployment, the browser may have already activated the new service worker, but the `reg.waiting` check can still momentarily find a waiting worker, causing the button to appear incorrectly.

The fix: Only show the update button when there's both a waiting worker AND an active controller (meaning the old version is still running). The existing check on line 42 already does this correctly for the `updatefound` event, but the initial check on line 28 doesn't.

## Changes Made

- File(s): `src/lib/pwa/update.ts`
- Change: Added check for `navigator.serviceWorker.controller` in addition to `reg.waiting` on line 29 to ensure update button only appears when old version is still active

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified change works (manual test required - deploy and test update flow)

## Status: DONE

<!-- Update to: DONE → VERIFIED → COMMITTED -->
