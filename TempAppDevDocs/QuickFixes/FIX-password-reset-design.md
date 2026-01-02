# Fix: Unify password reset page design

**Date:** 2025-12-31
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

The password reset page has a different design from the rest of the application.

## Desired Behavior

Password reset page should match the unified design system used throughout the app.

## Analysis

The reset-password page had hardcoded `@media (prefers-color-scheme: dark)` styles with hex colors instead of using CSS variables like other auth pages.

## Changes Made

- File(s): `src/routes/reset-password/+page.svelte`
- Change:
  - Removed entire `@media (prefers-color-scheme: dark)` block with hardcoded colors
  - Changed link color from hardcoded `#3b82f6` to `var(--accent)`
  - Page now uses CSS variables consistently like login/forgot-password pages

## QA Checklist

- [x] `npm run check` passes
- [x] Password reset page matches app design
- [x] Verified visually (screenshot comparison with login page)

## Status: VERIFIED
