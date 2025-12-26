# AI Import — Plan

**Phase:** 11  
**Created:** 2025-12-25  
**Last Updated:** 2025-12-25  
**Based on Spec:** `Docs/Specs/ai-import.md`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Module Structure](#module-structure)
3. [Data Model Implementation](#data-model-implementation)
4. [UI Components](#ui-components)
5. [Parsing Pipeline](#parsing-pipeline)
6. [AI Integration](#ai-integration)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)
9. [Risks / Constraints](#risks--constraints)
10. [Implementation Order](#implementation-order)

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|  UI Layer (Svelte Components)                                                     |
|  +-> /import route (ImportPage.svelte)                                            |
|  +-> ImportUpload.svelte (drag-drop, file picker, text paste)                     |
|  +-> ImportProgress.svelte (processing indicator)                                 |
|  +-> ImportReview.svelte (table, issues, bulk actions)                            |
|  +-> ImportCommit.svelte (summary, confirm)                                       |
|  +-> ImportReport.svelte (results)                                                |
+-----------------------------------------------------------------------------------+
|  State Layer (Svelte Stores)                                                      |
|  +-> importBatch store (current batch state)                                      |
|  +-> importPresets store (saved presets)                                          |
+-----------------------------------------------------------------------------------+
|  Service Layer (TypeScript Modules)                                               |
|  +-> src/lib/import/orchestrator.ts (main flow control)                           |
|  +-> src/lib/import/parsers/*.ts (file type parsers)                              |
|  +-> src/lib/import/validators.ts (validation rules)                              |
|  +-> src/lib/import/duplicates.ts (fingerprint + detection)                       |
|  +-> src/lib/import/ai.ts (AI integration wrapper)                                |
+-----------------------------------------------------------------------------------+
|  Storage Layer (IndexedDB)                                                        |
|  +-> importBatches store (draft/committed batches)                                |
|  +-> importPresets store (saved presets)                                          |
+-----------------------------------------------------------------------------------+
|  External (Server-side)                                                           |
|  +-> OCR API (Tesseract or cloud)                                                 |
|  +-> AI API (OpenAI or similar)                                                   |
+-----------------------------------------------------------------------------------+
```

---

## Module Structure

### New Files (MVP)

```
src/
  lib/
    import/
      types.ts              # ImportBatch, TimeEntryCandidate, etc. ✅ Done
      orchestrator.ts       # Main import flow control
      openai.ts             # OpenAI Responses API wrapper
      validators.ts         # Local validation rules
      duplicates.ts         # Fingerprint generation, duplicate detection
      presets.ts            # Preset CRUD operations
      prompts/
        import-system.ts    # System prompt for AI parsing
    storage/
      db.ts                 # Add importBatches + importPresets stores ✅ Done
  routes/
    import/
      +page.svelte          # Main import page (state machine)
    api/
      import/
        parse/
          +server.ts        # Server-side OpenAI API call (Premium only)
  components/
    import/
      ImportUpload.svelte   # File upload UI
      ImportProgress.svelte # Processing progress
      ImportReview.svelte   # Review table + issues
      ImportCommit.svelte   # Commit confirmation
      ImportReport.svelte   # Final report
      CandidateRow.svelte   # Single candidate row (inline edit)
      IssuesPanel.svelte    # Aggregated issues display
      BulkActions.svelte    # Bulk action buttons
      PresetSelector.svelte # Preset dropdown
```

**Removed (AI-first approach):**

- ~~parsers/csv.ts~~ — AI handles all parsing
- ~~parsers/excel.ts~~ — AI handles all parsing
- ~~parsers/json.ts~~ — AI handles all parsing
- ~~parsers/text.ts~~ — AI handles all parsing
- ~~parsers/ocr.ts~~ — AI handles vision

### Modified Files

```
src/lib/storage/db.ts       # Add new stores (DB_VERSION bump)
src/lib/types.ts            # Add import-related types
src/routes/+layout.svelte   # Add import route to navigation (premium only)
```

---

## Data Model Implementation

### IndexedDB Schema Changes

```typescript
// DB_VERSION = 7 (bump from 6)

// New store: importBatches
{
  name: 'importBatches',
  keyPath: 'id',
  indexes: [
    { name: 'status', keyPath: 'status' },
    { name: 'createdAt', keyPath: 'createdAt' },
    { name: 'userId', keyPath: 'userId' }
  ]
}

// New store: importPresets
{
  name: 'importPresets',
  keyPath: 'id',
  indexes: [
    { name: 'name', keyPath: 'name' },
    { name: 'sourceType', keyPath: 'sourceType' }
  ]
}
```

### Type Definitions

All types defined in spec Section 7 will be implemented in `src/lib/import/types.ts`:

- `ImportBatch`
- `ImportSource`
- `ImportStats`
- `TimeEntryCandidate`
- `CandidateFlag`
- `ImportIssue`
- `IssueType`
- `ImportPreset`
- `ColumnMapping`
- `CategoryMapping`
- `SourceType`

---

## UI Components

### State Machine (ImportPage)

```
UPLOAD -> PROCESSING -> REVIEW -> COMMIT -> REPORT
   ^                       |
   +--------(back)---------+
```

```typescript
type ImportState =
	| 'upload' // Initial: file selection
	| 'processing' // AI/parsing in progress
	| 'review' // User reviews candidates
	| 'commit' // Confirmation screen
	| 'report'; // Final results

let state: ImportState = 'upload';
let batch: ImportBatch | null = null;
```

### Component Responsibilities

| Component        | Responsibility                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `ImportUpload`   | File drag-drop, file picker, text paste, image add, source type selector, preset selector |
| `ImportProgress` | Progress bar, current file indicator, cancel button                                       |
| `ImportReview`   | Candidate table, issues panel, bulk actions, filter toggle, confidence slider             |
| `CandidateRow`   | Single row with inline editing, selection checkbox, status indicator                      |
| `IssuesPanel`    | Aggregated issue counts, clickable to filter                                              |
| `BulkActions`    | Category assignment, duration rounding, category mapping                                  |
| `ImportCommit`   | Summary stats, warning about skipped entries, preset save option                          |
| `ImportReport`   | Final counts, navigation buttons                                                          |
| `PresetSelector` | Dropdown with saved presets, delete option                                                |

---

## Parsing Pipeline

### AI-First Architecture

All parsing is done by OpenAI. No programmatic CSV/Excel parsers needed because user data formats are unpredictable.

### Flow

```
User uploads file (any format)
       |
       v
+--------------------+
| Read file as text  |  (client-side)
+--------------------+
       |
       v
+--------------------+
| POST /api/import/  |  (server-side)
| parse              |
+--------------------+
       |
       v
+--------------------+
| OpenAI Responses   |  model: gpt-4o (hard-coded)
| API call           |  returns TimeEntryCandidate[]
+--------------------+
       |
       v
+--------------------+
| Local validation   |  (dates, durations, duplicates)
+--------------------+
       |
       v
    ImportBatch
```

### OpenAI Integration

```typescript
// src/lib/import/openai.ts
const OPENAI_MODEL = 'gpt-4o'; // Hard-coded, update manually

export async function parseWithAI(
	fileContent: string,
	categories: Category[]
): Promise<TimeEntryCandidate[]> {
	const response = await fetch('/api/import/parse', {
		method: 'POST',
		body: JSON.stringify({ content: fileContent, categories })
	});
	return response.json();
}

// src/routes/api/import/parse/+server.ts
const response = await fetch('https://api.openai.com/v1/responses', {
	method: 'POST',
	headers: {
		Authorization: `Bearer ${OPENAI_API_KEY}`,
		'Content-Type': 'application/json'
	},
	body: JSON.stringify({
		model: OPENAI_MODEL,
		input: [
			{ role: 'system', content: IMPORT_SYSTEM_PROMPT },
			{ role: 'user', content: fileContent }
		]
	})
});
```

### Environment Variables

```env
# .env.local (gitignored)
OPENAI_API_KEY=sk-...
```

### File Handling

| Type       | Client-side               | Server-side                |
| ---------- | ------------------------- | -------------------------- |
| CSV/Excel  | Read as text (FileReader) | Send to OpenAI             |
| JSON       | Read as text              | Send to OpenAI             |
| Plain text | Read as text              | Send to OpenAI             |
| Images     | Convert to base64         | Upload to OpenAI Files API |

---

## AI Integration

### API Wrapper

```typescript
// src/lib/import/ai.ts

interface AIRequest {
	type: 'column_mapping' | 'text_extraction' | 'category_guess';
	data: unknown;
}

interface AIResponse {
	result: unknown;
	confidence: number;
}

async function callAI(request: AIRequest): Promise<AIResponse> {
	// Server-side call via API route
	const response = await fetch('/api/import/ai', {
		method: 'POST',
		body: JSON.stringify(request)
	});
	return response.json();
}
```

### Server-Side API Route

```typescript
// src/routes/api/import/ai/+server.ts

export async function POST({ request, locals }) {
	// 1. Check premium status
	// 2. Rate limit check
	// 3. Call OpenAI/other AI service
	// 4. Return structured response
}
```

### AI Tasks

| Task              | Input                            | Output                                 |
| ----------------- | -------------------------------- | -------------------------------------- |
| Column Mapping    | Headers array                    | `{ date: 'Datum', start: 'Von', ... }` |
| Text Extraction   | Raw text                         | `TimeEntryCandidate[]`                 |
| Category Guess    | Note text + available categories | `{ categoryId, confidence }`           |
| Summary Detection | Row data                         | `{ isSummary: boolean }`               |

---

## Error Handling

### Strategy

| Error Type       | Handling                                                |
| ---------------- | ------------------------------------------------------- |
| File read error  | Add to issues, continue with other files                |
| Parse error      | Add to issues, partial results                          |
| AI timeout       | Retry 3x with exponential backoff, then fail gracefully |
| Network error    | Show offline message, allow retry                       |
| Validation error | Flag candidate, don't block batch                       |

### User Feedback

- **Processing errors:** Show in issues panel
- **Network errors:** Show toast + retry button
- **Validation errors:** Inline in candidate row

---

## Testing Strategy

### Unit Tests

| Module             | Test Focus                                  |
| ------------------ | ------------------------------------------- |
| `parsers/csv.ts`   | Header detection, date parsing, edge cases  |
| `parsers/excel.ts` | Sheet handling, cell types                  |
| `validators.ts`    | All validation rules                        |
| `duplicates.ts`    | Fingerprint consistency, detection accuracy |

### Integration Tests

| Flow             | Test Focus            |
| ---------------- | --------------------- |
| CSV -> Review    | End-to-end parsing    |
| Review -> Commit | Selection, validation |
| Preset save/load | Persistence           |

### E2E Tests

| Scenario         | Test Focus                                          |
| ---------------- | --------------------------------------------------- |
| Full import flow | CSV upload -> review -> commit -> verify in Day tab |
| Premium gating   | Free user blocked, premium user allowed             |
| Error handling   | Invalid file, network error                         |

---

## Risks / Constraints

### Technical Risks

| Risk           | Mitigation                               |
| -------------- | ---------------------------------------- |
| AI API costs   | Rate limiting, file size limits, caching |
| OCR accuracy   | Low confidence for OCR, require review   |
| Large files    | Streaming parser, progress feedback      |
| Browser memory | Process files in chunks                  |

### UX Risks

| Risk            | Mitigation                                |
| --------------- | ----------------------------------------- |
| Complex UI      | Progressive disclosure, sensible defaults |
| Slow processing | Progress indicator, cancel option         |
| Data loss       | Auto-save draft, resume on return         |

### Platform Constraints

| Constraint     | Handling                                     |
| -------------- | -------------------------------------------- |
| IndexedDB size | Limit batch history, auto-cleanup old drafts |
| Offline        | Local parsing works, AI requires network     |
| Mobile         | Responsive design, touch-friendly            |

---

## Implementation Order

### Phase 11.1: Foundation (Tasks 1-4)

1. Types + IndexedDB schema
2. Basic parsers (CSV, JSON)
3. Validation module
4. Duplicate detection

### Phase 11.2: UI Shell (Tasks 5-8)

5. Import route + state machine
6. Upload component
7. Progress component
8. Basic review table

### Phase 11.3: Review Features (Tasks 9-12)

9. Inline editing
10. Issues panel
11. Bulk actions
12. Filter + confidence slider

### Phase 11.4: AI Integration (Tasks 13-15)

13. AI API wrapper
14. Column mapping
15. Category guessing

### Phase 11.5: Advanced Parsers (Tasks 16-18)

16. Excel parser
17. Text parser
18. OCR integration

### Phase 11.6: Commit + Polish (Tasks 19-22)

19. Commit flow
20. Import report
21. Preset save/load
22. Premium gating

### Phase 11.7: Testing (Tasks 23-25)

23. Unit tests
24. Integration tests
25. E2E tests

---

## Checkpoint: Plan Ready

Before proceeding to Tasks:

- [x] Architecture sketch complete
- [x] Module responsibilities defined
- [x] Data model mapped to IndexedDB
- [x] UI components identified
- [x] Parsing pipeline documented
- [x] AI integration approach defined
- [x] Error handling strategy defined
- [x] Testing approach documented
- [x] Risks identified with mitigations
- [x] Implementation order defined
