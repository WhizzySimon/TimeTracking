# TimeTracker v1 — Implementation Plan

**Status:** Draft for approval  
**Based on:** ui-logic-spec-v1.md + technical-guideline-v1.md  
**Target:** Offline-first PWA for time tracking

---

## 1. Architecture Overview

### 1.1 Application Structure

```
TimeTracker (SPA)
├── PWA Shell (offline-capable)
├── Tab Navigation (4 tabs)
├── Local-First Data Layer (IndexedDB)
├── Sync Engine (outbox pattern)
└── Auth Layer (optional for v1, required for cloud backup)
```

### 1.2 Module Responsibilities

**Core Modules:**
- **`/lib/db/`** - IndexedDB wrapper, schema, migrations
- **`/lib/stores/`** - Svelte stores for reactive state
- **`/lib/sync/`** - Outbox queue, sync engine
- **`/lib/auth/`** - Session management, token storage
- **`/lib/utils/`** - Date helpers, calculation logic, formatters
- **`/lib/components/`** - Reusable UI components

**Route Structure:**
- **`/routes/+layout.svelte`** - App shell, tab navigation, SW registration
- **`/routes/+layout.js`** - SSR/CSR config (ssr=false, csr=true)
- **`/routes/+page.svelte`** - Redirect to /day (default tab)
- **`/routes/day/+page.svelte`** - Day tab
- **`/routes/week/+page.svelte`** - Week tab
- **`/routes/analysis/+page.svelte`** - Auswertung tab
- **`/routes/settings/+page.svelte`** - Einstellungen tab

---

## 2. Data Model (IndexedDB)

### 2.1 Database Name
`timetracker-v1`

### 2.2 Object Stores (Tables)

#### **categories**
```typescript
{
  id: string (UUID)
  name: string
  countsAsWorkTime: boolean
  isSystem: boolean // true for Pause, Urlaub, Krank, Feiertag
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}
```
**Indexes:** `name`, `isSystem`

#### **timeEntries**
```typescript
{
  id: string (UUID)
  date: string (YYYY-MM-DD)
  categoryId: string (FK to categories)
  startTime: string (HH:mm)
  endTime: string | null (HH:mm or null if running)
  description: string | null
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}
```
**Indexes:** `date`, `categoryId`, `[date+startTime]` (compound)

#### **dayTypes**
```typescript
{
  date: string (YYYY-MM-DD) // PK
  type: 'arbeitstag' | 'urlaub' | 'krank' | 'feiertag'
  updatedAt: number (timestamp)
}
```
**Indexes:** `date` (primary key)

#### **workTimeModels**
```typescript
{
  id: string (UUID)
  validFrom: string (YYYY-MM-DD)
  monday: number | null (hours, null if inactive)
  tuesday: number | null
  wednesday: number | null
  thursday: number | null
  friday: number | null
  saturday: number | null
  sunday: number | null
  createdAt: number (timestamp)
  updatedAt: number (timestamp)
}
```
**Indexes:** `validFrom`

#### **outbox**
```typescript
{
  id: string (UUID)
  createdAt: number (timestamp)
  type: 'category_upsert' | 'category_delete' | 'entry_upsert' | 'entry_delete' | 'dayType_upsert' | 'model_upsert'
  payload: object (JSON)
  status: 'pending' | 'sending' | 'acked'
  retryCount: number
  lastError: string | null
}
```
**Indexes:** `status`, `createdAt`

#### **appState**
```typescript
{
  key: string (PK) // e.g., 'lastSelectedTab', 'analysisDateRange'
  value: any (JSON)
  updatedAt: number (timestamp)
}
```
**Indexes:** `key` (primary key)

#### **authSession** (optional for v1)
```typescript
{
  id: 'session' (singleton)
  token: string | null
  userId: string | null
  email: string | null
  expiresAt: number | null (timestamp)
  updatedAt: number (timestamp)
}
```

---

## 3. UI State Model

### 3.1 Svelte Stores (Reactive State)

**Global Stores:**
- **`currentDate`** - Writable<Date> - Selected date for Day tab
- **`currentWeek`** - Derived<{start: Date, end: Date}> - Selected week for Week tab
- **`categories`** - Writable<Category[]> - All categories
- **`timeEntries`** - Writable<TimeEntry[]> - All time entries (filtered per view)
- **`workTimeModels`** - Writable<WorkTimeModel[]> - All work time models
- **`syncStatus`** - Writable<'synced' | 'pending' | 'syncing' | 'error'> - Sync indicator
- **`isOnline`** - Writable<boolean> - Network status

