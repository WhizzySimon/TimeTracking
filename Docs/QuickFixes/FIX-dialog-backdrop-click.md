# Fix dialog closing on backdrop click in Settings

**Date:** 2025-12-31
**Type:** [ ] Improvement / [x] Bug / [ ] Behavior Change

## Current Behavior

Clicking next to (outside) the ExportDialog closes it via backdrop click handler.

## Desired Behavior

Clicking outside the dialog should NOT close it - only the close button or Escape key should close it.

## Analysis

ExportDialog.svelte has `handleBackdropClick` function (lines 41-45) that closes the dialog when clicking the backdrop. This should be removed or disabled.

## Changes Made

- File: `src/lib/components/ExportDialog.svelte:41,57-64`
  - Removed `handleBackdropClick` function and onclick handler from dialog-backdrop
- File: `src/lib/components/Modal.svelte:37-41,98-99`
  - Removed `handleBackdropClick` function and onclick handler from modal-backdrop
- File: `src/lib/components/PlanComparison.svelte:14-18,29`
  - Removed `handleBackdropClick` function and onclick handler from modal-backdrop
- File: `src/lib/components/Paywall.svelte:59-63,77`
  - Removed `handleBackdropClick` function and onclick handler from paywall-backdrop

**All dialogs now only close via:**

- Close button (×)
- Escape key
- Explicit action buttons

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified change works (manual test - click outside dialog)

## Status: VERIFIED
