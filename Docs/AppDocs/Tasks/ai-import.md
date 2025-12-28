# AI Import — Tasks

**Phase:** 11  
**Created:** 2025-12-25  
**Last Updated:** 2025-12-25  
**Based on Spec:** `Docs/Specs/ai-import.md`  
**Based on Plan:** `Docs/Plans/ai-import.md`

---

## Overview

19 tasks organized into 6 sub-phases for MVP implementation.

**Estimated total:** ~30-35 hours

**Architecture:** AI-first (OpenAI Responses API handles all parsing, no programmatic CSV/Excel parsers)

---

## Phase 11.1: Foundation (Tasks 1-4)

### Task 11.1 — Types + IndexedDB Schema

- **Files:**
  - `src/lib/import/types.ts` (new)
  - `src/lib/storage/db.ts` (modify)
- **Done when:**
  - All types from spec Section 7 defined
  - IndexedDB stores `importBatches` and `importPresets` created
  - DB_VERSION bumped to 7
- **Verify:**
  - `npm run verify`
- **Guardrails:**
  - Must not break existing stores
  - Must follow existing type patterns
- **Estimated:** 1h

### Task 11.2 — OpenAI API Integration

- **Files:**
  - `src/lib/import/openai.ts` (new)
  - `src/lib/import/prompts/import-system.ts` (new)
  - `src/routes/api/import/parse/+server.ts` (new)
- **Done when:**
  - Server route calls OpenAI Responses API
  - System prompt instructs AI to return TimeEntryCandidate[] JSON
  - OPENAI_API_KEY read from environment variable
  - Model hard-coded (gpt-4o)
  - Premium plan check before API call
  - Error handling for API failures
- **Verify:**
  - `npm run verify`
  - Manual test with .env.local API key
- **Guardrails:**
  - API key never exposed to client
  - Must use Responses API (not deprecated Chat Completions)
- **Estimated:** 2h

### Task 11.3 — Validation Module

- **Files:**
  - `src/lib/import/validators.ts` (new)
  - `src/lib/import/validators.test.ts` (new)
- **Done when:**
  - All hard validations from spec implemented
  - All soft validations from spec implemented
  - Flags correctly assigned to candidates
  - Issues generated for validation failures
- **Verify:**
  - `npm run verify`
  - `npm run test:unit`
- **Guardrails:**
  - Must match spec Section 9 exactly
- **Estimated:** 2h

### Task 11.4 — Duplicate Detection

- **Files:**
  - `src/lib/import/duplicates.ts` (new)
  - `src/lib/import/duplicates.test.ts` (new)
- **Done when:**
  - Fingerprint generation consistent (same input = same hash)
  - Text normalization works (lowercase, trim, collapse whitespace)
  - Duplicate detection within batch works
  - Duplicate detection against existing entries works
- **Verify:**
  - `npm run verify`
  - `npm run test:unit`
- **Guardrails:**
  - Must use SHA-256 or similar stable hash
- **Estimated:** 1.5h

---

## Phase 11.2: UI Shell (Tasks 5-8)

### Task 11.5 — Import Route + State Machine

- **Files:**
  - `src/routes/import/+page.svelte` (new)
- **Done when:**
  - Route `/import` exists
  - State machine implemented (upload -> processing -> review -> commit -> report)
  - Navigation between states works
  - Premium gate check on mount
- **Verify:**
  - `npm run verify`
  - Browser test: navigate to /import
- **Guardrails:**
  - Must show Paywall for free users
- **Estimated:** 1.5h

### Task 11.6 — Upload Component

- **Files:**
  - `src/lib/components/import/ImportUpload.svelte` (new)
- **Done when:**
  - Drag-and-drop zone works
  - File picker works
  - Text paste area works
  - Source type selector works
  - Preset selector placeholder works
  - File list with remove buttons works
- **Verify:**
  - `npm run verify`
  - Browser test: upload files
- **Guardrails:**
  - Must validate file types
  - Must enforce size limits
- **Estimated:** 2h

### Task 11.7 — Progress Component

