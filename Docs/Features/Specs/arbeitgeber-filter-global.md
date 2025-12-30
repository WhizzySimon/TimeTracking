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

**Phase:** TBD (to be added to IMPLEMENTATION_PROGRESS.md)  
**Created:** 2024-12-30  
**Last Updated:** 2024-12-30  
**Status:** Draft

**Depends on:**

- None (builds on existing employer filter infrastructure)

**Does not depend on:**

- Employer creation/management features (already implemented)
- Data model changes (employerId fields already exist)

---

## 1) Goal / Problem

Currently, the Arbeitgeber dropdown in the header filters time entries, categories, and work time models, but the pages (Tag, Woche, Monat, Auswertung) do not consistently apply this filter to all displayed content. This spec ensures that when a user selects an Arbeitgeber, all page content is filtered to show only data related to that employer.

## 2) Scope

### In scope

- Verify and ensure Tag page respects employer filter for all displayed data
- Verify and ensure Woche page respects employer filter for all displayed data
- Verify and ensure Monat page respects employer filter for all displayed data
- Verify and ensure Auswertung page respects employer filter for all displayed data
- Ensure Ist/Soll/Saldo calculations use filtered data
- Ensure task lists show only filtered entries
- Ensure category dropdowns show only filtered categories
- Ensure day/week/month summaries use filtered work time models

### Out of scope

- Changes to the Arbeitgeber dropdown UI itself (already implemented)
- Changes to the employer data model (already implemented)
- Adding employer filter to Settings page (not a data view page)
- Employer creation/deletion functionality (already implemented)

### What we don't want

- Duplicate filtering logic in each page component
- Inconsistent filter behavior across pages
- Performance issues from re-filtering already filtered data
- Breaking existing employer filter functionality

## 3) Functional Requirements (FR)

- **AGF-FR-001**: When user selects "Alle Arbeitgeber" (null), all pages MUST show all time entries, categories, and work time models regardless of their employerId
- **AGF-FR-002**: When user selects a specific Arbeitgeber, all pages MUST show only items where employerId matches the selected employer OR employerId is null (global items)
- **AGF-FR-003**: Tag page MUST use `filteredEntries`, `filteredCategories`, and `filteredActiveWorkTimeModel` stores for all data display and calculations
- **AGF-FR-004**: Woche page MUST use `filteredEntries`, `filteredCategories`, and `filteredActiveWorkTimeModel` stores for all data display and calculations
- **AGF-FR-005**: Monat page MUST use `filteredEntries`, `filteredCategories`, and `filteredActiveWorkTimeModel` stores for all data display and calculations
- **AGF-FR-006**: Auswertung page MUST use `filteredEntries`, `filteredCategories`, and `filteredModels` stores for all data display and calculations
- **AGF-FR-007**: Ist calculations MUST only include time entries from `filteredEntries` with categories from `filteredCategories` where `countsAsWorkTime === true`
- **AGF-FR-008**: Soll calculations MUST only use work time models from `filteredActiveWorkTimeModel` or `filteredModels`
- **AGF-FR-009**: Task lists MUST only display entries from `filteredEntries`
- **AGF-FR-010**: Category selectors in modals/forms MUST only show categories from `filteredCategories`
- **AGF-FR-011**: Running task banner MUST use `filteredRunningEntry` to show only running tasks for the selected employer
- **AGF-FR-012**: When employer filter changes, all page data MUST update reactively without requiring page refresh

## 4) Implementation Guarantees (IG)

- **AGF-IG-001**: All pages MUST use the existing filtered stores (`filteredEntries`, `filteredCategories`, `filteredModels`, `filteredActiveWorkTimeModel`, `filteredRunningEntry`) instead of unfiltered stores
- **AGF-IG-002**: No new filtering logic MUST be added to page components (use existing store-level filtering)
- **AGF-IG-003**: Filter changes MUST trigger reactive updates via Svelte's reactivity system (no manual refresh needed)
- **AGF-IG-004**: Existing filter logic in `src/lib/stores/index.ts` MUST NOT be modified (already correct)
- **AGF-IG-005**: All calculations (Ist/Soll/Saldo) MUST use filtered data sources
- **AGF-IG-006**: No performance degradation MUST occur (filtering already happens at store level)

## 5) Design Decisions (DD)

- **AGF-DD-001**: Use existing filtered stores rather than adding page-level filtering (DRY principle, single source of truth)
- **AGF-DD-002**: Items with `employerId === null` are treated as "global" and visible in all employer contexts (allows shared categories/models)
- **AGF-DD-003**: Filter logic remains in store layer (`src/lib/stores/index.ts`) for centralized control and consistency

## 6) Edge cases

- **Empty state**: When employer has no data, pages show empty states (already handled by existing UI)
- **Global items**: Items with `employerId === null` appear in all employer views (by design)
- **Running tasks**: If user switches employer while a task is running for a different employer, that task disappears from view (expected behavior)
- **Work time model fallback**: If selected employer has no work time model, Soll shows 0 (existing behavior)
- **Category availability**: If selected employer has no categories, user cannot create tasks (existing validation should handle this)

## 7) Data & privacy

- **What is stored?**: No new data storage required. Uses existing `employerId` fields on TimeEntry, Category, and WorkTimeModel
- **Where?**: IndexedDB (existing structure)
- **Retention?**: No change to retention policies
- **Export/delete expectations?**: No change to export/delete behavior

## 8) Acceptance checks (testable)

- [ ] **AC-001** (AGF-FR-001): Select "Alle Arbeitgeber" → verify Tag page shows all time entries
- [ ] **AC-002** (AGF-FR-001): Select "Alle Arbeitgeber" → verify Woche page shows all time entries
- [ ] **AC-003** (AGF-FR-001): Select "Alle Arbeitgeber" → verify Monat page shows all time entries
- [ ] **AC-004** (AGF-FR-001): Select "Alle Arbeitgeber" → verify Auswertung page shows all time entries
- [ ] **AC-005** (AGF-FR-002): Select specific employer → verify Tag page shows only that employer's entries + global entries
- [ ] **AC-006** (AGF-FR-002): Select specific employer → verify Woche page shows only that employer's entries + global entries
- [ ] **AC-007** (AGF-FR-002): Select specific employer → verify Monat page shows only that employer's entries + global entries
- [ ] **AC-008** (AGF-FR-002): Select specific employer → verify Auswertung page shows only that employer's entries + global entries
- [ ] **AC-009** (AGF-FR-007): Verify Ist calculation on Tag page only includes filtered entries with countsAsWorkTime categories
- [ ] **AC-010** (AGF-FR-007): Verify Ist calculation on Woche page only includes filtered entries with countsAsWorkTime categories
- [ ] **AC-011** (AGF-FR-007): Verify Ist calculation on Monat page only includes filtered entries with countsAsWorkTime categories
- [ ] **AC-012** (AGF-FR-007): Verify Ist calculation on Auswertung page only includes filtered entries with countsAsWorkTime categories
- [ ] **AC-013** (AGF-FR-008): Verify Soll calculation uses filtered work time model for selected employer
- [ ] **AC-014** (AGF-FR-011): Create running task for Employer A → switch to Employer B → verify running task banner disappears
- [ ] **AC-015** (AGF-FR-012): Switch employer filter → verify all pages update immediately without refresh

## 9) Change log

**[2024-12-30 14:45]**

- Added: Initial spec created

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
