# TimeTracker v1 — Implementation Tasks

**Status:** Draft for approval  
**Based on:** timetracker-v1-implementation.md (plan)  
**Estimated total:** ~40-50 hours

---

## Phase 1: Foundation (PWA + Data Layer)

### Task 1.1 — Configure SvelteKit for SPA mode
- **Files:**
  - `src/routes/+layout.js` (create)
- **Done when:**
  - File exports `ssr = false` and `csr = true`
  - Dev server still runs without errors
- **Verify:**
  - `npm run dev` - no errors
  - Browser console shows no SSR-related warnings
- **Guardrails:**
  - Do not modify existing `+layout.svelte` yet

---

### Task 1.2 — Create PWA manifest
- **Files:**
  - `static/manifest.webmanifest` (create)
- **Done when:**
  - Manifest contains: name, short_name, start_url, display, theme_color, background_color, icons
  - Icons array references `/icons/icon-192.png` and `/icons/icon-512.png`
  - `start_url` is `/`
  - `display` is `standalone`
- **Verify:**
  - `npm run build && npm run preview`
  - Navigate to `http://localhost:4173/manifest.webmanifest` - JSON loads
- **Guardrails:**
  - Use `.webmanifest` extension (not `.json`)
  - All paths must be root-relative (start with `/`)

---

### Task 1.3 — Create placeholder PWA icons
- **Files:**
  - `static/icons/icon-192.png` (create)
  - `static/icons/icon-512.png` (create)
  - `static/apple-touch-icon.png` (create)
- **Done when:**
  - Three PNG files exist with correct dimensions
  - Icons are simple placeholders (solid color + "TT" text is fine)
- **Verify:**
  - Files exist and open in image viewer
  - `npm run preview` - icons load at `/icons/icon-192.png`, etc.
- **Guardrails:**
  - Use actual PNG format (not renamed files)
  - Minimum quality sufficient for testing

---

### Task 1.4 — Update app.html with PWA meta tags
- **Files:**
  - `src/app.html` (modify)
