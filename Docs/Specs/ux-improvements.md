# ux-improvements — Spec

**Phase:** A4  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- None (standalone improvements)

**Does not depend on:**

- Multi-Arbeitgeber (A2)
- UI improvements (A5)

---

## 1) Goal / Problem

Improve user experience through better terminology, clearer navigation, and smarter landing page behavior. Users are confused by "Kategorien" terminology, navigation arrows conflict with browser back expectation, and landing page should default to Add tab when no task is running.

---

## 2) Scope

### In scope

- Rename "Arbeitskategorien" → "Tätigkeiten"
- Rename "Abwesenheitskategorien" → "Abwesenheit"
- Add labels "Arbeitszeit" / "Nicht Arbeitszeit" to categories
- Labeled navigation arrows (date/week/month context)
- Browser-style back button in header
- Landing page defaults to /add when no running task

### Out of scope

- Forward button (not needed yet)
- Swipe gestures for navigation
- Category grouping by custom tags
- Breadcrumb navigation

### What we don't want

- Removing existing ← → arrows — keep them, just label better
- Confusing "back" with "previous day" — separate buttons
- Auto-navigation based on time of day

---

## 3) Functional Requirements (FR)

### Terminology Rename

- **UX-FR-001**: "Arbeitskategorien" renamed to "Tätigkeiten" in all UI
- **UX-FR-002**: "Abwesenheitskategorien" renamed to "Abwesenheit" in all UI
- **UX-FR-003**: Generic term "Eintrag" used when referring to any category type
- **UX-FR-004**: Categories show label badge: "Arbeitszeit" or "Nicht Arbeitszeit"
- **UX-FR-005**: Badge visible in Settings category lists
- **UX-FR-006**: Badge uses subtle styling (small, muted color)

### Navigation Labels

- **UX-FR-010**: Day tab: ← arrow shows previous day number (e.g., "← 26")
- **UX-FR-011**: Day tab: → arrow shows next day number (e.g., "28 →")
- **UX-FR-012**: Week tab: ← arrow shows previous week number (e.g., "← KW51")
- **UX-FR-013**: Week tab: → arrow shows next week number (e.g., "KW53 →")
- **UX-FR-014**: Month tab: ← arrow shows previous month abbrev (e.g., "← Nov")
- **UX-FR-015**: Month tab: → arrow shows next month abbrev (e.g., "Jan →")
- **UX-FR-016**: Labels are compact (fit in button without overflow)

### Browser-Style Back Button

- **UX-FR-020**: Header shows back button (←) left of sync button
- **UX-FR-021**: Back button navigates to previous screen in history
- **UX-FR-022**: Back button uses browser history (history.back())
- **UX-FR-023**: Back button hidden on initial app load (no history)
- **UX-FR-024**: Back button visible after any navigation

### Landing Page Behavior

- **UX-FR-030**: App startup checks for running task
- **UX-FR-031**: If running task exists: land on /day
- **UX-FR-032**: If no running task: land on /add
- **UX-FR-033**: Behavior applies to fresh app launch and login redirect

---

## 4) Implementation Guarantees (IG)

- **UX-IG-001**: Terminology changes applied consistently (grep for old terms)
- **UX-IG-002**: Navigation labels update when date/week/month changes
- **UX-IG-003**: Back button does not appear on first page after login
- **UX-IG-004**: Landing logic runs before route guard completes

---

## 5) Design Decisions (DD)

- **UX-DD-001**: Week numbers use "KW" prefix (German convention)
- **UX-DD-002**: Month abbreviations use 3 letters (Jan, Feb, Mär, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Dez)
- **UX-DD-003**: Back button uses same icon style as sync button
- **UX-DD-004**: "Arbeitszeit" badge is green, "Nicht Arbeitszeit" badge is gray

---

## 6) Edge cases

- Day at month boundary: "← 31" / "1 →" — numbers alone are clear
- Week at year boundary: "← KW52" / "KW1 →" — no year needed, context is clear
- December/January: "← Dez" / "Jan →" — year not shown
- No history: Back button hidden (first page)
- PWA standalone: Back button essential (no browser back)

---

## 7) Data & privacy

- No new data stored
- Navigation history is browser-managed
- Landing preference not persisted (always check running task)

---

## 8) Acceptance checks (testable)

- [ ] AC-001: Settings shows "Tätigkeiten" instead of "Arbeitskategorien"
- [ ] AC-002: Settings shows "Abwesenheit" instead of "Abwesenheitskategorien"
- [ ] AC-003: Categories show "Arbeitszeit" or "Nicht Arbeitszeit" badge
- [ ] AC-004: Day tab arrows show day numbers
- [ ] AC-005: Week tab arrows show week numbers (KW format)
- [ ] AC-006: Month tab arrows show month abbreviations
- [ ] AC-007: Header shows back button after navigation
- [ ] AC-008: Back button returns to previous screen
- [ ] AC-009: App lands on /add when no running task
- [ ] AC-010: App lands on /day when task is running

---

## 9) Change log

**[2025-12-27 14:00]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (UX-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (UX-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx)
- [x] No ambiguous terms without measurable definitions
