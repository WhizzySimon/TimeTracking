# Strict Employer Model - Verification Workflow

**Date:** 2025-12-31
**Task:** Fix Analysis miscalculation after introducing Arbeitgeber/Employees

---

## Summary of Changes

### What Was Broken

1. **Employer filter was too lenient**: When a specific employer was selected, records with `employerId = null/undefined` were still shown (fallback logic). This caused data leakage between employers.

2. **dayTypes lacked employerId**: The `DayType` interface didn't have an `employerId` field, so vacation/sick/holiday days couldn't be filtered by employer.

3. **Missing employerId on legacy data**: Records created before employer support had no `employerId`, causing them to disappear when strict filtering was applied.

4. **dayTypes store not in global state**: No reactive store for dayTypes, making employer filtering impossible.

### Files Changed

| File                               | Change                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/types.ts`                 | Added `employerId` to `DayType` interface                                                                                     |
| `src/lib/stores/index.ts`          | Made `matchesEmployerFilter` STRICT (no null/undefined fallback), added `dayTypes` store and `filteredDayTypes` derived store |
| `src/lib/storage/migrations.ts`    | Added `migrateStrictEmployerModel()` - comprehensive migration for all record types                                           |
| `src/lib/backup/restore.ts`        | Added dayTypes normalization with employerId during import                                                                    |
| `src/routes/analysis/+page.svelte` | Enhanced diagnostic logging with DEV flag                                                                                     |

---

## Verification Workflow (Manual Steps)

### Prerequisites

- Clean browser (or incognito mode)
- Dev server running (`npm run dev`)

### Step 1: Fresh Start

1. Create a NEW user account (or clear IndexedDB for existing test account)
2. Import dataset: `timetracker-backup-2025-12-31.json` or `data supabase.json`
3. Reload app

### Step 2: Run Migration (if not auto-run)

Open browser console and run:

```javascript
// Check if migration is needed
const { migrateStrictEmployerModel } = await import('/src/lib/storage/migrations.ts');
const result = await migrateStrictEmployerModel();
console.log('Migration result:', result);
```

Expected output:

```
[Migration] Created default employer: Default (if no employers existed)
[Migration] Strict employer model applied: {
  categoriesUpdated: X,
  entriesUpdated: X,
  modelsUpdated: X,
  dayTypesUpdated: X,
  defaultEmployerCreated: true/false,
  defaultEmployerId: "employer-xxx"
}
```

### Step 3: Verify Analysis Debug Output

1. Navigate to **Auswertung** (Analysis) tab
2. Set date range: **2024-01-01 to 2024-03-15**
3. Open browser console (F12)
4. Look for `[Analysis Debug]` group

#### With "Alle Arbeitgeber" selected:

```
[Analysis Debug]
  selectedEmployerId: ALL
  BEFORE employer filter: { entries: X, categories: X, dayTypes: X, models: X }
  AFTER employer filter: { entries: X, categories: X, dayTypes: X, models: X }
  rangeEntries: { total: X, matchedToCategory: X, unmatchedCategoryId: 0, ... }
  Soll calculation: { totalDays: 75, arbeitstags: X, nonWorkDays: X, modelUsed: "Vollzeit 41h", ... }
  employerId coverage: ✓ all records have employerId
  TOTALS: { Ist: "315.42h", Soll: "XXX.XXh", Saldo: "XXX.XXh" }
```

**Pass criteria:**

- `unmatchedCategoryId: 0`
- `employerId coverage: ✓ all records have employerId`
- `modelUsed` is NOT "(none)"
- If dayTypes exist in range, `nonWorkDays > 0`

### Step 4: Test Employer Switching

1. Create a second employer (e.g., "Brother") in Settings > Arbeitgeber
2. Reassign some categories to "Brother"
3. Switch employer filter between:
   - **Alle Arbeitgeber**: Should show full totals
   - **Specific employer**: Should show ONLY that employer's records

**Pass criteria:**

- BEFORE filter counts stay the same (all data)
- AFTER filter counts drop appropriately for specific employer
- No `console.warn('MISSING employerId...')` messages

### Step 5: Verify Soll Calculation

With dayTypes in the range (urlaub/krank/feiertag):

1. `nonWorkDays` should be > 0 in debug output
2. Soll should be reduced accordingly
3. `Ø/Woche` denominator (`workDaysInRange`) should exclude non-work days

---

## Acceptance Criteria (Pass/Fail)

| Criterion                     | Expected                                  | Status |
| ----------------------------- | ----------------------------------------- | ------ |
| No missing-employerId records | All counts = 0                            | ☐      |
| No categoryId lookup failures | `unmatchedCategoryId == 0`                | ☐      |
| WorkTimeModel selection works | `modelUsed` is not "(none)"               | ☐      |
| dayTypes reduce Soll          | `nonWorkDays > 0` when urlaub/krank exist | ☐      |
| Strict filter works           | AFTER counts drop when employer selected  | ☐      |
| No data leakage               | Items with wrong employerId don't appear  | ☐      |

---

## How to Remove Debug Logging

After verification, remove the debug logging:

1. Open `src/routes/analysis/+page.svelte`
2. Find: `const ANALYSIS_DEBUG = true;`
3. Change to: `const ANALYSIS_DEBUG = false;`

Or delete the entire block between:

```
// ============================================================================
// DEBUG: Analysis diagnostic logging (remove after verification)
...
// ============================================================================
// END DEBUG
// ============================================================================
```

---

## Technical Details

### Strict Employer Filter Logic

```typescript
// src/lib/stores/index.ts
function matchesEmployerFilter(itemEmployerId, selectedId): boolean {
	if (selectedId === null) return true; // "Alle Arbeitgeber" shows all
	return itemEmployerId === selectedId; // STRICT: exact match only
}
```

### Migration Algorithm

```
1. Ensure at least one employer exists (create "Default" if empty)
2. For each category without employerId: set employerId = defaultEmployerId
3. For each workTimeModel without employerId: set employerId = defaultEmployerId
4. For each dayType without employerId: set employerId = defaultEmployerId
5. For each timeEntry without employerId:
   - Prefer: categoryMap.get(entry.categoryId)?.employerId
   - Else fallback: defaultEmployerId
```

### Restore Normalization

When importing a backup, `importSnapshot()` now:

1. Normalizes legacy category IDs (plain UUID → `user-` prefixed)
2. Assigns employerId to all record types if missing
3. Preserves original IDs (no mutation that would break categoryId references)
