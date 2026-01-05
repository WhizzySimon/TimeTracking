# CSS Refactoring Phase 1: Extract Visual Styles to Classes

**Date:** 2026-01-05
**Type:** [x] Architecture Refactoring
**Phase:** 1 of 2 (Visual Style Extraction)

## Phase 1 Goals

Extract **reusable** visual styles from Svelte component `<style>` blocks into CSS classes in `tt-design-system.css`.

**Pragmatic Approach:**

**Extract to Design System:**
- ✓ Reusable visual patterns (used in 3+ components)
- ✓ Visual properties: colors, fonts, borders, shadows, padding, border-radius
- ✓ Interactive states: hover, focus, active, disabled
- ✓ Animations and transitions

**Keep Local in Components:**
- ✓ Single-use layouts (unique to one component)
- ✓ Component-specific grid/flex structures
- ✓ Unique positioning and spacing
- ⚠️ **Must use CSS variables** (prefer semantic variables)
- ⚠️ **Must add comment** marking as "Single-use" or "Component-specific"

**Out of Scope (Phase 2):**
- Organizing/optimizing the design system itself
- Extracting base classes and inheritance hierarchies
- Creating CSS custom properties for repeated values
- Structural CSS (display, overflow, z-index)

**Out of Scope (Phase 3):**
- CSS variable refactoring (semantic variables in local CSS)
- See: `CSS-Refactoring-Phase3-Variables.md`

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

### Step 6: Analysis Page ✓

- [x] Created .tt-range-button classes (2 classes)
- [x] Created .tt-period-hours classes (6 classes)
- [x] Created .tt-no-work-badge class
- [x] Created .tt-column-header-label class
- [x] Created .tt-summary-total-row classes (2 classes)
- [x] Created .tt-category-name class
- [x] Created .tt-summary-value classes (3 classes)
- [x] Updated Analysis page HTML
- [x] Removed extracted CSS from Analysis page
- [x] Verified with npm run check

### Step 7: Settings Page ✓

- [x] Created .tt-settings-section-header\_\_title hover class
- [x] Created .tt-dropdown-menu classes (4 classes)
- [x] Created .tt-account-info classes (3 classes)
- [x] Created .tt-plan-text class
- [x] Created .tt-version-label and .tt-build-time classes
- [x] Created .tt-delete-account-error class
- [x] Created .tt-empty-list class
- [x] Updated Settings page HTML
- [x] Removed extracted CSS from Settings page
- [x] Verified with npm run check

### Step 8: Status Components ✓

- [x] Created .tt-warning-banner classes (6 classes)
- [x] Created .tt-sync-indicator classes (5 classes)
- [x] Updated WarningBanner.svelte
- [x] Updated SyncIndicator.svelte
- [x] Verified with npm run check

### Step 9: Header Navigation & Empty State ✓
- [x] Created .tt-header-nav-button classes (3 classes)
- [x] Created .tt-empty-state classes (3 classes)
- [x] Updated BackButton.svelte
- [x] Updated ForwardButton.svelte
- [x] Updated TaskList.svelte
- [x] Visual verification in browser
- [x] Verified with npm run check

### Step 10: Form Fields & Dialog Components ✓
- [x] Created .tt-form-field classes (2 classes)
- [x] Created .tt-info-message class
- [x] Created .tt-error-message class
- [x] Created .tt-form-actions class
- [x] Updated CategoryDialog.svelte
- [x] Updated EmployerDialog.svelte
- [x] Updated AddWorkTimeModelModal.svelte (with single-use weekday grid documented)
- [x] Updated NameEditDialog.svelte
- [x] Updated EmailEditDialog.svelte (with single-use success message documented)
- [x] Visual verification in browser (CategoryDialog tested)
- [x] Verified with npm run check
- [x] Form patterns now reused across 5 dialog components

### Remaining Components - Pragmatic Assessment

**Complex single-use components (~35 components):**
- ✓ Keep local CSS with semantic variables (Phase 3)
- ✓ Already use design system classes for common elements (buttons, inputs, dialogs)
- Examples: ImportExcelModal, StundenzettelExport, ExportDialog

**Picker components (DayPicker, MonthYearPicker, WeekYearPicker):**
- ✓ Already use `.tt-button-primary`, `.tt-button-secondary` ✓
- ✓ Already use `Modal` component ✓
- ✓ Unique calendar/grid layouts kept local (single-use)
- No further extraction needed

**Other utility components:**
- ✓ Common elements (buttons, dropdowns, inputs) already use design system classes
- ✓ Unique layouts kept local with semantic variables
- No further extraction needed

**Phase 1 Status: Complete with pragmatic approach**

## QA Checklist

- [ ] All components tested in browser
- [ ] No visual regressions
- [ ] Hover states working correctly
- [ ] Responsive behavior maintained
- [ ] `npm run check` passes

## Status: IN PROGRESS

<!-- Will update to: PHASE_1_COMPLETE → COMMITTED -->
