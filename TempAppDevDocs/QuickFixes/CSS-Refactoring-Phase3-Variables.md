# CSS Refactoring Phase 3: Variable Optimization

**Date:** TBD (After Phase 2)
**Type:** [x] Architecture Refactoring
**Phase:** 3 of 3 (CSS Variable Refactoring)

## Phase 3 Goals

Refactor CSS variables across both design system and component-local CSS to use semantic variables consistently.

**Scope:**

### 1. Design System Variables (`tt-design-system.css`)
- Review all hardcoded values in design system classes
- Replace with semantic CSS variables where appropriate
- Ensure consistency with existing variable naming conventions

### 2. Component-Local Variables
- Review single-use component CSS (documented in Phase 1)
- Replace hardcoded values with semantic variables
- Examples:
  - `AddWorkTimeModelModal` - weekday grid layout
  - `EmailEditDialog` - success message display
  - `ImportExcelModal` - import grid layout
  - `StundenzettelExport` - export form grid
  - `ExportDialog` - format selection UI

### 3. Variable Consolidation
- Identify duplicate or similar values across components
- Create new semantic variables if patterns emerge
- Update variable documentation

## Prerequisites

**Must complete Phase 2 first:**
- Design system organization (base classes, inheritance)
- This provides clarity on which values should be variables

## Approach

1. **Audit Phase:**
   - Scan design system for hardcoded values
   - Scan component-local CSS for hardcoded values
   - Document patterns and duplicates

2. **Variable Creation:**
   - Define new semantic variables if needed
   - Follow existing naming conventions (`--tt-*`)
   - Prefer semantic over literal names

3. **Replacement Phase:**
   - Replace hardcoded values systematically
   - Test after each batch of changes
   - Verify visual consistency

4. **Documentation:**
   - Update variable reference documentation
   - Document variable usage guidelines

## Success Criteria

- ✓ All design system classes use semantic variables
- ✓ All component-local CSS uses semantic variables
- ✓ No visual regressions
- ✓ Improved maintainability (change colors/spacing in one place)
- ✓ `npm run check` passes with 0 errors

## Notes

- This phase focuses on **maintainability** not visual changes
- Variable refactoring makes future theme changes easier
- Should be done after Phase 2 to avoid refactoring twice
