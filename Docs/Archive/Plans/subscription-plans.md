# subscription-plans — Plan

**Phase:** A1  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Based on Spec:** `Docs/Specs/subscription-plans.md`

---

## Architecture / Modules

### New Components

| Component               | Location              | Responsibility                          |
| ----------------------- | --------------------- | --------------------------------------- |
| `ProPaywall.svelte`     | `src/lib/components/` | Reusable paywall modal for Pro features |
| `PlanComparison.svelte` | `src/lib/components/` | Modal showing Free vs Pro vs Premium    |
| `ExportDialog.svelte`   | `src/lib/components/` | Export format selection dialog          |
| `+page.svelte` (import) | `src/routes/import/`  | Import flow UI                          |

### Modified Components

| Component                          | Changes                                              |
| ---------------------------------- | ---------------------------------------------------- |
| `src/routes/settings/+page.svelte` | Add Konto section, Daten section                     |
| `src/lib/stores/user.ts`           | Already has `isPro`, `isPremium` (no changes needed) |
| `src/lib/backup/`                  | Add plan check before cloud backup                   |

### New Modules

| Module      | Location          | Responsibility            |
| ----------- | ----------------- | ------------------------- |
| `export.ts` | `src/lib/export/` | CSV, JSON, PDF generation |
| `import.ts` | `src/lib/import/` | JSON, Excel parsing       |
| `pdf.ts`    | `src/lib/export/` | PDF table generation      |
| `excel.ts`  | `src/lib/import/` | Excel (.xlsx) parsing     |

### Dependencies

| Library                     | Purpose        | Size   |
| --------------------------- | -------------- | ------ |
| `xlsx` (SheetJS)            | Excel parsing  | ~300KB |
| `jspdf` + `jspdf-autotable` | PDF generation | ~200KB |

---

## Data Model

### Supabase Schema (already exists from P10 prep)

```sql
-- profiles table already has:
-- plan TEXT NOT NULL DEFAULT 'free'

-- Update constraint to include 'premium'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'premium'));
```

### Export Data Shapes

**CSV columns:**

```
date,start_time,end_time,category,description,duration_minutes
2025-12-01,08:00,12:00,Arbeit,Meeting,240
```

**JSON structure:**

```typescript
interface ExportData {
	version: number;
	exportedAt: string;
	entries: TimeEntry[];
	categories: Category[];
	dayTypes: DayType[];
	workTimeModels: WorkTimeModel[];
}
```

**PDF:** Table with same columns as CSV, formatted for print.

### Import Data Shapes

**JSON:** Same as ExportData above.

**Excel:**

- Sheet 1: Entries (date, start, end, category, description)
- Header row required
- Date format: YYYY-MM-DD or DD.MM.YYYY

---

## UI State Model

### Export Dialog State

```typescript
interface ExportDialogState {
	isOpen: boolean;
	selectedFormat: 'csv' | 'json' | 'pdf';
	isExporting: boolean;
	error: string | null;
}
```

### Import Page State

```typescript
interface ImportPageState {
	step: 'upload' | 'preview' | 'importing' | 'complete';
	file: File | null;
	parsedData: ParsedImportData | null;
	validationErrors: ValidationError[];
	importResult: ImportResult | null;
}

interface ParsedImportData {
	entries: TimeEntry[];
	categories: Category[];
	source: 'json' | 'excel';
}

interface ImportResult {
	entriesAdded: number;
	entriesUpdated: number;
	categoriesAdded: number;
}
```

### Paywall State

```typescript
// Managed by existing stores
// $isPro, $isPremium from src/lib/stores/user.ts
```

---

## Error Handling

| Scenario                        | Handling                                     |
| ------------------------------- | -------------------------------------------- |
| Export fails                    | Show toast error, log to console             |
| PDF generation fails            | Fallback to CSV offer                        |
| Import file invalid             | Show error in preview, disable import        |
| Import file too large           | Show size limit error (10MB max)             |
| Excel parse error               | Show row-level errors in preview             |
| Duplicate entries on import     | Show warning, let user choose skip/overwrite |
| Network error during plan check | Use cached plan, default to 'free'           |

---

## Testing Strategy

### Unit Tests

| Module      | Tests                                      |
| ----------- | ------------------------------------------ |
| `export.ts` | CSV format, JSON structure, column headers |
| `import.ts` | JSON parsing, Excel parsing, validation    |
| `pdf.ts`    | Table generation, formatting               |

### Integration Tests

| Flow        | Tests                                               |
| ----------- | --------------------------------------------------- |
| Export flow | Format selection → download trigger                 |
| Import flow | Upload → preview → confirm → data in IndexedDB      |
| Paywall     | Free user → paywall shown, Pro user → feature works |

### E2E Tests

| Scenario         | Tests                               |
| ---------------- | ----------------------------------- |
| Free user export | Shows paywall                       |
| Pro user export  | Downloads file                      |
| Import JSON      | Preview shows data, import succeeds |
| Import Excel     | Parses correctly, imports data      |

---

## Risks / Constraints

### Performance

- **Large exports:** >10k entries may slow PDF generation
  - Mitigation: Warn user, consider pagination for PDF
- **Excel parsing:** Large files may block UI
  - Mitigation: Use Web Worker if needed

### Platform

- **PDF fonts:** Browser-dependent rendering
  - Mitigation: Use standard fonts only
- **Excel format:** Only .xlsx supported (not .xls)
  - Mitigation: Clear error message for .xls files

### UX

- **Import destructive:** Could overwrite existing data
  - Mitigation: Clear preview, confirmation step
- **Plan upgrade:** No Stripe yet
  - Mitigation: "Kommt bald" message, manual upgrade via SQL

---

## Implementation Order

1. **Plan gating infrastructure** — Paywall component, plan checks
2. **Cloud Backup gating** — Check plan before sync
3. **Export (JSON)** — Simplest, already have data structure
4. **Export (CSV)** — Transform entries to CSV
5. **Export (PDF)** — Add jsPDF, generate table
6. **Export Dialog** — UI for format selection
7. **Import (JSON)** — Parse and validate own format
8. **Import (Excel)** — Add xlsx library, parse
9. **Import Route** — Full UI flow
10. **Settings sections** — Konto + Daten UI
11. **Plan Comparison Modal** — Feature comparison