**Derived Stores:**
- **`activeDayEntries`** - Derived from timeEntries + currentDate
- **`activeWeekEntries`** - Derived from timeEntries + currentWeek
- **`runningEntry`** - Derived from timeEntries (entry with endTime === null)
- **`activeWorkTimeModel`** - Derived from workTimeModels + currentDate

### 3.2 Component-Local State
- Form inputs (controlled components)
- Modal/dialog open states
- Dropdown selections

---

## 4. Component Hierarchy

### 4.1 Layout Components
```
+layout.svelte
├── TabNavigation (Tag | Woche | Auswertung | Einstellungen)
├── SyncIndicator (⚠️ Not backed up / ✅ Synced)
└── <slot /> (page content)
```

### 4.2 Page Components

**Day Tab (`/routes/day/+page.svelte`):**
```
DayView
├── WarningBanner (if running entry exists)
├── DayTypeSelector (dropdown)
├── DaySummary (Ist / Soll / Saldo inline)
├── AddTaskButton
└── TaskList
    └── TaskItem (×N)
```

**Week Tab (`/routes/week/+page.svelte`):**
```
WeekView
├── WeekTypeSelector (dropdown, sets all days)
├── WeekSummary (Ist / Soll / Saldo inline)
└── DayList
    └── DayItem (×7, filtered by active days in model)
```

**Analysis Tab (`/routes/analysis/+page.svelte`):**
```
AnalysisView
├── DateRangeSelector (Schnellwahl + Manual)
├── AnalysisSummary (Gesamt Ist / Soll / Saldo)
└── PeriodList (auto-grouped by KW or Month)
    └── PeriodItem (×N)
```

**Settings Tab (`/routes/settings/+page.svelte`):**
```
SettingsView
├── CategoriesSection
│   ├── AddCategoryButton
│   └── CategoryList
│       └── CategoryItem (×N, with delete button)
└── WorkTimeModelsSection
    ├── AddModelButton
    └── ModelList
        └── ModelItem (×N)
```

### 4.3 Reusable Components
- **`Button.svelte`** - Primary/secondary variants
- **`Dropdown.svelte`** - Accessible select
- **`TextField.svelte`** - Text input with validation
- **`TimeField.svelte`** - HH:mm input (text + optional picker)
- **`DateField.svelte`** - DD.MM.YYYY input (text + optional picker)
- **`Checkbox.svelte`** - Labeled checkbox
- **`Modal.svelte`** - Dialog wrapper
- **`InlineSummary.svelte`** - Ist/Soll/Saldo display

---

## 5. Calculation Logic

### 5.1 Ist (Actual Hours)
```typescript
function calculateIst(entries: TimeEntry[], categories: Category[]): number {
  return entries
    .filter(e => e.endTime !== null) // exclude running
    .filter(e => {
      const cat = categories.find(c => c.id === e.categoryId);
      return cat?.countsAsWorkTime === true;
    })
    .reduce((sum, e) => sum + calculateDuration(e.startTime, e.endTime!), 0);
}
```

### 5.2 Soll (Target Hours)
```typescript
function calculateSoll(date: Date, dayType: DayType, model: WorkTimeModel): number {
  if (dayType.type !== 'arbeitstag') return 0;
  const dayOfWeek = getDayOfWeek(date); // 'monday' | 'tuesday' | ...
  return model[dayOfWeek] ?? 0;
}
```

### 5.3 Saldo (Balance)
```typescript
function calculateSaldo(ist: number, soll: number): number {
  return ist - soll;
}
```

---

## 6. Error Handling Strategy

### 6.1 IndexedDB Errors
- **On open failure:** Show error banner, offer "Retry" or "Clear data"
- **On transaction failure:** Log to console, show user-friendly message
- **On quota exceeded:** Prompt user to free space or sync to cloud

### 6.2 Sync Errors
- **Network timeout:** Retry with exponential backoff (max 3 retries)
- **Auth failure (401):** Clear session, redirect to login
- **Server error (5xx):** Mark outbox item as failed, retry on next trigger
- **Conflict (409):** Log conflict, require manual resolution (future)

### 6.3 Validation Errors
- **Invalid date:** Show inline error, prevent save
- **Duplicate work time model date:** Show error, prevent save
- **Running entry exists:** Show warning banner (not blocking)

### 6.4 Offline Handling
- **No network:** Show offline indicator, allow all local operations
- **Sync disabled:** Queue changes in outbox, show "Not backed up" warning

---

## 7. PWA Implementation

### 7.1 Required Files
- **`static/manifest.webmanifest`** - PWA manifest
- **`static/icons/icon-192.png`** - App icon 192×192
- **`static/icons/icon-512.png`** - App icon 512×512
- **`static/apple-touch-icon.png`** - iOS icon 180×180
- **`static/sw.js`** - Service worker (app shell caching)

