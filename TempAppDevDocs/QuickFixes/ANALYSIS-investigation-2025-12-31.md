# Analysis Page Investigation - 2025-12-31

## CHANGES IMPLEMENTED (2025-12-31 14:30)

### A) Diagnostic Logging Added

**File:** `src/routes/analysis/+page.svelte`

Console output now includes:

```
[Analysis Debug] categories: matched=X, notWorkTime=Y, unmatched=Z, unmatchedIds=[...]
[Analysis Debug] dayTypes: totalDays=X, nonWork=Y, sample=[2024-01-15:urlaub, ...]
[Analysis Debug] missing employerId: entries=X, categories=Y, models=Z
[Analysis Debug] totals: Ist=X.XXh, Soll=Y.YYh, Saldo=Z.ZZh
```

### B) Strict Employer Filtering

**File:** `src/lib/stores/index.ts`

Changed `matchesEmployerFilter` to STRICT mode:

- "Alle Arbeitgeber" selected → show all items
- Specific employer selected → show ONLY items with `employerId === selectedId` (no null/undefined leakage)

### B2) Entity Creation Blocked Without Employer

**Files:**

- `src/lib/components/CategoryDialog.svelte` - requires employer for create/edit
- `src/lib/components/ImportCategoriesModal.svelte` - requires employer for import
- `src/lib/components/AddWorkTimeModelModal.svelte` - requires employer for create/edit

Error message: "Bitte zuerst Arbeitgeber auswählen"

### C) Restore-Time Normalization Prepared

**File:** `src/lib/backup/restore.ts`

`importSnapshot(snapshot, defaultEmployerId?)` now:

1. Normalizes legacy category IDs (plain UUID → `user-` prefixed)
2. Rewrites `timeEntry.categoryId` to match normalized IDs
3. Assigns `defaultEmployerId` to entities missing employerId (if provided)

Logs normalization actions to console.

---

## A) Current Implementation Summary

### File Paths & Functions

| Component              | Location                           |
| ---------------------- | ---------------------------------- |
| **Analysis Page**      | `src/routes/analysis/+page.svelte` |
| **Calculation Utils**  | `src/lib/utils/calculations.ts`    |
| **Stores (filtering)** | `src/lib/stores/index.ts`          |
| **Category Storage**   | `src/lib/storage/categories.ts`    |
| **Backup Restore**     | `src/lib/backup/restore.ts`        |

### Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  timeEntries    │───▶│ filteredEntries  │───▶│  rangeEntries   │
│  (all entries)  │    │ (employer filter)│    │  (date filter)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   categories    │───▶│filteredCategories│───▶│  calculateIst() │
│  (all cats)     │    │ (employer filter)│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Filter Chain (Pseudocode)

```typescript
// 1. Employer Filter (stores/index.ts:145-151)
function matchesEmployerFilter(itemEmployerId, selectedId):
    if selectedId === null:     // "Alle Arbeitgeber"
        return true
    return itemEmployerId === selectedId
        || itemEmployerId === null
        || itemEmployerId === undefined

// 2. filteredEntries = timeEntries filtered by matchesEmployerFilter
// 3. filteredCategories = categories filtered by matchesEmployerFilter
// 4. rangeEntries = filteredEntries filtered by date range

// 5. calculateIst (calculations.ts:78-98)
function calculateIst(entries, categories):
    categoryMap = Map(categories.map(c => [c.id, c]))
    totalHours = 0

    for entry in entries:
        if entry.endTime === null:
            continue  // Skip running entries

        category = categoryMap.get(entry.categoryId)

        // CRITICAL: Only counts if category exists AND countsAsWorkTime
        if category?.countsAsWorkTime:
            totalHours += calculateDuration(entry.startTime, entry.endTime)

    return totalHours

// 6. calculateSoll (calculations.ts:112-132)
function calculateSoll(date, dayType, model):
    if dayType !== 'arbeitstag':
        return 0  // Non-work days have Soll = 0

    if model === null:
        return 0

    weekday = getDayOfWeek(date)
    return model[weekday] ?? 0
```

### Calculation Formulas

