# CSS Variable Migration - Old to New

**Date:** 2026-01-03
**Type:** [ ] Bug / [ ] Behavior Change / [x] Improvement

## Current Behavior

255 instances of old CSS variables (e.g., `--text`, `--surface`, `--border`, `--muted`, `--input-*`) still exist across 30 files, despite CSS-v2 migration being marked complete.

## Desired Behavior

All components should use the new `--tt-*` prefixed variables from `tt-design-system-v2.css`.

## Analysis

**Files with most old variables:**

- ImportCategoriesModal.svelte (16)
- StundenzettelExport.svelte (16)
- DayPicker.svelte (15)
- settings/+page.svelte (15)
- Auth pages (login, signup, forgot-password, reset-password) (12 each)
- EmployerSelector.svelte (11)
- ExportDialog.svelte (11)
- ImportExcelModal.svelte (11)
- analysis/+page.svelte (11)
- DateRangeSelector.svelte (10)
- MonthYearPicker.svelte (9)

**Variable mapping:**
| Old Variable | New Variable |
|-------------|--------------|
| `--text` | `--tt-text-primary` |
| `--muted` | `--tt-text-muted` |
| `--surface` | `--tt-background-card` |
| `--surface-hover` | `--tt-background-card-hover` |
| `--border` | `--tt-border-default` |
| `--input-bg` | `--tt-background-input` |
| `--input-text` | `--tt-text-primary` |
| `--input-border` | `--tt-border-default` |
| `--input-focus-border` | `--tt-border-focus` |
| `--input-placeholder` | `--tt-text-muted` |
| `--accent` | `--tt-brand-primary` |
| `--accent-light` | `--tt-brand-primary-faded` |
| `--neg` | `--tt-status-danger` |
| `--neg-light` | `--tt-status-danger-faded` |
| `--pos` | `--tt-status-success` |
| `--r-input` | `--tt-radius-input` |
| `--r-btn` | `--tt-radius-button` |
| `--r-modal` | `--tt-radius-modal` |

## Changes Made

**Session 2026-01-03 Progress: 255 → 0 instances (255 fixed, 100%) ✅**

Migrated files (31 total):

1. `analysis/+page.svelte` - 11 variables migrated
2. `Modal.svelte` - 3 variables migrated
3. `WeekTypeSelector.svelte` - 6 variables migrated
4. `AddTaskModal.svelte` - 6 variables migrated
5. `TimePicker.svelte` - 5 variables migrated
6. `WarningBanner.svelte` - 2 variables migrated
7. `day/+page.svelte` - 3 variables migrated
8. `week/+page.svelte` - 2 variables migrated
9. `month/+page.svelte` - 2 variables migrated
10. `login/+page.svelte` - 12 variables migrated
11. `signup/+page.svelte` - 12 variables migrated
12. `forgot-password/+page.svelte` - 12 variables migrated
13. `reset-password/+page.svelte` - 11 variables migrated
14. `PasswordInput.svelte` - 7 variables migrated
15. `+error.svelte` - 4 variables migrated
16. `EmployerSelector.svelte` - 11 variables migrated
17. `AddCategoryModal.svelte` - 8 variables migrated
18. `DateRangeSelector.svelte` - 10 variables migrated
19. `MonthYearPicker.svelte` - 9 variables migrated
20. `WeekYearPicker.svelte` - 8 variables migrated
21. `ImportJsonModal.svelte` - 7 variables migrated
22. `Paywall.svelte` - 8 variables migrated
23. `PlanComparison.svelte` - 6 variables migrated
24. `PlanGrid.svelte` - 6 variables migrated
25. `ExportDialog.svelte` - 11 variables migrated
26. `ImportExcelModal.svelte` - 11 variables migrated
27. `DayPicker.svelte` - 15 variables migrated
28. `settings/+page.svelte` - 15 variables migrated
29. `ImportCategoriesModal.svelte` - 16 variables migrated
30. `StundenzettelExport.svelte` - 16 variables migrated

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified visual appearance unchanged

## Status: DONE (100% complete)

<!-- Update to: DONE → VERIFIED → COMMITTED -->