- **Files:**
  - `src/lib/components/import/ImportProgress.svelte` (new)
- **Done when:**
  - Progress bar displays percentage
  - Current file/step indicator works
  - Cancel button works
- **Verify:**
  - `npm run verify`
  - Browser test: see progress during processing
- **Guardrails:**
  - Cancel must abort processing cleanly
- **Estimated:** 1h

### Task 11.8 — Basic Review Table

- **Files:**
  - `src/lib/components/import/ImportReview.svelte` (new)
  - `src/lib/components/import/CandidateRow.svelte` (new)
- **Done when:**
  - Table displays all candidates
  - Columns: checkbox, date, start, end, duration, category, note, source, status
  - Status icons show (OK, ?, !!)
  - Selection checkboxes work
- **Verify:**
  - `npm run verify`
  - Browser test: see candidates in table
- **Guardrails:**
  - Must handle 100+ rows without lag
- **Estimated:** 2.5h

---

## Phase 11.3: Review Features (Tasks 9-12)

### Task 11.9 — Inline Editing

- **Files:**
  - `src/lib/components/import/CandidateRow.svelte` (modify)
- **Done when:**
  - Click on cell enables edit mode
  - Date picker for date field
  - Time picker for start/end fields
  - Number input for duration
  - Text input for note
  - Changes saved to candidate
  - Edited flag set on candidate
- **Verify:**
  - `npm run verify`
  - Browser test: edit candidate fields
- **Guardrails:**
  - Must validate input before saving
- **Estimated:** 2h

### Task 11.10 — Issues Panel

- **Files:**
  - `src/lib/components/import/IssuesPanel.svelte` (new)
  - `src/lib/components/import/ImportReview.svelte` (modify)
- **Done when:**
  - Aggregated issue counts displayed
  - Issue types: missing date, missing duration, unknown category, overlaps, duplicates
  - Click on issue filters table to affected candidates
- **Verify:**
  - `npm run verify`
  - Browser test: see issues, click to filter
- **Guardrails:**
  - Must update counts when candidates edited
- **Estimated:** 1.5h

### Task 11.11 — Bulk Actions

- **Files:**
  - `src/lib/components/import/BulkActions.svelte` (new)
  - `src/lib/components/import/ImportReview.svelte` (modify)
- **Done when:**
  - "Set category for matching text" action works
  - "Round durations to 5/15 min" action works
  - "Map unknown category" action works
  - Actions apply to selected candidates only
- **Verify:**
  - `npm run verify`
  - Browser test: use bulk actions
- **Guardrails:**
  - Must show confirmation before applying
- **Estimated:** 2h

### Task 11.12 — Filter + Confidence Slider

- **Files:**
  - `src/lib/components/import/ImportReview.svelte` (modify)
- **Done when:**
  - "Show only uncertain" toggle works
  - Confidence threshold slider works (0.5 - 1.0)
  - Candidates auto-selected based on threshold
  - Selection updates when threshold changes
- **Verify:**
  - `npm run verify`
  - Browser test: filter and adjust threshold
- **Guardrails:**
  - Must not lose manual selections when threshold changes
- **Estimated:** 1.5h

---

## Phase 11.4: AI Integration (Tasks 13-15)

### Task 11.13 — AI API Wrapper

- **Files:**
  - `src/lib/import/ai.ts` (new)
  - `src/routes/api/import/ai/+server.ts` (new)
- **Done when:**
  - Client-side wrapper calls server endpoint
  - Server endpoint validates premium status
  - Server endpoint calls OpenAI API
  - Rate limiting implemented (10/hour)
  - Error handling with retries
- **Verify:**
  - `npm run verify`
- **Guardrails:**
  - API key must never be exposed to client
  - Must handle API errors gracefully
- **Estimated:** 2.5h

### Task 11.14 — Column Mapping AI

- **Files:**
  - `src/lib/import/ai.ts` (modify)
  - `src/lib/import/parsers/csv.ts` (modify)
