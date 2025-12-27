# kleine-aenderungen — Spec

**Phase:** A3  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- None (standalone improvements)

**Does not depend on:**

- Multi-Arbeitgeber (A2)
- UX/UI improvements (A4/A5)

---

## 1) Goal / Problem

Small but important feature additions that improve daily usability: creating categories directly from Add tab, password visibility toggle on login, and editing existing categories in Settings.

---

## 2) Scope

### In scope

- "Kategorie erstellen" button/action in Add tab
- Reusable category create/edit dialog component
- Password visibility toggle (eye icon) on login form
- Category edit functionality in Settings

### Out of scope

- Category deletion (already exists)
- Category reordering/sorting
- Category icons or colors
- Bulk category operations

### What we don't want

- Navigation away from Add tab to create category — use modal
- Separate dialogs for create vs edit — reuse same component
- Complex password strength meter — just visibility toggle

---

## 3) Functional Requirements (FR)

### Category Create in Add Tab

- **KA-FR-001**: Add tab shows "Kategorie erstellen" button (+ icon)
- **KA-FR-002**: Button opens modal dialog for new category
- **KA-FR-003**: Dialog is same component used in Settings
- **KA-FR-004**: After creation, new category appears in Add tab list
- **KA-FR-005**: Dialog fields: Name, Type (Tätigkeit/Abwesenheit), countsAsWorkTime toggle

### Password Visibility Toggle

- **KA-FR-010**: Login form password field has eye icon button
- **KA-FR-011**: Clicking eye toggles between password hidden/visible
- **KA-FR-012**: Icon changes to indicate current state (eye / eye-off)
- **KA-FR-013**: Default state: password hidden

### Category Edit in Settings

- **KA-FR-020**: Categories in Settings are clickable/tappable
- **KA-FR-021**: Clicking category opens edit dialog
- **KA-FR-022**: Edit dialog pre-fills current values
- **KA-FR-023**: Can edit: Name, countsAsWorkTime
- **KA-FR-024**: Cannot edit: Type (Tätigkeit/Abwesenheit) — would break entries
- **KA-FR-025**: Save updates category in IndexedDB and syncs to cloud

---

## 4) Implementation Guarantees (IG)

- **KA-IG-001**: Category dialog component is reusable (create/edit mode via prop)
- **KA-IG-002**: Password toggle does not submit form on click
- **KA-IG-003**: Category name validation: non-empty, max 50 chars
- **KA-IG-004**: Edit preserves category ID and all linked entries

---

## 5) Design Decisions (DD)

- **KA-DD-001**: Use existing ConfirmDialog pattern for category modal
- **KA-DD-002**: Password toggle uses Lucide eye/eye-off icons
- **KA-DD-003**: "Kategorie erstellen" button appears at bottom of each category section in Add tab

---

## 6) Edge cases

- Creating duplicate category name: Allow (user's choice)
- Editing category used by running task: Allow, update in real-time
- Empty category name: Block save, show validation error
- Very long category name: Truncate in list, show full in tooltip

---

## 7) Data & privacy

- **Stored:** Category changes in IndexedDB
- **Where:** Local + Supabase (Pro)
- **Retention:** Until user deletes
- **Export:** Categories included in JSON export

---

## 8) Acceptance checks (testable)

- [ ] AC-001: Add tab shows "Kategorie erstellen" button
- [ ] AC-002: Clicking button opens category creation modal
- [ ] AC-003: Can create new Tätigkeit from Add tab
- [ ] AC-004: Can create new Abwesenheit from Add tab
- [ ] AC-005: New category appears immediately in Add tab
- [ ] AC-006: Login form has password visibility toggle
- [ ] AC-007: Toggle shows/hides password text
- [ ] AC-008: Settings categories are clickable
- [ ] AC-009: Clicking category opens edit dialog
- [ ] AC-010: Can edit category name
- [ ] AC-011: Changes persist after reload

---

## 9) Change log

**[2025-12-27 14:00]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (KA-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (KA-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx)
- [x] No ambiguous terms without measurable definitions
