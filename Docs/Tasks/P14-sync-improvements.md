# P14: Cloud Sync Improvements - Tasks

**Spec:** `Docs/Specs/P14-sync-improvements.md`
**Status:** Ready for implementation
**Estimated:** 4-5 hours total

## Task 14.1: Detect Fresh Install State

**Files:** `src/lib/backup/cloud.ts`, `src/lib/storage/db.ts`
**Estimate:** 30 min

**Done when:**

- Function `isFreshInstall()` checks if local storage has no user data
- Returns true if: no timeEntries AND no user-created categories
- System categories and default work time model don't count

**Verification:**

- Fresh IndexedDB -> isFreshInstall() returns true
- After adding one entry -> returns false

---

## Task 14.2: Auto-Download Cloud Backup on Fresh Login

**Files:** `src/routes/+layout.svelte`, `src/lib/backup/cloud.ts`
**Estimate:** 45 min

**Done when:**

- After successful login, check if fresh install
- If fresh AND cloud backup exists, auto-restore
- No conflict dialog shown
- Sync indicator shows "Synced" after

**Verification:**

- Login on fresh device with cloud backup
- Data appears without any dialogs
- Sync shows as synced

---

## Task 14.3: Gather Conflict Context Data

**Files:** `src/lib/backup/cloud.ts`
**Estimate:** 30 min

**Done when:**

- Function `getConflictContext()` returns:
  - cloudLastModified: Date
  - localLastModified: Date
  - cloudEntryCount: number
  - localEntryCount: number
- Fetches cloud metadata without full download

**Verification:**

- Function returns correct counts
- Timestamps are accurate

---

## Task 14.4: Create Enhanced Conflict Dialog

**Files:** `src/lib/components/SyncConflictDialog.svelte`
**Estimate:** 45 min

**Done when:**

- Shows cloud info: "Cloud backup from [date], [N] entries"
- Shows local info: "Local data from [date], [N] entries"
- Two buttons: "Use Cloud Data" / "Keep Local Data"
- Recommended option has primary styling

**Verification:**

- Dialog displays correct counts
- Dates formatted in German locale
- Recommended option visually distinct

---

## Task 14.5: Implement Recommendation Logic

**Files:** `src/lib/backup/cloud.ts`
**Estimate:** 30 min

**Done when:**

- Function `getRecommendedAction(context)` returns 'cloud' | 'local'
- Logic:
  - If one has 0 entries, recommend the other
  - If timestamps differ by >1 hour, recommend newer
  - If similar age, recommend more entries

**Verification:**

- Empty local, full cloud -> recommends cloud
- Newer local -> recommends local
- Similar age, more cloud entries -> recommends cloud

---

## Task 14.6: Wire Conflict Dialog to Sync Flow

**Files:** `src/routes/settings/+page.svelte` (or wherever sync is triggered)
**Estimate:** 30 min

**Done when:**

- Sync button click triggers conflict check if both local and cloud have data
- Shows SyncConflictDialog with context
- User choice triggers appropriate action
- Sync indicator updates correctly

**Verification:**

- Device with local data, cloud has different data
- Click sync -> conflict dialog appears
- Choose option -> data updated, indicator shows synced

---

## Task 14.7: Update Sync Indicator After Restore

**Files:** `src/lib/sync/engine.ts`, `src/lib/backup/cloud.ts`
**Estimate:** 15 min

**Done when:**

- After cloud restore, syncStatus store set to 'synced'
- Outbox cleared (no pending changes)
- Indicator shows checkmark

**Verification:**

- Restore cloud data
- Indicator shows "Synced" immediately

---

## Implementation Order

1. Task 14.1 (Fresh install detection) - Foundation
2. Task 14.3 (Conflict context) - Data gathering
3. Task 14.5 (Recommendation logic) - Decision engine
4. Task 14.4 (Conflict dialog) - UI component
5. Task 14.2 (Auto-download) - Happy path
6. Task 14.6 (Wire dialog) - Integration
7. Task 14.7 (Indicator update) - Polish

## Notes

- This is a critical bug fix affecting new users
- Test thoroughly with real Supabase backend
- Consider E2E test for fresh device scenario
