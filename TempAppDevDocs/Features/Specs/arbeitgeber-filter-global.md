# arbeitgeber-filter-global — Spec

<!--
SPEC LENGTH GUIDELINES:
- Small task: ~100-200 lines (single component, minor feature)
- Medium task: ~300-500 lines (multi-component feature, integration)
- Complex task: ~800-1500 lines (cross-cutting feature, major subsystem)
Write as much as necessary, but not more.

SPEC DRIFT RULE:
If code behavior changes, update this spec in the same commit.
-->

**Phase:** A2.2  
**Created:** 2024-12-30  
**Last Updated:** 2025-12-31  
**Status:** Approved

**Depends on:**

- None (builds on existing employer filter infrastructure)

**Does not depend on:**

- Employer creation/management UI changes (header dropdown already exists)
- Employer creation/deletion functionality (already implemented)
- Woche page employer filtering (Woche page is not filtered by employer for this feature)
- Adding employer filter to Settings page (not a data view page)
- Any major redesign of entry creation flow beyond the Add page adjustments above

---

## 1) Goal / Problem

Currently, the Arbeitgeber dropdown in the header filters some data, but the app does not consistently apply it to all employer-dependent elements across pages and UI surfaces. In addition, the UI and mental model still use "Kategorie(n)" although users work with "Einträge" (work activities and absences) and need clear badges that communicate work-time relevance.

This spec ensures that the header Arbeitgeber dropdown acts as the single global filter for all employer-dependent elements, introduces consistent "Eintrag/Einträge" terminology, defines absence behavior (no employer assignment, "Keine Arbeitszeit" badge), and updates Add/Tag/Woche page behaviors accordingly.

## 2) Scope

### In scope

- Ensure employer dropdown in the header acts as a global filter for all employer-dependent elements across relevant pages
- Replace user-facing terminology "Kategorie(n)" with "Eintrag/Einträge" where applicable
- Define a unified concept "Eintrag" that covers:
  - Tätigkeiten (counts as work time; employer-scoped)
  - Abwesenheiten (does NOT count as work time; no employer assignment)
- Ensure Tätigkeiten display the Arbeitgeber badge of their assigned employer
- Ensure Abwesenheiten display a "Keine Arbeitszeit" badge
- Verify and ensure Tag page respects employer filter for all employer-dependent elements (including entry lists and selectors)
- Woche page: keep behavior unchanged regarding employer filtering (see Out of scope)
- Verify and ensure Monat page respects employer filter for all employer-dependent elements
- Verify and ensure Auswertung page respects employer filter for all employer-dependent elements
- Ensure Ist/Soll/Saldo calculations use the correct filtered sources
- Add page UI changes:
  - Remove title "Alle Kategorien"
  - Remove title "Aufgabe starten"
  - Remove "Kategorie erstellen" section at end of page
  - Filter input width is limited to at most ~50% of available width and is followed by a button labeled "Eintrag erstellen" (no plus icon)
  - Under the title bar, show a hint "Klicke auf einen Eintrag, um die Zeit zu starten" only for users who have never started a new entry (tracked via boolean `NeverAddedAnEntry`)
  - The function that creates/starts an entry MUST set `NeverAddedAnEntry` to `false`
- Tag page changes:
  - Einträge shown on Tag page include employer badge (Tätigkeiten) or "Keine Arbeitszeit" badge (Abwesenheiten)
  - Employer dropdown filters employer-dependent Einträge on Tag page

### Out of scope

- Changes to the Arbeitgeber dropdown UI itself (already implemented)
- Employer creation/deletion functionality (already implemented)
- Woche page employer filtering (Woche page is not filtered by employer for this feature)
- Adding employer filter to Settings page (not a data view page)
- Any major redesign of entry creation flow beyond the Add page adjustments above

### What we don't want

- Duplicate filtering logic in each page component
- Inconsistent filter behavior across pages
- Ambiguous semantics (e.g., whether absences should be filtered by employer)
- Performance issues from re-filtering already filtered data
- Breaking existing employer filter functionality
- Re-introducing "Kategorie" terminology in new UI