- **Done when:**
  - Manifest link already exists (verify it's correct)
  - Apple touch icon link already exists (verify it's correct)
  - Theme color meta tag already exists (verify it's correct)
  - Viewport meta includes `width=device-width, initial-scale=1`
- **Verify:**
  - `npm run preview`
  - View page source - all meta tags present
- **Guardrails:**
  - Do not remove existing SvelteKit placeholders (`%sveltekit.head%`, `%sveltekit.body%`)

---

### Task 1.5 — Implement basic service worker
- **Files:**
  - `static/sw.js` (create)
- **Done when:**
  - SW caches app shell on install (/, /_app/*, /icons/*, /manifest.webmanifest)
  - SW serves from cache-first for cached resources
  - SW uses network-only for uncached resources
  - Cache name includes version (e.g., `timetracker-v1`)
- **Verify:**
  - `npm run build && npm run preview`
  - Open DevTools → Application → Service Workers - shows registered
  - Open DevTools → Application → Cache Storage - shows cached files
  - Disconnect network, reload page - app loads from cache
- **Guardrails:**
  - Only register in production (not dev)
  - Use simple cache-first strategy (no complex runtime caching yet)

---

### Task 1.6 — Register service worker in layout
- **Files:**
  - `src/routes/+layout.svelte` (modify)
- **Done when:**
  - SW registration code exists in `onMount`
  - Registration only runs when `!dev` and `'serviceWorker' in navigator`
  - No errors in console during dev mode
- **Verify:**
  - `npm run dev` - no SW registration, no errors
  - `npm run build && npm run preview` - SW registers successfully
- **Guardrails:**
  - Import `dev` from `$app/environment`
  - Do not block app startup on SW registration

---

### Task 1.7 — Create IndexedDB wrapper module
- **Files:**
  - `src/lib/db/index.ts` (create)
  - `src/lib/db/schema.ts` (create)
- **Done when:**
  - `schema.ts` exports DB_NAME, DB_VERSION, and store definitions
  - `index.ts` exports `openDB()` function that creates/upgrades DB
  - All 7 object stores created: categories, timeEntries, dayTypes, workTimeModels, outbox, appState, authSession
  - Indexes created per plan
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual test: Call `openDB()` in browser console, check DevTools → Application → IndexedDB
- **Guardrails:**
  - Use native IndexedDB API (no libraries)
  - Handle version upgrades properly (createObjectStore only if not exists)

---

### Task 1.8 — Create IndexedDB CRUD helpers
- **Files:**
  - `src/lib/db/operations.ts` (create)
- **Done when:**
  - Exports generic CRUD functions: `getAll(storeName)`, `getById(storeName, id)`, `put(storeName, data)`, `delete(storeName, id)`
  - All functions return Promises
  - Error handling wraps IndexedDB errors
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual test: Add/get/delete a test record in browser console
- **Guardrails:**
  - Use transactions properly (readonly for reads, readwrite for writes)
  - Always close cursors and transactions

---

### Task 1.9 — Seed system categories
- **Files:**
  - `src/lib/db/seed.ts` (create)
- **Done when:**
  - Exports `seedSystemCategories()` function
  - Creates 4 system categories: Pause, Urlaub, Krank, Feiertag
  - Sets `isSystem: true` and `countsAsWorkTime: false` for all
  - Function is idempotent (checks if categories exist before creating)
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual test: Call function, check IndexedDB - 4 categories exist
  - Call again - no duplicates created
- **Guardrails:**
  - Use UUIDs for IDs (`crypto.randomUUID()`)
  - Set timestamps (`Date.now()`)

---

### Task 1.10 — Create Svelte stores for global state
- **Files:**
  - `src/lib/stores/index.ts` (create)
- **Done when:**
  - Exports writable stores: `categories`, `timeEntries`, `workTimeModels`, `syncStatus`, `isOnline`
  - Exports writable stores: `currentDate`, `currentWeek`
  - Exports derived store: `runningEntry` (finds entry with endTime === null)
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Stores can be imported in components
- **Guardrails:**
  - Use Svelte 5 runes syntax if applicable, or traditional stores
  - Initialize with empty arrays/default values

---

## Phase 2: Core UI (Day Tab)

### Task 2.1 — Create tab navigation component
- **Files:**
  - `src/lib/components/TabNavigation.svelte` (create)
  - `src/routes/+layout.svelte` (modify)
- **Done when:**
  - Component renders 4 tabs: Tag, Woche, Auswertung, Einstellungen
  - Active tab is highlighted based on current route
  - Clicking tab navigates to correct route
  - Mobile-friendly (touch targets ≥ 44px)
- **Verify:**
  - `npm run dev`
  - Click each tab - URL changes, active state updates
  - Test on mobile viewport (DevTools responsive mode)
- **Guardrails:**
  - Use SvelteKit `<a>` tags with `href` (not buttons with click handlers)
  - Use `$page.url.pathname` to determine active tab

---

### Task 2.2 — Create placeholder routes for all tabs
- **Files:**
  - `src/routes/+page.svelte` (modify - redirect to /day)
  - `src/routes/day/+page.svelte` (create)
  - `src/routes/week/+page.svelte` (create)
  - `src/routes/analysis/+page.svelte` (create)
  - `src/routes/settings/+page.svelte` (create)
- **Done when:**
  - Root `/` redirects to `/day`
  - Each tab route renders placeholder heading (e.g., "Day Tab")
  - Navigation works between all tabs
- **Verify:**
  - `npm run dev`
  - Navigate to each tab - correct placeholder shows
  - Direct URL access works (e.g., `/week`)
- **Guardrails:**
  - Use `goto('/day')` from `$app/navigation` for redirect
  - Keep placeholders minimal (just `<h1>` tags)

---

### Task 2.3 — Create date utility functions
- **Files:**
  - `src/lib/utils/date.ts` (create)
- **Done when:**
  - Exports `formatDate(date, format)` - formats Date to DD.MM.YYYY or YYYY-MM-DD
  - Exports `parseDate(str)` - parses DD.MM.YYYY or YYYY-MM-DD to Date
  - Exports `getWeekBounds(date)` - returns {start, end} for ISO week
  - Exports `getDayOfWeek(date)` - returns 'monday' | 'tuesday' | ...
  - Exports `isToday(date)` - boolean
  - Exports `getCurrentWeekNumber(date)` - returns ISO week number
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Unit tests or manual console tests for each function
- **Guardrails:**
  - Handle timezone correctly (use local time, not UTC)
  - ISO week starts on Monday

---

### Task 2.4 — Create calculation utility functions
- **Files:**
  - `src/lib/utils/calculations.ts` (create)
- **Done when:**
  - Exports `calculateDuration(startTime, endTime)` - returns hours (decimal)
  - Exports `calculateIst(entries, categories)` - sums work time entries
  - Exports `calculateSoll(date, dayType, model)` - returns target hours
  - Exports `calculateSaldo(ist, soll)` - returns balance
  - Exports `formatHours(hours)` - formats to "X,X Std" (German format)
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual tests with sample data
- **Guardrails:**
  - Handle null/undefined gracefully
  - Use German decimal separator (comma) for display

---

### Task 2.5 — Create InlineSummary component
- **Files:**
  - `src/lib/components/InlineSummary.svelte` (create)
- **Done when:**
  - Accepts props: `ist`, `soll`, `saldo` (numbers)
  - Renders: "Ist: X,X Std    Soll: X,X Std    Saldo: ±X,X Std"
  - Negative saldo shows minus sign
  - Mobile-friendly, single line (wraps on very small screens)
- **Verify:**
  - `npm run dev`
  - Render component with test data - displays correctly
  - Test with positive/negative/zero saldo
- **Guardrails:**
  - Use `formatHours()` utility
  - Keep styling minimal (can enhance later)

---

### Task 2.6 — Implement Day tab UI structure
- **Files:**
  - `src/routes/day/+page.svelte` (modify)
- **Done when:**
  - Renders date navigation (← Today →)
  - Renders day type selector (dropdown placeholder)
  - Renders InlineSummary (with dummy data for now)
  - Renders "Add Task" button (placeholder)
  - Renders task list (empty for now)
- **Verify:**
  - `npm run dev` → `/day`
  - All elements visible in correct order
  - Date navigation buttons clickable (no functionality yet)
- **Guardrails:**
  - Use `currentDate` store
  - Keep components modular (extract to separate files if needed)

---

### Task 2.7 — Implement date navigation logic
- **Files:**
  - `src/routes/day/+page.svelte` (modify)
- **Done when:**
  - ← button decrements `currentDate` by 1 day
  - → button increments `currentDate` by 1 day
  - "Today" button sets `currentDate` to current date
  - Date heading shows "Heute" if `isToday(currentDate)`, else formatted date
- **Verify:**
  - `npm run dev` → `/day`
  - Click ← / → - date changes
  - Click "Today" - returns to today, heading shows "Heute"
- **Guardrails:**
  - Update store, not local state
  - Use `isToday()` and `formatDate()` utilities

---

### Task 2.8 — Create DayTypeSelector component
- **Files:**
  - `src/lib/components/DayTypeSelector.svelte` (create)
- **Done when:**
  - Renders dropdown with 4 options: Arbeitstag, Urlaub, Krank, Feiertag
  - Accepts props: `date` (Date), `value` (current type)
  - Emits event on change with new type
  - Saves to IndexedDB `dayTypes` store on change
- **Verify:**
  - `npm run dev`
  - Select different day types - saves to IndexedDB
  - Reload page - selection persists
- **Guardrails:**
  - Use `date` as key (YYYY-MM-DD format)
  - Default to 'arbeitstag' if no record exists

---

### Task 2.9 — Load day type and work time model for current date
- **Files:**
  - `src/routes/day/+page.svelte` (modify)
- **Done when:**
  - On mount and when `currentDate` changes, loads day type from IndexedDB
  - Loads active work time model (latest model where validFrom ≤ currentDate)
  - Calculates Soll using `calculateSoll()` utility
  - Passes real data to InlineSummary (Ist still 0 for now)
- **Verify:**
  - `npm run dev`
  - Create a work time model in IndexedDB manually
  - Change day type - Soll updates correctly
  - Change date - Soll updates based on weekday
- **Guardrails:**
  - Handle case where no work time model exists (Soll = 0)
  - Use reactive statements to recalculate when date/type changes

---

### Task 2.10 — Create AddTaskModal component
- **Files:**
  - `src/lib/components/AddTaskModal.svelte` (create)
  - `src/lib/components/Modal.svelte` (create - reusable wrapper)
- **Done when:**
  - Modal has fields: Category (dropdown), Start Time, End Time, Description
  - Category dropdown loads from `categories` store
  - Start Time pre-filled with current time (HH:mm)
  - End Time optional (can be left empty for running task)
  - Description optional
  - Save button creates time entry in IndexedDB
  - Cancel button closes modal without saving
- **Verify:**
  - `npm run dev`
  - Click "Add Task" - modal opens
  - Fill form, click Save - entry created in IndexedDB
  - Click Cancel - modal closes, no entry created
- **Guardrails:**
  - Validate: start time required, end time must be after start (if provided)
  - Use `crypto.randomUUID()` for entry ID
  - Set `date` to current date (YYYY-MM-DD)

---

### Task 2.11 — Create TaskList and TaskItem components
- **Files:**
  - `src/lib/components/TaskList.svelte` (create)
  - `src/lib/components/TaskItem.svelte` (create)
- **Done when:**
  - TaskList loads entries for `currentDate` from IndexedDB
  - Entries sorted newest first (by startTime descending)
  - TaskItem displays: time span, category name, "zählt als Arbeitszeit" indicator
  - Running task (endTime === null) shows "laufend" instead of end time
  - Click on item opens edit modal (placeholder for now)
- **Verify:**
  - `npm run dev`
  - Add tasks via modal - appear in list
  - Create running task (no end time) - shows "laufend"
  - List updates reactively when new task added
- **Guardrails:**
  - Join with `categories` store to get category name
  - Handle missing category gracefully (show ID or "Unknown")

---

### Task 2.12 — Implement running task warning banner
- **Files:**
  - `src/lib/components/WarningBanner.svelte` (create)
  - `src/routes/day/+page.svelte` (modify)
- **Done when:**
  - Banner shows "⚠ Aufgabe läuft noch (keine Endzeit)" when `runningEntry` exists
  - Banner appears above day type selector
  - Banner disappears immediately when running task gets end time
  - Banner is persistent (not dismissible)
- **Verify:**
  - `npm run dev`
  - Create running task - banner appears
  - Edit task to add end time - banner disappears
  - No running task - banner hidden
- **Guardrails:**
  - Use `runningEntry` derived store
  - Keep styling simple (yellow background, warning icon)

---

### Task 2.13 — Calculate real Ist from time entries
- **Files:**
  - `src/routes/day/+page.svelte` (modify)
- **Done when:**
  - Loads time entries for `currentDate`
  - Calculates Ist using `calculateIst()` utility
  - Passes real Ist to InlineSummary
  - Recalculates when entries change
- **Verify:**
  - `npm run dev`
  - Add tasks with work time categories - Ist increases
  - Add tasks with non-work categories (Pause) - Ist unchanged
  - Delete task - Ist decreases
- **Guardrails:**
  - Exclude running tasks from Ist calculation
  - Use reactive statements to recalculate

---

### Task 2.14 — Implement edit task functionality
- **Files:**
  - `src/lib/components/AddTaskModal.svelte` (modify - rename to TaskModal)
  - `src/lib/components/TaskItem.svelte` (modify)
- **Done when:**
  - TaskModal accepts optional `entry` prop (for edit mode)
  - If `entry` provided, pre-fills form fields
  - Save button updates existing entry (instead of creating new)
  - TaskItem click opens modal with entry data
- **Verify:**
  - `npm run dev`
  - Click task - modal opens with data pre-filled
  - Edit fields, save - entry updates in IndexedDB and list
- **Guardrails:**
  - Update `updatedAt` timestamp on edit
  - Validate same rules as create

---

### Task 2.15 — Implement delete task functionality
- **Files:**
  - `src/lib/components/TaskItem.svelte` (modify)
- **Done when:**
  - TaskItem has delete button (🗑️ icon or text)
  - Click delete shows confirmation dialog
  - Confirm deletes entry from IndexedDB
  - List updates reactively
- **Verify:**
  - `npm run dev`
  - Click delete on task - confirmation appears
  - Confirm - task removed from list and IndexedDB
  - Cancel - task remains
- **Guardrails:**
  - Use native `confirm()` for v1 (can enhance later)
  - Remove from IndexedDB, not just hide

---

## Phase 3: Additional Tabs

### Task 3.1 — Implement Week tab UI structure
- **Files:**
  - `src/routes/week/+page.svelte` (modify)
- **Done when:**
  - Renders week navigation (← Aktuelle KW X →)
  - Renders week type selector (dropdown)
  - Renders InlineSummary for week totals
  - Renders list of days (7 items, filtered by active days in model)
- **Verify:**
  - `npm run dev` → `/week`
  - All elements visible
  - Week navigation buttons clickable
- **Guardrails:**
  - Use `currentWeek` store
  - Calculate week number using `getCurrentWeekNumber()`

---

### Task 3.2 — Implement week navigation logic
- **Files:**
  - `src/routes/week/+page.svelte` (modify)
- **Done when:**
  - ← button decrements week by 7 days
  - → button increments week by 7 days
  - "Aktuelle KW" button sets to current week
  - Heading shows "Aktuelle KW X" if current week, else "KW X"
- **Verify:**
  - `npm run dev` → `/week`
  - Navigate weeks - date range updates correctly
  - Week number displays correctly
- **Guardrails:**
  - Update `currentWeek` store (derived from date)
  - Use `getWeekBounds()` utility

---

### Task 3.3 — Implement week type selector
- **Files:**
  - `src/lib/components/WeekTypeSelector.svelte` (create)
- **Done when:**
  - Dropdown with 4 options: Arbeitswoche, Urlaub, Krank, Feiertag
  - On change, sets day type for all 7 days of week in IndexedDB
  - Confirmation dialog warns "Dies setzt alle Tage dieser Woche"
- **Verify:**
  - `npm run dev` → `/week`
  - Select week type - all 7 days updated in IndexedDB
  - Navigate to Day tab - day types match
- **Guardrails:**
  - Use `getWeekBounds()` to get all 7 dates
  - Batch update (single transaction if possible)

---

### Task 3.4 — Calculate week Ist/Soll/Saldo
- **Files:**
  - `src/routes/week/+page.svelte` (modify)
- **Done when:**
  - Loads all entries for week (7 days)
  - Loads day types for all 7 days
  - Calculates total Ist (sum of all days)
  - Calculates total Soll (sum of all days based on types + model)
  - Calculates Saldo (Ist - Soll)
  - Passes to InlineSummary
- **Verify:**
  - `npm run dev` → `/week`
  - Add tasks across multiple days - week Ist updates
  - Change day types - week Soll updates
- **Guardrails:**
  - Recalculate reactively when week changes
  - Handle missing data gracefully

---

### Task 3.5 — Render week day list
- **Files:**
  - `src/lib/components/WeekDayList.svelte` (create)
  - `src/lib/components/WeekDayItem.svelte` (create)
- **Done when:**
  - Lists all 7 days of week
  - Filters out days not active in work time model (where model[dayOfWeek] === null)
  - Each item shows: date, day type, Ist/Soll
  - Format: "Mo 18.03 – Arbeitstag   Ist 4,0 / Soll 8,0"
- **Verify:**
  - `npm run dev` → `/week`
  - Create work time model with some days inactive (e.g., Sat/Sun = null)
  - Week list shows only active days
  - Ist/Soll values correct per day
- **Guardrails:**
  - Use `getDayOfWeek()` to check model
  - Calculate per-day Ist/Soll using existing utilities

---

### Task 3.6 — Implement Analysis tab UI structure
- **Files:**
  - `src/routes/analysis/+page.svelte` (modify)
- **Done when:**
  - Renders date range selector (button that opens modal)
  - Renders InlineSummary for total Ist/Soll/Saldo
  - Renders period list (grouped by week or month)
  - Default range: 01.01.current year to today
- **Verify:**
  - `npm run dev` → `/analysis`
  - All elements visible
  - Default range displays correctly
- **Guardrails:**
  - Store selected range in `appState` IndexedDB (persist across sessions)

---

### Task 3.7 — Create DateRangeSelector component
- **Files:**
  - `src/lib/components/DateRangeSelector.svelte` (create)
- **Done when:**
  - Modal with two sections: Schnellwahl + Manuell
  - Schnellwahl: "Aktuelles Jahr" button
  - Manuell: Two date fields (Von, Bis) with DD.MM.YYYY format
  - Both text input and date picker supported (use `<input type="date">` as fallback)
  - Save button applies range, Cancel closes without saving
- **Verify:**
  - `npm run dev` → `/analysis`
  - Click range selector - modal opens
  - Select "Aktuelles Jahr" - range updates to 01.01.YYYY - today
  - Enter manual dates - range updates
- **Guardrails:**
  - Validate: Von ≤ Bis
  - Save to `appState` IndexedDB

---

### Task 3.8 — Calculate analysis totals
- **Files:**
  - `src/routes/analysis/+page.svelte` (modify)
- **Done when:**
  - Loads all entries within selected date range
  - Loads day types for all dates in range
  - Calculates total Ist, Soll, Saldo
  - Passes to InlineSummary
- **Verify:**
  - `npm run dev` → `/analysis`
  - Change date range - totals update
  - Add tasks in range - Ist increases
- **Guardrails:**
  - Efficient query (use IndexedDB date index)
  - Recalculate when range changes

---

### Task 3.9 — Implement period grouping logic
- **Files:**
  - `src/lib/utils/analysis.ts` (create)
- **Done when:**
  - Exports `groupByPeriod(entries, dayTypes, range)` function
  - If range ≈ 1 month (≤ 60 days) → group by calendar week
  - If range > 2 months → group by month
  - Returns array of periods with Ist/Soll/Saldo per period
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual tests with different ranges
- **Guardrails:**
  - Include current incomplete period (e.g., current week/month)
  - Sort periods chronologically

---

### Task 3.10 — Render period list
- **Files:**
  - `src/lib/components/PeriodList.svelte` (create)
  - `src/lib/components/PeriodItem.svelte` (create)
- **Done when:**
  - Lists all periods from `groupByPeriod()`
  - Each item shows: period label (KW X or Month name), Ist/Soll
  - Format: "KW 12 – Arbeitswoche   Ist 38 / Soll 51"
  - Current incomplete period clearly marked
- **Verify:**
  - `npm run dev` → `/analysis`
  - Periods display correctly
  - Grouping changes based on date range
- **Guardrails:**
  - Use German month names
  - Handle edge cases (range with no data)

---

### Task 3.11 — Implement Settings tab UI structure
- **Files:**
  - `src/routes/settings/+page.svelte` (modify)
- **Done when:**
  - Renders two sections: Kategorien + Arbeitszeitmodelle
  - Each section has heading + "Add" button
  - Renders lists (empty for now)
- **Verify:**
  - `npm run dev` → `/settings`
  - Both sections visible
  - Add buttons clickable
- **Guardrails:**
  - Keep sections visually separated

---

### Task 3.12 — Implement category list
- **Files:**
  - `src/lib/components/CategoryList.svelte` (create)
  - `src/lib/components/CategoryItem.svelte` (create)
- **Done when:**
  - Loads categories from store
  - Each item shows: name, "Zählt als Arbeitszeit" checkbox, delete button
  - System categories (Pause, Urlaub, Krank, Feiertag) have no delete button
  - Checkbox is read-only display (not editable inline)
- **Verify:**
  - `npm run dev` → `/settings`
  - System categories visible, no delete button
  - Custom categories (if any) have delete button
- **Guardrails:**
  - Filter by `isSystem` flag for delete button visibility

---

### Task 3.13 — Implement add category modal
- **Files:**
  - `src/lib/components/AddCategoryModal.svelte` (create)
- **Done when:**
  - Modal with fields: Name (text), "Zählt als Arbeitszeit" (checkbox)
  - Save creates category in IndexedDB with `isSystem: false`
  - Category appears in list immediately
  - Cancel closes without saving
- **Verify:**
  - `npm run dev` → `/settings`
  - Click "Add Category" - modal opens
  - Create category - appears in list and IndexedDB
- **Guardrails:**
  - Validate: name required, no duplicates
  - Use `crypto.randomUUID()` for ID

---

### Task 3.14 — Implement delete category
- **Files:**
  - `src/lib/components/CategoryItem.svelte` (modify)
- **Done when:**
  - Delete button shows confirmation dialog
  - Confirm deletes category from IndexedDB
  - Category removed from list
  - Warning if category is used in time entries (optional for v1)
- **Verify:**
  - `npm run dev` → `/settings`
  - Delete custom category - removed from list and IndexedDB
  - System categories still cannot be deleted
- **Guardrails:**
  - Only allow delete if `isSystem: false`
  - Use native `confirm()` for v1

---

### Task 3.15 — Implement work time model list
- **Files:**
  - `src/lib/components/WorkTimeModelList.svelte` (create)
  - `src/lib/components/WorkTimeModelItem.svelte` (create)
- **Done when:**
  - Loads models from store, sorted by validFrom descending
  - Each item shows: validFrom date, weekly total hours
  - Click item to expand/collapse details (7 weekdays + hours)
- **Verify:**
  - `npm run dev` → `/settings`
  - Models display correctly
  - Click to expand - shows all 7 days
- **Guardrails:**
  - Format validFrom as DD.MM.YYYY
  - Calculate weekly total (sum of non-null days)

---

### Task 3.16 — Implement add work time model modal
- **Files:**
  - `src/lib/components/AddWorkTimeModelModal.svelte` (create)
- **Done when:**
  - Modal with fields: "Gültig ab" (date), 7 weekday rows (checkbox + hours)
  - Each row: "☑ Montag [8,0] Std"
  - Hours field disabled if checkbox unchecked
  - Hours field value preserved when toggling checkbox
  - Weekly total displayed (read-only, auto-calculated)
  - Save creates model in IndexedDB
- **Verify:**
  - `npm run dev` → `/settings`
  - Click "Add Model" - modal opens
  - Toggle checkboxes - hours fields enable/disable
  - Enter hours - weekly total updates
  - Save - model appears in list
- **Guardrails:**
  - Validate: validFrom required, no duplicate dates
  - Accept both comma and period as decimal separator
  - Store null for inactive days (checkbox unchecked)

---

## Phase 4: Sync & Polish

### Task 4.1 — Implement outbox queue operations
- **Files:**
  - `src/lib/sync/outbox.ts` (create)
- **Done when:**
  - Exports `addToOutbox(type, payload)` - creates outbox entry
  - Exports `getOutboxItems()` - returns all pending items
  - Exports `markAsSent(id)` - updates status to 'acked'
  - Exports `markAsFailed(id, error)` - updates status, increments retryCount
- **Verify:**
  - `npm run check` - no TypeScript errors
  - Manual test: Add items, retrieve, mark as sent
- **Guardrails:**
  - Use `crypto.randomUUID()` for outbox IDs
  - Set timestamps correctly

---

### Task 4.2 — Integrate outbox with data operations
- **Files:**
  - `src/lib/db/operations.ts` (modify)
- **Done when:**
  - All write operations (put, delete) also create outbox entry
  - Outbox entry created AFTER successful DB write (in same transaction if possible)
  - Outbox type matches operation (e.g., 'entry_upsert', 'category_delete')
- **Verify:**
  - `npm run dev`
  - Create/edit/delete any entity - outbox entry created
  - Check IndexedDB outbox store - entries exist
- **Guardrails:**
  - Keep payload minimal (only data needed for server sync)
  - Do not create outbox entries for reads

---

### Task 4.3 — Create sync engine module
- **Files:**
  - `src/lib/sync/engine.ts` (create)
- **Done when:**
  - Exports `syncNow()` function
  - Function retrieves pending outbox items
  - Logs items to console (no actual API call for v1)
  - Marks items as 'acked' (simulating successful sync)
  - Updates `syncStatus` store during sync
- **Verify:**
  - `npm run dev`
  - Call `syncNow()` from console
  - Console shows outbox items
  - Outbox cleared, syncStatus updates
- **Guardrails:**
  - Handle empty outbox gracefully
  - Set syncStatus to 'syncing' during, 'synced' after

---

### Task 4.4 — Implement sync triggers
- **Files:**
  - `src/routes/+layout.svelte` (modify)
- **Done when:**
  - Sync runs on app mount
  - Sync runs when online event fires (navigator.onLine)
  - Sync runs when visibility changes to visible
  - Optional: Sync runs every 60s if outbox not empty (while app open)
- **Verify:**
  - `npm run dev`
  - Create offline changes, go online - sync triggers
  - Switch tabs away/back - sync triggers
- **Guardrails:**
  - Only sync if authenticated (skip for v1 if no auth)
  - Debounce rapid triggers (max 1 sync per 5 seconds)

---

### Task 4.5 — Create sync status indicator component
- **Files:**
  - `src/lib/components/SyncIndicator.svelte` (create)
  - `src/routes/+layout.svelte` (modify)
- **Done when:**
  - Component shows icon based on `syncStatus` store
  - States: ✅ Synced (green), ⚠️ Not backed up (yellow), 🔄 Syncing (blue), ❌ Error (red)
  - Always visible in app header/footer
  - Click opens details modal (optional for v1)
- **Verify:**
  - `npm run dev`
  - Create changes - indicator shows "Not backed up"
  - Trigger sync - indicator shows "Syncing" then "Synced"
- **Guardrails:**
  - Keep indicator small, non-intrusive
  - Use color + icon (not color alone for accessibility)

---

### Task 4.6 — Implement online/offline detection
- **Files:**
  - `src/routes/+layout.svelte` (modify)
- **Done when:**
  - `isOnline` store initialized with `navigator.onLine`
  - Listens to 'online' and 'offline' events
  - Updates store when connectivity changes
  - Optional: Shows toast notification on connectivity change
- **Verify:**
  - `npm run dev`
  - Toggle DevTools network (offline/online) - store updates
  - Sync triggers when going online
- **Guardrails:**
  - Clean up event listeners on component destroy

---

### Task 4.7 — Add loading states to all async operations
- **Files:**
  - All components with async operations (modify)
- **Done when:**
  - All IndexedDB operations show loading state (spinner or disabled buttons)
  - No double-submit possible (buttons disabled during save)
  - Error states displayed if operation fails
- **Verify:**
  - `npm run dev`
  - Perform operations - buttons disable during save
  - Simulate slow IndexedDB (DevTools throttling) - loading states visible
- **Guardrails:**
  - Use local component state for loading flags
  - Re-enable buttons after operation completes (success or error)

---

### Task 4.8 — Implement basic error boundaries
- **Files:**
  - `src/routes/+error.svelte` (create)
- **Done when:**
  - Catches unhandled errors in routes
  - Displays user-friendly error message
  - Shows "Reload" button
  - Logs error to console for debugging
- **Verify:**
  - `npm run dev`
  - Trigger error (e.g., throw in component) - error page shows
  - Click reload - app recovers
- **Guardrails:**
  - Do not expose technical details to user
  - Keep error page simple

---

### Task 4.9 — Add input validation to all forms
- **Files:**
  - All modal/form components (modify)
- **Done when:**
  - Required fields validated (not empty)
  - Date fields validated (valid format, reasonable range)
  - Time fields validated (HH:mm format, end > start)
  - Hours fields validated (positive number, reasonable range 0-24)
  - Validation errors shown inline (below field)
  - Save button disabled if validation fails
- **Verify:**
  - `npm run dev`
  - Try to save invalid data - errors shown, save blocked
  - Fix errors - save enabled
- **Guardrails:**
  - Use HTML5 validation attributes where possible
  - Add custom validation for complex rules

---

### Task 4.10 — Optimize IndexedDB queries
- **Files:**
  - `src/lib/db/operations.ts` (modify)
- **Done when:**
  - All queries use appropriate indexes
  - Date range queries use compound index [date+startTime]
  - No full table scans for common operations
  - Cursors closed properly
- **Verify:**
  - `npm run dev`
  - Check DevTools → Performance - IndexedDB queries fast (<50ms)
  - Test with large dataset (1000+ entries)
- **Guardrails:**
  - Use `IDBKeyRange` for range queries
  - Limit results where appropriate

---

### Task 4.11 — Add basic accessibility features
- **Files:**
  - All components (modify)
- **Done when:**
  - All interactive elements keyboard accessible (tab navigation)
  - Buttons have visible focus states
  - Form labels properly associated with inputs
  - Modals trap focus (tab cycles within modal)
  - ARIA labels on icon-only buttons
- **Verify:**
  - `npm run dev`
  - Navigate entire app using only keyboard
  - Screen reader announces elements correctly (test with NVDA/JAWS if possible)
- **Guardrails:**
  - Use semantic HTML (`<button>`, `<label>`, etc.)
  - Do not remove focus outlines

---

### Task 4.12 — Implement responsive design
- **Files:**
  - All components (modify)
  - `src/app.css` or component styles (modify)
- **Done when:**
  - App works on 320px width (iPhone SE)
  - Touch targets ≥ 44×44px
  - Text readable without zoom
  - No horizontal scroll
  - Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- **Verify:**
  - `npm run dev`
  - Test in DevTools responsive mode at various sizes
  - Test on real mobile device if available
- **Guardrails:**
  - Mobile-first CSS (base styles for mobile, media queries for larger)
  - Use relative units (rem, %, vh/vw)

---

### Task 4.13 — Test PWA installation flow
- **Files:**
  - None (testing task)
- **Done when:**
  - Build succeeds: `npm run build`
  - Preview works: `npm run preview`
  - Manifest loads at `/manifest.webmanifest`
  - Service worker registers in DevTools
  - App installable in Chrome (desktop + Android)
  - Installed app opens in standalone mode
  - Offline works (disconnect network, reload)
- **Verify:**
  - Run checklist from `PROJECT_SCAFFOLD_CHECKLIST.md` section F
- **Guardrails:**
  - Test in production build, not dev mode
  - Clear cache between tests

---

### Task 4.14 — Write basic E2E test
- **Files:**
  - `e2e/timetracker.test.ts` (create)
- **Done when:**
  - Test navigates to app
  - Test adds a task
  - Test verifies task appears in list
  - Test navigates to Week tab
  - Test verifies week summary updates
  - Test passes in CI (if configured)
- **Verify:**
  - `npm run test:e2e` - test passes
- **Guardrails:**
  - Use Playwright selectors (data-testid recommended)
  - Keep test simple and stable

---

### Task 4.15 — Final polish and deployment prep
- **Files:**
  - Various (cleanup)
- **Done when:**
  - All console.log removed or replaced with proper logging
  - No TypeScript errors: `npm run check`
  - No lint errors: `npm run lint`
  - Code formatted: `npm run format`
  - README updated with setup/deploy instructions
  - All tasks from `PROJECT_SCAFFOLD_CHECKLIST.md` completed
- **Verify:**
  - `npm run check` - passes
  - `npm run lint` - passes
  - `npm run build` - succeeds
  - `npm run preview` - app works
- **Guardrails:**
  - Do not deploy with debug code
  - Verify all environment variables set (if any)

---

**END OF TASKS**

## Summary
- **Total tasks:** 60
- **Estimated time:** 40-50 hours
- **Phases:** 4 (Foundation → Core UI → Additional Tabs → Sync & Polish)
- **Verification:** Each task has specific verification steps
- **Guardrails:** Each task has constraints to prevent common mistakes

## Next Steps After Approval
1. Review plan + tasks with user
2. Get approval or incorporate feedback
3. Begin implementation starting with Task 1.1
4. Mark tasks complete as verified
5. Update plan/tasks if reality differs from assumptions
