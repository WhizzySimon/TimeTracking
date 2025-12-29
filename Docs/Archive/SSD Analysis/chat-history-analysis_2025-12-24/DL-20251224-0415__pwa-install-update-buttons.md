# PWA Install & Update Buttons Implementation

**Chat Date/Time:** 2025-12-22 21:05 - 2025-12-24 04:15 (UTC+01:00)
**Generated At:** 2025-12-24T04:15:00+01:00
**Chat topic:** Implement in-app PWA install button and service worker update banner
**Workflow used:** /new-task

**Related Docs:**

- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: NONE
- Other referenced docs: DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards
  /SVELTEKIT_PWA_ADDENDUM.md

## Decisions (aus Chat)

- D1: Install button placement in second header row under title bar — Reason: Title bar is tight, need separate row for install/update CTAs — Evidence: "Place the button in the global header area: a second row directly under the title bar (since the title bar is tight)"

- D2: Update banner has priority over install banner — Reason: Updates are more critical than initial install for existing users — Evidence: UI implementation shows `{#if hasUpdate} ... {:else if canInstall}` structure

- D3: Use Svelte stores for install/update state management — Reason: Reactive state needs to be shared and trigger UI updates — Evidence: Created `installState` and `updateAvailable` writable stores in helper modules

- D4: No fallback text when install/update not available — Reason: Clean UI, only show actionable items — Evidence: "No 'how-to' fallback text. If install isn't possible, show nothing"

- D5: Service Worker already had SKIP_WAITING handler — Reason: Previous implementation included message handler, only needed client-side detection — Evidence: `static/sw.js` lines 111-113 already contained `if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();`

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- NONE — No spec/plan/tasks created, implemented as ad-hoc task

### Code Delta (nur aus Chat)

- `src/lib/pwa/install.ts` — NEW — Helper module for PWA install prompt detection and triggering — Evidence: "Create src/lib/pwa/install.ts helper module with install prompt logic"

- `src/lib/pwa/update.ts` — NEW — Helper module for Service Worker update detection and activation — Evidence: "Create src/lib/pwa/update.ts helper module for SW update detection"

- `src/routes/+layout.svelte` — Install button integration in global header — Evidence: "Integrate install button UI in global header (+layout.svelte)"

- `src/routes/+layout.svelte` — Update banner integration with priority over install button — Evidence: "Integrate update banner UI in global header (+layout.svelte)"

- `static/sw.js` — Already had SKIP_WAITING message handler (lines 111-113) — Evidence: Read from repo, handler existed from previous implementation

### Repo-Verified Delta (optional, getrennt!)

- `src/lib/pwa/install.ts` — File exists with setupInstallPrompt(), installState store, triggerInstall() — Evidence: File created in this session

- `src/lib/pwa/update.ts` — File exists with setupUpdateDetection(), updateAvailable store, applyUpdate() — Evidence: File created in this session

- `src/routes/+layout.svelte` — Contains install banner and update banner UI with conditional rendering — Evidence: File modified in this session, lines 238-250

- `static/sw.js` — Contains message event listener with SKIP_WAITING handler at lines 94-114 — Evidence: Read from repo at line 111-113

## Verification (strict)

- Claimed in chat:
  - `npm run verify` — Result: PASS — Evidence: "Verification complete: ALL PASSED" in cascade-output.txt after both implementations

- Verified now in repo (static only):
  - `src/lib/pwa/install.ts` exists — Evidence: File created with 106 lines
  - `src/lib/pwa/update.ts` exists — Evidence: File created with 64 lines
  - `src/routes/+layout.svelte` contains install/update banner code — Evidence: Lines 238-250 show conditional rendering
  - `static/sw.js` contains SKIP_WAITING handler — Evidence: Lines 111-113

## Bugs / Issues mentioned

- NONE

## Follow-ups

- F1: Test install button on Android Chrome after deployment — Owner: User — Priority: High

- F2: Test update banner when new SW version is deployed — Owner: User — Priority: High

- F3: Verify iOS Safari standalone detection works correctly — Owner: User — Priority: Medium

## Tags

tags: pwa, install-button, service-worker, update-banner, ui, ux, android

## Confidence

- High (implementation is clear and complete, verification passed, all requirements explicitly stated in chat)
