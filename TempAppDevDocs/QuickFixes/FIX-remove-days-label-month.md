# Remove days count label from month page week rows

**Date:** 2026-01-08
**Type:** [x] Improvement

## Current Behavior

Month page week rows show two labels:

1. Date range (e.g., "1.–7.")
2. Days count (e.g., "(5 Tage)")

## Desired Behavior

Show only the date range label. Remove the days count label.

## Reasoning

The days count label adds visual noise without providing meaningful value:

- The date range already communicates the span
- Active work days vary by work time model, making the count potentially confusing
- Reduces visual clutter in an already information-dense row

**UI Principle:** Remove elements that don't add clear value. Less is more when information is already conveyed through other means.

## Changes Made

- File: `src/routes/month/+page.svelte`
- Removed `week-row__days` span from template
- Removed `activeDays` const calculation from template
- Removed `getActiveWorkDays()` function (no longer used)
- Updated grid layout from `4rem auto auto 1fr` to `4rem auto 1fr`
- Removed `.week-row__days` CSS styling

## QA Checklist

- [x] `npm run check` passes (0 errors, 13 warnings in styleguide only)
- [ ] Verified change works (visual check in month page)

## Status: DONE
