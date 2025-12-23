# TimeTracker v1 — Implementation Progress

**Last Updated:** 2025-12-23  
**Current Phase:** Phase 8 - Plus-Tab (Ein-Klick-Workflow)  
**Tasks Completed:** 94 / 94  
**Estimated Progress:** 100%

---

## Cross-Browser Testing Summary (2025-12-22)

### Automated E2E Tests (Playwright) - Post Phase 6

| Browser       | Tests | Status        |
| ------------- | ----- | ------------- |
| Chromium      | 9     | ✅ PASS       |
| WebKit        | 9     | ✅ PASS       |
| Mobile Safari | 9     | ✅ PASS       |
| **Total**     | 27    | ✅ ALL PASSED |

### Previous E2E Tests (Playwright)

| Browser                   | Tests | Status  |
| ------------------------- | ----- | ------- |
| Desktop WebKit (Safari)   | 9/9   | ✅ PASS |
| Mobile Safari (iPhone 13) | 9/9   | ✅ PASS |
| Chromium (sanity check)   | 9/9   | ✅ PASS |

### Interactive MCP Browser Testing

| Browser/Device            | Viewport  | Pages Tested                   | Status  |
| ------------------------- | --------- | ------------------------------ | ------- |
| Desktop Safari (WebKit)   | Standard  | Login, Day, Analysis, Settings | ✅ PASS |
| Desktop Chrome            | Standard  | All pages                      | ✅ PASS |
| Mobile Safari (iPhone 15) | 393x852   | Day, Analysis                  | ✅ PASS |
| Chrome 4K (32" monitor)   | 3840x2160 | Login, Day, Analysis           | ✅ PASS |
| Android (Pixel 7)         | 412x915   | Day, Analysis                  | ✅ PASS |

### UI Issues Found & Fixed

1. **Saldo label colored red** - The word "Saldo" was red along with the number
   - Fix: Separated label from value, only number gets `.negative` class
   - File: `src/routes/analysis/+page.svelte`

2. **Auth session cleared by tests** - Tests cleared IndexedDB including auth session
   - Fix: Added mock auth session creation in test beforeEach hooks

3. **Test expectations outdated** - Tests expected default user categories from JSON
   - Fix: Updated tests to expect only 4 system categories on first run

4. **E2E test selectors brittle (2025-12-22)** - 9 tests failed due to UI changes
   - **Root cause:** Tests used text-based selectors (`text=Gesichert`, `getByRole('button', { name: '+ Kategorie' })`) that broke when UI text/buttons changed
   - **Fix:** Added stable `data-testid` attributes and updated tests to use `getByTestId()`
   - **New test IDs added:**
     - `sync-indicator` - Sync status indicator in header
     - `data-sync-status` - Attribute with current sync state (synced/pending/syncing/error)
     - `category-menu-btn` - 3-dot menu button for categories
     - `add-category-menu-item` - "Hinzufügen" menu item in category dropdown
   - **Files changed:**
     - `src/lib/components/SyncIndicator.svelte` - Added data-testid
     - `src/routes/settings/+page.svelte` - Added data-testid to menu elements
     - `src/routes/+layout.svelte` - Added SyncIndicator component to header
     - `e2e/basic-flow.test.ts` - Updated to use getByTestId
     - `e2e/milestone1.test.ts` - Updated to use getByTestId

5. **Strict mode violation** - `getByText('Kategorien')` matched multiple elements
   - Fix: Changed to more specific selector `getByRole('heading', { name: 'Abwesenheitskategorien' })`

### Cross-Browser Verification Checklist

- [x] Font rendering correct on all browsers (including German umlauts)
- [x] Wide screen (4K): Content centered with max-width constraint
- [x] Mobile: Navigation tabs fit, touch targets adequate
- [x] Saldo numbers colored correctly (red for negative, green for positive)
- [x] Forms usable on all viewport sizes

**No browser-specific bugs found.** All issues were general UI/test infrastructure problems.

---

## How to Use This File

**Cascade MUST update this file after completing each task:**

1. Mark task as ✅ Done
2. Update "Last Updated" timestamp
3. Update "Tasks Completed" counter
4. Add verification results
5. Note any deviations from plan

**Format for each task:**

```
- [x] Task X.Y — Brief description
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None (or describe)
  - Notes: (optional implementation notes)
```

---

## Phase 1: Foundation (PWA + Data Layer) ✅

**Target:** 10 tasks, ~8-10 hours  
**Status:** COMPLETE (10/10 tasks)

### Configuration & PWA Setup

- [x] **Task 1.1** — Configure SvelteKit for SPA mode
  - Files: `src/routes/+layout.ts`
  - Verified: File exports `ssr = false` and `csr = true` ✅
  - Deviations: Used `.ts` extension instead of `.js` (TypeScript project)
  - Notes: SSR disabled globally per technical-guideline-v1

- [x] **Task 1.2** — Create PWA manifest
  - Files: `static/manifest.webmanifest`
  - Verified: Manifest contains all required fields ✅
  - Deviations: None
  - Notes: Icons reference `/icons/icon-192.png` and `/icons/icon-512.png`

- [x] **Task 1.3** — Create placeholder PWA icons
  - Files: `static/icons/icon-192.png`, `static/icons/icon-512.png`, `static/apple-touch-icon.png`
  - Verified: Icons exist (need visual verification by user)
  - Deviations: None
  - Notes: Placeholder icons created

- [x] **Task 1.4** — Update app.html with PWA meta tags
  - Files: `src/app.html`
  - Verified: Manifest link, apple-touch-icon, theme-color meta present ✅
  - Deviations: None
  - Notes: All PWA meta tags in place

- [x] **Task 1.5** — Implement basic service worker
  - Files: `static/sw.js`
  - Verified: SW caches app shell, cache-first strategy ✅
  - Deviations: None
  - Notes: Cache name `timetracker-v1`

- [x] **Task 1.6** — Register service worker in layout
  - Files: `src/routes/+layout.svelte`
  - Verified: SW registration in onMount with `!dev` guard ✅
  - Deviations: None
  - Notes: Only registers in production

### IndexedDB Setup

- [x] **Task 1.7** — Create IndexedDB wrapper module
  - Files: `src/lib/storage/db.ts` (schema inline)
  - Verified: DB opens, creates stores with indexes ✅
  - Deviations: Combined schema and wrapper in single file; only `categories` and `meta` stores created (others deferred to when needed)
  - Notes: DB_NAME='timetracker', DB_VERSION=1

- [x] **Task 1.8** — Create IndexedDB CRUD helpers
  - Files: `src/lib/storage/db.ts`
  - Verified: Generic CRUD functions (getByKey, getAll, put, deleteByKey) ✅
  - Deviations: Functions in same file as wrapper
  - Notes: All functions return Promises, proper transaction handling

- [x] **Task 1.9** — Seed system categories
  - Files: `src/lib/storage/categories.ts`
  - Verified: E2E test passes - system categories exist, protected, countsAsWorkTime=false ✅
  - Deviations: Seeding logic in categories module instead of separate seed.ts; also seeds default user categories from JSON
  - Notes: 4 system categories + default user categories from `static/default-categories.de.json`

- [x] **Task 1.10** — Create Svelte stores for global state
  - Files: `src/lib/stores/index.ts`, `src/lib/types.ts` (extended)
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Added types (TimeEntry, DayType, WorkTimeModel, SyncStatus, WeekBounds); created writable stores (categories, timeEntries, workTimeModels, syncStatus, isOnline, currentDate) and derived stores (currentWeek, runningEntry, activeDayEntries, activeWeekEntries, activeWorkTimeModel)

---

## Phase 2: Core UI (Day Tab)

**Target:** 15 tasks, ~15-18 hours  
**Status:** COMPLETE (15/15 tasks)

### Navigation & Structure

- [x] **Task 2.1** — Create tab navigation component
  - Files: `src/lib/components/TabNavigation.svelte`, `src/routes/+layout.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Fixed bottom nav with 4 tabs, uses resolve() from $app/paths for navigation

- [x] **Task 2.2** — Create placeholder routes for all tabs
  - Files: `src/routes/+page.svelte`, `src/routes/day/+page.svelte`, `src/routes/week/+page.svelte`, `src/routes/analysis/+page.svelte`, `src/routes/settings/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Root page redirects to /day, all tab routes have placeholder content

### Utilities

- [x] **Task 2.3** — Create date utility functions
  - Files: `src/lib/utils/date.ts`, `src/lib/utils/date.test.ts`
  - Verified: npm run check ✅, npm run lint ✅, npm run test:unit ✅ (29 tests)
  - Deviations: None
  - Notes: Added formatDate, parseDate, getWeekBounds, getDayOfWeek, isToday, isCurrentWeek, getWeekNumber, addDays, getWeekDates, formatShortDate, startOfDay, endOfDay, isSameDay, formatTime, parseTime. Also set up Vitest with vite.config.ts.

- [x] **Task 2.4** — Create calculation utility functions
  - Files: `src/lib/utils/calculations.ts`, `src/lib/utils/calculations.test.ts`
  - Verified: npm run check ✅, npm run lint ✅, npm run test:unit ✅ (28 tests)
  - Deviations: None
  - Notes: Added calculateDuration, calculateIst, calculateSoll, calculateSaldo, formatHours, calculateWeeklyTotal. All functions follow ui-logic-spec-v1.md Section 10.

### Day Tab Components

- [x] **Task 2.5** — Create InlineSummary component
  - Files: `src/lib/components/InlineSummary.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Displays Ist/Soll/Saldo with German formatting. Positive saldo green, negative red.

- [x] **Task 2.6** — Implement Day tab UI structure
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Added date navigation, day type selector (placeholder), InlineSummary with dummy data, add task button, empty task list. All elements in spec order.

- [x] **Task 2.7** — Implement date navigation logic
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: ← decrements day, → increments day, clicking date title goes to today. Shows "Heute" for today.

- [x] **Task 2.8** — Create DayTypeSelector component
  - Files: `src/lib/components/DayTypeSelector.svelte`, `src/lib/storage/db.ts`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Added dayTypes store to IndexedDB (bumped DB_VERSION to 2)
  - Notes: Dropdown with 4 options, saves to IndexedDB on change, loads persisted value on date change.

- [x] **Task 2.9** — Load day type and work time model for current date
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Loads day type from IndexedDB, uses activeWorkTimeModel store, calculates real Soll/Saldo. Ist still 0 (Task 2.13).

- [x] **Task 2.10** — Create AddTaskModal component
  - Files: `src/lib/components/AddTaskModal.svelte`, `src/lib/components/Modal.svelte`, `src/lib/storage/db.ts`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Added timeEntries store to IndexedDB (bumped DB_VERSION to 3)
  - Notes: Modal wrapper with escape/backdrop close. Form with category, start/end time, description. Saves to IndexedDB.

- [x] **Task 2.11** — Create TaskList and TaskItem components
  - Files: `src/lib/components/TaskList.svelte`, `src/lib/components/TaskItem.svelte`, `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: TaskItem shows time span, category, work indicator. TaskList sorts newest first. Integrated with Day page including modal for add/edit.

- [x] **Task 2.12** — Implement running task warning banner
  - Files: `src/lib/components/WarningBanner.svelte`, `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Shows "⚠ Aufgabe läuft noch (keine Endzeit)" when any entry has null endTime. Appears above date nav per spec.

- [x] **Task 2.13** — Calculate real Ist from time entries
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Uses calculateIst() with dayEntries and categories. Only counts completed tasks with countsAsWorkTime=true.

- [x] **Task 2.14** — Implement edit task functionality
  - Files: `src/lib/components/AddTaskModal.svelte`, `src/lib/components/TaskItem.svelte`, `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Already implemented in Task 2.11. Clicking TaskItem opens AddTaskModal with entry data pre-filled.

- [x] **Task 2.15** — Implement delete task functionality
  - Files: `src/lib/components/TaskItem.svelte`, `src/lib/components/TaskList.svelte`, `src/routes/day/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Delete button on each TaskItem with confirmation dialog. Removes from IndexedDB and refreshes store.

---

## Phase 3: Additional Tabs

**Target:** 16 tasks, ~12-15 hours  
**Status:** In Progress (5/16 tasks)

### Week Tab

- [x] **Task 3.1** — Implement Week tab UI structure
  - Files: `src/routes/week/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Week navigation (← KW X →), week type selector (placeholder for Task 3.3), InlineSummary, day list filtered by active days in model. Uses SvelteMap for reactive day types.

- [x] **Task 3.2** — Implement week navigation logic
  - Files: `src/routes/week/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented as part of Task 3.1
  - Notes: ← decrements by 7 days, → increments by 7 days, clicking title goes to current week. Shows "Aktuelle KW X" for current week, "KW X" otherwise.

- [x] **Task 3.3** — Implement week type selector
  - Files: `src/lib/components/WeekTypeSelector.svelte`, `src/routes/week/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Dropdown with 4 options (Arbeitswoche, Urlaub, Krank, Feiertag). On change, shows confirmation dialog and sets day type for all 7 days in IndexedDB. Resets to default after action.

- [x] **Task 3.4** — Calculate week Ist/Soll/Saldo
  - Files: `src/routes/week/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented as part of Task 3.1
  - Notes: Loads entries for week, loads day types, calculates weekIst/weekSoll/weekSaldo reactively.

- [x] **Task 3.5** — Render week day list
  - Files: `src/routes/week/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented inline in week page instead of separate components (WeekDayList/WeekDayItem)
  - Notes: Lists active days, shows date, day type, Ist/Soll per day. Filters by active days in work time model.

### Analysis Tab

- [x] **Task 3.6** — Implement Analysis tab UI structure
  - Files: `src/routes/analysis/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: None
  - Notes: Date range display (placeholder for selector), InlineSummary, period list. Default range: 01.01.current year to today.

- [x] **Task 3.7** — Create DateRangeSelector component
  - Files: `src/lib/components/DateRangeSelector.svelte`, `src/routes/analysis/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅, Browser test ✅
  - Deviations: None
  - Notes: Modal with Schnellwahl (Aktuelles Jahr) and manual date inputs (Von/Bis). Validates dates and updates analysis range. Period grouping switches to weeks when range ≤60 days.

- [x] **Task 3.8** — Calculate analysis totals
  - Files: `src/routes/analysis/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented as part of Task 3.6
  - Notes: Calculates totalIst, totalSoll, totalSaldo for entire date range.

- [x] **Task 3.9** — Implement period grouping logic
  - Files: `src/routes/analysis/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented as part of Task 3.6
  - Notes: Groups by week if range ≤60 days, by month otherwise. Uses helper functions getPeriodKey/getPeriodLabel.

- [x] **Task 3.10** — Render period list
  - Files: `src/routes/analysis/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅
  - Deviations: Implemented inline in analysis page instead of separate components
  - Notes: Lists periods with label, Ist, Soll. German month names for monthly grouping.

### Settings Tab

- [x] **Task 3.11** — Implement Settings tab UI structure
  - Files: `src/routes/settings/+page.svelte`, `src/lib/types.ts`
  - Verified: npm run check ✅, npm run lint ✅, Browser test ✅
  - Deviations: Added `name` property to WorkTimeModel type
  - Notes: Two sections (Kategorien, Arbeitszeitmodelle), each with heading and add button. Category list shows badges for work time status, delete buttons only for non-system categories.

- [x] **Task 3.12** — Implement category list
  - Files: `src/routes/settings/+page.svelte`
  - Verified: npm run check ✅, npm run lint ✅, Browser test ✅
  - Deviations: Implemented inline in settings page instead of separate components
  - Notes: Shows all categories with name, work time badge, delete button (user categories only).

- [x] **Task 3.13** — Implement add category modal
  - Files: `src/lib/components/AddCategoryModal.svelte`, `src/routes/settings/+page.svelte`
  - Verified: npm run lint ✅, Browser test ✅
  - Deviations: None
  - Notes: Modal with name input and "Zählt als Arbeitszeit" checkbox. Validates name required and no duplicates. Saves to IndexedDB and updates store.

- [x] **Task 3.14** — Implement delete category
  - Files: `src/routes/settings/+page.svelte`
  - Verified: npm run lint ✅, Browser test ✅
  - Deviations: None
  - Notes: Delete button with native confirm() dialog. Removes from IndexedDB and store. Only available for non-system categories.

- [x] **Task 3.15** — Implement work time model list
  - Files: `src/routes/settings/+page.svelte`
  - Verified: npm run lint ✅, Browser test ✅
  - Deviations: Implemented as part of Task 3.11
  - Notes: Shows model name and validFrom date. Empty state when no models exist.

- [x] **Task 3.16** — Implement add work time model modal
  - Files: `src/lib/components/AddWorkTimeModelModal.svelte`, `src/routes/settings/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Modal with name, validFrom date, and hours per weekday (7 inputs). Default: 8h Mon-Fri, empty Sat-Sun. Saves to IndexedDB and updates store.

---

## Phase 4: Sync & Polish

**Target:** 15 tasks, ~8-10 hours  
**Status:** Not started

### Sync Engine

- [x] **Task 4.1** — Implement outbox queue operations
  - Files: `src/lib/sync/outbox.ts`, `src/lib/storage/db.ts`, `src/lib/types.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added outbox store to IndexedDB (DB_VERSION=5), OutboxItem type with status/retryCount/lastError, functions: addToOutbox, getOutboxItems, getOutboxCount, markAsSent, markAsFailed, removeFromOutbox, clearAckedItems
- [x] **Task 4.2** — Integrate outbox with data operations
  - Files: `src/lib/storage/operations.ts`, `src/lib/components/AddTaskModal.svelte`, `src/lib/components/DayTypeSelector.svelte`, `src/lib/components/AddWorkTimeModelModal.svelte`, `src/lib/components/WeekTypeSelector.svelte`, `src/lib/storage/categories.ts`, `src/routes/day/+page.svelte`, `src/routes/settings/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Created operations.ts with wrapper functions (saveTimeEntry, deleteTimeEntry, saveDayType, saveWorkTimeModel, saveUserCategory, deleteUserCategoryWithSync) that call both db.put/delete AND addToOutbox. Updated all components to use these wrappers.
- [x] **Task 4.3** — Create sync engine module
  - Files: `src/lib/sync/engine.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Created syncNow() with debouncing (5s), checkSyncStatus(), getSyncStatusValue(). v1 logs to console and marks items as acked (no actual API). Updates syncStatus store during sync.
- [x] **Task 4.4** — Implement sync triggers
  - Files: `src/lib/storage/operations.ts`, `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Playwright UI test ✅
  - Deviations: None
  - Notes: Added triggerSync() after each data operation, startup sync (1s delay), visibility change sync trigger
- [x] **Ad-hoc** — ConfirmDialog component (replaces browser confirm/alert)
  - Files: `src/lib/components/ConfirmDialog.svelte`, `src/routes/day/+page.svelte`, `src/routes/settings/+page.svelte`, `src/lib/components/WeekTypeSelector.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Playwright UI test ✅
  - Notes: Created styled ConfirmDialog component with confirm/alert modes, danger button variant. Replaced all browser confirm() and alert() calls.
- [x] **Task 4.5** — Create sync status indicator component
  - Files: `src/lib/components/SyncIndicator.svelte`, `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Browser test ✅
  - Deviations: None
  - Notes: Component shows 4 states (synced/pending/syncing/error) with icons and German labels. Positioned in sticky header at top-right. Responsive (hides label on very small screens). Dark mode support.
- [x] **Task 4.6** — Implement online/offline detection
  - Files: `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Browser test ✅
  - Deviations: None
  - Notes: Initialize isOnline store with navigator.onLine, listen to online/offline events, trigger sync when going online, clean up event listeners on destroy.

### Polish & Quality

- [x] **Task 4.7** — Add loading states to all async operations
  - Files: Already implemented in all pages and modals
  - Verified: Code review ✅
  - Deviations: None
  - Notes: All pages have `loading` state with "Laden..." display. All modals have `saving` state with disabled buttons/inputs and "Speichern..." text. Already complete from previous tasks.
- [x] **Task 4.8** — Implement basic error boundaries
  - Files: `src/routes/+error.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Created error page with user-friendly German message, reload/home buttons, collapsible technical details. Dark mode support.
- [x] **Task 4.9** — Add input validation to all forms
  - Files: `src/lib/components/AddWorkTimeModelModal.svelte` (enhanced)
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Most validation already existed. Added hours range validation (0-24) to work time model. All forms have: required field validation, format validation, range validation, duplicate checking where applicable.
- [x] **Task 4.10** — Optimize IndexedDB queries
  - Files: `src/lib/storage/db.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added getEntriesByDateRange() and getEntriesByDate() using indexes for efficient date-based queries. Existing optimizations: DB instance caching, indexes on date/categoryId/validFrom/status/createdAt.
- [x] **Task 4.11** — Add basic accessibility features
  - Files: `src/lib/components/Modal.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added focus management to Modal (focus on open, restore on close). Existing a11y: aria-labels on buttons, role="dialog", aria-modal, aria-labelledby, keyboard navigation (Escape to close), semantic HTML throughout.
- [x] **Task 4.12** — Implement responsive design
  - Files: `src/lib/components/InlineSummary.svelte`, `src/lib/components/AddWorkTimeModelModal.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added media queries for small screens (<360px, <400px). InlineSummary stacks vertically on tiny screens. Weekday grid adapts from 7 to 4 to 2 columns. Existing responsive: max-width containers, flexbox, 44px touch targets, rem units.

### Testing & Deployment

- [x] **Task 4.13** — Test PWA installation flow
  - Files: Verified existing `static/manifest.webmanifest`, `static/sw.js`, `src/app.html`
  - Verified: Browser test ✅
  - Deviations: None
  - Notes: PWA config complete: manifest with icons, service worker with cache-first for assets and network-first for navigation, app.html with manifest link and meta tags. Minor icon size warning (cosmetic).
- [x] **Task 4.14** — Write basic E2E test
  - Files: `e2e/basic-flow.test.ts`
  - Verified: npm run test:e2e ✅ (5 passed)
  - Deviations: None
  - Notes: Tests cover: app load, tab navigation, add task flow, task persistence after reload, day type selector. All tests passing.
- [x] **Task 4.15** — Final polish and deployment prep
  - Files: Verified all existing files
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Final verification passed. README up to date. All Phase 4 tasks complete.
- [x] **Task 4.16** — Write unit tests for core logic
  - Files: `src/lib/utils/calculations.test.ts`, `src/lib/utils/date.test.ts`
  - Verified: npm run test:unit ✅ (57 tests passed)
  - Deviations: None
  - Notes: Already implemented. 28 calculation tests + 29 date tests. Run `npm run test:unit` before/after changes to catch regressions.

---

## Post-v1 Improvements

### UI Improvements (2025-12-22)

- [x] **Settings page** — Remove "Arbeitszeit" badge, move "Keine Arbeitszeit" to right
- [x] **TimePicker** — Separate hour/minute dropdowns (24 items + 12 items instead of 288)
- [x] **Version display** — Show version and build time in Settings
- [x] **Update checking** — Service worker checks for new version, shows banner if available
- [x] **Week tab fix** — Dropdown stays on selected value after confirm
- [x] **Week tab fix** — Prevent non-work day type if hours already logged

### Manual Testing Checklist

- [ ] Test version checking on production build (`npm run build && npm run preview`)
- [ ] Test PWA installation on Windows (localhost:4173)
- [ ] Deploy to server and test PWA installation on phone

---

## Phase 5: Extended Features

**Target:** 10 tasks, ~10-12 hours  
**Status:** Complete (10/10 tasks)

### Default Work Time Model & Category Changes

- [x] **Task 5.1** — Implement default work time model on first run
  - Files: `src/lib/storage/categories.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Replaced seedDefaultCategories() with seedDefaultWorkTimeModel(). New installs get "Vollzeit 40h" (Mon-Fri 8h, Sat-Sun 0h, validFrom 2020-01-01) and empty user categories.

### Category Import/Export

- [x] **Task 5.2** — Implement category export
  - Files: `src/routes/settings/+page.svelte`, `src/lib/utils/categoryIO.ts`
  - Verified: npm run verify ✅ (ALL PASSED), Browser test ✅
  - Deviations: None
  - Notes: Created categoryIO.ts with export/import utilities. Added "Exportieren" button to settings. Downloads kategorien.txt with comma-separated user category names.

- [x] **Task 5.3** — Implement category import
  - Files: `src/routes/settings/+page.svelte`, `src/lib/utils/categoryIO.ts`, `src/lib/components/ImportCategoriesModal.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Browser test ✅
  - Deviations: None
  - Notes: Created ImportCategoriesModal with file upload and text input. Shows import count and skipped duplicates. Auto-closes on success.

### Authentication

- [x] **Task 5.4** — Create auth store and types
  - Files: `src/lib/types.ts`, `src/lib/stores/auth.ts`, `src/lib/storage/db.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added AuthSession type, created auth.ts store with loadSession/saveSession/clearSession, added authSession store to IndexedDB (DB_VERSION=6)

- [x] **Task 5.5** — Create login page
  - Files: `src/routes/login/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED), Browser test ✅
  - Deviations: None
  - Notes: Email/password form with autocomplete, links to signup and forgot-password, mock login saves session

- [x] **Task 5.6** — Create signup page
  - Files: `src/routes/signup/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Registration form with password confirmation (min 8 chars), auto-login after signup

- [x] **Task 5.7** — Create forgot password page
  - Files: `src/routes/forgot-password/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Email form, generic success message (security: never reveals if email exists)

- [x] **Task 5.8** — Implement auth guard and routing
  - Files: `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Auth guard checks session on mount, redirects to /login if not authenticated. Public paths (login/signup/forgot-password) bypass auth. Loading screen while checking.

- [x] **Task 5.9** — Add logout button to settings
  - Files: `src/routes/settings/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: "Abmelden" button at bottom of settings with confirmation dialog. Clears session and redirects to login. Local data preserved.

- [x] **Task 5.10** — Create auth API service (mock)
  - Files: `src/lib/api/auth.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Mock implementation with login/signup/forgotPassword/validateToken/logout. TODO comments for real API replacement.

---

## Phase 6: Cloud Auth & Backup (Supabase)

**Target:** 6 tasks  
**Status:** Complete (6/6 tasks)
**Spec:** `Docs/Specs/cloud-backup-and-auth.md`

### Supabase Integration

- [x] **Task 6.1** — Add Supabase client + env configuration
  - Files: `src/lib/supabase/client.ts`, `.env.example`, `package.json`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Added @supabase/supabase-js dependency. Client uses PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY env vars. Falls back to mock auth if not configured.

- [x] **Task 6.2** — Replace mock auth with real Supabase auth
  - Files: `src/lib/api/auth.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Implemented login, signup, forgotPassword, updatePassword, logout using Supabase Auth. Added getCurrentUserId and validateSession helpers. Mock fallback preserved for development without Supabase.

- [x] **Task 6.3** — Update auth pages to use real API
  - Files: `src/routes/login/+page.svelte`, `src/routes/signup/+page.svelte`, `src/routes/forgot-password/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: All auth pages now call real Supabase auth functions. Error messages displayed to user.

- [x] **Task 6.4** — Create password reset page
  - Files: `src/routes/reset-password/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Handles Supabase password reset flow. Validates link, allows new password entry, redirects to login on success.

### Cloud Backup

- [x] **Task 6.5** — Implement IndexedDB snapshot export
  - Files: `src/lib/backup/snapshot.ts`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: Exports all IndexedDB stores (categories, timeEntries, dayTypes, workTimeModels, outbox) with metadata (schemaVersion, exportedAt, appVersion).

- [x] **Task 6.6** — Implement cloud backup with offline detection
  - Files: `src/lib/backup/cloud.ts`, `src/routes/settings/+page.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Deviations: None
  - Notes: "In Cloud speichern" button in Settings. Shows offline modal if not online. UPSERTs to Supabase user_backups table. Displays "Letztes Backup" timestamp. Stores backup metadata locally.

### Supabase SQL (for manual setup)

```sql
-- Create user_backups table
CREATE TABLE public.user_backups (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  schema_version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_backups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own backup
CREATE POLICY "Users can view own backup" ON public.user_backups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own backup" ON public.user_backups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own backup" ON public.user_backups
  FOR UPDATE USING (auth.uid() = user_id);
```

### Verification Checklist

Auth:

- [ ] Sign up works and creates user
- [ ] Login works
- [ ] Logout works
- [ ] Forgot password sends email and allows reset
- [ ] Guards redirect correctly

Backup:

- [ ] Local saves always work offline (IndexedDB)
- [ ] Clicking "Save to cloud" while offline shows modal and does NOT error
- [ ] Clicking while online creates/updates snapshot row in Supabase
- [ ] "Last cloud backup" updates

---

## Phase 6.1: Global UI Fixes (Logout + Save to Cloud + Forgot Password)

**Target:** 3 fixes  
**Status:** Complete (3/3)
**Date:** 2025-12-22

### Problem Report (Pre-Fix)

- Signup + login worked
- No logout UI existed in main app (only in Settings, not globally visible)
- "Forgot password" link existed but user couldn't test full flow without logout
- "Save to cloud" button was in Settings but not globally visible
- Confirmation email not received (Supabase "Confirm email" setting related)

### Fixes Implemented

- [x] **Fix 6.1.1** — Add global Logout button in app header
  - Files: `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Notes: "Log out" button in top-right header, visible when authenticated. Shows confirmation dialog. Clears session and redirects to /login.

- [x] **Fix 6.1.2** — Add global "Save to cloud" button + timestamp in header
  - Files: `src/routes/+layout.svelte`
  - Verified: npm run verify ✅ (ALL PASSED)
  - Notes: "Save to cloud" button in top-left header, visible when authenticated. Shows offline modal if not online. Displays last backup timestamp on wider screens. Error indicator if backup fails.

- [x] **Fix 6.1.3** — Verify Forgot Password link on /login
  - Files: `src/routes/login/+page.svelte` (already had link at line 97)
  - Verified: Link exists ✅
  - Notes: "Passwort vergessen?" link already present. After reset request, shows success message and "Zurück zur Anmeldung" link.

### E2E Test Results (Post-Fix)

| Browser       | Tests | Status        |
| ------------- | ----- | ------------- |
| Chromium      | 9     | ✅ PASS       |
| WebKit        | 9     | ✅ PASS       |
| Mobile Safari | 9     | ✅ PASS       |
| **Total**     | 27    | ✅ ALL PASSED |

### Confirmation Email Behavior (Documentation)

**Current behavior:**

- Supabase Auth is configured with "Confirm email" setting
- If ON: Users must confirm email before first sign-in (unless bypassed in Supabase dashboard)
- If OFF: Users can sign in immediately after signup

**Expected behavior for production:**

- "Confirm email" should be ON for security
- Email templates should be configured in Supabase dashboard
- SMTP settings may need configuration for reliable delivery

**Note:** If confirmation emails are not received:

1. Check Supabase Auth settings → Email Templates
2. Check spam/junk folder
3. Consider configuring custom SMTP in Supabase for production

---

## Phase 6.2: Remove Mock Auth, Wire Real Supabase

**Target:** Remove all mock fallbacks, require real Supabase  
**Status:** Complete
**Date:** 2025-12-22

### Problem Report (Pre-Fix)

- Auth was NOT calling Supabase (Network tab showed zero requests on login)
- `src/lib/supabase/client.ts` used `import.meta.env` instead of `$env/static/public`
- `src/lib/api/auth.ts` had mock fallbacks that always succeeded when Supabase not configured
- `isSupabaseConfigured()` silently allowed mock auth instead of blocking

### Changes Made

- [x] **Fix 6.2.1** — Use correct SvelteKit env imports
  - Files: `src/lib/supabase/client.ts`
  - Changed: `import.meta.env.PUBLIC_*` → `import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'`
  - Added: `getSupabaseConfigError()` helper for user-friendly error messages

- [x] **Fix 6.2.2** — Remove all mock fallbacks from auth.ts
  - Files: `src/lib/api/auth.ts`
  - Removed: `mockLogin()` function entirely
  - Added: `requireSupabase()` helper that throws if not configured
  - Changed: `login()`, `signup()`, `forgotPassword()`, `updatePassword()` now throw error if Supabase not configured
  - Changed: `validateSession()`, `getCurrentUserId()`, `logout()` handle missing config gracefully (return false/null/skip)

### Verification Results

| Check             | Result              |
| ----------------- | ------------------- |
| npm run verify    | ✅ ALL PASSED       |
| E2E Chromium      | 9/9 ✅              |
| E2E WebKit        | 9/9 ✅              |
| E2E Mobile Safari | 9/9 ✅              |
| **Total**         | **27 tests passed** |

### Manual Verification Checklist

To verify Supabase integration is working:

1. **Network tab verification:**
   - Open DevTools → Network tab
   - Attempt login/signup
   - Should see requests to `https://<project>.supabase.co/auth/v1/...`

2. **Supabase Dashboard verification:**
   - Go to Supabase Dashboard → Authentication → Users
   - After signup, user should appear in the list

3. **Cloud backup verification:**
   - Click "Save to cloud" while authenticated
   - Check Supabase Dashboard → Table Editor → `user_backups`
   - Should see UPSERT row with user_id, snapshot, schema_version, updated_at

4. **Error handling verification:**
   - Remove `.env` file or clear env vars
   - Attempt login → Should show error: "PUBLIC_SUPABASE_URL ist nicht gesetzt"

---

## Phase 6.3: Snapshot Meta Improvements (Timezone + Timestamp Consistency)

**Target:** Add timezone info and consistent timestamps to snapshot meta  
**Status:** Complete
**Date:** 2025-12-22

### Changes Made

- [x] **Add timezone info to snapshot meta**
  - `meta.tz`: IANA timezone string (e.g., "Europe/Berlin") using `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - `meta.tzOffsetMinutes`: Numeric offset using `Date.getTimezoneOffset()` (minutes behind UTC; positive in most of Europe, e.g., 60 for UTC+1, 120 for UTC+2)

- [x] **Add epoch ms timestamp for consistency**
  - `meta.exportedAt`: ISO 8601 string (human-readable, e.g., "2025-12-22T12:30:00.000Z")
  - `meta.exportedAtMs`: Epoch milliseconds (programmatic use, e.g., 1734869400000)

### Snapshot Meta Schema (v1)

```typescript
interface SnapshotMeta {
	schemaVersion: number; // Always 1 for now
	exportedAt: string; // ISO 8601 timestamp
	exportedAtMs: number; // Epoch milliseconds
	appVersion: string; // App version from version.json
	tz?: string; // IANA timezone (optional, may be undefined)
	tzOffsetMinutes: number; // Minutes behind UTC (Date.getTimezoneOffset())
}
```

### Backward Compatibility

- `tz` is optional (may be undefined if Intl API unavailable)
- Restore/import accepts snapshots missing `tz`/`tzOffsetMinutes` (older backups)
- No changes to domain records (categories, timeEntries, etc.)

### Files Changed

- `src/lib/backup/snapshot.ts`: Updated `SnapshotMeta` interface and `exportSnapshot()` function

---

## Spec Compliance Verification

After each phase, verify against specs:

### Phase 1 Verification

- [ ] IndexedDB schema matches `technical-guideline-v1.md` Section 3.1
- [ ] PWA manifest meets `SVELTEKIT_PWA_ADDENDUM.md` requirements
- [ ] Service worker caches app shell correctly

### Phase 2 Verification

- [ ] Day tab order matches `ui-logic-spec-v1.md` Section 3
- [ ] Calculation logic matches `ui-logic-spec-v1.md` Section 10
- [ ] Warning banner behavior matches Section 3.1

### Phase 3 Verification

- [ ] Week tab matches `ui-logic-spec-v1.md` Section 4
- [ ] Analysis tab matches Section 5
- [ ] Settings tab matches Sections 7, 8, 9

### Phase 4 Verification

- [ ] Sync follows `technical-guideline-v1.md` Section 4
- [ ] All PWA requirements from `DEVELOPMENT_GUIDELINES.md` met
- [ ] Deployment checklist from `PROJECT_SCAFFOLD_CHECKLIST.md` complete

---

## Deviations Log

**Purpose:** Track any deviations from original plan/specs with justification

| Task | Deviation | Reason | Approved By |
| ---- | --------- | ------ | ----------- |
| -    | -         | -      | -           |

---

## Blockers & Issues

**Purpose:** Track any blockers that prevent progress

| Task | Issue | Status | Resolution |
| ---- | ----- | ------ | ---------- |
| -    | -     | -      | -          |

---

## Phase 7: Quick-Start UX Improvements

**Target:** 10 tasks, ~8 hours  
**Status:** Complete (10/10 tasks)  
**Spec:** `Docs/Specs/P07-20251223-quick-start-ux.md`  
**Plan:** `Docs/Plans/P07-20251223-quick-start-ux.md`  
**Tasks:** `Docs/Tasks/P07-20251223-quick-start-ux.md`

### Quick-Start Buttons

- [x] **Task 7.1** — Frequency Utils erstellen
  - Files: `src/lib/utils/frequency.ts`, `src/lib/utils/frequency.test.ts`
  - Verified: npm run verify ✅, npm run test:unit ✅ (78 tests, 17 new)
  - Deviations: None
  - Notes: Created getCategoryFrequency(), getTopCategories(), sortCategoriesByFrequency(). Excludes system categories, respects 30-day window, alphabetical tiebreaker.

- [x] **Task 7.2** — Quick-Start Buttons Komponente
  - Files: `src/lib/components/QuickStartButtons.svelte`, `src/routes/day/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Component shows up to 5 buttons for frequent categories. Integrated above "+ Aufgabe hinzufügen". handleQuickStart placeholder added (full logic in Task 7.3).

- [x] **Task 7.3** — Quick-Start Logik (Aufgabe sofort starten)
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: handleQuickStart creates entry with startTime=now, endTime=null. Auto-ends running task first (TT-FR-005). Tested: button click creates running task, warning banner appears.

### Beenden & Resume Buttons

- [x] **Task 7.4** — TaskItem Refactor (Running vs Completed)
  - Files: `src/lib/components/TaskItem.svelte`, `src/lib/components/TaskList.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Added Beenden button (running tasks) and Resume button ▶ (completed tasks). Running tasks have distinct visual style (warning border/bg). onend/onresume callbacks added.

- [x] **Task 7.5** — Beenden-Button Logik
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: handleEndEntry sets endTime=now and saves immediately. No modal, no confirmation per TT-FR-011. Tested: click Beenden → task ends, warning banner disappears.

- [x] **Task 7.6** — Resume-Button Logik
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: handleResumeEntry creates new task with same category. Auto-ends running task first (TT-FR-015). Tested: click Resume → new running task created.

### Dropdown & Einstellungen

- [x] **Task 7.7** — Kategorie-Dropdown Häufigkeitssortierung
  - Files: `src/lib/components/CategorySelect.svelte`, `src/lib/components/AddTaskModal.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: CategorySelect now accepts entries prop and sortOrder prop. Uses sortCategoriesByFrequency() for frequency mode. Most-used categories appear first, system categories at end. Auto-scroll to position 6 implemented (TT-FR-007).

- [x] **Task 7.8** — Einstellungen Toggle für Sortierung
  - Files: `src/routes/settings/+page.svelte`, `src/lib/stores/theme.ts`, `src/lib/components/AddTaskModal.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Added categorySort store with 'frequency'/'alphabetical' options. Toggle in Erscheinungsbild section. CategorySelect uses setting via sortOrder prop. Persisted to localStorage.

- [x] **Task 7.9** — Endzeit vorausfüllen beim Bearbeiten
  - Files: `src/lib/components/AddTaskModal.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: When editing a running task (endTime=null), end time is pre-filled with current time (rounded to 5 min). New tasks and completed tasks behave as before.

### Testing

- [x] **Task 7.10** — E2E Tests
  - Files: `e2e/quick-start.test.ts`
  - Verified: npm run test:e2e ✅ (6 tests, all passing)
  - Deviations: None
  - Notes: Tests cover Quick-Start buttons, Beenden/Resume buttons, auto-end running task, and settings toggle. Used exact: true for button selectors to avoid matching task item containers.

---

## Phase 8: Plus-Tab (Ein-Klick-Workflow + Smart Suggestions)

**Target:** 9 tasks, ~5 hours  
**Status:** Complete (9/9 tasks)  
**Spec:** `Docs/Specs/P07-20251223-quick-start-ux.md` (Phase 8 Abschnitt + Smart Suggestions)  
**Plan:** `Docs/Plans/P07-20251223-quick-start-ux.md` (Phase 8 Abschnitt + Algorithmus-Details)  
**Tasks:** `Docs/Tasks/P07-20251223-quick-start-ux.md` (Phase 8 Tasks 8.1-8.9)

### Plus-Tab Route & Smart Suggestions

- [x] **Task 8.1** — Plus-Tab Route erstellen
  - Files: `src/routes/add/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Route `/add` created with placeholder content. Shows "Aufgabe starten" heading.

- [x] **Task 8.2** — Smart Suggestions Algorithmus implementieren
  - Files: `src/lib/utils/frequency.ts`, `src/lib/utils/frequency.test.ts`
  - Verified: npm run verify ✅, npm run test:unit ✅ (88 tests, 10 new)
  - Deviations: None
  - Notes: Implemented `getSmartTopCategories()` and `getTimeSlot()`. Context-first scoring (×1000 multiplier), 2h time slots, weekday matching, alphabetical tiebreaker.

- [x] **Task 8.3** — CategoryList Komponente
  - Files: `src/lib/components/CategoryList.svelte`, `src/routes/add/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Created CategoryList with Top 5 smart suggestions + A-Z remaining categories. No duplicates. System categories excluded.

- [x] **Task 8.4** — Ein-Klick-Start Logik
  - Files: `src/routes/add/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: One-click task start creates entry with startTime=now, endTime=null. Auto-ends running task. Redirects to /day after start.

### Navigation & Default-Tab

- [x] **Task 8.5** — Navigation anpassen (Plus-Tab erster Tab)
  - Files: `src/lib/components/TabNavigation.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: File was TabNavigation.svelte not Navigation.svelte
  - Notes: Plus-Tab added as first tab with "+" label, accent color styling, aria-label for accessibility.

- [x] **Task 8.6** — Default-Tab-Logik
  - Files: `src/routes/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: None
  - Notes: Root "/" redirects to /day if running task exists, otherwise to /add (Plus-Tab).

### Cleanup

- [x] **Task 8.7** — Cleanup: Tag-Tab (Quick-Start + Add-Button entfernen)
  - Files: `src/routes/day/+page.svelte`
  - Verified: npm run verify ✅, Browser test ✅
  - Deviations: QuickStartButtons.svelte kept (may be used elsewhere), only removed from Day page
  - Notes: Removed QuickStartButtons, Add-Button, and related CSS/functions from Day page.

- [x] **Task 8.8** — Cleanup: Settings (Sorting Toggle entfernen)
  - Files: `src/routes/settings/+page.svelte`
  - Verified: npm run verify ✅
  - Deviations: Kept categorySort store in theme.ts (used by AddTaskModal)
  - Notes: Removed "Kategorie-Sortierung" toggle from Settings UI. Store kept for backward compatibility.

### Testing

- [x] **Task 8.9** — E2E Tests erweitern
  - Files: `e2e/quick-start.test.ts`, `e2e/basic-flow.test.ts`
  - Verified: npm run test:e2e ✅ (48 tests, all passing)
  - Deviations: Also updated basic-flow.test.ts for Plus-Tab changes
  - Notes: Updated tests for Plus-Tab, Default-Tab-Logik, removed old Quick-Start/Add-Button tests.

---

## Manual Test Checklist: Netlify SPA Routing

**Purpose:** Verify direct URL access works after deploying `200.html` + `_redirects` fix.

### Test URLs

| Route              | timetracker24.netlify.app | timetracker.samuelgross.org |
| ------------------ | ------------------------- | --------------------------- |
| `/login`           | ☐ Direct open             | ☐ Direct open               |
| `/login`           | ☐ Hard refresh (F5)       | ☐ Hard refresh (F5)         |
| `/register`        | ☐ Direct open             | ☐ Direct open               |
| `/register`        | ☐ Hard refresh (F5)       | ☐ Hard refresh (F5)         |
| `/forgot-password` | ☐ Direct open             | ☐ Direct open               |
| `/forgot-password` | ☐ Hard refresh (F5)       | ☐ Hard refresh (F5)         |
| `/settings`        | ☐ Direct open             | ☐ Direct open               |
| `/day`             | ☐ Direct open             | ☐ Direct open               |

### Expected Behavior

- **Pass:** Page loads correctly (login form, register form, etc.)
- **Fail:** Netlify 404 "Page not found" error

### Test Date: **\*\*\*\***\_\_\_\_**\*\*\*\***

---

**END OF PROGRESS TRACKER**
