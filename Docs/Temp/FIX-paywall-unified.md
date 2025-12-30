# Unified Paywall with Plan Selection

**Date:** 2025-12-30
**Type:** [x] Enhancement

## Current Behavior
- Paywall component only shows Pro plan with "Pro freischalten" button
- Different paywall instances (backup, export, import) show same Pro-only content
- No way to see or select Premium plan from paywall

## Desired Behavior
- Show all available plans (Free, Pro, Premium) in paywall
- Keep contextual messaging (title/subtitle) based on feature
- Let user choose which plan fits their needs
- Consistent with PlanComparison dialog in settings

## Rationale
**Industry best practices:**
- Spotify, Slack, Dropbox show all tiers when upselling
- Users should see all options and choose what fits
- Future-proof for Premium launch

**User feedback:**
- User noticed different paywall for sync vs settings
- Expected to see all plans everywhere

## Analysis

**Current implementation:**
- Paywall component showed only Pro plan with hardcoded features
- No way to see Premium plan or compare all options
- Different from PlanComparison dialog in settings

**Industry best practices (Spotify, Slack, Dropbox):**
- Show all available tiers when upselling
- Keep contextual messaging (why upgrade)
- Let users choose what fits their needs

**Solution:**
- Extract plan data/grid to shared `PlanGrid.svelte` component
- Refactor `Paywall.svelte` to use PlanGrid with contextual header
- Refactor `PlanComparison.svelte` to use same PlanGrid
- Single source of truth for plan features

## Changes Made

**New file:** `src/lib/components/PlanGrid.svelte`
- Extracted plan data (Free, Pro, Premium) and grid UI
- Reusable component with `onselect` callback
- Shows "Aktuell" badge for current plan (optional via `showCurrentBadge` prop)
- Shows selection buttons for non-current, available plans

**Modified:** `src/lib/components/Paywall.svelte`
- Replaced hardcoded Pro-only content with PlanGrid component
- Kept contextual header (icon, title, subtitle) based on `feature` prop
- Removed duplicate plan data and feature list
- Changed max-width from 400px to 900px to fit plan grid
- Simplified to just show PlanGrid + "Weiter mit Free" button

**Modified:** `src/lib/components/PlanComparison.svelte`
- Replaced inline plan grid with PlanGrid component
- Removed duplicate plan data and all grid styling
- Simplified from ~300 lines to ~120 lines
- Same functionality, cleaner code 

## QA Checklist
- [x] `npm run check` passes
- [ ] Verified backup paywall (Sync button) shows all plans
- [ ] Verified export paywall shows all plans
- [ ] Verified import paywall shows all plans
- [ ] Verified settings "Plan ändern" still works

## Status: DONE
<!-- Update to: DONE → VERIFIED → COMMITTED -->
