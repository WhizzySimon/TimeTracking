# multi-arbeitgeber — Spec

**Phase:** A2  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- Phase A1: Subscription Plans (plan gating for export features)

**Does not depend on:**

- Payment System (A1c)
- UX/UI improvements (A4/A5)

---

## 1) Goal / Problem

Enable users to track time for multiple employers (Arbeitgeber). Currently only one employer is supported. Users with multiple jobs need separate tracking, separate work time models, separate categories, and separate exports (Stundenzettel) per employer.

---

## 2) Scope

### In scope

- Employer (Arbeitgeber/AG) entity with CRUD operations
- AG selector tab bar visible on all main tabs (ALL / AG1 / AG2 / ...)
- Work time models linked to specific AG
- Categories (Tätigkeiten) grouped per AG
- Time entries linked to AG
- Filtering all views by selected AG
- Stundenzettel export per AG with selectable columns
- Export formats: Excel (.xlsx) and PDF

### Out of scope

- Sharing employers between users
- Employer-specific color themes
- AG-specific paywall/plan gating (all AGs available to all plans)
- Calendar sync per AG

### What we don't want

- Complex AG hierarchy (parent/child) — keep flat
- AG as required field — entries without AG default to first/default AG
- Deletion cascade — deleting AG keeps entries, just hides AG from selector

---

## 3) Functional Requirements (FR)

### AG Entity

- **AG-FR-001**: User can create unlimited employers (Arbeitgeber)
- **AG-FR-002**: AG has: id, name, createdAt, isActive (soft delete)
- **AG-FR-003**: AG is stored in IndexedDB `employers` store
- **AG-FR-004**: AG syncs to Supabase for Pro users

### AG Selector

- **AG-FR-010**: AG selector tab bar appears below title bar on all main tabs
- **AG-FR-011**: Selector shows: "Alle" (default) + one tab per AG
- **AG-FR-012**: Selected AG filters all displayed data
- **AG-FR-013**: "Alle" shows combined data from all AGs
- **AG-FR-014**: Selection persists in session (localStorage)

### Work Time Models

- **AG-FR-020**: Work time model has new field: `employerId` (optional, null = all AGs)
- **AG-FR-021**: When AG selected, only show relevant work time models
- **AG-FR-022**: Soll-Zeit calculated per AG when AG selected

### Categories (Tätigkeiten)

- **AG-FR-030**: Category has new field: `employerId` (optional, null = all AGs)
- **AG-FR-031**: Categories grouped per AG in Settings
- **AG-FR-032**: Categories grouped per AG in Add tab
- **AG-FR-033**: Categories with null employerId appear in all AG views

### Time Entries

- **AG-FR-040**: Time entry has new field: `employerId`
- **AG-FR-041**: New entries inherit AG from current selector (or null if "Alle")
- **AG-FR-042**: Entry can be reassigned to different AG via edit

### Views (Day/Week/Month/Analysis)

- **AG-FR-050**: All views respect AG selector filter
- **AG-FR-051**: Soll/Ist/Haben calculated per selected AG
- **AG-FR-052**: Analysis tab shows per-AG breakdown when "Alle" selected

### Stundenzettel Export

- **AG-FR-060**: Export available per AG (not combined)
- **AG-FR-061**: User selects columns to include in export
- **AG-FR-062**: Available columns: Date, Day, Start, End, Duration, Category, Description, AG
- **AG-FR-063**: Export formats: Excel (.xlsx), PDF
- **AG-FR-064**: Export filename includes AG name and date range
- **AG-FR-065**: Export gated behind Pro plan

### AG Deletion

- **AG-FR-070**: Deleting AG sets `isActive = false`
- **AG-FR-071**: Inactive AGs hidden from selector
- **AG-FR-072**: Entries with inactive AG still visible in history
- **AG-FR-073**: Option to permanently delete AG (removes from DB, entries keep orphan employerId)

---

## 4) Implementation Guarantees (IG)

- **AG-IG-001**: AG selector must not cause layout shift on page load
- **AG-IG-002**: Changing AG selector must update view within 100ms
- **AG-IG-003**: Existing entries without employerId treated as null (visible in all AGs)
- **AG-IG-004**: IndexedDB migration adds `employers` store, adds `employerId` index to entries
- **AG-IG-005**: Supabase migration adds `employers` table, adds `employer_id` column to entries

---

## 5) Design Decisions (DD)

- **AG-DD-001**: AG selector uses horizontal scrollable tabs (not dropdown) for quick access
- **AG-DD-002**: "Alle" tab always first, cannot be hidden
- **AG-DD-003**: AG tabs show abbreviated name (max 10 chars) with tooltip for full name
- **AG-DD-004**: No limit on number of AGs — UI scrolls horizontally

---

## 6) Edge cases

- User with 0 AGs: Hide AG selector entirely, behave as single-AG mode
- User with 1 AG: Show selector with "Alle" + AG name (allows future expansion)
- Entry created in "Alle" mode: Set employerId to null (appears in all)
- Category overlap: Same category name can exist in multiple AGs
- Work model overlap: Different hours per AG is expected use case

---

## 7) Data & privacy

- **Stored:** AG name, entries linked to AG
- **Where:** IndexedDB (local), Supabase (Pro cloud sync)
- **Retention:** Until user deletes
- **Export:** AG data included in JSON export, Stundenzettel per AG

---

## 8) Acceptance checks (testable)

- [ ] AC-001: Can create new AG in Settings
- [ ] AC-002: AG selector appears on Day/Week/Month/Analysis tabs
- [ ] AC-003: Selecting AG filters displayed entries
- [ ] AC-004: "Alle" shows entries from all AGs
- [ ] AC-005: New entry inherits current AG selection
- [ ] AC-006: Categories grouped by AG in Add tab
- [ ] AC-007: Work time models can be assigned to specific AG
- [ ] AC-008: Soll/Ist/Haben reflects selected AG
- [ ] AC-009: Can export Stundenzettel per AG as Excel
- [ ] AC-010: Can export Stundenzettel per AG as PDF
- [ ] AC-011: Deleting AG hides it but keeps entries
- [ ] AC-012: Existing entries without AG visible in all views

---

## 9) Change log

**[2025-12-27 14:00]**

- Added: Initial spec created based on user requirements

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (AG-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (AG-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
