# ux-improvements — Plan

**Phase:** A4  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/ux-improvements.md`

---

## Architecture / Modules

### New Components

- `BackButton.svelte` — Browser-style history back button
- `CategoryBadge.svelte` — "Arbeitszeit" / "Nicht Arbeitszeit" label

### Modified Components

- `Header.svelte` — Add BackButton
- `DayNavigation.svelte` — Add date labels to arrows
- `WeekNavigation.svelte` — Add week number labels to arrows
- `MonthNavigation.svelte` — Add month labels to arrows
- `SettingsPage.svelte` — Rename category sections, add badges
- `AddTab.svelte` — Rename category sections
- `+layout.svelte` — Landing page logic

---

## Data Model

No schema changes required.

---

## UI State Model

### Navigation State

- `canGoBack: boolean` — Derived from browser history length
- Uses `window.history` API

### Landing Logic

- Check `timeEntries` for running task (endTime === null)
- Redirect accordingly in `+layout.ts` or `+page.ts`

---

## Error Handling

| Error                    | Handling         | User Feedback  |
| ------------------------ | ---------------- | -------------- |
| History.back() fails     | Fallback to /day | No error shown |
| Running task check fails | Default to /add  | No error shown |

---

## Testing Strategy

### Unit Tests

- Date/week/month label formatting
- canGoBack derivation

### E2E Tests

- Back button appears after navigation
- Back button returns to previous screen
- Landing on /add when no task
- Landing on /day when task running

---

## Risks / Constraints

- **Browser history:** PWA standalone has different history behavior
  - Mitigation: Track internal navigation separately if needed
- **Label space:** Small screens may not fit "← KW51"
  - Mitigation: Compact design, test on 320px

---

## Tasks

| #     | Task                                                     | Estimate | Dependencies |
| ----- | -------------------------------------------------------- | -------- | ------------ |
| A4.1  | Rename "Arbeitskategorien" → "Tätigkeiten" globally      | 1h       | -            |
| A4.2  | Rename "Abwesenheitskategorien" → "Abwesenheit" globally | 0.5h     | -            |
| A4.3  | CategoryBadge component                                  | 1h       | -            |
| A4.4  | Add badges to Settings category lists                    | 1h       | A4.3         |
| A4.5  | Day navigation: add date labels to arrows                | 1h       | -            |
| A4.6  | Week navigation: add week number labels                  | 1h       | -            |
| A4.7  | Month navigation: add month abbrev labels                | 1h       | -            |
| A4.8  | BackButton component                                     | 1h       | -            |
| A4.9  | Integrate BackButton into Header                         | 0.5h     | A4.8         |
| A4.10 | Landing page logic: check running task                   | 1h       | -            |
| A4.11 | Redirect to /add or /day based on task state             | 0.5h     | A4.10        |
| A4.12 | E2E tests                                                | 1.5h     | A4.1-A4.11   |

**Total estimate:** ~11 hours
