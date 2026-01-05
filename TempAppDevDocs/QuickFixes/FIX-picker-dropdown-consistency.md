# Replace native select elements with CustomDropdown in date pickers

**Date:** 2026-01-05
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

The date pickers (MonthYearPicker, WeekYearPicker, DayPicker) used native HTML `<select>` elements with custom CSS styling. The chevron icon in these native selects had browser-specific styling that was too close to the edge, making them look inconsistent with other dropdowns in the app (e.g., in the AddWorkTimeModelModal).

Additionally, dropdowns with many options (12 months, 50+ weeks) created poor UX with long scrollable lists.

## Desired Behavior

- Year selectors should use the `CustomDropdown` component for consistent styling
- Month selector should use a visual grid instead of dropdown (12 options = too many for dropdown)
- Week selector should use number input instead of dropdown (50+ options = way too many)

## Analysis

Native `<select>` elements have browser-specific styling for the dropdown arrow/chevron that is difficult to control with CSS. The solution is to replace all native `<select>` elements in the date pickers with the `CustomDropdown` component, which provides consistent styling and proper spacing.

## Changes Made

- File(s):
  - `src/lib/components/MonthYearPicker.svelte` (lines 10-11, 73-76, 93-99, 130-154, 197-210)
  - `src/lib/components/WeekYearPicker.svelte` (lines 10-13, 60-64, 89, 143-166, 200-231)
  - `src/lib/components/DayPicker.svelte` (lines 10-13, 65-68, 100-106, 193-223, 298-311)
- Changes:
  1. **All pickers:** Imported `CustomDropdown` component
  2. **MonthYearPicker:** Replaced month dropdown with 4x3 grid of month buttons (Jan, Feb, Mär...)
  3. **MonthYearPicker:** Created `availableMonths` array to track valid months for selected year
  4. **MonthYearPicker:** Added `.month-grid`, `.month-btn` with selected/disabled states
  5. **DayPicker:** Created `yearOptions` and `monthOptions` arrays for CustomDropdown
  6. **WeekYearPicker:** Created `yearOptions` only (week uses number input instead)
  7. **All pickers:** Replaced native year `<select>` with `CustomDropdown` components
  8. **WeekYearPicker:** Replaced week dropdown with `<input type="number">` to avoid 50+ options
  9. **WeekYearPicker:** Put year and week selectors in one row (`.selectors` flex container)
  10. **All pickers:** Removed unused `.select-input` and `.select-input:focus` CSS rules
  11. **CustomDropdown integration:** Used `String()` conversion for values and `parseInt()` for change handlers

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works via Playwright:
  - MonthYearPicker: Year uses CustomDropdown, month uses 4x3 grid (no dropdown with 12 items)
  - MonthYearPicker: Month grid shows all 12 months at once, selected month highlighted, disabled months grayed out
  - WeekYearPicker: Year and week in one row, week uses number input (no 50+ dropdown items)
  - DayPicker: Year and month use CustomDropdown with proper chevron spacing
  - All year dropdowns have consistent styling across the app
  - CustomDropdown max-height prevents dialog from growing when opened
  - No scrollbars in pickers - compact and user-friendly

## Status: VERIFIED

<!-- Update to: DONE → VERIFIED → COMMITTED -->
