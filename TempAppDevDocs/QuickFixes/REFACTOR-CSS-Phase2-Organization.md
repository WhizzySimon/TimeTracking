# CSS Refactoring Phase 2: Design System Organization

**Date:** 2026-01-05
**Type:** [x] Architecture Refactoring
**Phase:** 2 of 3 (Design System Organization)

## Phase 2 Goals

Organize and optimize `tt-design-system.css` WITHOUT changing component files or introducing visual regressions.

**Scope:**

- ✓ Only modify `src/lib/styles/tt-design-system.css`
- ✓ Fix known visual issues
- ✓ Extract base classes to reduce duplication
- ✓ Consolidate conflicting class definitions
- ✓ Organize file structure

**Out of Scope:**

- Component file changes (keep Phase 1 work intact)
- CSS variable refactoring (Phase 3)

## CSS Analysis Results

### Current State

- **File size:** ~2378 lines
- **Classes:** 72+ design system classes

### Issues Found

**1. Duplicate `.tt-nav-button` Definition (CRITICAL)**

- Lines 1102-1126: Date navigation buttons (Day/Week/Month)
- Lines 1862-1888: Tab navigation buttons (different purpose!)
- **Fix:** Rename one to avoid conflict

**2. Inline Label Duplication (~84 lines)**

- 7 classes with identical base properties:
  - `.tt-inline-label` (base)
  - `.tt-inline-label-employer`
  - `.tt-inline-label-no-work`
  - `.tt-inline-label-neutral`
  - `.tt-inline-label-success`
  - `.tt-inline-label-warning`
  - `.tt-inline-label-danger`
- **Fix:** Extract shared properties to base, use modifier pattern

**3. Button Class Duplication (~85 lines)**

- 5 button classes with identical base properties
- **Fix:** Extract shared properties to `.tt-button` base

**4. Symbol Button Variants**

- `.tt-symbol-button`, `.tt-action-button`, `.tt-delete-button`
- Similar structure, can be consolidated

**5. Backward Compatibility Section**

- Lines 2202-2378 (~176 lines)
- Review for removal or consolidation

## Known Issues to Fix

### Issue 1: Week Page Day Row Hover State

- **Problem:** Wrong hover background color
- **Fix:** Verify hover state uses correct variable

### Issue 2: Week Page Label Positioning

- **Problem:** "Arbeitstag" labels need right alignment
- **Fix:** Add positioning styles

### Issue 3: Dialog Overflow Prevention

- **Problem:** Horizontal scrollbar in dialogs
- **Fix:** Add overflow prevention to modal content

### Issue 4: Input Width Standardization

- **Problem:** Hour inputs need narrow width
- **Fix:** Create `.tt-text-input--narrow`, `.tt-text-input--medium` modifiers

### Issue 5: Red Line Indicator

- **Problem:** Unknown purpose
- **Investigation required**

## Progress Tracking

### Step 1: Baseline Verification

- [x] Start dev server
- [x] Check all pages visually
- [x] Note any existing issues

### Step 2: Fix Known Issues

- [x] Issue 1: Week page hover - Fixed: Use solid card-hover color instead of transparent overlay
- [x] Issue 2: Label positioning - Fixed: Added badge styling to `.tt-list-row__detail`
- [x] Issue 3: Dialog overflow - Fixed: Added max-width and overflow-x to `.tt-modal-content`
- [x] Issue 4: Input widths - Fixed: Added `.tt-text-input--narrow/medium/full` modifiers
- [x] Issue 5: Red line investigation - Not visible in current state, may be data-dependent

### Step 3: Reduce Duplication

- [x] Extract inline label base class - Reduced ~120 lines to ~70 lines
- [x] Extract button base class - Reduced ~180 lines to ~120 lines
- [x] Fix `.tt-nav-button` conflict - Renamed duplicate to `.tt-tab-button`
- [x] Consolidate symbol buttons - Shared base selector for 3 button types

### Step 4: Clean Up

- [x] Review backward compatibility section - Added deprecation notice with migration guide
- [x] Removed duplicate `.tt-button-primary` definition
- [x] Added architecture comments to consolidated sections

### Step 5: Verification

- [x] `npm run check` passes (0 errors, 13 warnings - all pre-existing)
- [x] Visual regression test all pages
- [x] Compare against baseline screenshots

## Changes Made

1. **Hover state fix** - `.tt-list-row-clickable` now uses `var(--tt-background-card-hover)` solid color
2. **Label styling** - `.tt-list-row__detail` has badge appearance (background, padding, border-radius)
3. **Dialog overflow** - `.tt-modal-content` prevents horizontal scroll
4. **Input width modifiers** - Added narrow (60px), medium (120px), full (100%) variants
5. **Inline label consolidation** - 7 classes share base properties via comma-separated selector
6. **Button consolidation** - 6 button classes share base properties
7. **Symbol button consolidation** - 3 symbol button classes share base properties
8. **Nav button conflict** - Renamed unused `.tt-nav-button` to `.tt-tab-button`
9. **Backward compatibility** - Added deprecation notice, removed duplicate definition

## QA Checklist

- [x] `npm run check` passes
- [x] No visual regressions
- [x] All known issues fixed (except Issue 5 - not visible)
- [x] File well-organized and documented

## Status: VERIFIED

Ready to commit.
