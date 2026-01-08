# subscription-plans — Spec

**Phase:** A1  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Status:** Draft

**Depends on:**

- Phase 6: Cloud Auth & Backup (Supabase Integration)

**Does not depend on:**

- Stripe Integration (future)
- AI Import (Premium, separate spec)

**Supersedes:**

- `Docs/Specs/P10-monetising.md` (DEPRECATED)

---

## 1) Goal / Problem

Introduce subscription tiers (Free, Pro, Premium) to monetize TimeTracker while keeping core functionality accessible. Free users get full local functionality. Pro unlocks cloud features and data portability. Premium is a placeholder for future AI features.

---

## 2) Scope

### In scope

- Three-tier plan system: Free, Pro, Premium
- Supabase Schema: `profiles.plan` with values `'free' | 'pro' | 'premium'`
- Feature gating based on plan
- Export functionality (Pro): CSV, JSON, PDF
- Import functionality (Pro): JSON, Excel
- Cloud Backup gating (Pro)
- Paywall UI for gated features
- User Profile UI showing current plan

### Out of scope

- Stripe/Payment integration (future)
- AI Import with credits (Premium, see `Docs/Specs/ai-import.md`)
- Task grouping (Premium, future)
- Arbeitgeber/Employer system (separate feature)
- Onboarding flow

### What we don't want

- Client as source of truth for `plan` — Supabase is authoritative
- Partially rendered Pro features — either full access or paywall
- Hidden tabs — tabs remain visible, content is paywalled
- Complex subscription logic — just `plan` field for now

---

## 3) Functional Requirements (FR)

### Plan System

- **SP-FR-001**: User has a `plan` with values `'free'`, `'pro'`, or `'premium'`
- **SP-FR-002**: Default at registration: `plan = 'free'`
- **SP-FR-003**: Plan is stored in Supabase `profiles` table

### Free Tier Features

- **SP-FR-010**: Free users have full access to: Tag, Woche, Monat, Auswertung tabs
- **SP-FR-011**: Free users have full access to: Plus-Tab (add entries), Settings
- **SP-FR-012**: Free users have LOCAL storage only (IndexedDB)
- **SP-FR-013**: Free users see paywall when attempting Cloud Backup
- **SP-FR-014**: Free users see paywall when attempting Import/Export

### Pro Tier Features

- **SP-FR-020**: Pro users have all Free features
- **SP-FR-021**: Pro users can sync to Cloud (Supabase backup)
- **SP-FR-022**: Pro users can Export data (CSV, JSON, PDF)
- **SP-FR-023**: Pro users can Import data (JSON, Excel)

### Premium Tier (Placeholder)

- **SP-FR-030**: Premium users have all Pro features
- **SP-FR-031**: Premium features TBD (AI Import with credits, task grouping)
- **SP-FR-032**: Premium paywall shows "Kommt bald" message

### Export (Pro)

- **SP-FR-040**: Export CSV: time entries with date, start, end, category, description
- **SP-FR-041**: Export JSON: full data (entries, categories, settings, work models)
- **SP-FR-042**: Export PDF: formatted data table (same content as CSV, presentable for accounting)
- **SP-FR-043**: Export UI: Dialog opened from Settings → "Daten" section → "Exportieren"
- **SP-FR-044**: Export Dialog shows format selection (CSV, JSON, PDF)
- **SP-FR-045**: Export triggers browser download of selected format

### Import (Pro)

- **SP-FR-050**: Import JSON: restore from own backup (full data)
- **SP-FR-051**: Import Excel: parse .xlsx with TimeTracker format
- **SP-FR-052**: Import UI: Dedicated route `/import`
- **SP-FR-053**: Import flow: Upload → Preview table → Confirm → Complete
- **SP-FR-054**: Import preview shows data to be imported with validation
- **SP-FR-055**: Import confirms number of entries added/updated
- **SP-FR-056**: Import navigated from Settings → "Daten" section → "Importieren"

### Paywall

- **SP-FR-060**: Paywall shows feature name and Pro benefits
- **SP-FR-061**: Paywall shows "Pro freischalten" button (stub: shows "Kommt bald")
- **SP-FR-062**: Paywall shows "Weiter mit Free" secondary option
- **SP-FR-063**: Cloud Backup button shows paywall modal for Free users
- **SP-FR-064**: Export/Import buttons show paywall modal for Free users

