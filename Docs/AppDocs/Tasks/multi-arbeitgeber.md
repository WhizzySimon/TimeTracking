# multi-arbeitgeber — Tasks

**Phase:** A2  
**Created:** 2025-12-28  
**Last Updated:** 2025-12-28  
**Based on Spec:** `Docs/AppDocs/Specs/multi-arbeitgeber.md`  
**Based on Plan:** `Docs/AppDocs/Plans/multi-arbeitgeber.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/Rules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task A2.1 — IndexedDB migration: add employers store

- **Files:**
  - `src/lib/types.ts`
  - `src/lib/storage/db.ts`
- **Done when:**
  - `Employer` interface defined in types.ts
  - IndexedDB version incremented
  - `employers` store created with keyPath `id`
  - Index on `isActive` for filtering active employers
- **Verify:**
  - `npm run verify`
  - App loads without errors
- **Guardrails:**
  - Existing data must be preserved
  - Migration must be backwards compatible
- **Estimated:** 1h
- **Status:** COMPLETE

---

## Task A2.2 — IndexedDB migration: add employerId to entries/categories/models

- **Files:**
  - `src/lib/types.ts`
- **Done when:**
  - `employerId?: string | null` added to TimeEntry, Category, WorkTimeModel interfaces
  - Existing data continues to work (null = all employers)
- **Verify:**
  - `npm run verify`
  - Existing entries still load correctly
- **Guardrails:**
  - Do NOT modify existing data in migration
  - null employerId = visible in all employers
- **Estimated:** 1h
- **Status:** COMPLETE
- **Dependencies:** A2.1

---

## Task A2.3 — Supabase migration: employers table + columns

- **Files:**
  - Supabase SQL migration
- **Done when:**
  - `employers` table created (id, user_id, name, created_at, updated_at, is_active)
  - `employer_id` column added to categories, time_entries, work_time_models
  - RLS policies configured
- **Verify:**
  - Supabase dashboard shows new schema
- **Guardrails:**
  - Existing data must remain intact
- **Estimated:** 1h
- **Status:** Pending

---

## Task A2.4 — Employer store + CRUD operations

- **Files:**
  - `src/lib/storage/employers.ts` (new)
  - `src/lib/storage/operations.ts`
- **Done when:**
  - `getAllEmployers()`, `getActiveEmployers()`, `saveEmployer()`, `deleteEmployer()` functions
  - CRUD operations integrate with outbox for sync
  - Soft delete (isActive = false) implemented
- **Verify:**
  - `npm run verify`
  - Unit test for CRUD operations
- **Guardrails:**
  - Delete must be soft delete by default
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.1

---

## Task A2.5 — EmployerSelector component

- **Files:**
  - `src/lib/components/EmployerSelector.svelte` (new)
- **Done when:**
  - Horizontal scrollable tab bar component
  - Shows "Alle" tab + one tab per active employer
  - Emits selection change event
  - Abbreviated names (max 10 chars) with tooltip
- **Verify:**
  - `npm run verify`
  - Visual test in browser
- **Guardrails:**
  - Must not cause layout shift on load
  - Selection change must be < 100ms
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.4

---

## Task A2.6 — Integrate selector into Header

- **Files:**
  - `src/lib/components/Header.svelte`
- **Done when:**
  - EmployerSelector appears below title bar
  - Hidden when user has 0 employers
  - Selection persists to localStorage
- **Verify:**
  - `npm run verify`
  - Visual test on all main tabs
- **Guardrails:**
  - Must be compact to minimize vertical space
- **Estimated:** 1h
- **Status:** Pending
- **Dependencies:** A2.5

---

## Task A2.7 — Filter logic for all stores

- **Files:**
  - `src/lib/stores/employer.ts` (new)
  - `src/lib/stores/entries.ts` (if exists, or create)
- **Done when:**
  - `selectedEmployerId` store (null = Alle)
  - Derived stores: `filteredEntries`, `filteredCategories`, `filteredModels`
  - Filter respects employerId === null as "visible in all"
- **Verify:**
  - `npm run verify`
  - Unit test for filter logic
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.2

---

## Task A2.8 — Update Day/Week/Month tabs for AG filtering

- **Files:**
  - `src/routes/day/+page.svelte`
  - `src/routes/week/+page.svelte`
  - `src/routes/month/+page.svelte`
- **Done when:**
  - All views subscribe to selectedEmployerId
  - Displayed entries filtered by selected employer
  - Soll/Ist/Haben calculated per selected employer
- **Verify:**
  - `npm run verify`
  - E2E test: select employer → verify filtered view
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.7

---

## Task A2.9 — Update Analysis tab for AG filtering

- **Files:**
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - Analysis respects selected employer
  - "Alle" shows combined analysis with per-AG breakdown
- **Verify:**
  - `npm run verify`
  - Visual test
- **Estimated:** 1h
- **Status:** Pending
- **Dependencies:** A2.7

---

## Task A2.10 — Update Add tab: group categories by AG

- **Files:**
  - `src/routes/add/+page.svelte`
- **Done when:**
  - Categories grouped by employer in selection
  - New entry inherits current employer selection
  - Global categories (employerId = null) shown in all groups
- **Verify:**
  - `npm run verify`
  - Visual test
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.7

---

## Task A2.11 — Update Settings: AG management section

- **Files:**
  - `src/routes/settings/+page.svelte`
  - `src/lib/components/EmployerDialog.svelte` (new)
- **Done when:**
  - "Arbeitgeber" section in Settings
  - List of employers with edit/delete buttons
  - "Arbeitgeber hinzufügen" button opens EmployerDialog
  - Edit opens EmployerDialog with existing data
  - Delete shows confirmation, then soft deletes
- **Verify:**
  - `npm run verify`
  - E2E test: create, edit, delete employer
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.4

---

## Task A2.12 — Update Settings: categories grouped by AG

- **Files:**
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - Categories section shows employer groupings
  - User can assign category to specific employer or "Alle"
- **Verify:**
  - `npm run verify`
  - Visual test
- **Estimated:** 1h
- **Status:** Pending
- **Dependencies:** A2.7

---

## Task A2.13 — Update WorkTimeModelDialog for AG

- **Files:**
  - `src/lib/components/WorkTimeModelDialog.svelte`
- **Done when:**
  - Dialog has employer dropdown (optional)
  - Model can be assigned to specific employer or "Alle"
  - Existing models without employer continue to work
- **Verify:**
  - `npm run verify`
  - Visual test
- **Estimated:** 1h
- **Status:** Pending
- **Dependencies:** A2.2

---

## Task A2.14 — StundenzettelExport component

- **Files:**
  - `src/lib/components/StundenzettelExport.svelte` (new)
- **Done when:**
  - Export dialog with employer selector
  - Date range picker
  - Column selection checkboxes
  - Preview table
- **Verify:**
  - `npm run verify`
  - Visual test
- **Guardrails:**
  - Export per employer only (not combined)
- **Estimated:** 3h
- **Status:** Pending
- **Dependencies:** A2.7

---

## Task A2.15 — Export to Excel (.xlsx) per AG

- **Files:**
  - `src/lib/export/stundenzettel-export.ts` (new or extend existing)
- **Done when:**
  - `exportStundenzettelExcel()` creates .xlsx with selected columns
  - Filename includes employer name and date range
  - Proper formatting (headers, borders)
- **Verify:**
  - `npm run verify`
  - Open exported file in Excel
- **Guardrails:**
  - Export gated behind Pro plan
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.14

---

## Task A2.16 — Export to PDF per AG

- **Files:**
  - `src/lib/export/stundenzettel-export.ts`
- **Done when:**
  - `exportStundenzettelPdf()` creates PDF with selected columns
  - Filename includes employer name and date range
  - Professional formatting
- **Verify:**
  - `npm run verify`
  - Open exported PDF
- **Guardrails:**
  - Export gated behind Pro plan
- **Estimated:** 1h
- **Status:** Pending
- **Dependencies:** A2.14

---

## Task A2.17 — Sync employers to Supabase

- **Files:**
  - `src/lib/sync/engine.ts`
  - `src/lib/api/employers.ts` (new)
- **Done when:**
  - Employer CRUD syncs to Supabase for Pro users
  - Outbox operations: employer_upsert, employer_delete
  - Pull/push logic implemented
- **Verify:**
  - `npm run verify`
  - Manual test: create employer → appears in Supabase
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.3, A2.4

---

## Task A2.18 — E2E tests for multi-AG

- **Files:**
  - `e2e/multi-arbeitgeber.test.ts` (new)
- **Done when:**
  - Test: create employer → selector shows it
  - Test: select employer → entries filtered
  - Test: create entry with employer → visible in that AG only
  - Test: export per AG
- **Verify:**
  - `npm run e2e`
- **Estimated:** 2h
- **Status:** Pending
- **Dependencies:** A2.1-A2.17

---

**Total estimate:** ~26 hours
