# Cloud Auth + Cloud Backup Spec (Netlify + Supabase)

## Goal

Make authentication real (email + password + password recovery email), and add a simple, reliable “cloud backup” feature for a single-user app:

- Local data is always saved immediately to IndexedDB.
- Cloud backup is manual via a button (no background sync requirement).
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

## Cloud backup requirements

### UX

- Add a globally visible button: label = "Save to cloud" (final label can be adjusted).
- Do not disable/grey it out when offline.
- On click:
  - If offline: show a modal dialog: "Offline — can't back up now. Your changes are saved locally. Try again when online."
  - If online: upload a full snapshot of the local database.
- Show "Last cloud backup: <timestamp>" near the button.
- (Optional) In settings: "Restore from cloud" which overwrites local after confirmation.

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

- Export snapshot from IndexedDB in one operation.
- Upload via Supabase client (recommended) using the logged-in user session.
- On success:
  - Store `lastCloudBackupAt` locally (for UI)
- On error:
  - Show a clear error dialog/toast with the reason.

## Work plan for Cascade

1. Add Supabase client:
   - Add dependency: `@supabase/supabase-js`
   - Add `src/lib/supabase/client.ts` for creating the Supabase client.
   - Add env vars:
     - PUBLIC_SUPABASE_URL
     - PUBLIC_SUPABASE_ANON_KEY

2. Implement real auth:
   - Update `src/lib/api/auth.ts` to call Supabase auth methods.
   - Update auth store/guard logic to use Supabase session.
   - Implement forgot password flow with Supabase.
   - Remove/disable “always succeeds” mock behavior.

3. Implement cloud backup:
   - Create snapshot exporter from IndexedDB.
   - Create `backup.ts` with `saveToCloud()` and (optional) `restoreFromCloud()`.
   - Add global “Save to cloud” button and last-sync timestamp UI.
   - Offline modal behavior.

4. Supabase SQL + RLS:
   - Provide a SQL migration file or documented SQL steps to:
     - create `user_backups` table
     - enable RLS
     - create policies

5. Testing + documentation updates:
   - Update implementation progress tracking:
     - Add a feature item: "Supabase auth real" + "Cloud backup snapshot"
     - Record manual verification steps + results
   - Check for any other planning/spec/task docs that track features; update them too.

## Verification checklist

Auth:

- Sign up works and creates user
- Login works
- Logout works
- Forgot password sends email and allows reset
- Guards redirect correctly

Backup:

- Local saves always work offline (IndexedDB)
- Clicking "Save to cloud" while offline shows modal and does NOT error
- Clicking while online creates/updates snapshot row in Supabase
- "Last cloud backup" updates
- (Optional) Restore overwrites local only after confirmation
