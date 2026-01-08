# Cloud Auth + Cloud Sync Spec (Netlify + Supabase)

## Goal

Make authentication real (email + password + password recovery email), and add a reliable **2-way cloud sync** feature for a single-user app:

- Local data is always saved immediately to IndexedDB.
- Cloud sync is manual via a button (no background sync requirement).
- **2-way sync**: Automatically determines which side (local or cloud) has newer data and syncs accordingly.
- Use Netlify for hosting the frontend.
- Use Supabase for Auth + Database.

## Current state (from Cascade report)

- Auth is currently a mock/stub.
- UI pages exist for login/signup/forgot password.
- Session is stored in IndexedDB.
- `src/lib/api/auth.ts` has mock functions and TODOs.
- No Supabase/Netlify Identity/JWT hashing libs currently integrated.

## Hosting decision

- Frontend: Netlify
- Backend: Supabase (Auth + Postgres)

Important:

- We can still keep the frontend as a static build on Netlify because auth + backup are handled by Supabase over HTTPS.
- We do NOT need Netlify Functions for the basic backup if we write to Supabase using the user’s session and RLS.
- Only add Netlify Functions later if we need server-only secrets or custom server logic.

## Authentication requirements

- Email + password sign up
- Email + password sign in
- Password reset email (Supabase-managed flow)
- No OAuth/social login

Implementation:

- Replace the mock API in `src/lib/api/auth.ts` with real Supabase calls.
- Replace the custom “session in IndexedDB” logic so it reflects the Supabase session.
  - We may keep local session caching for UX, but source of truth is Supabase.

## Cloud Sync Requirements (2-Way)

### Core Sync Logic

The sync is **bidirectional**: it automatically determines which side has newer/valid data and acts accordingly.

**Decision algorithm** (on sync button click):

1. Fetch cloud snapshot with `updated_at` timestamp
2. Read local meta: `localChangedAt`, `lastSyncAt`, `lastCloudUpdatedAt`
3. Determine sync direction:

| Local State                          | Cloud State          | Action                      |
| ------------------------------------ | -------------------- | --------------------------- |
| Empty (fresh install)                | Has data             | **Restore from cloud**      |
| Has data, no changes since last sync | Same as last sync    | **Already synced** (no-op)  |
| Has data, changes since last sync    | Same as last sync    | **Upload to cloud**         |
| Has data, no changes since last sync | Newer than last sync | **Restore from cloud**      |
| Has data, changes since last sync    | Newer than last sync | **Conflict** → user decides |

**Critical edge case** (fresh install / cache cleared):

- `localChangedAt` = null AND `lastSyncAt` = null → treat as "fresh install"
- If cloud has data → **always restore from cloud** (never overwrite cloud with empty local)

### UX

**Button label**: "Synchronisieren" (single label, no state-dependent text)

**Button behavior**:

- Enabled when: online AND authenticated
- Disabled when: offline OR syncing in progress OR not authenticated
- On click: Execute sync algorithm silently, show error dialog only on failure

**No user-facing sync direction indicator**: The app always does the right thing automatically. User doesn't need to know if it's uploading or downloading.

**Conflict handling** (both sides changed since last sync):

- Show dialog: "Lokale und Cloud-Daten unterscheiden sich. Welche Version behalten?"
- Options: "Lokal behalten" / "Cloud behalten"
- Selected version overwrites the other

**Offline handling**: On click when offline, show modal: "Offline — Synchronisierung nicht möglich. Deine Änderungen sind lokal gespeichert."

### Data model (Supabase)

Create a table to store one snapshot per user.

Table: `user_backups`

- user_id uuid PRIMARY KEY references auth.users(id)
- snapshot jsonb NOT NULL
- schema_version int NOT NULL default 1
- updated_at timestamptz NOT NULL default now()

Store the full snapshot in `snapshot` as JSONB.

### Security (RLS)

Enable Row Level Security and ensure:

- Users can SELECT only their own row
- Users can INSERT/UPDATE only their own row (user_id = auth.uid())

No service-role key in the client.

### Snapshot content

Snapshot must include all persisted app state:

- tasks/categories
- settings / models
- time entries
- any other tables currently stored in IndexedDB

Also include:

- snapshot_meta: { schemaVersion, exportedAt, appVersion }

### Client behavior

**Local metadata** (stored in IndexedDB `meta` store):

```typescript
interface CloudSyncMeta {
	key: 'cloudSyncMeta';
	lastSyncAt: string | null; // When last successful sync completed
	lastCloudUpdatedAt: string | null; // Cloud's updated_at at last sync
	localChangedAt: string | null; // When local data last changed
}
```

**Sync flow**:

1. Fetch cloud row: `SELECT snapshot, updated_at FROM user_backups WHERE user_id = auth.uid()`
2. Read local meta
3. Determine action per decision table above
4. Execute action:
   - **Upload**: Export local snapshot → upsert to cloud → update local meta
   - **Restore**: Import cloud snapshot to IndexedDB → update local meta
   - **Conflict**: Show dialog → user picks → execute chosen action
5. On success: Update `lastSyncAt`, `lastCloudUpdatedAt`, `schemaVersion`, `exportedAt`, and `appVersion` in local meta
6. On error: Show error dialog with reason

## Work plan for Cascade

See `Docs/Plans/cloud-sync.md` and `Docs/Tasks/cloud-sync.md` for detailed implementation plan.

## Verification checklist

Auth:

- Sign up works and creates user
- Login works
- Logout works
- Forgot password sends email and allows reset
- Guards redirect correctly

Sync:

- Local saves always work offline (IndexedDB)
- Clicking "Synchronisieren" while offline shows modal and does NOT error
- Fresh install with cloud data → restores from cloud
- Local changes + no cloud changes → uploads to cloud
- No local changes + cloud newer → restores from cloud
- Both changed → shows conflict dialog, user choice is applied
- After sync, `lastSyncAt` and `lastCloudUpdatedAt` are updated

## Change Log

- **2025-12-23**: Evolved from 1-way backup to 2-way sync. Added conflict detection, fresh-install handling, renamed button to "Synchronisieren".
