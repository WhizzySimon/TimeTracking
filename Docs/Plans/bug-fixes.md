# bug-fixes — Plan

**Phase:** A6  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/bug-fixes.md`

---

## Architecture / Modules

### Modified Files

- `src/lib/sync/engine.ts` — Fresh login detection, auto-sync logic
- `src/lib/sync/conflict.ts` — Smart conflict resolution
- `src/lib/storage/db.ts` — Add updatedAt to all entities
- `src/routes/day/+page.svelte` — Task list layout fix
- `src/lib/components/TaskItem.svelte` — Button alignment

---

## Data Model

### Updated Entities

All syncable entities get `updatedAt` field:

```typescript
interface TimeEntry {
  // existing fields...
  updatedAt: number; // UTC milliseconds
}

interface Category {
  // existing fields...
  updatedAt: number;
}

interface WorkTimeModel {
  // existing fields...
  updatedAt: number;
}
```

### IndexedDB Migration

- Add `updatedAt` to existing entries: `updatedAt = createdAt`
- Version bump for migration

---

## Sync Logic

### Fresh Login Detection

```typescript
function isFreshLogin(): boolean {
  const entries = await getAll('timeEntries');
  const categories = await getAll('categories');
  return entries.length === 0 && categories.length === 0;
}
```

### Auto-Sync Flow

1. On login success, check `isFreshLogin()`
2. If fresh: pull all from cloud, no conflict check
3. If not fresh: normal sync with conflict resolution

### Conflict Resolution Algorithm

```typescript
function resolveConflict(local: Entry, cloud: Entry): Entry {
  // Same entry modified on both sides
  if (local.updatedAt > cloud.updatedAt) {
    return local; // Local is newer
  } else if (cloud.updatedAt > local.updatedAt) {
    return cloud; // Cloud is newer
  } else {
    // Same timestamp (rare): prefer cloud for stability
    return cloud;
  }
}
```

---

## UI State Model

### Task List Layout

```css
.task-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}

.task-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-actions {
  flex-shrink: 0;
  width: 40px; /* Fixed width for button */
}
```

---

## Error Handling

| Error | Handling | User Feedback |
|-------|----------|---------------|
| Fresh sync fails | Show error, allow retry | "Synchronisierung fehlgeschlagen. Erneut versuchen?" |
| Conflict resolution fails | Log, keep both versions | Console log only |
| Network error during sync | Queue for later | Sync indicator shows pending |

---

## Testing Strategy

### Unit Tests

- `isFreshLogin()` detection
- `resolveConflict()` for all cases (local newer, cloud newer, same time)
- `updatedAt` added on save

### E2E Tests

- Fresh login → auto-sync from cloud
- Multi-device: modify on device A, sync, modify on device B, sync
- Resume button alignment on narrow viewport

### Manual Testing

- Test on actual iPhone SE
- Test multi-device scenario with real Supabase

---

## Risks / Constraints

- **Clock skew:** Device clocks may differ
  - Mitigation: Use server timestamp for cloud writes
- **Race conditions:** Simultaneous edits
  - Mitigation: Last-write-wins is acceptable for this app

---

## Tasks

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| A6.1 | Add updatedAt to all entity types | 1h | - |
| A6.2 | IndexedDB migration for updatedAt | 1h | A6.1 |
| A6.3 | Update save functions to set updatedAt | 1h | A6.1 |
| A6.4 | Fresh login detection function | 1h | - |
| A6.5 | Auto-sync on fresh login | 2h | A6.4 |
| A6.6 | Conflict resolution with timestamps | 2h | A6.3 |
| A6.7 | Integrate conflict resolution into sync engine | 2h | A6.6 |
| A6.8 | Fix TaskItem layout (CSS grid) | 1h | - |
| A6.9 | Test on 320px viewport | 0.5h | A6.8 |
| A6.10 | E2E tests for sync scenarios | 2h | A6.1-A6.7 |
| A6.11 | E2E tests for button alignment | 0.5h | A6.8 |

**Total estimate:** ~14 hours