### User Profile

- **SP-FR-070**: Settings shows "Konto" section with email and plan
- **SP-FR-071**: Plan display shows: Free, Pro, or Premium badge
- **SP-FR-072**: "Plan ändern" button opens plan comparison modal
- **SP-FR-073**: Plan comparison shows Free vs Pro vs Premium features

---

## 4) Implementation Guarantees (IG)

- **SP-IG-001**: `plan` is read from Supabase `profiles` table only
- **SP-IG-002**: Client caches `plan` locally, refreshes at app start and after auth events
- **SP-IG-003**: Paywall renders completely — no flicker, no partial Pro content
- **SP-IG-004**: Core tabs (Tag, Woche, Monat, Auswertung) are NEVER gated
- **SP-IG-005**: Export/Import only available when authenticated (requires Supabase profile)
- **SP-IG-006**: Offline users see cached plan; default to 'free' if no cache
- **SP-IG-007**: PDF export generates client-side (no server required)

---

## 5) Design Decisions (DD)

- **SP-DD-001**: Paywall as reusable component `ProPaywall.svelte`
- **SP-DD-002**: Plan check via `isPro` / `isPremium` derived stores from `src/lib/stores/user.ts`
- **SP-DD-003**: Export as dialog modal, Import as dedicated route `/import`
- **SP-DD-004**: PDF generation using client-side library (e.g., jsPDF or pdfmake)
- **SP-DD-005**: Excel parsing using SheetJS (xlsx library)
- **SP-DD-006**: "Pro freischalten" shows toast "Kommt bald" until Stripe integration
- **SP-DD-007**: Premium section shows "Kommt bald" placeholder

---

## 6) Edge cases

- **No profile row**: Treat as `plan = 'free'` (should not happen with Supabase trigger)
- **Offline at app start**: Use cached plan; no cache = 'free'
- **Plan changes during session**: Not relevant until Stripe (no auto-change in v1)
- **Import with duplicates**: Show warning, let user decide (skip/overwrite)
- **Import invalid file**: Show error message, do not import
- **Export empty data**: Allow export (empty CSV/JSON is valid)
- **Large export**: No pagination for v1; warn if >10k entries

---

## 7) Data & privacy

### Supabase Schema

```sql
-- profiles.plan already exists from P10 prep
-- Ensure values include 'premium'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'pro', 'premium'));
```

### What is stored?

| Field  | Type | Description                 |
| ------ | ---- | --------------------------- |
| `plan` | TEXT | 'free', 'pro', or 'premium' |

### Export data

- Exported to user's device only
- No server-side storage of exports
- User controls their data

### Import data

- Processed client-side
- Stored in user's IndexedDB (and Supabase if Pro)

---

## 8) Acceptance checks (testable)

### Plan System

- [ ] **AC-001**: New user has `plan = 'free'` after registration (→ SP-FR-002)
- [ ] **AC-002**: Pro user can access Cloud Backup (→ SP-FR-021)
- [ ] **AC-003**: Free user sees paywall on Cloud Backup (→ SP-FR-013)

### Export

- [ ] **AC-010**: Pro user can export CSV with correct columns (→ SP-FR-040)
- [ ] **AC-011**: Pro user can export JSON with full data (→ SP-FR-041)
- [ ] **AC-012**: Pro user can export PDF with formatted table (→ SP-FR-042)
- [ ] **AC-013**: Free user sees paywall on Export button (→ SP-FR-064)
- [ ] **AC-014**: Export dialog shows format selection (→ SP-FR-044)

### Import

- [ ] **AC-020**: Pro user can import JSON backup (→ SP-FR-050)
- [ ] **AC-021**: Pro user can import Excel file (→ SP-FR-051)
- [ ] **AC-022**: Import shows preview before confirming (→ SP-FR-054)
- [ ] **AC-023**: Import shows success count (→ SP-FR-055)
- [ ] **AC-024**: Free user sees paywall on Import button (→ SP-FR-064)
- [ ] **AC-025**: Invalid file shows error, no data imported (→ edge case)

### Paywall

- [ ] **AC-030**: Paywall shows Pro benefits (→ SP-FR-060)
- [ ] **AC-031**: "Pro freischalten" shows "Kommt bald" toast (→ SP-FR-061)
- [ ] **AC-032**: "Weiter mit Free" dismisses paywall (→ SP-FR-062)

