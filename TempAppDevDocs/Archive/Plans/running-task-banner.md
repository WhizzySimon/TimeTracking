# running-task-banner - Plan

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/running-task-banner.md`

---

## Architecture / modules

### Components affected

- **`+layout.svelte`** — Add banner rendering (global visibility)
- **`WarningBanner.svelte`** — Add click handler prop, cursor styling
- **`stores/index.ts`** — Modify `runningEntry` to return oldest running task

### New state

- `runningEntries` (derived) — All entries with `endTime === null`, sorted by `createdAt`
- `oldestRunningEntry` (derived) — First item from `runningEntries`

### Navigation flow

```
Banner click
  → goto(`/day`)
  → set currentDate to entry.date
  → set editingEntryId to entry.id
  → /day page opens AddTaskModal for that entry
```

## Data model

No new data. Uses existing:

- `timeEntries` store (already in IndexedDB)
- `TimeEntry.endTime` (null = running)
- `TimeEntry.createdAt` (for sorting oldest first)

## UI state model

| State            | Location           | Purpose                            |
| ---------------- | ------------------ | ---------------------------------- |
| `runningEntries` | derived store      | All tasks with no end time         |
| `oldestRunning`  | derived store      | First/oldest running task          |
| `editingEntryId` | URL param or store | Which entry to edit after navigate |
| `currentDate`    | store              | Selected date for /day view        |

### Synchronization

- Banner reactively updates when `timeEntries` changes
- No manual refresh needed
- Modal close triggers store update → banner recalculates

## Error handling

| Scenario                      | Handling                             |
| ----------------------------- | ------------------------------------ |
| Navigation fails              | Log error, stay on current page      |
| Entry deleted before navigate | Banner disappears (no entry to show) |
| Store not yet loaded          | Banner not shown until store ready   |

No user-facing error dialogs (per TT-IG-103).

## Testing strategy

### Manual testing

- Navigate to different pages, verify banner visible
- Click banner, verify navigation and modal opens
- Create 2 running tasks, verify oldest shown first
- End one task, verify next task shown

### E2E tests (Playwright)

- AC-100: Check banner visibility on multiple pages
- AC-101: Click banner, verify URL change
- AC-102: Verify modal opens with correct entry
- AC-103: Two running tasks, verify order
- AC-105: End all tasks, verify banner gone

## Risks / constraints

### Performance

- Derived store recalculates on every timeEntries change
- Acceptable for typical data sizes (<1000 entries)

### UX

- User might be mid-edit when clicking banner
- Mitigation: Navigate away (standard SvelteKit behavior), user can use back button

### Platform

- No platform-specific concerns
- Works on all browsers (uses standard goto/store reactivity)
