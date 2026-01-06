# Right-align labels in settings and week page + Fix dropdown width

**Date:** 2026-01-05
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior

The "Keine Arbeitszeit" badge appears immediately after the category label (e.g., "Einkaufen", "Feiertag") on the left side of the row.

## Desired Behavior

The "Keine Arbeitszeit" badge should be right-aligned, pushed to the right side of the row before the delete icon.

**Extension 1:** Same fix needed for week page - day type labels (Arbeitstag, Urlaub, Krank, Feiertag) should be right-aligned regardless of varying content to the right (hours display).

**Extension 2:** Dropdown menu options are too wide - they should be constrained to the width of the closed dropdown button.

## Analysis

The `CategoryBadge` component is currently rendered inside the `tt-list-row__title` span (line 699), causing it to flow inline with the category name on the left side.

The fix is to move the badge from inside `tt-list-row__title` to the `row-right-section` div, where it will appear on the right side before the delete button (similar to how employer labels work in the Tätigkeiten section).

## Changes Made

- File(s):
  - `src/routes/settings/+page.svelte` (lines 697-732)
  - `src/routes/week/+page.svelte` (lines 336-354)
  - `src/lib/styles/tt-design-system.css` (lines 2221-2225)
  - `src/lib/components/CustomDropdown.svelte` (lines 183-211)
- Changes:
  1. **Settings page:** Moved `CategoryBadge` component from inside `tt-list-row__title` to `row-right-section` div
  2. **Settings page:** Added placeholder div (`tt-btn-delete-placeholder`) for system categories to maintain vertical alignment with rows that have delete buttons
  3. **Week page:** Moved day type label (`tt-list-row__detail`) outside `tt-list-row__content` to position between date and hours (Date | Label | Hours)
  4. **Dropdown:** Changed `.custom-dropdown` container from `width: auto` to `width: fit-content` so it only takes the width of its content
  5. **Dropdown:** Changed `.dropdown-menu` from `min-width: 100%` to `width: 100%` and added `overflow-x: hidden`
  6. **Dropdown:** Added text truncation to `.dropdown-option` (white-space, overflow, text-overflow)
  7. Added CSS for placeholder with same width (40px) as delete button

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works via Playwright:
  - Settings page (Abwesenheit): Badges right-aligned, vertically consistent
  - Week page: Labels positioned between date and hours (Date | Label | Hours)
  - Dropdown: Menu width constrained to button width, options truncate with ellipsis

## Status: VERIFIED

<!-- Update to: DONE → VERIFIED → COMMITTED -->
