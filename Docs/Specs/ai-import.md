# AI Import — Spec

**Phase:** 11  
**Created:** 2025-12-25  
**Last Updated:** 2025-12-25  
**Status:** Draft

**Depends on:**

- Phase 10 (Monetising) for Premium gating infrastructure

**Does not depend on:**

- Cloud Sync (Phase 6) — AI Import is local-first, cloud backup optional

---

## Table of Contents

1. [Goal / Problem](#1-goal--problem)
2. [Scope](#2-scope)
3. [Functional Requirements (FR)](#3-functional-requirements-fr)
4. [Implementation Guarantees (IG)](#4-implementation-guarantees-ig)
5. [Design Decisions (DD)](#5-design-decisions-dd)
6. [UX Flow](#6-ux-flow)
7. [Data Model](#7-data-model)
8. [Parsing Strategy](#8-parsing-strategy)
9. [Guardrails / Validations](#9-guardrails--validations)
10. [Premium Gating](#10-premium-gating)
11. [Security / Privacy](#11-security--privacy)
12. [Edge Cases](#12-edge-cases)
13. [Data & Privacy](#13-data--privacy)
14. [Acceptance Checks](#14-acceptance-checks)
15. [Test Cases](#15-test-cases)
16. [Future Scope (v1.1 / v2)](#16-future-scope-v11--v2)
17. [Change Log](#17-change-log)

---

## 1) Goal / Problem

Users have historical time data in various formats (Excel, CSV, text files, screenshots) that they want to import into TimeTracker. Manual entry is tedious and error-prone. AI can extract structured time entries from unstructured sources, but must never "guess" or fill gaps silently.

**Product Goal:** User can import clean time data in minutes without manual typing.

**Non-Goal:** Fully automatic import without review. AI must not invent data.

---

## 2) Scope

### In scope (MVP v1)

- File upload: CSV, Excel (.xlsx simple sheets), JSON (structured), plain text
- Image upload: Screenshots/photos with printed text (OCR)
- AI-powered extraction: column mapping, text parsing, category guessing
- Review UI: table with inline editing, issue panel, bulk actions
- Validation: required fields, time bounds, overlap detection, duplicate detection
- Import policy: confidence threshold (default 0.85)
- Preset saving: mapping rules per source type
- Premium gating: UI + backend

### Out of scope (MVP v1)

- Handwritten text recognition (best-effort only, always requires review)
- Invoice/calendar/chat-log specialized extractors
- Learning/adaptive mapping (no ML training on user data)
- Multi-user/team imports
- Undo after commit (use manual delete)

### What we don't want

- Silent data invention — AI must flag uncertainty, never fill gaps
- Blind commits — every import requires explicit user review
- Complex state management — use simple local state, no external stores
- Over-abstraction — use framework directly, no unnecessary wrappers

---

## 3) Functional Requirements (FR)

### Upload & Source Detection

- **TT-FR-101:** User can upload multiple files via drag-and-drop or file picker
- **TT-FR-102:** User can paste text directly into import area
- **TT-FR-103:** User can add images (screenshots, photos) for OCR processing
- **TT-FR-104:** System auto-detects source type (Timesheet/Projektlog/Rechnung/Kalender/Chat/Sonstiges)
- **TT-FR-105:** User can override auto-detected source type

### Processing

- **TT-FR-106:** User sees processing progress with cancel option
- **TT-FR-107:** Partial failures produce partial results (ImportBatch with issues)
- **TT-FR-108:** Processing timeout: max 60 seconds per file, max 5 minutes total

### Review UI

- **TT-FR-109:** User sees table with columns: Datum, Start, Ende, Dauer, Kategorie, Task/Notiz, Quelle, Status
- **TT-FR-110:** User can inline-edit any field (Datum, Zeit, Dauer, Notiz)
- **TT-FR-111:** User sees aggregated issues panel: missing dates, missing times, unknown categories, overlaps, duplicates
- **TT-FR-112:** User can filter to show only uncertain entries
- **TT-FR-113:** User can perform bulk actions:
  - Set category for all matching text
  - Round durations to 5/15 minutes
  - Map unknown category to existing category
- **TT-FR-114:** User can delete individual candidates
- **TT-FR-115:** User can select/deselect candidates for import

### Import Policy

- **TT-FR-116:** Default: auto-select only candidates with confidence >= 0.85 AND no hard-blocking flags
- **TT-FR-117:** User can adjust confidence threshold (0.5 - 1.0)
- **TT-FR-118:** Candidates below threshold remain in review (not imported, not deleted)
- **TT-FR-119:** User can manually select/deselect any candidate regardless of confidence

### Commit

- **TT-FR-120:** User sees summary before commit: count, date range, total hours
- **TT-FR-121:** Clear warning: "X Eintraege werden nicht importiert (unsicher/unvollstaendig)"
- **TT-FR-122:** User clicks "Importieren" to commit selected candidates
- **TT-FR-123:** After commit: show import report (imported count, skipped count, errors)
- **TT-FR-124:** User can save current mapping as preset for future imports

### Presets

- **TT-FR-125:** User can save mapping rules (column assignments, category mappings) as named preset
- **TT-FR-126:** User can load preset when starting new import
- **TT-FR-127:** User can delete saved presets

---

## 4) Implementation Guarantees (IG)

### Data Integrity

- **TT-IG-101:** No candidate is imported without explicit user action (click "Importieren")
- **TT-IG-102:** Every candidate has source_ref linking to original file/line/cell
- **TT-IG-103:** Candidates missing required fields (date + duration/times) cannot be imported
- **TT-IG-104:** Duplicate detection uses fingerprint: hash(date + start + end + duration + normalized_note + category)
- **TT-IG-105:** Duplicates are marked, never auto-deleted or auto-merged

### AI Behavior

- **TT-IG-106:** AI never invents data — unclear = flag + issue
- **TT-IG-107:** AI confidence score reflects actual certainty (0.0 = unknown, 1.0 = certain)
- **TT-IG-108:** Summary rows (e.g., "Total", "Week 52") are detected and excluded from candidates

### Validation

- **TT-IG-109:** Time values must be 00:00-23:59
- **TT-IG-110:** Duration must be 1-960 minutes (16 hours max, configurable)
- **TT-IG-111:** Overlapping entries on same day are flagged (soft validation)
- **TT-IG-112:** Entries > 12 hours are flagged as extreme (soft validation)

### Premium

- **TT-IG-113:** Free users cannot access import feature (UI gated + backend check)
- **TT-IG-114:** Premium check happens before processing starts

---

## 5) Design Decisions (DD)

- **TT-DD-101:** Candidates below confidence threshold stay in review state (not imported, not discarded). Rationale: User can fix and import later; no data loss.
- **TT-DD-102:** OCR/AI calls are server-side only. Rationale: Protect API keys, enable rate limiting.
- **TT-DD-103:** Original files are NOT stored permanently. Only extracted metadata (filename, hash, size) is kept. Rationale: Privacy, storage costs.
- **TT-DD-104:** ImportBatch is stored in IndexedDB until committed or discarded. Rationale: Offline-first, resume interrupted imports.
- **TT-DD-105:** Presets are stored per-user in IndexedDB. Rationale: Local-first, no cloud dependency for basic functionality.
- **TT-DD-106:** Handwritten text always gets confidence < 0.5 and requires manual review. Rationale: OCR accuracy too low for auto-import.

---

## 6) UX Flow

### Screen A: Import Start

```
+-------------------------------------------------------------------------------+
|  Import (AI)                                                    [Premium]     |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                                                                         |  |
|  |     Drag & Drop Dateien hier                                            |  |
|  |     oder                                                                |  |
|  |     [Dateien auswaehlen]  [Text einfuegen]  [Bild hinzufuegen]          |  |
|  |                                                                         |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  Erkannter Typ: [Timesheet v]  (auto-detected, user can override)            |
|                                                                               |
|  Gespeicherte Presets: [-- Kein Preset --  v]                                |
|                                                                               |
|  Dateien:                                                                     |
|  - zeiterfassung.xlsx (45 KB)                                         [x]    |
|  - notizen.txt (2 KB)                                                 [x]    |
|                                                                               |
|                                                      [Abbrechen] [Verarbeiten]|
+-------------------------------------------------------------------------------+
```

### Screen B: Processing

```
+-------------------------------------------------------------------------------+
|  Verarbeitung laeuft...                                                       |
|                                                                               |
|  [=============================>                    ] 65%                     |
|                                                                               |
|  Aktuell: zeiterfassung.xlsx - Spalten analysieren...                        |
|                                                                               |
|                                                              [Abbrechen]      |
+-------------------------------------------------------------------------------+
```

### Screen C: Review / Preview Editor

```
+-------------------------------------------------------------------------------+
|  Import Review                                                                |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | PROBLEME (5)                                                            |  |
|  | - 2 Eintraege ohne Datum                                                |  |
|  | - 1 Eintrag ohne Dauer/Zeiten                                           |  |
|  | - 1 unbekannte Kategorie: "Dev stuff"                                   |  |
|  | - 1 Ueberlappung gefunden                                               |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  [x] Nur unsichere anzeigen    Confidence-Schwelle: [0.85 v]                 |
|                                                                               |
|  Bulk-Aktionen: [Kategorie zuweisen...] [Dauer runden...] [Mapping...]       |
|                                                                               |
|  +---+----------+-------+-------+-------+-------------+--------+------+----+ |
|  |[x]| Datum    | Start | Ende  | Dauer | Kategorie   | Notiz  |Quelle|Stat| |
|  +---+----------+-------+-------+-------+-------------+--------+------+----+ |
|  |[x]| 23.12.25 | 09:00 | 12:00 | 3:00  | Development | Fix... |A:R5  | OK | |
|  |[x]| 23.12.25 | 13:00 | 17:30 | 4:30  | Development | API... |A:R6  | OK | |
|  |[ ]| --.--.-- | --:-- | --:-- | --:-- | ???         | ???    |A:R7  | !! | |
|  |[x]| 22.12.25 | 10:00 | 11:00 | 1:00  | Dev stuff   | Test   |B:L3  | ?  | |
|  +---+----------+-------+-------+-------+-------------+--------+------+----+ |
|                                                                               |
|  Status: OK = sicher, ? = unsicher, !! = fehlt/blockiert                     |
|                                                                               |
|                                              [Abbrechen] [Weiter zum Import] |
+-------------------------------------------------------------------------------+
```

### Screen D: Commit

```
+-------------------------------------------------------------------------------+
|  Import bestaetigen                                                           |
|                                                                               |
|  Zusammenfassung:                                                             |
|  - 12 Eintraege werden importiert                                             |
|  - Zeitraum: 20.12.2025 - 24.12.2025                                          |
|  - Gesamtstunden: 42:30                                                       |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | HINWEIS: 3 Eintraege werden NICHT importiert (unsicher/unvollstaendig)  |  |
|  | Diese bleiben im Review und koennen spaeter bearbeitet werden.          |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  [ ] Mapping als Preset speichern: [____________________]                     |
|                                                                               |
|                                              [Zurueck] [Importieren]          |
+-------------------------------------------------------------------------------+
```

### Screen E: Import Report

```
+-------------------------------------------------------------------------------+
|  Import abgeschlossen                                                         |
|                                                                               |
|  - 12 Eintraege erfolgreich importiert                                        |
|  - 3 Eintraege uebersprungen (im Review verblieben)                           |
|  - 0 Fehler                                                                   |
|                                                                               |
|  [Neuer Import]                                              [Zum Tag-Tab]   |
+-------------------------------------------------------------------------------+
```

---

## 7) Data Model

### ImportBatch

```typescript
interface ImportBatch {
	id: string; // UUID
	createdAt: string; // ISO 8601
	userId: string; // User ID
	sources: ImportSource[]; // Source files/inputs
	candidates: TimeEntryCandidate[];
	issues: ImportIssue[];
	stats: ImportStats;
	status: 'draft' | 'reviewed' | 'committed';
	presetId?: string; // If preset was used
}

interface ImportSource {
	id: string; // UUID
	filename: string; // Original filename or "pasted-text" / "image-1"
	mimeType: string; // e.g., "text/csv", "image/png"
	hash: string; // SHA-256 of content
	size: number; // Bytes
	sheetName?: string; // For Excel files
}

interface ImportStats {
	entryCount: number;
	dateMin: string; // YYYY-MM-DD
	dateMax: string; // YYYY-MM-DD
	totalMinutesEstimated: number;
	issueCount: number;
	highConfidenceCount: number; // >= threshold
	lowConfidenceCount: number; // < threshold
}
```

### TimeEntryCandidate

```typescript
interface TimeEntryCandidate {
	id: string; // UUID
	date: string | null; // YYYY-MM-DD, required for import
	startTime: string | null; // HH:mm, optional
	endTime: string | null; // HH:mm, optional
	durationMinutes: number | null; // Optional, but required if no start+end
	categoryGuess: string | null; // AI-suggested category name
	categoryId: string | null; // Mapped category ID (after user mapping)
	note: string | null; // Task description
	sourceRef: string; // e.g., "file1.xlsx:Sheet2:R23" or "image2.png:line5"
	confidence: number; // 0.0 - 1.0
	flags: CandidateFlag[]; // Validation flags
	selected: boolean; // User selection for import
	edited: boolean; // User has edited this candidate
}

type CandidateFlag =
	| 'missing_date'
	| 'missing_duration'
	| 'ambiguous_time'
	| 'overlaps'
	| 'duplicate_suspect'
	| 'unknown_category'
	| 'extreme_duration'
	| 'invalid_time'
	| 'summary_row'
	| 'handwritten'
	| 'hard_block';
```

### ImportIssue

```typescript
interface ImportIssue {
	id: string; // UUID
	type: IssueType;
	severity: 'error' | 'warning';
	message: string; // Human-readable German
	candidateIds: string[]; // Affected candidates
	suggestion?: string; // Optional fix suggestion
}

type IssueType =
	| 'missing_date'
	| 'missing_duration'
	| 'unknown_category'
	| 'overlap'
	| 'duplicate'
	| 'extreme_duration'
	| 'invalid_format'
	| 'parse_error';
```

### ImportPreset

```typescript
interface ImportPreset {
	id: string; // UUID
	name: string; // User-defined name
	createdAt: string; // ISO 8601
	sourceType: SourceType; // Timesheet, Projektlog, etc.
	columnMapping: ColumnMapping; // Column name -> field mapping
	categoryMappings: CategoryMapping[]; // Text -> category ID
	durationRounding?: 5 | 15; // Optional rounding
}

interface ColumnMapping {
	date?: string; // Column name for date
	startTime?: string; // Column name for start time
	endTime?: string; // Column name for end time
	duration?: string; // Column name for duration
	category?: string; // Column name for category
	note?: string; // Column name for note/description
}

interface CategoryMapping {
	sourceText: string; // Text from source (e.g., "Dev stuff")
	categoryId: string; // Target category ID
}

type SourceType = 'timesheet' | 'projektlog' | 'rechnung' | 'kalender' | 'chat' | 'sonstiges';
```

---

## 8) Parsing Strategy

### A) Structured Files (CSV/Excel/JSON)

1. **Deterministic parsing first:**
   - Read file structure (columns, rows)
   - Detect header row
   - Parse data types (dates, times, numbers)

2. **AI assists with:**
   - Column mapping: "Start" / "Von" / "Beginn" -> startTime
   - Free text -> category/note separation
   - Summary row detection: "Total", "Summe", "Week XX", "Gesamt"

3. **Validation:**
   - Apply all guardrails
   - Generate issues for problems

### B) Unstructured Text

1. **AI extracts:**
   - Line-by-line parsing
   - Date/time pattern recognition
   - Category/note extraction

2. **Source refs:**
   - Each candidate gets line number reference

3. **Confidence:**
   - Lower than structured files
   - More issues expected

### C) Images (OCR)

1. **OCR processing:**
   - Server-side OCR (Tesseract or cloud API)
   - Returns text + line positions

2. **AI structures:**
   - Same as unstructured text
   - Additional "handwritten" flag if detected

3. **Confidence:**
   - Printed text: 0.5 - 0.8
   - Handwritten: 0.0 - 0.4 (always requires review)

---

## 9) Guardrails / Validations

### Hard Validations (block import)

| Check             | Rule                                | Flag                             |
| ----------------- | ----------------------------------- | -------------------------------- |
| Date required     | Candidate must have valid date      | `missing_date`, `hard_block`     |
| Duration required | Must have duration OR (start + end) | `missing_duration`, `hard_block` |
| Time bounds       | Times must be 00:00 - 23:59         | `invalid_time`, `hard_block`     |
| Duration bounds   | Duration must be 1 - 960 minutes    | `invalid_time`, `hard_block`     |
| Summary row       | Detected summary rows excluded      | `summary_row`, `hard_block`      |

### Soft Validations (warn/mark)

| Check             | Rule                                   | Flag                |
| ----------------- | -------------------------------------- | ------------------- |
| Overlap           | Same day, overlapping time ranges      | `overlaps`          |
| Extreme duration  | Duration > 720 minutes (12h)           | `extreme_duration`  |
| Unknown category  | Category not in user's list            | `unknown_category`  |
| Duplicate suspect | Fingerprint matches existing entry     | `duplicate_suspect` |
| Ambiguous time    | Multiple possible time interpretations | `ambiguous_time`    |

### Duplicate Detection

```typescript
function generateFingerprint(candidate: TimeEntryCandidate): string {
	const normalized = [
		candidate.date,
		candidate.startTime || '',
		candidate.endTime || '',
		candidate.durationMinutes?.toString() || '',
		normalizeText(candidate.note || ''),
		candidate.categoryId || ''
	].join('|');
	return sha256(normalized);
}

function normalizeText(text: string): string {
	return text.toLowerCase().trim().replace(/\s+/g, ' ');
}
```

**Duplicate check scope:**

- Within current ImportBatch
- Against existing TimeEntries in date range (dateMin - 7 days to dateMax + 7 days)

---

## 10) Premium Gating

### UI Gating

- Import button/route shows lock icon for Free users
- Clicking shows Paywall component with upsell
- Premium users see full import UI

### Backend Gating

- All import API endpoints check user plan
- Free plan: return 403 with upgrade message
- Premium plan: proceed with import

### Implementation

```typescript
// Route guard
if (userPlan === 'free') {
	showPaywall = true;
	return;
}

// API check
async function processImport(files: File[]): Promise<ImportBatch> {
	const plan = await getUserPlan();
	if (plan === 'free') {
		throw new Error('Premium required for AI Import');
	}
	// ... proceed
}
```

---

## 11) Security / Privacy

### Data Handling

- **No raw data in logs:** File contents never logged
- **Minimal metadata:** Only filename, hash, size stored
- **No permanent file storage:** Original files deleted after processing
- **TTL for ImportBatch:** Draft batches auto-deleted after 7 days

### Sensitive Data Detection

- **Email/phone redaction:** Optional, detect and warn before AI processing
- **Secret detection:** If text contains API keys, passwords, etc. -> warn and allow cancel
- **MVP:** Detection only, no automatic redaction

### API Security

- **Server-side AI calls:** API keys never exposed to client
- **Rate limiting:** Max 10 imports per hour, max 50 MB per import
- **File size limits:** Max 10 MB per file, max 5 files per batch

---

## 12) Edge Cases

| Scenario                       | Handling                                             |
| ------------------------------ | ---------------------------------------------------- |
| Empty file                     | Issue: "Datei ist leer", no candidates               |
| File with only headers         | Issue: "Keine Daten gefunden", no candidates         |
| All rows invalid               | ImportBatch with 0 selectable candidates, all issues |
| Mixed valid/invalid            | Partial results, issues for invalid rows             |
| Duplicate file upload          | Detect by hash, warn "Datei bereits hinzugefuegt"    |
| Very large file (>10MB)        | Reject with size limit error                         |
| Unsupported format             | Reject with format error                             |
| OCR fails completely           | Issue: "Text konnte nicht erkannt werden"            |
| Network error during AI        | Retry 3x, then fail with error                       |
| User closes browser mid-import | ImportBatch saved as draft, resume on return         |

---

## 13) Data & Privacy

### What is stored?

| Data                    | Storage     | Retention                 |
| ----------------------- | ----------- | ------------------------- |
| ImportBatch (draft)     | IndexedDB   | 7 days, then auto-delete  |
| ImportBatch (committed) | IndexedDB   | Permanent (metadata only) |
| TimeEntries (imported)  | IndexedDB   | Permanent                 |
| ImportPresets           | IndexedDB   | Permanent                 |
| Original files          | Memory only | Deleted after processing  |

### Where?

- All data stored locally in IndexedDB
- Cloud backup (if enabled) includes imported TimeEntries
- ImportBatch metadata optionally synced to cloud

### Export/Delete

- User can export all TimeEntries (existing feature)
- User can delete individual entries (existing feature)
- User can delete ImportBatch (removes metadata, keeps imported entries)

---

## 14) Acceptance Checks

### Core Flow

- [ ] **AC-101:** User can upload CSV and see candidates in review table (TT-FR-101, TT-FR-109)
- [ ] **AC-102:** User can upload Excel and see candidates in review table (TT-FR-101, TT-FR-109)
- [ ] **AC-103:** User can paste text and see candidates in review table (TT-FR-102, TT-FR-109)
- [ ] **AC-104:** User can upload image and see OCR-extracted candidates (TT-FR-103, TT-FR-109)

### Validation

- [ ] **AC-105:** Candidates without date show "missing_date" flag and cannot be imported (TT-IG-103)
- [ ] **AC-106:** Candidates without duration/times show "missing_duration" flag (TT-IG-103)
- [ ] **AC-107:** Overlapping entries are flagged but can still be imported (TT-IG-111)
- [ ] **AC-108:** Duplicate suspects are flagged but not auto-deleted (TT-IG-105)

### Review UI

- [ ] **AC-109:** User can inline-edit date, time, duration, note (TT-FR-110)
- [ ] **AC-110:** User can filter to show only uncertain entries (TT-FR-112)
- [ ] **AC-111:** User can bulk-assign category to matching entries (TT-FR-113)
- [ ] **AC-112:** User can map unknown category to existing category (TT-FR-113)

### Import

- [ ] **AC-113:** Only selected candidates are imported (TT-IG-101)
- [ ] **AC-114:** Imported entries appear in Day tab (TT-FR-122)
- [ ] **AC-115:** Unselected candidates remain in review (TT-DD-101)
- [ ] **AC-116:** Import report shows correct counts (TT-FR-123)

### Premium

- [ ] **AC-117:** Free user sees paywall when accessing import (TT-IG-113)
- [ ] **AC-118:** Premium user can access full import flow (TT-IG-114)

### Presets

- [ ] **AC-119:** User can save mapping as preset (TT-FR-125)
- [ ] **AC-120:** User can load preset for new import (TT-FR-126)

---

## 15) Test Cases

### Unit Tests

```typescript
// CSV Parsing
describe('parseCSV', () => {
	it('parses simple CSV with headers');
	it('detects date column by common names');
	it('detects time columns by common names');
	it('filters out summary rows');
	it('handles missing values');
	it('handles different date formats (DD.MM.YYYY, YYYY-MM-DD, MM/DD/YYYY)');
});

// Excel Parsing
describe('parseExcel', () => {
	it('parses simple single-sheet Excel');
	it('handles multiple sheets');
	it('detects header row');
	it('filters out summary rows');
});

// Validations
describe('validateCandidate', () => {
	it('flags missing date');
	it('flags missing duration when no start/end');
	it('accepts duration without start/end');
	it('accepts start+end without duration');
	it('flags invalid time format');
	it('flags extreme duration');
});

// Overlap Detection
describe('detectOverlaps', () => {
	it('detects overlapping entries on same day');
	it('ignores entries on different days');
	it('handles entries without times');
});

// Duplicate Detection
describe('detectDuplicates', () => {
	it('generates consistent fingerprint');
	it('detects exact duplicates');
	it('detects duplicates with minor text differences');
	it('does not flag different entries as duplicates');
});

// Fingerprint
describe('generateFingerprint', () => {
	it('produces same hash for identical entries');
	it('produces different hash for different dates');
	it('normalizes text before hashing');
});
```

### E2E Tests

```typescript
describe('AI Import', () => {
	it('uploads CSV and shows review table');
	it('shows issues panel with problems');
	it('allows inline editing of candidates');
	it('imports selected candidates');
	it('shows imported entries in Day tab');
	it('marks duplicates without blocking');
	it('blocks import for entries without date');
	it('saves and loads presets');
});

describe('Premium Gating', () => {
	it('shows paywall for free user');
	it('allows import for premium user');
});
```

---

## 16) Future Scope (v1.1 / v2)

### v1.1

- Robust handwritten text recognition
- Improved OCR accuracy with preprocessing
- Batch undo (revert entire import)

### v2

- Invoice extractor (specialized parser)
- Calendar import (ICS, Google Calendar)
- Chat log extractor (Slack, Teams)
- Learning mapping (transparent, user-editable)
- Multi-language support (EN, FR)

---

## 17) Change Log

**[2025-12-25 07:15]**

- Added: Initial spec created
- Added: Full UX flow with ASCII diagrams
- Added: Complete data model (ImportBatch, TimeEntryCandidate, ImportIssue, ImportPreset)
- Added: Parsing strategy for CSV/Excel/JSON/Text/Images
- Added: Guardrails and validation rules
- Added: Premium gating specification
- Added: Security and privacy requirements
- Added: Test cases (unit + E2E)
- Added: Future scope (v1.1/v2)

---

## 18) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (TT-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (TT-IG-xxx)
- [x] Design Decisions (DD) — all numbered (TT-DD-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
