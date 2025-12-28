# subscription-plans — Tasks

**Phase:** A1  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Based on Spec:** `Docs/Specs/subscription-plans.md`  
**Based on Plan:** `Docs/Plans/subscription-plans.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/Rules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task A1.1 — ProPaywall Component

- **Files:**
  - `src/lib/components/ProPaywall.svelte`
- **Done when:**
  - Reusable modal component exists
  - Shows Pro benefits (Cloud Backup, Export, Import)
  - "Pro freischalten" button shows "Kommt bald" toast
  - "Weiter mit Free" button closes modal
- **Verify:**
  - `npm run verify`
  - Visual test in browser
- **Guardrails:**
  - Must be reusable for any Pro-gated feature
- **Estimated:** 1h

---

## Task A1.2 — Cloud Backup Plan Gating

- **Files:**
  - `src/lib/backup/backup-service.ts` (or wherever backup logic is)
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - Cloud backup button checks `$isPro` before executing
  - Free users see ProPaywall modal instead of backup
  - Pro users can backup normally
- **Verify:**
  - `npm run verify`
  - Manual test: Free user → paywall, Pro user → backup works
- **Guardrails:**
  - Local backup (IndexedDB) must always work for everyone
- **Estimated:** 1h

---

## Task A1.3 — Export Module (JSON)

- **Files:**
  - `src/lib/export/index.ts`
  - `src/lib/export/json-export.ts`
- **Done when:**
  - `exportToJson()` function creates valid JSON with entries, categories, dayTypes, workTimeModels
  - Triggers browser download with filename `timetracker-backup-YYYY-MM-DD.json`
- **Verify:**
  - `npm run verify`
  - Unit test for JSON structure
- **Guardrails:**
  - Must include version number for future compatibility
- **Estimated:** 1h

---

## Task A1.4 — Export Module (CSV)

- **Files:**
  - `src/lib/export/csv-export.ts`
- **Done when:**
  - `exportToCsv()` function creates CSV with columns: date, start_time, end_time, category, description, duration_minutes
  - Triggers browser download with filename `timetracker-export-YYYY-MM-DD.csv`
  - Handles empty entries gracefully
- **Verify:**
  - `npm run verify`
  - Open exported CSV in Excel/Sheets
- **Guardrails:**
  - UTF-8 encoding with BOM for Excel compatibility
- **Estimated:** 1h

---

## Task A1.5 — Export Module (PDF)

- **Files:**
  - `src/lib/export/pdf-export.ts`
  - `package.json` (add jspdf, jspdf-autotable)
- **Done when:**
  - `exportToPdf()` function creates PDF with formatted table
  - Same data as CSV in presentable format
  - Triggers browser download with filename `timetracker-export-YYYY-MM-DD.pdf`
- **Verify:**
  - `npm run verify`
  - Open exported PDF, verify table formatting
- **Guardrails:**
  - Keep dependencies minimal (jspdf + autotable only)
- **Estimated:** 1.5h

---

## Task A1.6 — ExportDialog Component

- **Files:**
  - `src/lib/components/ExportDialog.svelte`
- **Done when:**
  - Modal with format selection (CSV, JSON, PDF radio buttons)
  - "Exportieren" button triggers selected format export
  - Shows loading state during export
  - Closes on success
- **Verify:**
  - `npm run verify`
  - Visual test all three formats
- **Guardrails:**
  - Must check `$isPro` and show paywall for Free users
- **Estimated:** 1h

---

## Task A1.7 — Import Module (JSON)

- **Files:**
  - `src/lib/import/index.ts`
  - `src/lib/import/json-import.ts`
- **Done when:**
  - `parseJsonImport()` validates JSON structure
  - Returns parsed data or validation errors
  - Handles version differences gracefully
- **Verify:**
  - `npm run verify`
  - Unit test with valid/invalid JSON
- **Guardrails:**
  - Must not auto-import, only parse for preview
- **Estimated:** 1h

---

## Task A1.8 — Import Module (Excel)

- **Files:**
  - `src/lib/import/excel-import.ts`
  - `package.json` (add xlsx)
- **Done when:**
  - `parseExcelImport()` reads .xlsx file
  - Extracts entries from first sheet
  - Maps columns to TimeEntry fields
  - Returns parsed data or validation errors
- **Verify:**
  - `npm run verify`
  - Unit test with sample Excel file
- **Guardrails:**
  - Only .xlsx supported, reject .xls with clear error
- **Estimated:** 1.5h

---

## Task A1.9 — Import Route (UI)

- **Files:**
  - `src/routes/import/+page.svelte`
- **Done when:**
  - Route `/import` exists with full flow: Upload → Preview → Confirm
  - File picker accepts .json and .xlsx
  - Preview table shows parsed entries
  - Validation errors shown inline
  - "Importieren" button commits data to IndexedDB
  - Success message shows count of added/updated entries
  - Back navigation to settings
- **Verify:**
  - `npm run verify`
  - E2E test import flow
- **Guardrails:**
  - Must check `$isPro` on mount, redirect Free users with paywall
  - Must not import without user confirmation
- **Estimated:** 2h

---

## Task A1.10 — Settings: Konto Section

- **Files:**
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - "Konto" section shows user email
  - Shows current plan badge (Free / Pro / Premium)
  - "Plan ändern" button exists (opens PlanComparison modal)
- **Verify:**
  - `npm run verify`
  - Visual test in browser
- **Guardrails:**
  - Keep existing settings sections intact
- **Estimated:** 1h

---

## Task A1.11 — Settings: Daten Section

- **Files:**
  - `src/routes/settings/+page.svelte`
- **Done when:**
  - "Daten" section exists below Konto
  - "Exportieren" button opens ExportDialog
  - "Importieren" button navigates to /import
  - Both buttons check plan and show paywall for Free users
- **Verify:**
  - `npm run verify`
  - Visual test in browser
- **Guardrails:**
  - Buttons visible for all users, paywall on click for Free
- **Estimated:** 0.5h

---

## Task A1.12 — PlanComparison Modal

- **Files:**
  - `src/lib/components/PlanComparison.svelte`
- **Done when:**
  - Modal shows Free vs Pro vs Premium comparison
  - Current plan highlighted
  - Free features listed: Tag, Woche, Monat, Auswertung, lokale Speicherung
  - Pro features listed: + Cloud Backup, Export, Import
  - Premium features listed: + AI Import (Kommt bald)
  - "Pro freischalten" shows "Kommt bald" toast
- **Verify:**
  - `npm run verify`
  - Visual test in browser
- **Guardrails:**
  - Premium section clearly marked as "Kommt bald"
- **Estimated:** 1h

---

## Task A1.13 — E2E Tests

- **Files:**
  - `e2e/subscription-plans.test.ts`
- **Done when:**
  - Test: Free user sees paywall on Cloud Backup
  - Test: Free user sees paywall on Export
  - Test: Pro user can export JSON
  - Test: Pro user can import JSON
  - Test: Settings shows Konto and Daten sections
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Use test user with known plan state
- **Estimated:** 1.5h

---

## Summary

| Task      | Description              | Est.    |
| --------- | ------------------------ | ------- |
| A1.1      | ProPaywall Component     | 1h      |
| A1.2      | Cloud Backup Plan Gating | 1h      |
| A1.3      | Export Module (JSON)     | 1h      |
| A1.4      | Export Module (CSV)      | 1h      |
| A1.5      | Export Module (PDF)      | 1.5h    |
| A1.6      | ExportDialog Component   | 1h      |
| A1.7      | Import Module (JSON)     | 1h      |
| A1.8      | Import Module (Excel)    | 1.5h    |
| A1.9      | Import Route (UI)        | 2h      |
| A1.10     | Settings: Konto Section  | 1h      |
| A1.11     | Settings: Daten Section  | 0.5h    |
| A1.12     | PlanComparison Modal     | 1h      |
| A1.13     | E2E Tests                | 1.5h    |
| **Total** |                          | **15h** |
