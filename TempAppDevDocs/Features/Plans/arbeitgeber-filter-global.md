# arbeitgeber-filter-global - Plan

**Phase:** A2.2  
**Created:** 2024-12-30  
**Last Updated:** 2025-12-31  
**Based on Spec:** `TempAppDevDocs/Features/Specs/arbeitgeber-filter-global.md`

---

## Architecture / modules

### New/Modified Components

| Component                                | Change                                                    |
| ---------------------------------------- | --------------------------------------------------------- |
| `src/routes/add/+page.svelte`            | Remove titles, adjust layout, add first-time hint         |
| `src/lib/components/CategoryList.svelte` | Rename headings to "Eintrag", adjust filter+button layout |
| `src/lib/components/TaskList.svelte`     | Add employer badge / "Keine Arbeitszeit" badge            |
| `src/lib/stores/user.ts`                 | Add `neverAddedAnEntry` flag + persistence                |
| `src/lib/storage/operations.ts`          | Set `neverAddedAnEntry = false` on first entry creation   |

### Existing Components (to verify/fix)

- **Pages**: `src/routes/day/+page.svelte`, `src/routes/month/+page.svelte`, `src/routes/analysis/+page.svelte`
- **Stores**: `src/lib/stores/index.ts` (filtering logic already correct)
- **Components**: Task lists, summaries, modals that consume filtered data

### Responsibilities

- **Store layer** (`src/lib/stores/index.ts`): Provides filtered stores - already implemented correctly
- **User store** (`src/lib/stores/user.ts`): Manages `neverAddedAnEntry` flag
- **Page components**: Must consume filtered stores; Add page shows hint based on flag
- **Child components**: Inherit filtered data via props; display badges

### Dependencies

- Svelte reactivity system (automatic updates when `selectedEmployerId` changes)
- Existing filtered stores: `filteredEntries`, `filteredCategories`, `filteredModels`, `filteredActiveWorkTimeModel`, `filteredRunningEntry`
- localStorage for `neverAddedAnEntry` persistence

---

## Data model

### Existing fields (no changes)

- `TimeEntry.employerId` (string | null)
- `Category.employerId` (string | null)
- `WorkTimeModel.employerId` (string | null)
- `selectedEmployerId` store (string | null)

### New field

- **`neverAddedAnEntry`** (boolean) in user store / localStorage
  - Default: `true` for new users
  - Set to `false` when user creates/starts first entry
  - Used to show first-time hint on Add page

### Semantic clarification

- **Tätigkeiten** = Categories with `countsAsWorkTime === true` → employer-dependent, show employer badge
- **Abwesenheiten** = Categories with `countsAsWorkTime === false` (system categories: Pause, Urlaub, Krank, Feiertag) → NOT employer-dependent, show "Keine Arbeitszeit" badge, always visible regardless of employer filter

Filter logic: Items with `employerId === null` are "global" and visible in all employer contexts.

---

## UI state model

### State Location

- **Global state**: `selectedEmployerId` in `src/lib/stores/index.ts` (writable store)
- **Derived state**: All filtered stores automatically update when `selectedEmployerId` changes
- **User state**: `neverAddedAnEntry` in `src/lib/stores/user.ts` (writable, persisted to localStorage)

### Synchronization

- Svelte's reactivity handles synchronization automatically
- When user changes employer dropdown → `selectedEmployerId` updates → all derived stores recalculate → all pages re-render with filtered data
- `neverAddedAnEntry` is loaded from localStorage on app init and updated atomically on first entry creation

### Add Page UI State

- First-time hint visibility: `$neverAddedAnEntry === true`
- Filter input + "Eintrag erstellen" button in same row (filter max 50% width)
- No "Aufgabe starten" title, no "Alle Kategorien" title, no bottom "Kategorie erstellen" button

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

- Navigate to each page (Tag, Monat, Auswertung)
- Select "Alle Arbeitgeber" → verify all data visible
- Select specific employer → verify only that employer's data visible
- Verify calculations (Ist/Soll/Saldo) use filtered data
- Verify running task banner filters correctly
- Verify badges on entries (employer badge for Tätigkeiten, "Keine Arbeitszeit" for Abwesenheiten)

### Add Page Verification

- No "Aufgabe starten" title visible
- No "Alle Kategorien" heading visible
- No "Kategorie erstellen" button at bottom
- Filter input ≤50% width, "Eintrag erstellen" button next to it
- First-time hint shows for new users, disappears after first entry

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

### Phase 1: User Store + NeverAddedAnEntry Flag

1. Add `neverAddedAnEntry` writable store to `src/lib/stores/user.ts`
2. Add persistence to localStorage
3. Add initialization logic (default `true` for new users, check existing entries for migration)
4. Update entry creation in `src/lib/storage/operations.ts` to set flag to `false`

### Phase 2: Add Page UI Changes

1. Remove `<h1>Aufgabe starten</h1>` from `+page.svelte`
2. Remove bottom "Kategorie erstellen" button from `+page.svelte`
3. Update `CategoryList.svelte`:
   - Remove "Alle Kategorien" heading
   - Change filter input to max 50% width
   - Add "Eintrag erstellen" button next to filter (no plus icon)
   - Rename any remaining "Kategorie" labels to "Eintrag"
4. Add first-time hint under title bar (conditional on `$neverAddedAnEntry`)

### Phase 3: Badges for Entries

1. Update `TaskList.svelte` to show badges:
   - Tätigkeiten (countsAsWorkTime=true): employer badge
   - Abwesenheiten (countsAsWorkTime=false): "Keine Arbeitszeit" badge
2. Ensure badges are visible on Tag page entry list

### Phase 4: Verify Employer Filtering

1. Audit Tag/Monat/Auswertung pages for correct filtered store usage
2. Fix any unfiltered store references
3. Verify Abwesenheiten remain visible regardless of employer filter

### Phase 5: Testing

1. Run Playwright tests for all acceptance checks
2. Manual testing of edge cases
3. Verify reactive updates when filter changes

---

## Checkpoint

- [x] Plan can be executed as tasks without requiring new decisions
- [x] Architecture is clear (use existing filtered stores + new flag)
- [x] Data model changes defined (neverAddedAnEntry flag)
- [x] Error handling strategy defined (use existing patterns)
- [x] Testing approach defined (Playwright + manual verification)
