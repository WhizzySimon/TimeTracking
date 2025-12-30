# Audit: Unfiltered Store Usage in Pages

**Date:** 2024-12-30  
**Task:** A2.1.1 - Audit all pages for unfiltered store usage  
**Purpose:** Identify all unfiltered store references that need to be replaced with filtered equivalents

---

## Summary

All four pages (day, week, month, analysis) currently use a **mix** of filtered and unfiltered stores. The pattern is:

- **Filtered stores** are used correctly for calculations and display
- **Unfiltered stores** are used in:
  1. `onMount()` to load data from IndexedDB
  2. Passing to picker components (DayPicker, WeekYearPicker, MonthYearPicker)
  3. Direct lookups in `$effect()` blocks

---

## Page 1: `src/routes/day/+page.svelte`

### ✅ Correctly Using Filtered Stores

- Line 20-24: Imports `filteredEntries`, `filteredCategories`, `filteredActiveWorkTimeModel`, `filteredRunningEntry`
- Line 54-56: `dayEntries` derived from `$filteredEntries`
- Line 59: `calculateIst(dayEntries, $filteredCategories)`
- Line 62: `calculateSoll($currentDate, dayType, $filteredActiveWorkTimeModel)`
- Line 194-200: `$filteredRunningEntry` check for auto-ending running task

### ❌ Unfiltered Store Usage (Needs Fixing)

1. **Line 18-19: Import unfiltered stores**

   ```typescript
   timeEntries,
   categories,
   ```

2. **Line 137-138: Reload after save**

   ```typescript
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   ```

3. **Line 150-151: Reload after delete**

   ```typescript
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   ```

4. **Line 178-179: Reload after end**

   ```typescript
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   ```

5. **Line 219-220: Reload after resume**

   ```typescript
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   ```

6. **Line 228: Direct lookup in $effect**

   ```typescript
   const entryToEdit = $timeEntries.find((e) => e.id === editEntryId);
   ```

7. **Line 241-245: onMount loads unfiltered stores**

   ```typescript
   const allCategories = await getAll<Category>('categories');
   categories.set(allCategories);
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   ```

8. **Line 310: Pass to DayPicker**
   ```typescript
   timeEntries = { $timeEntries };
   ```

---

## Page 2: `src/routes/week/+page.svelte`

### ✅ Correctly Using Filtered Stores

- Line 24-26: Imports `filteredEntries`, `filteredCategories`, `filteredActiveWorkTimeModel`
- Line 78-84: `weekEntries` derived from `$filteredEntries`
- Line 106: `calculateIst(weekEntriesUpToToday, $filteredCategories)`
- Line 115: `calculateSoll(date, dayType, $filteredActiveWorkTimeModel)`
- Line 168-171: `isDayActiveInModel()` uses `$filteredActiveWorkTimeModel`
- Line 177: `calculateIst(entries, $filteredCategories)`
- Line 184: `calculateSoll(date, dayType, $filteredActiveWorkTimeModel)`

### ❌ Unfiltered Store Usage (Needs Fixing)

1. **Line 21-23: Import unfiltered stores**

   ```typescript
   timeEntries,
   categories,
   workTimeModels,
   ```

2. **Line 207-216: onMount loads unfiltered stores**

   ```typescript
   await initializeCategories();
   const allCategories = await getAll<Category>('categories');
   categories.set(allCategories);
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   const allModels = await getAll<WorkTimeModel>('workTimeModels');
   workTimeModels.set(allModels);
   ```

3. **Line 284: Pass to WeekYearPicker**
   ```typescript
   timeEntries = { $timeEntries };
   ```

---

## Page 3: `src/routes/month/+page.svelte`

### ✅ Correctly Using Filtered Stores

- Line 20-22: Imports `filteredEntries`, `filteredCategories`, `filteredActiveWorkTimeModel`
- Line 134-140: `monthEntries` derived from `$filteredEntries`
- Line 162: `calculateIst(monthEntriesUpToToday, $filteredCategories)`
- Line 171: `calculateSoll(date, dayType, $filteredActiveWorkTimeModel)`
- Line 225-228: `isDayActiveInModel()` uses `$filteredActiveWorkTimeModel`
- Line 240: `calculateIst(entries, $filteredCategories)`
- Line 251: `calculateSoll(date, dayType, $filteredActiveWorkTimeModel)`

### ❌ Unfiltered Store Usage (Needs Fixing)

1. **Line 17-19: Import unfiltered stores**

   ```typescript
   timeEntries,
   categories,
   workTimeModels,
   ```

2. **Line 272-278: onMount loads unfiltered stores**

   ```typescript
   await initializeCategories();
   const allCategories = await getAll<Category>('categories');
   categories.set(allCategories);
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   const allModels = await getAll<WorkTimeModel>('workTimeModels');
   workTimeModels.set(allModels);
   ```

3. **Line 339: Pass to MonthYearPicker**
   ```typescript
   timeEntries = { $timeEntries };
   ```

---

## Page 4: `src/routes/analysis/+page.svelte`

### ✅ Correctly Using Filtered Stores

- Line 23-25: Imports `filteredEntries`, `filteredCategories`, `filteredModels`
- Line 108-112: `rangeEntries` derived from `$filteredEntries`
- Line 115: `calculateIst(rangeEntries, $filteredCategories)`
- Line 140-143: `getActiveModelForDate()` uses `$filteredModels`

### ❌ Unfiltered Store Usage (Needs Fixing)

1. **Line 19-21: Import unfiltered stores**

   ```typescript
   timeEntries,
   categories,
   workTimeModels,
   ```

2. **Line 468-474: onMount loads unfiltered stores**
   ```typescript
   await initializeCategories();
   const allCategories = await getAll<Category>('categories');
   categories.set(allCategories);
   const allEntries = await getAll<TimeEntry>('timeEntries');
   timeEntries.set(allEntries);
   const allModels = await getAll<WorkTimeModel>('workTimeModels');
   workTimeModels.set(allModels);
   ```

---

## Identified Issues

### Issue 1: Unfiltered Imports

All four pages import unfiltered stores (`timeEntries`, `categories`, `workTimeModels`) but only use them in `onMount()` and for passing to picker components.

### Issue 2: onMount Pattern

All pages load data into unfiltered stores in `onMount()`, which then populate the filtered stores via reactive derivations. This is **correct behavior** - the unfiltered stores are the source of truth.

### Issue 3: Picker Components

All pages pass `$timeEntries` to picker components (DayPicker, WeekYearPicker, MonthYearPicker). These pickers need unfiltered data to show all available dates with entries.

### Issue 4: Direct Lookups (day page only)

Day page line 228 uses `$timeEntries.find()` to look up an entry by ID. This should use `$filteredEntries` to respect the employer filter.

### Issue 5: Reload Pattern (day page only)

Day page reloads `timeEntries` store after CRUD operations (save, delete, end, resume). This is correct - it updates the source store which then updates filtered stores reactively.

---

## Conclusion

**Most usage is already correct!** The pages properly use filtered stores for all calculations and display.

**Only 1 actual bug found:**

- `src/routes/day/+page.svelte` line 228: Uses `$timeEntries.find()` instead of `$filteredEntries.find()`

**Not bugs (correct patterns):**

- onMount loading into unfiltered stores (source of truth)
- Passing unfiltered data to picker components (they need to show all dates)
- Reloading unfiltered stores after CRUD operations (maintains reactivity)

**Action Required:**
Fix the single bug in day page line 228, then verify all pages work correctly with employer filter.
