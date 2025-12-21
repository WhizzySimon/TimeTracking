# SVELTEKIT_PWA_ADDENDUM.md

## Purpose
This file defines **SvelteKit-specific** implementation rules for building a **PWA** that follows `DEVELOPMENT_GUIDELINES.md`.

It answers: **where things go** and **how to implement them** in SvelteKit without breaking dev workflow or iOS compatibility.

---

## Baseline Assumptions
- Development on Windows.
- PWA must be installable on Android + iOS.
- Offline scope defaults to: **app shell + read-only cached content**.
- No reliance on background execution.
- Deployed over HTTPS.

---

## Adapter Choice (Decide Early)

### Recommended default: Static
Use `@sveltejs/adapter-static` if:
- You don't need a server runtime
- Your backend is separate (or you use external APIs)
- You want simplest hosting

Static is the least moving parts and ideal for “app for my brother”.

### Use Node adapter only if needed
Use `@sveltejs/adapter-node` if:
- You need server routes / SSR runtime on your own server
- You are hosting on a VPS as a Node service

**Rule:** If unsure, start with **static**. Avoid SSR complexity unless required.

---

## File Locations in SvelteKit (Non-negotiable)

### Public / static assets
Put these under:
- `static/`

This ensures they are served at the web root in prod.

Required:
- `static/manifest.webmanifest`
- `static/icons/*` (PWA icons)
- `static/apple-touch-icon.png` (recommended for iOS)
- `static/favicon.png` (or `.ico`)

Example:
static/
manifest.webmanifest
favicon.png
apple-touch-icon.png
icons/
icon-192.png
icon-512.png


---

## Manifest: `static/manifest.webmanifest`
- Use `.webmanifest` extension.
- Keep paths root-relative (start with `/`).
- Ensure `start_url` points to your app entry route, usually `/`.

Mandatory fields:
- `name`, `short_name`
- `start_url`
- `display: "standalone"`
- `icons` (192 + 512)

---

## Add Manifest & Icons in HTML Head

### SvelteKit: `src/app.html`
Add:
- `<link rel="manifest" href="/manifest.webmanifest">`
- iOS icons and meta tags

**Rule:** Any `<head>` changes that must exist for every route belong in `src/app.html`.

Recommended minimum for iOS:
- `apple-touch-icon`
- `theme-color`

---

## Service Worker Strategy (Keep It Simple)

### Offline Minimum
Must cache:
- app shell assets (the built JS/CSS + entry HTML)
- icons + manifest

### Do NOT attempt complex caching first
Avoid:
- runtime caching of every API request
- background sync logic
- anything dependent on background timers

Start with:
- App shell caching
- Optional cache for GET requests to your API (read-only)

---

## Implementing Service Worker in SvelteKit

### Rule: Use a plain service worker in `/static`
Create:
- `static/sw.js`

Why:
- It’s stable, obvious, and independent of SvelteKit internals.
- It works with static and node adapters.

**Important:** SvelteKit does not automatically build/bundle your custom SW in `static/`. You ship it as-is.

---

## Service Worker Registration

### Put registration in `src/routes/+layout.svelte` (client-only)
Register SW on the client:

Rules:
- Must run only in browser.
- Must not run during SSR.
- Must not break dev HMR.

Implementation approach:
- Only register SW in production builds.
- Use `import { dev } from '$app/environment'` and guard on `!dev`.

---

## Dev vs Prod Rules (Critical)
### Never aggressively cache during dev
- In dev, caching can cause “why didn’t my changes show up?” loops.

Rules:
- Only register SW when `!dev`.
- Provide a manual “reset cache” dev helper if needed (optional).

---

## SvelteKit Routing & `start_url`
If you use a non-root start route (e.g. `/app`), set:
- `start_url: "/app"`

Otherwise keep it:
- `"/"`

**Rule:** Must not 404 when opened from home screen.

---

## API / Backend Considerations
- Prefer same-origin calls if hosted together.
- If backend is different origin:
  - configure CORS properly
  - be explicit about caching (don’t cache sensitive responses)

---

## iOS-specific PWA Notes (Implementation-Relevant)
- iOS PWAs can behave differently in standalone mode.
- Avoid fragile viewport logic (`100vh` issues).
- Ensure the app works without relying on background execution.
- Storage can be evicted: design for recovery.

---

## Build & Deploy (Static Adapter)
Typical:
- `npm run build`
- `npm run preview` (local prod test)
Deploy the generated output (adapter-dependent) to HTTPS hosting.

**Rule:** Always test offline using the preview/prod build, not dev server.

---

## Definition of “PWA implemented”
A SvelteKit PWA implementation is considered done when:
- Manifest is served at `/manifest.webmanifest`
- App is installable on Android
- iOS “Add to Home Screen” works
- Service worker is registered in production
- Offline app shell works in production build