## 3) Functional Requirements (FR)

- **AGF-FR-001**: The Arbeitgeber dropdown in the header MUST act as the global filter for all employer-dependent elements across the app (unless explicitly excluded in this spec)
- **AGF-FR-002**: When user selects "Alle Arbeitgeber" (null), all pages MUST show all employer-dependent items regardless of their `employerId`
- **AGF-FR-003**: When user selects a specific Arbeitgeber, all employer-dependent items MUST be filtered to show only items where `employerId` matches the selected employer OR `employerId` is null (global items)
- **AGF-FR-004**: All elements that are employer-dependent MUST have an internal employer assignment property (existing `employerId` or equivalent) that is authoritative for filtering
- **AGF-FR-005**: "Einträge" are the user-facing concept for work items and MUST be represented as:
  - Tätigkeiten (counts as work time; employer-dependent)
  - Abwesenheiten (does not count as work time; NOT employer-dependent)
- **AGF-FR-006**: Abwesenheiten MUST NOT have an employer assignment and MUST always display a badge "Keine Arbeitszeit"
- **AGF-FR-007**: Tätigkeiten MUST have an employer assignment and MUST display the badge of the assigned employer
- **AGF-FR-008**: The Tag page MUST use filtered stores (e.g., `filteredEntries`, `filteredActiveWorkTimeModel`, and equivalent filtered sources for Einträge) for all data display and calculations
- **AGF-FR-009**: The Monat page MUST use filtered stores for all data display and calculations
- **AGF-FR-010**: The Auswertung page MUST use filtered stores for all data display and calculations
- **AGF-FR-011**: Ist calculations MUST only include entries that count as work time (Tätigkeiten) and MUST exclude Abwesenheiten
- **AGF-FR-012**: Soll calculations MUST only use work time models from the filtered/active model sources for the selected employer (where employer filtering applies)
- **AGF-FR-013**: Running task banner MUST use the filtered running entry source to show only running Tätigkeiten for the selected employer
- **AGF-FR-014**: When employer filter changes, all relevant UI MUST update reactively without requiring page refresh
- **AGF-FR-015**: Add page MUST remove the title "Alle Kategorien" and MUST use "Eintrag" terminology
- **AGF-FR-016**: Add page filter input MUST be limited to at most ~50% width and MUST be followed by a button labeled "Eintrag erstellen" (no plus icon)
- **AGF-FR-017**: Add page MUST NOT show a "Kategorie erstellen" section at the end of the page
- **AGF-FR-018**: Add page MUST remove the title "Aufgabe starten"
- **AGF-FR-019**: Add page MUST show the hint text "Klicke auf einen Eintrag, um die Zeit zu starten" only if the current user's `NeverAddedAnEntry === true`
- **AGF-FR-020**: When the user creates/starts an entry for the first time, the app MUST set `NeverAddedAnEntry` to `false` (persisted)
- **AGF-FR-021**: Tag page Einträge MUST be filtered by the global Arbeitgeber dropdown for employer-dependent Einträge (Tätigkeiten), while Abwesenheiten remain visible regardless of selected employer

## 4) Implementation Guarantees (IG)

- **AGF-IG-001**: All pages MUST use the authoritative filtered sources/stores rather than performing ad-hoc filtering inside page components
- **AGF-IG-002**: Filter changes MUST trigger reactive updates via Svelte's reactivity system (no manual refresh needed)
- **AGF-IG-003**: Abwesenheiten are treated as non-employer-dependent and MUST NOT be accidentally hidden by employer filtering
- **AGF-IG-004**: All calculations (Ist/Soll/Saldo) MUST use the correct filtered data sources and MUST exclude Abwesenheiten from work time
- **AGF-IG-005**: No performance degradation MUST occur (filtering should be centralized and memoized via stores where possible)
- **AGF-IG-006**: The `NeverAddedAnEntry` flag MUST be persisted and MUST be updated atomically when the first entry is started/created

