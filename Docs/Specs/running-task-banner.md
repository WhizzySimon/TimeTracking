# running-task-banner — Spec

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- ui-logic-spec-v1.md Section 3.1 (Hinweisbanner)

**Does not depend on:**

- subscription-plans.md (banner is Free tier feature)

---

## 1) Goal / Problem

Users forget to stop running tasks. The current "Aufgabe läuft noch" banner only appears on the /day page and is not clickable. Users need to manually navigate to the correct date and find the task. When multiple tasks are left running across different days, there's no way to resolve them sequentially.

## 2) Scope

### In scope

- Move banner to global layout (visible on all pages)
- Make banner clickable → navigate to task's date and open edit modal
- Support multiple running tasks (show oldest first, then next when resolved)
- Banner disappears immediately when all running tasks have end times

### Out of scope

- Push notifications / browser notifications
- Automatic task ending
- Sound alerts
- Email reminders

### What we don't want

- Multiple banners stacked (only show one banner at a time)
- Complex queue management UI (just iterate through tasks on click)
- Modal asking "which task to fix?" (auto-navigate to oldest)

## 3) Functional Requirements (FR)

- **TT-FR-100**: Banner MUST be visible on all authenticated pages (not just /day)
- **TT-FR-101**: Banner MUST be clickable
- **TT-FR-102**: On click, navigate to `/day` with the running task's date set as `currentDate`
- **TT-FR-103**: On click, open AddTaskModal in edit mode for the running task
- **TT-FR-104**: When multiple tasks have `endTime === null`, show banner for the OLDEST task (by `createdAt`)
- **TT-FR-105**: When the current running task gets an end time, check for remaining running tasks and show banner for next oldest
- **TT-FR-106**: Banner disappears immediately when zero tasks have `endTime === null`
- **TT-FR-107**: Banner text remains "Aufgabe läuft noch (keine Endzeit)" (unchanged)

## 4) Implementation Guarantees (IG)

- **TT-IG-100**: Banner component remains stateless (receives data via props/stores)
- **TT-IG-101**: Running tasks derived from global `timeEntries` store (no separate store)
- **TT-IG-102**: Navigation uses SvelteKit's `goto()` function
- **TT-IG-103**: No browser `confirm()` or `alert()` dialogs
- **TT-IG-104**: Banner click does not interrupt unsaved work on current page

## 5) Design Decisions (DD)

- **TT-DD-100**: Show OLDEST running task first (not newest) because older forgotten tasks are more urgent
- **TT-DD-101**: Use existing `WarningBanner` component with added click handler (minimal change)
- **TT-DD-102**: Banner placed in `+layout.svelte` after header, before main content (same position as update/install banners)

## 6) Edge cases

- **No running tasks**: Banner not rendered
- **One running task**: Banner shows, click navigates to that task
- **Multiple running tasks**: Banner shows oldest, fixing it reveals next oldest
- **Running task on today**: Click still navigates (sets currentDate to today, opens modal)
- **User already on /day viewing the running task's date**: Just open the modal
- **Modal already open**: Close current modal, open for running task (or: just navigate, let page handle)

## 7) Data & privacy

- No new data stored
- Uses existing `timeEntries` store (already in IndexedDB)
- No external API calls

## 8) Acceptance checks (testable)

- [ ] AC-100: Banner visible on /day, /add, /analysis, /settings pages when running task exists (FR-100)
- [ ] AC-101: Clicking banner navigates to running task's date (FR-102)
- [ ] AC-102: After navigation, AddTaskModal opens with running task pre-filled (FR-103)
- [ ] AC-103: With 2 running tasks (dates A older, B newer), banner click goes to A first (FR-104)
- [ ] AC-104: After ending task A, banner shows for task B without page reload (FR-105)
- [ ] AC-105: After ending all running tasks, banner disappears immediately (FR-106)
- [ ] AC-106: No console errors during banner click navigation (IG-102)

## 9) Change log

**[2025-12-27 14:55]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (TT-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (TT-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
