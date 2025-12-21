
---

# TimeTracker v1 – Technical Guideline

**Offline-First PWA with Cloud Backup (No SSR, No E2EE)**

---

## 0) Goal and Constraints

### Primary Goal

Build a **true offline-installable PWA** for daily time tracking (tasks + time entries).

### Target Use

* Initially: personal use (my brother)
* Should support future multi-user use without changing fundamentals

### Core Requirements

* Works offline after installation
* Data is saved locally immediately
* Automatic cloud backup when online **and app is open**
* Very low user friction (login once, then invisible)
* Password recovery supported
* Simple deployment, no SSR
* Encryption “like most companies do” (TLS + server-side at-rest encryption)
* **No end-to-end encryption**

### Accepted Limitation

If the app is fully closed and the phone is offline, background uploads cannot be guaranteed on iOS PWAs.
Unsynced data may be lost if the device is lost before next successful sync.
This risk is accepted and mitigated via sync indicators and aggressive syncing while the app is open.

---

## 1) App Architecture

### Rendering Model

* **SPA (Single-Page Application)**
* Client-side routing only

### SvelteKit Configuration

* **SSR disabled globally**

  * Create `src/routes/+layout.js`
  * Put this inside:

    * export const ssr = false;
    * export const csr = true;
* Use **adapter-static**

  * Output: static HTML/CSS/JS
  * No Node server required for frontend hosting

---

## 2) PWA (Offline & Installable)

### Install Model

* User visits URL once (online)
* Browser offers “Install”
* After install, app works offline (app shell cached)

### Service Worker Role

* Cache application shell (HTML, JS, CSS, icons, manifest)
* Enable offline startup
* Not responsible for app UI logic or business logic

### Caching Strategy (v1)

* App shell: cache-first (to ensure offline start)
* API calls (sync): network-only or network-first (never rely on cache for authoritative sync)
* Keep rules simple and predictable

---

## 3) Local Storage Strategy

Different storages exist for different purposes.

### 3.1 IndexedDB (Primary Storage)

Store:

* Tasks
* Time entries
* Metadata needed for UI
* Sync outbox queue (pending uploads)

Reason:

* Async
* Structured
* Scales well
* Best durability available in web platform storage

### 3.2 Cache Storage (Service Worker Cache)

Store:

* App shell assets (JS/CSS/icons/manifest) to enable offline app startup

### 3.3 localStorage (Minimal Use)

Use only for:

* Tiny UI preferences (e.g. last selected tab)

Never store:

* Passwords
* Session tokens (prefer IndexedDB)
* Sensitive user data

---

## 4) Cloud Backup / Sync (Offline-First)

### 4.1 Principles

* Local-first writes: never block the user on network
* Eventual backup: upload when online and app open
* No assumption of background sync when app is closed (especially on iOS)

### 4.2 Outbox Queue Pattern

Maintain an `outbox` table in IndexedDB.

On every local change:

1. Commit the change to main local tables
2. Append a corresponding outbox entry describing what must be uploaded

Outbox record example fields:

* id (UUID)
* createdAt
* type (task_upsert, entry_upsert, task_delete, entry_delete, etc.)
* payload (minimal JSON needed to reproduce change)
* status (pending, sending, acked)
* optional retryCount, lastError

### 4.3 Sync Triggers (Client-Side Only)

Sync runs when:

* App starts / opens
* After each save if online
* Connectivity returns (online event)
* App returns to foreground (visibility change to visible)
* Optional: retry timer while app is open and outbox not empty (e.g., every 30–60 seconds)

### 4.4 Sync Algorithm (Simple and Reliable)

1. If not authenticated: skip sync
2. If outbox empty: done
3. Upload outbox items in chronological order (batch recommended)
4. Server returns ACK for items accepted
5. On ACK: remove or mark outbox items as synced
6. On failure: stop and retry on next trigger (do not lose outbox items)

### 4.5 Backend API (Minimum)

Auth:

* POST /auth/signup (email, password)
* POST /auth/login
* POST /auth/forgot
* POST /auth/reset

Sync:

* POST /sync/push (batched outbox events)
* GET /sync/pull (optional for later restore and multi-device support)

v1 focus: push-only cloud backup is sufficient. Pull/merge can come later.

### 4.6 Planned UI Feedback (Not in scope now, but must be supported)

* Clear status indicator:

  * Synced ✅ (no pending outbox)
  * Not backed up ⚠️ (outbox pending)
* Avoid silent risk during offline periods

---

## 5) Authentication

### Chosen Design

Standard web auth (Design 1):

* Email as username
* Password
* Password reset via email
* Server stores password hash only (no raw password)
* Client uses a session token (JWT or opaque)

No end-to-end encryption and no recovery keys.

### 5.1 Password Manager Compatibility

To encourage auto-save / auto-fill:

* Use a real login form
* Set autocomplete:

  * username field: autocomplete=username
  * login password: autocomplete=current-password
  * signup password: autocomplete=new-password
* Do not disable autocomplete

Goal: user enters password once; OS/browser password manager handles the rest.

### 5.2 Session Token Storage

* Prefer storing token in IndexedDB (or in memory plus refresh flow if implemented)
* Avoid localStorage for tokens

---

## 6) Encryption Strategy (Most companies do this)

### What We Do

* TLS/HTTPS for all communication (mandatory)
* Encryption at rest on the server (server-managed keys)
* Password reset supported (account recoverable)

### What This Protects Against

* Leaked database backups or snapshots
* Disk theft
* Accidental exposure of raw DB dumps

### What This Does Not Protect Against

* Full server compromise where attacker gets app secrets or keys
* Malicious admin with key access

This trade-off is accepted for v1.

---

## 7) Deployment

### Frontend

* Static hosting (adapter-static)
* HTTPS required (PWA and service worker)

### Backend

* Separate API service
* Handles auth, sync, password reset emails
* Must support CORS if hosted on a different domain than frontend

---

## 8) Explicit Non-Goals for v1

* No SSR
* No end-to-end encryption
* No recovery key
* No guaranteed background sync while app is closed
* No multi-device conflict resolution or merges (push-only backup first)
* No manual export/import as primary backup (optional emergency later)

---

## 9) v1 Acceptance Criteria

* Installable PWA on phone
* Fully functional offline:

  * create/edit tasks and entries offline
  * data persists locally
* Automatic backup when online and app open:

  * outbox uploads successfully
  * visible sync status supported
* Login once, then frictionless via password manager
* Password reset via email works
* Server reliably stores backed-up data

---

## 10) Future (Not v1)

* Restore from cloud flow (download and rehydrate local DB)
* Multi-device sync
* Conflict resolution strategy (versioning/merging)
* Optional export/import as emergency fallback
* Optional best-effort request for persistent storage (to reduce eviction risk)

---

END OF DOCUMENT — TimeTracker v1 Technical Guideline