| Metric              | Formula                                                               | Location                  |
| ------------------- | --------------------------------------------------------------------- | ------------------------- |
| **Ist**             | Sum of entry durations where `category.countsAsWorkTime === true`     | `calculations.ts:78-98`   |
| **Soll**            | Sum of `model[weekday]` for each day where `dayType === 'arbeitstag'` | `calculations.ts:112-132` |
| **Haben/Saldo**     | `Ist - Soll`                                                          | `calculations.ts:211-213` |
| **Effective Weeks** | `countWorkDaysInRange() / getWorkDaysPerWeekFromModel()`              | `+page.svelte:283-296`    |
| **Ø/Woche**         | `totalCategoryHours / effectiveWeeks`                                 | `+page.svelte:348-350`    |

### Employer & WorkTimeModel Selection

1. **Employer Selection**: Stored in `selectedEmployerId` store (writable, default `null`)
   - `null` = "Alle Arbeitgeber" (show all)
   - When set, filters entries/categories/models by `employerId` match OR `employerId` is null/undefined

2. **WorkTimeModel Selection** (`+page.svelte:142-148`):
   ```typescript
   function getActiveModelForDate(date: Date): WorkTimeModel | null {
   	const dateStr = formatDate(date, 'ISO');
   	const validModels = $filteredModels
   		.filter((model) => model.validFrom <= dateStr)
   		.sort((a, b) => b.validFrom.localeCompare(a.validFrom));
   	return validModels[0] ?? null; // Most recent valid model
   }
   ```

---

## B) Root Cause Analysis

### Suspected Issue A: "Ist excludes certain entries after employee changes"

**Investigation Results:**

The backup data (`data supabase.json`) reveals **two category ID formats**:

1. **Legacy UUID format** (no prefix):
   - `0831dd6c-babc-4962-9a29-46d66bd6a291` → "Allg. Orga, Mails"
   - `6c5dd66b-d718-4e88-9acc-9bbd298f5f8d` → "Aussschuss Verwaltung"

2. **New format** (with prefix):
   - `user-43ea3fb3-d735-4f1d-b15a-2046b365f5ae` → "GD-/Predigtvorbereitung"
   - `system-pause`, `system-urlaub`, etc.

**Time entries reference both formats:**

- ~40 entries reference legacy UUID `0831dd6c-babc-4962-9a29-46d66bd6a291`
- Many entries reference `user-*` prefixed categories

**Potential Root Cause #1: Category Lookup Failure**

In `calculateIst()`:

```typescript
const category = categoryMap.get(entry.categoryId);
if (category?.countsAsWorkTime) {  // Silent failure if category not found
    totalHours += calculateDuration(...)
}
```

If `category` is `undefined` (not found in `filteredCategories`), the entry is **silently skipped**.

**This could happen if:**

1. Categories were not imported correctly
2. Categories were filtered out by employer filter (but filter logic looks correct)
3. Category store was cleared/overwritten after import

**Ranking: HIGH LIKELIHOOD** - This is the most probable cause

---

**Potential Root Cause #2: Employer Filter Edge Case**

The backup shows **no employers defined** and **no employerId on entries/categories**.

After import, if user:

1. Created an employer
2. Selected that employer in the UI
3. The filter should still include items with `undefined` employerId

The `matchesEmployerFilter` logic appears correct:

```typescript
return itemEmployerId === selectedId || itemEmployerId === null || itemEmployerId === undefined;
```

**Ranking: LOW LIKELIHOOD** - Logic appears correct, but worth verifying runtime behavior

---

### Suspected Issue B: "dayTypes don't reduce Soll"

**Investigation Results:**

The implementation **correctly handles dayTypes**:

```typescript
// calculations.ts:118-120
if (dayType !== 'arbeitstag') {
	return 0; // Non-work days have Soll = 0
}
```

The Analysis page loads dayTypes for the range (`+page.svelte:453-465`):

```typescript
async function loadDayTypesForRange() {
	// Loads from IndexedDB 'dayTypes' store
	const record = await getByKey<DayType>('dayTypes', dateKey);
	dayTypesCache.set(dateKey, record?.type ?? 'arbeitstag'); // Defaults to arbeitstag
}
```

**Backup data shows dayTypes are defined:**

- 7 days of `urlaub` in January 2024
- 7 days of `krank` in February 2024
- 2 days of `feiertag` in March 2024
- 1 day of `urlaub` on 2024-03-15

**Ranking: LOW LIKELIHOOD** - Implementation looks correct

---

### Suspected Issue B2: "dayTypes not excluded from Ø/Woche denominator"

**Investigation Results:**

The `countWorkDaysInRange()` function (`+page.svelte:256-279`) **correctly excludes non-work days**:

