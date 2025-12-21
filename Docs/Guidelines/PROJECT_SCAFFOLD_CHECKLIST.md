# PROJECT_SCAFFOLD_CHECKLIST.md

## Purpose
One-page checklist to ensure the project scaffolding meets the PWA spec and is ready to hand over.

---

## A) Environment Setup
- [ ] Node.js LTS installed (`node -v` works)
- [ ] Project created with `npm create svelte@latest`
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Repo initialized (`git init`, first commit done)

---

## B) Required Project Docs
- [ ] `DEVELOPMENT_GUIDELINES.md` exists in project root
- [ ] `SVELTEKIT_PWA_ADDENDUM.md` exists in project root
- [ ] This file (`PROJECT_SCAFFOLD_CHECKLIST.md`) exists in project root

---

## C) PWA Skeleton Files Exist
- [ ] `static/manifest.webmanifest`
- [ ] `static/icons/icon-192.png`
- [ ] `static/icons/icon-512.png`
- [ ] `static/apple-touch-icon.png` (recommended)
- [ ] `static/sw.js`

---

## D) Head Tags Wired
In `src/app.html`:
- [ ] `<link rel="manifest" href="/manifest.webmanifest">`
- [ ] iOS icon link present (`apple-touch-icon`)
- [ ] `theme-color` present (optional but recommended)

---

## E) Service Worker Registration Rules
- [ ] SW registration exists in a client-only location (e.g. `+layout.svelte`)
- [ ] SW registers **only in production** (`!dev`)
- [ ] Dev workflow not broken (no caching issues during `npm run dev`)

---

## F) Local Production Test (Mandatory)
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] In preview/prod build:
  - [ ] Manifest loads: open `/manifest.webmanifest`
  - [ ] Service worker active in browser devtools
  - [ ] App loads with network offline (app shell works)

---

## G) Installation Tests
### Android (Chrome)
- [ ] "Install app" available
- [ ] Installed app opens in standalone mode
- [ ] Reload works (no redirect loops)
- [ ] Offline app shell works after first load

### iPhone (Safari) — to be done by your brother
- [ ] Open URL in Safari
- [ ] Share → Add to Home Screen
- [ ] Installed app opens in standalone mode
- [ ] First load works
- [ ] Offline app shell works after first load

---

## H) Final Handover
- [ ] Deployed to HTTPS URL
- [ ] Brother receives URL + iPhone install steps (Safari Share → Add to Home Screen)
- [ ] Brother confirms basic flow works on iPhone
