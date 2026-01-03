# Color Audit Report - TimeTracker

## Objective
Identify all hardcoded color values (hex, rgb, rgba, hsl) that are not using CSS variables from the defined color schemes.

## Scan Results

### Files Scanned
- CSS files: 2 files
- Svelte components: 30+ files
- Total color matches found: 400+ instances

## Detailed Findings

### 1. CSS Files

#### `theme.css` (103 hex colors)
- **Status**: DEPRECATED file with old color system
- Contains full color palettes that should be removed or migrated
- Uses old naming convention (--color-primary-50, etc.)

#### `tt-design-system.css` (97 hex colors)
- **Status**: ACTIVE - This is your main design system
- Contains scheme definitions (scheme-1 through scheme-4)
- All colors here are intentional CSS variable definitions

### 2. Component Files with Hardcoded Colors

#### High Priority - Components with inline hex colors:

**`SyncIndicator.svelte`** (9 hardcoded colors)
```
synced: { color: '#22c55e', bgColor: '#dcfce7' }
pending: { color: '#eab308', bgColor: '#fef9c3' }
syncing: { color: '#3b82f6', bgColor: '#dbeafe' }
error: { color: '#ef4444', bgColor: '#fee2e2' }
```
→ Should use CSS variables for status colors

**`import/CandidateRow.svelte`** (3 hardcoded colors)
```
status-ok: background: #22c55e
status-warning: background: #f59e0b
status-error: background: #ef4444
```
→ Should use --tt-status-success, --tt-status-warning, --tt-status-danger

**`import/ImportUpload.svelte`** (4 hardcoded colors)
```
btn-file-primary: background: #3b82f6
btn-remove hover: color: #ef4444
```
→ Should use --tt-brand-primary-500, --tt-status-danger

**`import/PresetSelector.svelte`** (4 hardcoded colors)
```
delete-btn hover: color: #ef4444
input.error: border-color: #ef4444
error-text: color: #ef4444
```
→ Should use --tt-status-danger

**`import/IssuesPanel.svelte`** (3 hardcoded colors)
```
issue-item.error: border-left: 3px solid #ef4444
issue-count: background: #ef4444
```
→ Should use --tt-status-danger

**`import/ImportReport.svelte`** (4 hardcoded colors)
```
success icon: background: #22c55e
stat-item.success: color: #22c55e
stat-item.skipped: color: #f59e0b
stat-item.error: color: #ef4444
```
→ Should use semantic status variables

**`import/ImportReview.svelte`** (8 hardcoded colors)
- Various status colors that should use CSS variables

**`analysis/+page.svelte`** (7 hardcoded colors)
- Chart colors and status indicators

**`import/+page.svelte`** (3 hardcoded colors)
```
error-message: background: #fef2f2, color: #dc2626
report-icon: color: #22c55e
```
→ Should use semantic status variables

### 3. Styleguide Colors

**`dev/styleguide/+page.svelte`** (38 hardcoded colors)
- **Status**: ACCEPTABLE - These are documentation/display purposes only
- Shows hex values in `<code>` tags for reference
- Uses CSS variables for actual styling

### 4. Components with rgba() values

**`+layout.svelte`** (7 rgba values)
- Modal overlays and shadows
- Should potentially use CSS variables for consistency

**`settings/+page.svelte`** (4 rgba values)
- Various UI elements

**`CustomDropdown.svelte`** (1 rgba value)
**`EmployerSelector.svelte`** (similar patterns)

## Summary by Category

### ✅ Acceptable (No Action Needed)
1. **`tt-design-system.css`** - Scheme definitions (intentional)
2. **`dev/styleguide/+page.svelte`** - Documentation display only

### ⚠️ Should Review
1. **`theme.css`** - Old deprecated system, consider removing

### ❌ Needs Refactoring (High Priority)
1. **`SyncIndicator.svelte`** - 9 colors
2. **`import/CandidateRow.svelte`** - 3 colors
3. **`import/ImportUpload.svelte`** - 4 colors
4. **`import/PresetSelector.svelte`** - 4 colors
5. **`import/IssuesPanel.svelte`** - 3 colors
6. **`import/ImportReport.svelte`** - 4 colors
7. **`import/ImportReview.svelte`** - 8 colors
8. **`analysis/+page.svelte`** - 7 colors
9. **`import/+page.svelte`** - 3 colors

### 🔍 Needs Investigation
- Various components with rgba() values for overlays/shadows
- Chart colors in analysis page
- Modal overlays

## Recommended Actions

### Phase 1: Add Missing CSS Variables
Add these to `tt-design-system.css` if not already present:
- Status colors (success, warning, danger, info) - ✅ Already exist
- Modal overlay colors
- Shadow definitions

### Phase 2: Refactor Components
Replace hardcoded colors in priority order:
1. Import-related components (highest concentration)
2. Status indicators
3. Analysis/chart colors
4. Modal overlays

### Phase 3: Remove Deprecated
- Consider removing or archiving `theme.css`

## Next Steps
1. Review this report
2. Decide which colors need new CSS variables
3. Create missing variables in scheme definitions
4. Systematically replace hardcoded values
5. Test all color schemes to ensure consistency
