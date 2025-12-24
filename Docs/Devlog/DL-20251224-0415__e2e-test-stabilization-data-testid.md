# E2E Test Stabilization with data-testid

**Chat Date/Time:** 2025-12-22 19:31 (UTC+01:00)
**Generated At:** 2025-12-24T04:15:00+01:00
**Chat topic:** Fix 9 failing Playwright E2E tests by replacing brittle text-based selectors with stable data-testid attributes
**Workflow used:** UNKNOWN

**Related Docs:**

- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: Docs/IMPLEMENTATION_PROGRESS.md (Cross-Browser Testing Summary section, UI Issues Found & Fixed #4)
- Other referenced docs:
  - Docs/IMPLEMENTATION_PROGRESS.md
  - svelte.config.js
  - static/\_redirects

## Decisions (aus Chat)

- D1: Use data-testid attributes instead of text-based selectors for E2E tests — Reason: Text-based selectors (`text=Gesichert`, `getByRole('button', { name: '+ Kategorie' })`) are brittle and break when UI text or button types change — Evidence: "Die Tests sind failing, aber diese sind **nicht durch meine Änderungen verursacht** - sie sind bestehende Testprobleme: 1. **'Gesichert' Text nicht gefunden** - Der Sync-Indikator zeigt jetzt einen anderen Text 2. **'+ Kategorie' Button nicht gefunden** - Der Button wurde zu einem '+' Icon geändert (frühere UI-Änderung)"

- D2: Add SyncIndicator component to app header — Reason: Component existed but was not integrated into the layout, causing test failures — Evidence: "Der `SyncIndicator` wird nicht im Layout verwendet! Ich muss prüfen, wo er sein sollte" → "Der `SyncIndicator` wird nicht importiert/verwendet im Layout"

- D3: Keep current UI unchanged, only add test infrastructure — Reason: Tests should adapt to UI, not vice versa — Evidence: User request: "Keep the current UI (do NOT reintroduce removed texts just to satisfy tests)"

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- NONE

### Code Delta (nur aus Chat)

- `src/lib/components/SyncIndicator.svelte` — Added `data-testid="sync-indicator"` and `data-sync-status={$syncStatus}` attributes to root div — Evidence: "Add data-testid to sync indicator for E2E tests"

- `src/routes/settings/+page.svelte` — Added `data-testid="category-menu-btn"` to 3-dot menu button and `data-testid="add-category-menu-item"` to "Hinzufügen" dropdown item — Evidence: "Add data-testid to category menu button for E2E tests" + "Add data-testid to add category menu item for E2E tests"

- `src/routes/+layout.svelte` — Imported SyncIndicator component and added `<SyncIndicator />` to header-left section — Evidence: "Import SyncIndicator component" + "Add SyncIndicator to header"

- `e2e/basic-flow.test.ts` — Changed `page.locator('text=Gesichert')` to `page.getByTestId('sync-indicator')` — Evidence: "Update E2E test to use data-testid instead of text selector for sync indicator"

- `e2e/milestone1.test.ts` — Changed `page.getByRole('button', { name: '+ Kategorie' })` to `page.getByTestId('category-menu-btn').click()` followed by `page.getByTestId('add-category-menu-item').click()` (2 occurrences) — Evidence: "Update E2E test to use data-testid selectors for add category flow" + "Update second test to use data-testid selectors for add category flow"

- `Docs/IMPLEMENTATION_PROGRESS.md` — Added section "4. **E2E test selectors brittle (2025-12-22)**" documenting root cause, fix, new test IDs, and files changed — Evidence: "Document the E2E test selector fixes"

### Repo-Verified Delta (optional, getrennt!)

- `Docs/Devlog/INDEX.md` — Contains 15 existing devlog entries with proper table format (header + separator + entries) — Evidence: Read file shows table structure with Date/Time | Title | Path | Status | Tags columns

- `src/lib/components/SyncIndicator.svelte` — File exists with data-testid attributes on lines 56-57 — Evidence: File read after edit shows `data-testid="sync-indicator"` and `data-sync-status={$syncStatus}`

- `src/routes/+layout.svelte` — SyncIndicator import exists on line 10, component usage on line 179 — Evidence: File read after edit shows import and component placement

## Verification (strict)

- Claimed in chat:
  - npm run verify — Result: PASS — Evidence: "Verification complete: ALL PASSED" in cascade-output.txt
  - Playwright E2E tests (27 tests: Chromium 9, WebKit 9, Mobile Safari 9) — Result: PASS (27 passed, 0 failed) — Evidence: "27 passed (36.2s)" in cascade-output.txt after final test run
  - Initial E2E test run before fixes — Result: FAIL (3 failed, 24 passed) — Evidence: "3 failed [...] 24 passed (59.5s)" showing failures in basic-flow.test.ts:85:2 for all three browsers

- Verified now in repo (static only):
  - `data-testid="sync-indicator"` attribute exists in SyncIndicator.svelte — Evidence: File content line 56
  - `data-testid="category-menu-btn"` attribute exists in settings/+page.svelte — Evidence: File content line 348
  - `data-testid="add-category-menu-item"` attribute exists in settings/+page.svelte — Evidence: File content line 357
  - SyncIndicator component imported and used in +layout.svelte — Evidence: Import on line 10, usage on line 179
  - Test files updated to use getByTestId() — Evidence: e2e/basic-flow.test.ts line 92, e2e/milestone1.test.ts lines 143-144 and 192-193

## Bugs / Issues mentioned

- B1: 9 E2E tests failing due to brittle text-based selectors — Cause: UI changes (removed "Gesichert" text, changed "+ Kategorie" button to dropdown menu) broke tests using text/role selectors — Fix: Added data-testid attributes to UI elements and updated tests to use getByTestId() — Status: DONE — Evidence: "Die E2E-Tests haben 9 Fehler" → "Alle 27 Tests bestanden!"

- B2: SyncIndicator component not integrated in app layout — Cause: Component file existed but was never imported/used in +layout.svelte — Fix: Added import and component usage in header — Status: DONE — Evidence: "Der `SyncIndicator` wird nicht im Layout verwendet!" → Added to layout and tests pass

## Follow-ups

- F1: Consider adding data-testid to other critical UI elements proactively — Owner: Cascade — Priority: Low
- F2: Document data-testid naming conventions in testing guidelines — Owner: User — Priority: Low
- F3: Review other E2E tests for potential brittleness with text-based selectors — Owner: Cascade — Priority: Med

## Tags

- tags: [testing, e2e, playwright, data-testid, bugfix, ui, refactor]

## Confidence

- High (all changes explicitly documented in chat, verification output captured, repo changes confirmed)
