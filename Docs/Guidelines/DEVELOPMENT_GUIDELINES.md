# PWA Development Guidelines (Android + iOS)

## Goal

Develop a **Progressive Web App (PWA)** that:

- Works on **Android and iPhone**
- Can be **installed directly from the website**
- Works **offline within a defined scope**
- Is developed **entirely on Windows**
- Requires **no App Store, no Mac, no cloud build**

The app targets **Safari (iOS / WebKit)** and **Chrome (Android / Blink)** compatibility.

---

## Core Principles (Non-Negotiable)

1. **Web-first**
   - Use standard HTML, CSS, and JavaScript
   - No platform-specific hacks unless unavoidable

2. **Safari-first compatibility**
   - Assume **iOS Safari is the strictest environment**
   - If something is questionable, avoid it

3. **Offline is explicit**
   - Offline behavior exists **only where explicitly defined**
   - No assumptions that "the browser will handle it"

4. **Predictability over cleverness**
   - Simple, explicit behavior beats advanced tricks
   - Avoid fragile lifecycle-dependent logic

---

## PWA Requirements (Mandatory)

### 1. Web App Manifest

Provide a valid `manifest.json` including:

- `name`
- `short_name`
- `start_url`
- `display: standalone`
- App icons (at least 192×192 and 512×512)

### 2. Service Worker

A Service Worker **must exist** and must:

- Cache the **app shell** (HTML, CSS, JS)
- Handle offline scenarios explicitly
- Fail loudly and visibly (no silent failures)

### 3. HTTPS

The app **must be served over HTTPS**.  
No HTTPS → no PWA guarantees.

---

## Offline Strategy (Strictly Defined)

### Minimum Offline Guarantee (Required)

When offline:

- App **opens successfully**
- UI loads from cache
- User sees a **clear offline indicator**
- No crashes, reload loops, or blank screens

### Supported Offline Scope

- **Read-only offline access** to previously loaded content
- Cached UI and static assets

### Explicitly Not Guaranteed

- Long-term storage persistence on iOS
- Background sync
- Offline usage after long periods of inactivity

> Storage may be cleared by iOS at any time under system pressure.

---

## Offline Write Policy (Precision Point #1)

Offline **write support is optional and must be explicitly decided**.

### Default Rule

- **No offline writes**
- If offline, block write actions with a clear message

### If Offline Writes Are Added (Optional)

All of the following must be implemented:

- Local persistence using IndexedDB
- Explicit "pending sync" state
- Manual or foreground-triggered sync
- Conflict-safe behavior

If any of these are missing → **offline writes are forbidden**.

---

## Supported Feature Scope (Precision Point #2)

### Allowed / Safe

- Forms
- Dashboards
- Notes / tracking
- Cached read-only data
- Manual refresh actions
- Camera upload (foreground only)
- Local storage / IndexedDB
- Basic push notifications (best-effort)

### Allowed with Caution

- Push notifications (iOS fragile)
- Large local datasets
- Frequent state updates

### Explicitly Avoid

- Background jobs
- Background sync dependencies
- Bluetooth, NFC
- Sensors requiring background access
- Long-running timers
- OS-level integrations
- Assumptions about process persistence

If a feature relies on:

- background execution
- guaranteed storage persistence
- OS hooks

👉 **It does not belong in this project.**

---

## Browser & Platform Constraints

### iOS (Safari / WebKit)

- All PWAs run on WebKit
- Known constraints:
  - Aggressive memory cleanup
  - Limited background execution
  - Storage eviction under pressure
- Design accordingly:
  - Stateless UI where possible
  - Explicit reload recovery
  - No reliance on background activity

### Android (Chrome)

- More permissive
- Do **not** rely on Android-only behavior
- Chrome success ≠ iOS success

---

## CSS Rules

Avoid:

- Fragile `position: fixed` layouts
- Uncontrolled `100vh` usage

Prefer:

- Flexbox / Grid
- Responsive units
- Safe viewport handling

Test:

- Portrait orientation
- Small viewport heights
- Standalone (installed) mode

---

## JavaScript Rules

- Use stable browser APIs only
- All async operations must:
  - handle network failure
  - handle reload
  - fail gracefully
- No assumptions about:
  - background execution
  - long-lived processes

---

## Storage Rules

Allowed:

- `localStorage` (small, non-critical state)
- `IndexedDB` (structured app data)

Always assume:

- Storage **can disappear**
- Data must be recoverable or re-fetchable

Never assume:

- Long-term persistence on iOS
- Unlimited capacity

---

## Testing Rules (Without iPhone)

Mandatory:

- Android Chrome (real device)
- Desktop Chrome
- Desktop Safari (responsive mode)

Before declaring "done":

- App loads
- App installs
- App opens offline
- Core flows work without reload loops
- Standalone mode works correctly

---

## Installation Flow (User Experience)

### Android

- Browser shows "Install app" prompt

### iPhone

- Safari → Share → "Add to Home Screen"
- App launches fullscreen
- No browser UI visible

Standalone behavior **must be correct**.

---

## Non-Goals (Explicitly Excluded)

- Native App Store submission
- Xcode or macOS tooling
- Deep OS integrations
- Background execution guarantees
- Platform-specific forks

---

## Definition of Done

The app is complete when:

- Works on Android
- Works on iPhone Safari
- Installs as a PWA
- Opens offline
- Degrades gracefully
- Requires no Mac or App Store tooling

---

## Final Rule

If a feature:

- Requires a Mac
- Requires Xcode
- Requires App Store tooling

👉 **It does not belong in this project.**
