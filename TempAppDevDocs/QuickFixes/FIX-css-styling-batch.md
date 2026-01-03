# CSS/Styling improvements batch

**Date:** 2026-01-03
**Type:** [ ] Bug / [ ] Behavior Change / [x] Improvement

## Current Behavior

1. **Day-page empty state:** Shows "Keine Aufgaben für diesen Tag" text
2. **Last/next buttons:** Horizontal alignment of chevron/text is off
3. **Week/month/analysis time-rows:** No space between labels, summary at right end needs adjustment
4. **Hover states:** Need to re-implement hover highlighting differently from "touched" state
5. **Analysis Summe row:** Looks too highlighted/touchable, should look like info row

## Desired Behavior

1. Empty state should show button "Füge eine Tätigkeit hinzu" that navigates to /add
2. Chevron and text properly aligned horizontally
3. Proper spacing between labels, summary positioned correctly
4. Distinct hover vs touched states
5. Summe row styled as non-interactive info

## Analysis

### 1. Empty state button

`TaskList.svelte:42` shows static text. Need to replace with button that navigates to `/add`.

### 2. Nav button alignment

Day/week/month pages have `.nav-btn` with chevron SVGs. Need to check alignment of chevron and text.

### 3. Time-rows spacing

Analysis page has summary rows with labels and values. Need to check spacing between "Gesamt" and "Ø/Woche" labels.

### 4. Hover states

Need to review hover CSS across clickable elements to ensure distinct from pressed state.

### 5. Summe row styling

`analysis/+page.svelte:734` - `.summary-total-row` uses `.tt-list-row-static` which may look too highlighted. Should be styled as info row, not clickable.

## Changes Made

1. **Empty state button** (`TaskList.svelte`)
   - Replaced static text with button linking to `/add`
   - Added flexbox layout for centered button

2. **Nav button alignment** (`day/+page.svelte`, `week/+page.svelte`, `month/+page.svelte`)
   - Increased gap from `4px` to `var(--tt-space-8)` for better chevron/text spacing
   - Added `:hover` state with `var(--tt-background-card-hover)` (distinct from `:active` pressed state)

3. **Time-rows spacing** (`analysis/+page.svelte`)
   - Changed `.column-headers` gap to `var(--tt-space-16)` for consistent spacing
   - Updated color variable to `var(--tt-text-muted)`

4. **Hover states**
   - Added `:hover` styles to nav buttons (day/week/month pages)
   - Hover uses `--tt-background-card-hover`, distinct from `:active` pressed state

5. **Summe row styling** (`analysis/+page.svelte`)
   - Changed from highlighted brand colors to info-style
   - Removed `.tt-list-row-static` dependency, added explicit flex layout
   - Background: `var(--tt-background-info)`, border: `var(--tt-border-default)`
   - Now looks like non-interactive info row

## QA Checklist

- [x] `npm run check` passes
- [ ] Manual verification needed:
  - Day-page empty state shows button
  - Nav buttons have proper chevron/text spacing
  - Analysis page Summe row looks like info (not clickable)
  - Hover states work correctly

## Status: DONE

<!-- Update to: DONE → VERIFIED → COMMITTED -->