```typescript
const isActiveWeekday = isWeekdayActiveInModel(current, model);
const isWorkDay = dayType === 'arbeitstag';

if (isActiveWeekday && isWorkDay) {
	workDays++; // Only counts if both conditions true
}
```

**Ranking: LOW LIKELIHOOD** - Implementation looks correct

---

## C) Minimal Fix Proposal

### Diagnosis First

Before fixing, add temporary logging to confirm the root cause. Add this to `src/routes/analysis/+page.svelte`:

```typescript
// Add after line 119 (after totalIst calculation)
$effect(() => {
	if (browser && rangeEntries.length > 0) {
		console.group('[Analysis Debug]');
		console.log('Range:', rangeStartStr, 'to', rangeEndStr);
		console.log('Total entries in range:', rangeEntries.length);
		console.log('Filtered categories count:', $filteredCategories.length);

		// Count entries by category match status
		const categoryMap = new Map($filteredCategories.map((c) => [c.id, c]));
		let matched = 0,
			unmatched = 0,
			notWorkTime = 0;
		const unmatchedIds = new Set<string>();

		for (const entry of rangeEntries) {
			if (!entry.endTime) continue;
			const cat = categoryMap.get(entry.categoryId);
			if (!cat) {
				unmatched++;
				unmatchedIds.add(entry.categoryId);
			} else if (!cat.countsAsWorkTime) {
				notWorkTime++;
			} else {
				matched++;
			}
		}

		console.log('Entries matched to category:', matched);
		console.log('Entries with countsAsWorkTime=false:', notWorkTime);
		console.log('Entries with UNMATCHED categoryId:', unmatched);
		if (unmatchedIds.size > 0) {
			console.log('Unmatched categoryIds:', [...unmatchedIds]);
		}
		console.log('Calculated Ist:', totalIst);
		console.groupEnd();
	}
});
```

### If Root Cause #1 Confirmed (Category Lookup Failure)

**Fix Option A: Data Migration** (Preferred if categories exist but aren't matched)

- Check if legacy categories exist in the database
- If entries reference non-existent categories, the categories may need to be re-imported

**Fix Option B: Graceful Fallback** (If we want to handle orphaned entries)

- Modify `calculateIst` to log warnings for unmatched entries
- Not recommended as a permanent fix - data integrity should be addressed

### Safety Considerations

1. **Do not change filter logic** without confirming it's the actual issue
2. **Do not delete or modify user data** - only add logging first
3. **Preserve existing working behavior** - any fix should be additive

---

## D) Verification Plan

### Step 1: Add Debug Logging (as shown above)

### Step 2: Reproduce with Test Data

1. Select date range: **01.01.2024 – 15.03.2024**
2. Set employer filter to: **"Alle Arbeitgeber"**
3. Open browser console
4. Check debug output for:
   - Total entries in range
   - Matched vs unmatched entries
   - List of unmatched categoryIds

### Step 3: Expected Debug Output

If **Root Cause #1** is confirmed:

```
[Analysis Debug]
Range: 2024-01-01 to 2024-03-15
Total entries in range: ~300
Filtered categories count: ~50
Entries matched to category: ~260 (should be higher)
Entries with countsAsWorkTime=false: ~30 (system-pause, etc.)
Entries with UNMATCHED categoryId: ~10 (PROBLEM!)
Unmatched categoryIds: ['0831dd6c-babc-4962-9a29-46d66bd6a291', ...]
```

### Step 4: Verify Fix

After fix is applied, re-run with same range and verify:

- `Entries with UNMATCHED categoryId: 0`
- Ist/Soll/Haben match expected values

### Expected Values for Range 01.01.2024 – 15.03.2024

Based on backup data:

- **dayTypes reducing Soll**: 7 urlaub + 7 krank + 2 feiertag + 1 urlaub = 17 non-work days
- **WorkTimeModel**: "Vollzeit 41h" (Tue-Fri 8h + Sat 2h + Sun 5h = 41h/week, Mon=0)
- **Work days in model**: 6 days/week (Mon is off)

---

## Summary

**Most Likely Root Cause**: Category lookup failure in `calculateIst()` - entries reference categoryIds that don't exist in `filteredCategories`, causing those entries to be silently skipped.

**Next Step**: Add debug logging to confirm, then address data integrity issue (ensure all referenced categories exist in the categories store).
