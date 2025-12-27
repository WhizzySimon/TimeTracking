# multi-arbeitgeber — Plan

**Phase:** A2  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/multi-arbeitgeber.md`

---

## Architecture / Modules

### New Components

- `EmployerSelector.svelte` — Tab bar for AG selection (ALL / AG1 / AG2)
- `EmployerDialog.svelte` — Create/edit employer modal
- `StundenzettelExport.svelte` — Column selection + export dialog

### Modified Components

- `Header.svelte` — Add EmployerSelector below title
- `DayTab.svelte`, `WeekTab.svelte`, `MonthTab.svelte`, `AnalysisTab.svelte` — Filter by selected AG
- `AddTab.svelte` — Group categories by AG
- `SettingsPage.svelte` — AG management section, categories grouped by AG
- `WorkTimeModelDialog.svelte` — Add employerId field

### New Stores

- `employers` store — List of employers
- `selectedEmployer` store — Current selection (null = ALL)

### Modified Stores

- `categories` — Add employerId filter
- `timeEntries` — Add employerId filter
- `workTimeModels` — Add employerId filter

---

## Data Model

### IndexedDB

**New store: `employers`**

```typescript
interface Employer {
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	isActive: boolean;
}
```

**Modified: `categories`**

```typescript
interface Category {
	// existing fields...
	employerId?: string | null; // null = all AGs
}
```

**Modified: `timeEntries`**

```typescript
interface TimeEntry {
	// existing fields...
	employerId?: string | null;
}
```

**Modified: `workTimeModels`**

```typescript
interface WorkTimeModel {
	// existing fields...
	employerId?: string | null;
}
```

### Supabase

**New table: `employers`**

- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- name (text)
- created_at (timestamptz)
- updated_at (timestamptz)
- is_active (boolean, default true)

**Modified tables:** Add `employer_id` column to:

- categories
- time_entries
- work_time_models

---

## UI State Model

### State

- `selectedEmployerId: string | null` — null means "Alle"
- `employers: Employer[]` — List of active employers
- Derived: `filteredEntries`, `filteredCategories`, `filteredModels`

### Persistence

- `selectedEmployerId` stored in localStorage (session preference)
- Employers synced to cloud for Pro users

### Synchronization

- EmployerSelector reads from `employers` store
- Selection updates `selectedEmployerId`
- All views subscribe to `selectedEmployerId` and filter accordingly

---

## Error Handling

| Error                | Handling             | User Feedback                                     |
| -------------------- | -------------------- | ------------------------------------------------- |
| AG creation fails    | Retry 3x, log error  | Toast: "Arbeitgeber konnte nicht erstellt werden" |
| AG sync fails        | Queue for later sync | Subtle sync indicator                             |
| Filter returns empty | Show empty state     | "Keine Einträge für diesen Arbeitgeber"           |
| Export fails         | Log, show error      | Toast: "Export fehlgeschlagen"                    |

---

## Testing Strategy

### Unit Tests

- Employer CRUD operations
- Filter logic for entries/categories/models
- Soll/Ist calculation per AG

### Integration Tests

- AG creation → appears in selector
- AG selection → filters all views
- AG deletion → entries remain visible in history

### E2E Tests

- Create AG → Add entry → Verify filtering
- Export Stundenzettel per AG
- Multi-AG workflow

---

## Risks / Constraints

- **Performance:** Filtering large datasets on every selection change
  - Mitigation: Memoize filtered results, use derived stores
- **Migration:** Existing entries have no employerId
  - Mitigation: null employerId = visible in all AGs
- **UX:** Tab bar adds height to all screens
  - Mitigation: Compact design, hide when 0 AGs

---

## Tasks

| #     | Task                                                             | Estimate | Dependencies |
| ----- | ---------------------------------------------------------------- | -------- | ------------ |
| A2.1  | IndexedDB migration: add employers store                         | 1h       | -            |
| A2.2  | IndexedDB migration: add employerId to entries/categories/models | 1h       | A2.1         |
| A2.3  | Supabase migration: employers table + columns                    | 1h       | -            |
| A2.4  | Employer store + CRUD operations                                 | 2h       | A2.1         |
| A2.5  | EmployerSelector component                                       | 2h       | A2.4         |
| A2.6  | Integrate selector into Header                                   | 1h       | A2.5         |
| A2.7  | Filter logic for all stores                                      | 2h       | A2.2         |
| A2.8  | Update Day/Week/Month tabs for AG filtering                      | 2h       | A2.7         |
| A2.9  | Update Analysis tab for AG filtering                             | 1h       | A2.7         |
| A2.10 | Update Add tab: group categories by AG                           | 2h       | A2.7         |
| A2.11 | Update Settings: AG management section                           | 2h       | A2.4         |
| A2.12 | Update Settings: categories grouped by AG                        | 1h       | A2.7         |
| A2.13 | Update WorkTimeModelDialog for AG                                | 1h       | A2.2         |
| A2.14 | StundenzettelExport component                                    | 3h       | A2.7         |
| A2.15 | Export to Excel (.xlsx) per AG                                   | 2h       | A2.14        |
| A2.16 | Export to PDF per AG                                             | 1h       | A2.14        |
| A2.17 | Sync employers to Supabase                                       | 2h       | A2.3, A2.4   |
| A2.18 | E2E tests for multi-AG                                           | 2h       | A2.1-A2.17   |

**Total estimate:** ~26 hours
