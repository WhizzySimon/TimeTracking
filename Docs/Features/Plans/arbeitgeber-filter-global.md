# arbeitgeber-filter-global - Plan

**Phase:** TBD (to be added to IMPLEMENTATION_PROGRESS.md)  
**Created:** 2024-12-30  
**Last Updated:** 2024-12-30  
**Based on Spec:** `Docs/Features/Specs/arbeitgeber-filter-global.md`

---

## Architecture / modules

**No new modules required.** This is a verification and correction task using existing infrastructure.

### Existing Components (to verify/fix)

- **Pages**: `src/routes/day/+page.svelte`, `src/routes/week/+page.svelte`, `src/routes/month/+page.svelte`, `src/routes/analysis/+page.svelte`
- **Stores**: `src/lib/stores/index.ts` (filtering logic already correct)
- **Components**: Task lists, summaries, modals that consume filtered data

### Responsibilities

- **Store layer** (`src/lib/stores/index.ts`): Provides filtered stores - already implemented correctly
- **Page components**: Must consume filtered stores instead of unfiltered stores
- **Child components**: Inherit filtered data from parent pages via props

### Dependencies

- Svelte reactivity system (automatic updates when `selectedEmployerId` changes)
- Existing filtered stores: `filteredEntries`, `filteredCategories`, `filteredModels`, `filteredActiveWorkTimeModel`, `filteredRunningEntry`

---

## Data model

**No changes required.** All necessary fields already exist:

- `TimeEntry.employerId` (string | null)
- `Category.employerId` (string | null)
- `WorkTimeModel.employerId` (string | null)
- `selectedEmployerId` store (string | null)

Filter logic: Items with `employerId === null` are "global" and visible in all contexts.

---

## UI state model

### State Location

- **Global state**: `selectedEmployerId` in `src/lib/stores/index.ts` (writable store)
- **Derived state**: All filtered stores automatically update when `selectedEmployerId` changes

### Synchronization

- Svelte's reactivity handles synchronization automatically
- When user changes employer dropdown → `selectedEmployerId` updates → all derived stores recalculate → all pages re-render with filtered data

### No local state needed

Pages should not maintain their own filter state - they consume the global filtered stores.

---

## Error handling

### Potential Issues

1. **Empty state when employer has no data**
   - **Handling**: Existing empty state UI in each page already handles this
   - **User feedback**: "Keine Einträge vorhanden" messages already present

2. **No work time model for selected employer**
   - **Handling**: `filteredActiveWorkTimeModel` returns null → Soll = 0
   - **User feedback**: Soll shows as "0:00" (existing behavior)

3. **No categories for selected employer**
   - **Handling**: Category dropdowns show empty or only global categories
   - **User feedback**: User cannot create tasks without categories (existing validation)

4. **Running task disappears when switching employer**
   - **Handling**: Expected behavior - task is filtered out
   - **User feedback**: Running task banner disappears (correct per spec)

### No new error handling needed

All edge cases are handled by existing UI patterns.

---

## Testing strategy

### Manual Testing (Primary)

**Playwright browser tests** for each acceptance check:

- Navigate to each page (Tag, Woche, Monat, Auswertung)
- Select "Alle Arbeitgeber" → verify all data visible
- Select specific employer → verify only that employer's data visible
- Verify calculations (Ist/Soll/Saldo) use filtered data
- Verify running task banner filters correctly

### Verification Checklist

For each page, verify:

1. Uses `$filteredEntries` instead of `$timeEntries`
2. Uses `$filteredCategories` instead of `$categories`
3. Uses `$filteredActiveWorkTimeModel` instead of `$activeWorkTimeModel`
4. Uses `$filteredModels` instead of `$workTimeModels` (Auswertung only)
5. Uses `$filteredRunningEntry` instead of `$runningEntry` (if applicable)

### Automated Testing

- **Unit tests**: Not applicable (this is integration-level filtering)
- **Integration tests**: Could add tests for filtered stores, but they already exist and work
- **E2E tests**: Playwright tests are the most realistic and valuable

---

## Risks / constraints

### Performance

- **Risk**: Minimal - filtering already happens at store level
- **Mitigation**: No additional filtering needed in components

### UX Constraints

- **Constraint**: When user switches employer, all data changes immediately
- **Mitigation**: This is expected behavior per spec
- **Note**: User might be surprised if they have a running task and switch employers (task disappears)

### Platform Limitations

- None identified

### Implementation Risks

- **Risk**: Missing a store reference in a page component
- **Mitigation**: Systematic audit of all four pages + grep search for unfiltered store usage

---

## Implementation Approach

### Phase 1: Audit

1. Check each page file for store usage
2. Identify any usage of unfiltered stores (`$timeEntries`, `$categories`, `$workTimeModels`, `$activeWorkTimeModel`, `$runningEntry`)
3. Document findings

### Phase 2: Fix

1. Replace unfiltered store references with filtered equivalents
2. Verify calculations use filtered data sources
3. Ensure child components receive filtered data via props

### Phase 3: Verify

1. Run Playwright tests for all acceptance checks
2. Manual testing of edge cases
3. Verify reactive updates when filter changes

---

## Checkpoint

- [x] Plan can be executed as tasks without requiring new decisions
- [x] Architecture is clear (use existing filtered stores)
- [x] Data model is unchanged
- [x] Error handling strategy defined (use existing patterns)
- [x] Testing approach defined (Playwright + manual verification)
