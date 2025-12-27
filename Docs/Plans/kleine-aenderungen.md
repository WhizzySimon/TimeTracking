# kleine-aenderungen — Plan

**Phase:** A3  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/kleine-aenderungen.md`

---

## Architecture / Modules

### New Components

- `CategoryDialog.svelte` — Reusable create/edit category modal
- `PasswordInput.svelte` — Input with visibility toggle (reusable)

### Modified Components

- `AddTab.svelte` — Add "Kategorie erstellen" button per section
- `SettingsPage.svelte` — Make categories clickable, open edit dialog
- `LoginForm.svelte` — Use PasswordInput component

---

## Data Model

No schema changes required. Uses existing `categories` store.

---

## UI State Model

### CategoryDialog State

- `mode: 'create' | 'edit'`
- `category: Partial<Category>` — Form data
- `isOpen: boolean`

### PasswordInput State

- `visible: boolean` — Toggle between text/password type

---

## Error Handling

| Error | Handling | User Feedback |
|-------|----------|---------------|
| Empty category name | Block save | Inline validation: "Name erforderlich" |
| Duplicate name | Allow (user choice) | No error |
| Save fails | Retry 3x | Toast: "Speichern fehlgeschlagen" |

---

## Testing Strategy

### Unit Tests

- CategoryDialog: create mode vs edit mode
- Validation logic for category name

### E2E Tests

- Create category from Add tab
- Edit category from Settings
- Password visibility toggle on login

---

## Risks / Constraints

- **Consistency:** Dialog must look/behave same in Add tab and Settings
  - Mitigation: Single component with props
- **Mobile:** Dialog must work on small screens
  - Mitigation: Use existing ConfirmDialog patterns

---

## Tasks

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| A3.1 | CategoryDialog component (create mode) | 2h | - |
| A3.2 | CategoryDialog component (edit mode) | 1h | A3.1 |
| A3.3 | Add "Kategorie erstellen" button to Add tab | 1h | A3.1 |
| A3.4 | Make categories clickable in Settings | 1h | A3.2 |
| A3.5 | PasswordInput component with toggle | 1h | - |
| A3.6 | Integrate PasswordInput into LoginForm | 0.5h | A3.5 |
| A3.7 | E2E tests | 1h | A3.1-A3.6 |

**Total estimate:** ~7.5 hours