### User Profile

- [ ] **AC-040**: Settings shows Konto section with email (→ SP-FR-070)
- [ ] **AC-041**: Settings shows current plan badge (→ SP-FR-071)
- [ ] **AC-042**: Plan comparison modal shows tier features (→ SP-FR-073)

---

## 9) Change log

**[2025-12-26 22:15]**

- Added: Initial spec created
- Added: Supersedes P10-monetising.md
- Added: Free tier includes all tabs (Monat, Auswertung not gated)
- Added: Pro tier includes Cloud Backup, Import, Export
- Added: Premium tier as placeholder
- Added: Export formats: CSV, JSON, PDF
- Added: Import formats: JSON, Excel
- Added: UI decisions: Export = dialog, Import = route

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (SP-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (SP-IG-xxx)
- [x] Design Decisions (DD) — all numbered (SP-DD-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions

---

## 11) UI Mockups (ASCII)

### Settings — Daten Section

```
+---------------------------------------------------------------+
|  Einstellungen                                                |
+---------------------------------------------------------------+
|                                                               |
|  KONTO                                                        |
|  +-----------------------------------------------------------+|
|  | E-Mail: user@example.com                                  ||
|  +-----------------------------------------------------------+|
|  | Plan: [Free]                       [ Plan ändern ]        ||
|  +-----------------------------------------------------------+|
|                                                               |
|  DATEN                                                        |
|  +-----------------------------------------------------------+|
|  | [ Exportieren ]              [ Importieren ]              ||
|  +-----------------------------------------------------------+|
|                                                               |
|  KATEGORIEN                                                   |
|  ...                                                          |
+---------------------------------------------------------------+
```

### Export Dialog

```
+-----------------------------------------------+
|              Daten exportieren            [x] |
+-----------------------------------------------+
|                                               |
|  Wähle ein Format:                            |
|                                               |
|  ( ) CSV  — Tabelle für Excel/Sheets          |
|  ( ) JSON — Vollständiges Backup              |
|  ( ) PDF  — Formatierte Übersicht             |
|                                               |
|  Zeitraum: [Alle Daten v]                     |
|                                               |
|              [ Exportieren ]                  |
|                                               |
+-----------------------------------------------+
```

### Import Route (/import)

```
+---------------------------------------------------------------+
|  [←] Daten importieren                                        |
+---------------------------------------------------------------+
|                                                               |
|  +-----------------------------------------------------------+|
|  |                                                           ||
|  |     [ Datei auswählen ]                                   ||
|  |                                                           ||
|  |     Unterstützte Formate: JSON, Excel (.xlsx)             ||
|  |                                                           ||
|  +-----------------------------------------------------------+|
|                                                               |
|  --- After file selected ---                                  |
|                                                               |
|  Vorschau: 47 Einträge gefunden                               |
|                                                               |
|  +-----------------------------------------------------------+|
|  | Datum      | Start | Ende  | Kategorie | Beschreibung     ||
|  |------------|-------|-------|-----------|------------------||
|  | 2025-12-01 | 08:00 | 12:00 | Arbeit    | Meeting          ||
|  | 2025-12-01 | 13:00 | 17:30 | Arbeit    | Development      ||
|  | ...                                                       ||
|  +-----------------------------------------------------------+|
|                                                               |
|  [ Abbrechen ]                    [ 47 Einträge importieren ] |
|                                                               |
+---------------------------------------------------------------+
```

### Pro Paywall Modal

```
+---------------------------------------------------------------+
|                     Pro-Funktionen                        [x] |
+---------------------------------------------------------------+
|                                                               |
|     Cloud-Backup, Import und Export sind in Pro enthalten.    |
|                                                               |
|     ✓ Cloud-Backup — Daten sicher in der Cloud speichern      |
|     ✓ Export — CSV, JSON, PDF für Buchhaltung                 |
|     ✓ Import — Daten aus Backup oder Excel wiederherstellen   |
|                                                               |
|                      10 € / Monat                             |
|                    jederzeit kündbar                          |
|                                                               |
|              [ Pro freischalten ]  (Primary)                  |
|              [ Weiter mit Free ]   (Secondary)                |
|                                                               |
|     Alle anderen Funktionen bleiben kostenlos verfügbar.      |
|                                                               |
+---------------------------------------------------------------+
```