- **Done when:**
  - AI suggests column mapping from headers
  - Common patterns recognized (Datum, Date, Von, Start, Bis, Ende, etc.)
  - User can override AI suggestions
  - Mapping stored in preset
- **Verify:**
  - `npm run verify`
  - Browser test: upload CSV, see column mapping suggestions
- **Guardrails:**
  - Must work without AI (fallback to pattern matching)
- **Estimated:** 2h

### Task 11.15 — Category Guessing AI

- **Files:**
  - `src/lib/import/ai.ts` (modify)
  - `src/lib/import/orchestrator.ts` (new)
- **Done when:**
  - AI suggests category from note text
  - Confidence score reflects certainty
  - Unknown categories flagged
  - User categories passed to AI for matching
- **Verify:**
  - `npm run verify`
  - Browser test: see category suggestions
- **Guardrails:**
  - Must not invent categories
- **Estimated:** 2h

---

## Phase 11.5: Advanced Parsers (Tasks 16-18)

### Task 11.16 — Excel Parser

- **Files:**
  - `src/lib/import/parsers/excel.ts` (new)
  - `package.json` (add xlsx dependency)
- **Done when:**
  - .xlsx files parsed
  - Multiple sheets supported
  - Header row detected
  - Cell types handled (dates, numbers, strings)
- **Verify:**
  - `npm run verify`
  - Browser test: upload Excel file
- **Guardrails:**
  - Use lightweight xlsx library
- **Estimated:** 2h

### Task 11.17 — Text Parser

- **Files:**
  - `src/lib/import/parsers/text.ts` (new)
- **Done when:**
  - Plain text parsed line-by-line
  - AI extracts structured data from text
  - Source refs include line numbers
  - Lower confidence than structured files
- **Verify:**
  - `npm run verify`
  - Browser test: paste text, see candidates
- **Guardrails:**
  - Must handle various text formats
- **Estimated:** 2h

### Task 11.18 — OCR Integration

- **Files:**
  - `src/lib/import/parsers/ocr.ts` (new)
  - `src/routes/api/import/ocr/+server.ts` (new)
- **Done when:**
  - Images sent to OCR API
  - Text extracted with line positions
  - Handwritten text flagged with low confidence
  - Source refs include line numbers
- **Verify:**
  - `npm run verify`
  - Browser test: upload image, see OCR results
- **Guardrails:**
  - Must handle OCR failures gracefully
  - Handwritten always < 0.5 confidence
- **Estimated:** 3h

---

## Phase 11.6: Commit + Polish (Tasks 19-22)

### Task 11.19 — Commit Flow

- **Files:**
  - `src/lib/components/import/ImportCommit.svelte` (new)
  - `src/routes/import/+page.svelte` (modify)
- **Done when:**
  - Summary shows: count, date range, total hours
  - Warning shows skipped entries count
  - "Importieren" button commits selected candidates
  - TimeEntries created in IndexedDB
  - ImportBatch status updated to 'committed'
- **Verify:**
  - `npm run verify`
  - Browser test: commit import, see entries in Day tab
- **Guardrails:**
  - Must not import unselected candidates
- **Estimated:** 2h

### Task 11.20 — Import Report

- **Files:**
  - `src/lib/components/import/ImportReport.svelte` (new)
  - `src/routes/import/+page.svelte` (modify)
- **Done when:**
  - Report shows: imported count, skipped count, errors
  - "Neuer Import" button resets to upload state
  - "Zum Tag-Tab" button navigates to /day
- **Verify:**
  - `npm run verify`
  - Browser test: see report after import
- **Guardrails:**
  - None
- **Estimated:** 1h

### Task 11.21 — Preset Save/Load

- **Files:**
  - `src/lib/import/presets.ts` (new)
  - `src/lib/components/import/PresetSelector.svelte` (new)
  - `src/lib/components/import/ImportCommit.svelte` (modify)
- **Done when:**
  - User can save current mapping as named preset
  - User can load preset when starting import
  - User can delete presets
  - Presets stored in IndexedDB
- **Verify:**
  - `npm run verify`
  - Browser test: save and load preset
