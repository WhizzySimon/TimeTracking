# Cloud Sync Implementation Plan

**Spec reference**: `Docs/Specs/cloud-backup-and-auth.md`

## Architecture Overview

### Components

| Component | Responsibility |
|-----------|----------------|
| `src/lib/backup/cloud.ts` | Core sync logic: `syncWithCloud()`, `determineSyncAction()` |
| `src/lib/backup/snapshot.ts` | Export/import snapshots (already exists) |
| `src/lib/backup/restore.ts` | NEW: Import cloud snapshot to IndexedDB |
| `src/lib/stores/index.ts` | Reactive sync state store |
| `src/routes/+layout.svelte` | Sync button UI, conflict dialog |

### Data Flow

```
User clicks "Synchronisieren"
        ↓
syncWithCloud()
        ↓
┌───────────────────────────────────┐
│ 1. Fetch cloud snapshot + updated_at │
│ 2. Read local meta                    │
│ 3. determineSyncAction()              │
└───────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│ Action: upload | restore | conflict | noop │
└─────────────────────────────────────────┘
        ↓
Execute action → Update local meta → Done
```

## Data Model

### Local Metadata (IndexedDB `meta` store)

```typescript
interface CloudSyncMeta {
  key: 'cloudSyncMeta';
  lastSyncAt: string | null;           // ISO timestamp of last successful sync
  lastCloudUpdatedAt: string | null;   // Cloud's updated_at at last sync
  localChangedAt: string | null;       // When local data last changed (set by markLocalChanged)
}
```

### Cloud Table (already exists)

```sql
user_backups (
  user_id uuid PRIMARY KEY,
  snapshot jsonb NOT NULL,
  schema_version int NOT NULL,
  updated_at timestamptz NOT NULL
)
```

## Sync Decision Logic

```typescript
type SyncAction = 'upload' | 'restore' | 'conflict' | 'noop';

function determineSyncAction(
  localMeta: CloudSyncMeta | null,
  cloudUpdatedAt: string | null,
  cloudHasData: boolean
): SyncAction {
  const isFreshInstall = !localMeta?.lastSyncAt && !localMeta?.localChangedAt;
  
  // Fresh install: always restore if cloud has data
  if (isFreshInstall && cloudHasData) {
    return 'restore';
  }
  
  // Never synced, no cloud data: upload
  if (!cloudHasData) {
    return 'upload';
  }
  
  const localChanged = localMeta?.localChangedAt != null;
  const cloudChanged = cloudUpdatedAt != null && 
    (localMeta?.lastCloudUpdatedAt == null || 
     new Date(cloudUpdatedAt) > new Date(localMeta.lastCloudUpdatedAt));
  
  if (localChanged && cloudChanged) {
    return 'conflict';
  }
  if (localChanged) {
    return 'upload';
  }
  if (cloudChanged) {
    return 'restore';
  }
  return 'noop';
}
```

## UI State Model

### Stores

```typescript
// In src/lib/stores/index.ts
export const syncInProgress = writable<boolean>(false);
```

### Button State

- **Enabled**: `$isOnline && $isAuthenticated && !$syncInProgress`
- **Disabled**: Otherwise
- **Label**: Always "Synchronisieren"

### Dialogs

1. **Offline dialog**: "Offline — Synchronisierung nicht möglich. Deine Änderungen sind lokal gespeichert."
2. **Conflict dialog**: "Lokale und Cloud-Daten unterscheiden sich. Welche Version behalten?" → "Lokal behalten" / "Cloud behalten"
3. **Error dialog**: Dynamic error message from sync failure

## Error Handling

| Error | Handling |
|-------|----------|
| Network failure | Show error dialog, no data change |
| Supabase error | Show error dialog with message |
| Import failure | Rollback not possible (IndexedDB), show error |

## Testing Approach

### Manual Testing Scenarios

1. **Fresh install + cloud has data** → Verify restore happens
2. **Local changes, cloud unchanged** → Verify upload happens
3. **Cloud changed, local unchanged** → Verify restore happens
4. **Both changed** → Verify conflict dialog appears
5. **Offline click** → Verify offline dialog appears
6. **After sync** → Verify meta updated correctly

### Unit Tests

- `determineSyncAction()` with all combinations
- `exportSnapshot()` / `importSnapshot()` roundtrip

## Performance Constraints

- Sync should complete in < 5s on typical data size
- No blocking UI during sync (button shows loading state)

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/backup/cloud.ts` | Refactor to 2-way sync |
| `src/lib/backup/restore.ts` | NEW: Import snapshot to IndexedDB |
| `src/lib/stores/index.ts` | Add `syncInProgress` store, remove `backupNeeded` |
| `src/routes/+layout.svelte` | Update button, add conflict dialog |
| `src/lib/storage/operations.ts` | Keep `markLocalChanged()` calls |