## 5) Design Decisions (DD)

- **AGF-DD-001**: Employer filtering remains a store-level responsibility (single source of truth)
- **AGF-DD-002**: Items with `employerId === null` are treated as "global" and visible in all employer contexts (allows shared data)
- **AGF-DD-003**: Abwesenheiten are explicitly non-employer-dependent and remain visible in all employer contexts
- **AGF-DD-004**: "Eintrag" becomes the user-facing term; internal type names MAY remain unchanged initially, but UI strings and headings MUST use "Eintrag" terminology consistently
- **AGF-DD-005**: The `NeverAddedAnEntry` user flag is used as a minimal persisted signal to show the first-time hint on Add page

## 6) Edge cases

- **Empty state**: When employer has no employer-dependent data, pages show empty states (already handled by existing UI)
- **Global items**: Items with `employerId === null` appear in all employer views (by design)
- **Running tasks**: If user switches employer while a task is running for a different employer, that task disappears from view (expected behavior)
- **Work time model fallback**: If selected employer has no work time model, Soll shows 0 (existing behavior)
- **First-time hint**: Existing users who have already started entries MUST NOT see the hint; `NeverAddedAnEntry` initialization/migration must avoid false positives
- **Absences**: Abwesenheiten always remain visible and must not be double-counted in work time summaries

## 7) Data & privacy

- **What is stored?**:
  - Existing employer assignment fields on employer-dependent items (e.g., `employerId`)
  - New boolean user flag `NeverAddedAnEntry`
- **Where?**: IndexedDB (existing structure)
- **Retention?**: No change to retention policies
- **Export/delete expectations?**: No change to export/delete behavior

## 8) Acceptance checks (testable)

- [ ] **AC-001** (AGF-FR-002): Select "Alle Arbeitgeber" → Tag page shows all Tätigkeiten + all Abwesenheiten
- [ ] **AC-002** (AGF-FR-002): Select "Alle Arbeitgeber" → Monat page shows all Tätigkeiten + all Abwesenheiten
- [ ] **AC-003** (AGF-FR-002): Select "Alle Arbeitgeber" → Auswertung uses all Tätigkeiten (and excludes Abwesenheiten from work time)
- [ ] **AC-004** (AGF-FR-003): Select Employer A → Tag page shows only Employer A Tätigkeiten + global Tätigkeiten + all Abwesenheiten
- [ ] **AC-005** (AGF-FR-003): Select Employer B → Tag page shows only Employer B Tätigkeiten + global Tätigkeiten + all Abwesenheiten
- [ ] **AC-006** (AGF-FR-007): Tätigkeiten show the correct employer badge
- [ ] **AC-007** (AGF-FR-006): Abwesenheiten show badge "Keine Arbeitszeit"
- [ ] **AC-008** (AGF-FR-011): Ist calculations exclude Abwesenheiten across Tag/Monat/Auswertung
- [ ] **AC-009** (AGF-FR-012): Soll uses the filtered/active work time model for the selected employer
- [ ] **AC-010** (AGF-FR-013): Create running Tätigkeit for Employer A → switch to Employer B → running task banner disappears
- [ ] **AC-011** (AGF-FR-014): Switch employer filter → relevant pages update immediately without refresh
- [ ] **AC-012** (AGF-FR-015..018): Add page uses "Eintrag" terminology and removed headings/sections as specified
- [ ] **AC-013** (AGF-FR-019): If `NeverAddedAnEntry === true`, Add page shows hint under title bar
- [ ] **AC-014** (AGF-FR-020): After creating/starting the first entry, `NeverAddedAnEntry` becomes `false` and the hint is no longer shown

## 9) Change log

**[2024-12-30 14:45]**

- Added: Initial spec created

**[2025-12-31 00:51]**

- Changed: Expanded scope to include "Eintrag" terminology, absence behavior, badges, Add page adjustments, and Tag page filtering semantics

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (AGF-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (AGF-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