- **Guardrails:**
  - Must validate preset name (non-empty, unique)
- **Estimated:** 1.5h

### Task 11.22 — Premium Gating

- **Files:**
  - `src/routes/import/+page.svelte` (modify)
  - `src/routes/api/import/parse/+server.ts` (modify)
- **Done when:**
  - Free/Pro users see Paywall component with Premium upsell
  - Premium users see full import UI
  - API endpoint checks plan before processing
  - 403 returned for non-Premium users on API calls
- **Verify:**
  - `npm run verify`
  - Browser test: free/pro user blocked, premium user allowed
- **Guardrails:**
  - Must use existing Paywall component
  - Must use isPremium store
- **Estimated:** 1h

---

## Phase 11.7: Testing (Tasks 23-25)

### Task 11.23 — Unit Tests

- **Files:**
  - `src/lib/import/validators.test.ts` (extend)
  - `src/lib/import/duplicates.test.ts` (extend)
  - `src/lib/import/openai.test.ts` (new)
- **Done when:**
  - Validator tests: all rules covered
  - Duplicate tests: fingerprint consistency, detection accuracy
  - OpenAI wrapper tests: mock API responses, error handling
  - All tests pass
- **Verify:**
  - `npm run verify`
  - `npm run test:unit`
- **Guardrails:**
  - Must mock OpenAI API calls
  - Must cover edge cases from spec
- **Estimated:** 2h

### Task 11.24 — Integration Tests

- **Files:**
  - `src/lib/import/orchestrator.test.ts` (new)
- **Done when:**
  - End-to-end parsing flow tested
  - Review -> commit flow tested
  - Preset save/load tested
- **Verify:**
  - `npm run verify`
  - `npm run test:unit`
- **Guardrails:**
  - Must mock AI calls
- **Estimated:** 2h

### Task 11.25 — E2E Tests

- **Files:**
  - `e2e/ai-import.test.ts` (new)
- **Done when:**
  - Full import flow: CSV upload -> review -> commit -> verify in Day tab
  - Premium gating: free user blocked, premium user allowed
  - Error handling: invalid file shows error
  - Duplicate detection: duplicates marked
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Must use test fixtures (sample CSV, Excel files)
- **Estimated:** 3h

---

## Task Dependencies

```
11.1 (Types) ──┬──> 11.2 (OpenAI API)
               │
               ├──> 11.3 (Validators)
               │
               └──> 11.4 (Duplicates)

11.2 + 11.3 + 11.4 ──> 11.5 (Route)

11.5 ──> 11.6 (Upload) ──> 11.7 (Progress) ──> 11.8 (Review Table)

11.8 ──┬──> 11.9 (Inline Edit)
       │
       ├──> 11.10 (Issues Panel)
       │
       ├──> 11.11 (Bulk Actions)
       │
       └──> 11.12 (Filter)

11.9-11.12 ──> 11.19 (Commit) ──> 11.20 (Report)

11.19 ──> 11.21 (Presets)

11.5 + 11.2 ──> 11.22 (Premium Gating)

11.1-11.22 ──> 11.23 (Unit Tests) ──> 11.24 (Integration) ──> 11.25 (E2E)
```

**Note:** Tasks 11.13-11.18 removed (AI-first architecture - OpenAI handles all parsing)

---

## Parallel Execution

Tasks that can be worked on in parallel (by different developers or in separate PRs):

**Parallel Group A (after 11.1):**

- 11.2 (OpenAI API)
- 11.3 (Validators)
- 11.4 (Duplicates)

**Parallel Group B (after 11.8):**

- 11.9 (Inline Edit)
- 11.10 (Issues Panel)
- 11.11 (Bulk Actions)
- 11.12 (Filter)

---

## Checkpoint: Tasks Ready

Before starting implementation:

- [x] All tasks have clear "Done when" criteria
- [x] All tasks have verification steps
- [x] Tasks are in logical order
- [x] Dependencies documented
- [x] Parallel execution opportunities identified
- [x] Estimates provided
- [x] No task depends on "figure it out while coding"
