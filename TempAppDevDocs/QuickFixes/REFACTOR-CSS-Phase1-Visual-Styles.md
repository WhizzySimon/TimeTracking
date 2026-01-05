# CSS Refactoring Phase 1: Extract Visual Styles to Classes

**Date:** 2026-01-05
**Type:** [x] Architecture Refactoring
**Phase:** 1 of 2 (Visual Style Extraction)

## Goal

Extract all visual styling from component `<style>` tags into `.tt-*` CSS classes in `tt-design-system.css`.

## Scope

**Visual styles to extract:**

- Colors (text, background, border)
- Typography (font-size, font-weight, line-height)
- Borders, shadows, border-radius
- Hover/active/focus states
- Transitions and animations

**Keep in components:**

- Layout (flex, grid, positioning)
- Spacing (padding, margin, gap)
- Structural CSS (display, overflow, z-index)

## Reference Document

Full context: `TempAppDevDocs/QuickFixes/Refactor-CSS-Visual-Styles-To-Classes.md`

## Progress Tracking

### Step 1: Test Process with Simple Component ✓

- [x] Choose test component (InlineSummary.svelte)
- [x] Extract visual styles (.tt-summary-label)
- [x] Test with npm run check
- [x] Verified working

### Step 2: Navigation Pattern (Day/Week/Month Pages) ✓

- [x] Created .tt-nav-button class
- [x] Created .tt-nav-button\_\_chevron class
- [x] Created .tt-nav-button\_\_label class
- [x] Created .tt-date-selector-button class
- [x] Created .tt-date-selector-button\_\_prefix class
- [x] Created .tt-date-selector-button\_\_date class
- [x] Updated Day page
- [x] Updated Week page
- [x] Updated Month page
- [x] Verified with npm run check

### Step 3: Dialog & Modal Components ✓

- [x] Created .tt-dialog-message class
- [x] Created .tt-modal-backdrop class
- [x] Created .tt-modal-content class
- [x] Created .tt-modal-header class
- [x] Created .tt-modal-header\_\_title class
- [x] Updated ConfirmDialog.svelte
- [x] Updated Modal.svelte
- [x] Verified with npm run check

### Step 4: Add Page ✓

- [x] Created .tt-info-hint class
- [x] Created .tt-loading-text class
- [x] Updated Add page
- [x] Verified with npm run check

### Step 5: Common UI Patterns ✓

- [x] Created .tt-section-toggle classes (3 classes)
- [x] Created .tt-empty-state class
- [x] Created .tt-page-header classes (2 classes)
- [x] Verified with npm run check

### Remaining Work (Analysis & Settings Pages)

**Analysis Page** - Many visual styles remain:

- `.range-button` and child elements
- `.period-hours` and child elements (`.ist`, `.separator`, `.soll`, `.saldo`)
- `.no-work-badge`
- `.summary-total-row`, `.summary-label`, `.summary-values`, `.summary-value` variants
- `.category-row`, `.category-name`
- `.header-label`, `.column-headers`

**Settings Page** - Many visual styles remain:

- `.section-header h2` hover effect
- `.dropdown-menu`, `.dropdown-item`, `.dropdown-icon`, `.dropdown-item-danger`
- `.account-info`, `.account-row`, `.account-label`, `.account-value`
- `.plan-text` variants
- `.version-info`, `.version-label`, `.build-time`
- `.delete-account-error`
- `.dev-settings`, `.color-preview`, `.color-swatch`
- And more...

### Remaining Components

- [ ] Many components in `src/lib/components/` still need review

## QA Checklist

- [ ] All components tested in browser
- [ ] No visual regressions
- [ ] Hover states working correctly
- [ ] Responsive behavior maintained
- [ ] `npm run check` passes

## Status: IN PROGRESS

<!-- Will update to: PHASE_1_COMPLETE → COMMITTED -->
