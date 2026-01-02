# Fix: Week page dropdown triangle position

**Date:** 2025-12-31
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

On the Week page, the "Wochenart" dropdown has the triangle icon on the right side.

## Desired Behavior

Move the triangle icon to the left side, matching the "Tagesart" dropdown on the Day page.

## Analysis

DayTypeSelector uses custom select styling with left-positioned triangle icon. WeekTypeSelector was using default browser styling.

## Changes Made

- File(s): `src/lib/components/WeekTypeSelector.svelte`
- Change: Added custom select styling matching DayTypeSelector (appearance: none, background-image for triangle, background-position: 0.75rem center)

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works (code review)

## Status: VERIFIED