### 7.2 Service Worker Strategy
**Cache-first for:**
- `/` (app shell HTML)
- `/_app/**` (built JS/CSS)
- `/icons/**`
- `/manifest.webmanifest`

**Network-only for:**
- API calls (`/api/**` or external backend)

**Fallback:**
- If offline and resource not cached, serve cached app shell

### 7.3 Registration
In `+layout.svelte`:
```typescript
onMount(() => {
  if (!dev && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
});
```

---

## 8. Performance & UX Constraints

### 8.1 Mobile-First Design
- Touch targets ≥ 44×44px
- No hover-only interactions
- Responsive breakpoints: 320px (min), 768px (tablet), 1024px (desktop)

### 8.2 Offline UX
- Clear sync status indicator always visible
- Optimistic UI updates (save locally first, sync later)
- No blocking spinners for network operations

### 8.3 iOS Safari Constraints
- Avoid `100vh` (use `100dvh` or safe-area-inset)
- No background timers (sync only when app open)
- Test in standalone mode (installed PWA)

### 8.4 Performance Targets
- First paint < 1s
- Time to interactive < 2s
- IndexedDB queries < 50ms (for typical dataset: 1000 entries)

---

## 9. Testing Strategy

### 9.1 Unit Tests (Optional for v1)
- Calculation logic (Ist/Soll/Saldo)
- Date utilities
- Validation functions

### 9.2 Integration Tests (Manual)
- IndexedDB CRUD operations
- Outbox queue behavior
- Sync flow (mock backend)

### 9.3 E2E Tests (Playwright - Minimal)
- **Critical path:** Add task → View summary → Navigate tabs
- **Offline:** Load app offline, verify cached shell
- **PWA install:** Verify manifest, icons, service worker

### 9.4 Manual Testing Checklist
- [ ] Day tab: Add/edit/delete tasks
- [ ] Week tab: Set week type, view summary
- [ ] Analysis tab: Change date range, view grouping
- [ ] Settings: Add/delete categories, add work time model
- [ ] Offline: Disconnect network, verify app works
- [ ] Sync: Reconnect, verify outbox uploads
- [ ] PWA install: Install on Android, verify standalone mode

---

## 10. Risks & Constraints

### 10.1 Technical Risks
- **iOS storage eviction:** Mitigated by aggressive sync + user warnings
- **IndexedDB quota limits:** Mitigated by data cleanup (future)
- **Service worker cache invalidation:** Mitigated by versioned cache names

### 10.2 UX Risks
- **Running task forgotten:** Mitigated by persistent warning banner
- **Unsynced data loss:** Mitigated by sync indicator + frequent sync triggers

### 10.3 Scope Constraints
**v1 does NOT include:**
- Backend implementation (API stub only)
- Multi-device sync (push-only backup)
- Conflict resolution
- Data export/import
- Push notifications

---

## 11. Dependencies

### 11.1 Production Dependencies
- **None** (vanilla Svelte 5 + SvelteKit)

### 11.2 Dev Dependencies (Already Installed)
- `@sveltejs/kit`
- `@sveltejs/adapter-static`
- `svelte`
- `typescript`
- `vite`
- `@playwright/test` (E2E)

### 11.3 New Dependencies (If Needed)
- **UUID generation:** Use `crypto.randomUUID()` (native)
- **Date handling:** Native `Date` + custom utils (no library)
- **IndexedDB:** Native API + thin wrapper (no library)

---

## 12. Deployment Plan

### 12.1 Build Process
```bash
npm run build
# Output: build/ (static files)
```

### 12.2 Hosting Options
- **Netlify** (recommended: free, HTTPS, easy deploy)
- **Vercel** (alternative)
- **GitHub Pages** (requires custom domain for HTTPS)

### 12.3 Deployment Checklist
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)
- [ ] Service worker registers in prod build
- [ ] Manifest accessible at `/manifest.webmanifest`
- [ ] App installable on Android Chrome
- [ ] App works offline after first load
- [ ] Deploy to HTTPS hosting
- [ ] Test on real Android device
- [ ] Brother tests on iPhone Safari

---

## 13. Implementation Phases

### Phase 1: Foundation (PWA + Data Layer)
- SSR config, PWA manifest, service worker
- IndexedDB schema + wrapper
- Basic stores setup

### Phase 2: Core UI (Day Tab)
- Tab navigation shell
- Day tab with task list
- Add/edit/delete tasks
- Calculation logic (Ist/Soll/Saldo)

### Phase 3: Additional Tabs
- Week tab
- Analysis tab
- Settings tab (categories + models)

### Phase 4: Sync & Polish
- Outbox queue implementation
- Sync engine (mock backend)
- Offline indicators
- Final testing + deployment

---

**END OF PLAN**
