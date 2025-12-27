# TimeTracker v1 — Implementation Progress (Current)

**Last Updated:** 2025-12-26  
**Current Focus:** Dev Framework Improvements (Phases D1-D3), then App Improvements

---

## Archive

- **Completed History:** `Docs/Progress/IMPLEMENTATION_PROGRESS_V1_CLEAN_2025-12-26.md` (Phases 1-8)

---

## How to Use This File

1. Update per PR/merge
2. Add one short line describing the change
3. Keep current-only; completed history goes to archive

---

## Roadmap Overview

### Priority 1: Dev System Improvements (do first)

| Phase | Name                           | Status      |
| ----- | ------------------------------ | ----------- |
| D1    | Self-documenting Dev Framework | COMPLETE    |
| D2    | Self-learning Dev Framework    | COMPLETE    |
| D3    | Watcher Framework Improvement  | COMPLETE    |
| D4    | Just-in-Time Rules System      | IN PROGRESS |

### Priority 2: App Improvements (after Dev Framework)

| Phase | Name                                 | Status      |
| ----- | ------------------------------------ | ----------- |
| 10    | Free/Pro Feature-Flags + Paywall     | DEPRECATED  |
| 11    | AI Import (Premium Feature)          | Blocked     |
| A1    | Subscription Plans                   | Not started |
| A1b   | Multi-Arbeitgeber (Future)           | Not started |
| A2    | UX (Kategorien, Navigation, Landing) | Not started |
| A3    | UI (Deutsch, Farbschemata, Icons)    | Not started |
| A4    | Bugs (Auto Sync, Resume Button)      | Not started |

---

## Phase D4: Just-in-Time Rules System

**Goal:** Restructure AGENTS.md (282 lines) into a slim dispatcher (~50 lines) + trigger-based rule files.

**Research:** `Docs/Devlog/SSD Analysis/2025-12-27__just-in-time-rules-research.md`

### Tasks

| # | Task | Status | Notes |
|---|------|--------|-------|
| D4.1 | Create `Docs/Rules/` folder | DONE | New folder for trigger-based rules |
| D4.2 | Create `session-start.md` | DONE | T1: Session start rules |
| D4.3 | Create `spec-writing.md` | DONE | T2: Spec creation rules |
| D4.4 | Create `planning.md` | DONE | T3: Plan creation rules |
| D4.5 | Create `implementation.md` | DONE | T4: Implementation rules |
| D4.6 | Create `pre-commit.md` | DONE | T5: Pre-commit checklist |
| D4.7 | Create `session-end.md` | DONE | T6: Session end rules |
| D4.8 | Create `framework-changes.md` | DONE | T7: Framework doc rules |
| D4.9 | Create `RULE_MAP.md` dispatcher | DONE | Replaces AGENTS.md |
| D4.10 | Update `Docs/INDEX.md` | DONE | Add Rules section |
| D4.11 | Update `.windsurf/rules/` pointers | USER TODO | Cannot edit, user must update |
| D4.12 | Keep AGENTS.md as backup | DONE | Will delete after testing |
| D4.13 | Test with real session | Not started | Verify nothing lost |

### Migration Checklist (from AGENTS.md)

Content to extract:

- [ ] Start-of-session workflow (lines 9-16) → session-start.md
- [ ] Mandatory doc loading (lines 17-24) → session-start.md
- [ ] Source of truth (lines 26-31) → dispatcher (core)
- [ ] Phase 1 SPEC (lines 36-61) → spec-writing.md
- [ ] Phase 2 PLAN (lines 62-80) → planning.md
- [ ] Phase 3 TASKS (lines 82-99) → planning.md
- [ ] Phase -1 PRE-IMPLEMENTATION GATES (lines 101-111) → implementation.md
- [ ] Phase 4 IMPLEMENT (lines 113-128) → implementation.md
- [ ] Git workflow (lines 130-147) → pre-commit.md
- [ ] Verification (lines 149-160) → implementation.md
- [ ] Coding rules (lines 162-167) → implementation.md
- [ ] PWA constraints (lines 169-172) → implementation.md
- [ ] Single Source of Truth table (lines 174-188) → dispatcher (reference)
- [ ] Self-Learning System (lines 190-229) → session-end.md
- [ ] Rules for framework changes (lines 231-239) → framework-changes.md
- [ ] Pre-commit checklist (lines 241-251) → pre-commit.md
- [ ] Session-end rules (lines 253-271) → session-end.md
- [ ] Communication style (lines 273-282) → dispatcher (core)

---

## Open Checklists

### Manual Testing Checklist

- [ ] Test version checking on production build (`npm run build && npm run preview`)
- [ ] Test PWA installation on Windows (localhost:4173)
- [ ] Deploy to server and test PWA installation on phone

### Phase 6 Verification Checklist

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

### Spec Compliance Verification

Phase 1:

- [ ] IndexedDB schema matches `technical-guideline-v1.md` Section 3.1
- [ ] PWA manifest meets `SVELTEKIT_PWA_ADDENDUM.md` requirements
- [ ] Service worker caches app shell correctly

Phase 2:

- [ ] Day tab order matches `ui-logic-spec-v1.md` Section 3
- [ ] Calculation logic matches `ui-logic-spec-v1.md` Section 10
- [ ] Warning banner behavior matches Section 3.1

Phase 3:

- [ ] Week tab matches `ui-logic-spec-v1.md` Section 4
- [ ] Analysis tab matches Section 5
- [ ] Settings tab matches Sections 7, 8, 9

Phase 4:

- [ ] Sync follows `technical-guideline-v1.md` Section 4
- [ ] All PWA requirements from `DEVELOPMENT_GUIDELINES.md` met
- [ ] Deployment checklist from `PROJECT_SCAFFOLD_CHECKLIST.md` complete

### Netlify SPA Routing Checklist

| Route              | timetracker24.netlify.app | timetracker.samuelgross.org |
| ------------------ | ------------------------- | --------------------------- |
| `/login`           | [ ] Direct open           | [ ] Direct open             |
| `/login`           | [ ] Hard refresh (F5)     | [ ] Hard refresh (F5)       |
| `/register`        | [ ] Direct open           | [ ] Direct open             |
| `/register`        | [ ] Hard refresh (F5)     | [ ] Hard refresh (F5)       |
| `/forgot-password` | [ ] Direct open           | [ ] Direct open             |
| `/forgot-password` | [ ] Hard refresh (F5)     | [ ] Hard refresh (F5)       |
| `/settings`        | [ ] Direct open           | [ ] Direct open             |
| `/day`             | [ ] Direct open           | [ ] Direct open             |

---

---

# Dev System Improvements (Priority 1)

---

## Phase D1: Self-documenting Dev Framework

**Target:** 5 files  
**Status:** COMPLETE  
**Commit:** f268bfd

### Deliverables

- [x] `Docs/Devlog/CHANGELOG.md` — Everything log (one line per commit)
- [x] `Docs/Devlog/DECISIONS.md` — Decision log (ADR-light)
- [x] `Docs/INDEX.md` — Added Development history section
- [x] `AGENTS.md` — Added changelog to session-end rules
- [x] `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md` — Added changelog step to workflow

---

## Phase D2: Self-learning Dev Framework

**Target:** 4 files  
**Status:** COMPLETE  
**Commits:** f861f6d, b3e31e7

### Deliverables

- [x] `Docs/Devlog/LEARNINGS.md` — Distillate (proven preferences, max 30 bullets)
- [x] `Docs/Devlog/LEARNINGS-INBOX.md` — Inbox (raw feedback capture)
- [x] `AGENTS.md` — Added Self-Learning System section
- [x] `Docs/INDEX.md` — Added learnings files to Development history
- [x] `.windsurf/workflows/helpers/read-governance.md` — Added LEARNINGS.md to session-start reading

---

## Phase D3: Watcher Framework Improvement

**Target:** 7 tasks  
**Status:** COMPLETE  
**Spec:** `Docs/Specs/D3-watcher-framework-improvement.md`  
**Plan:** `Docs/Plans/D3-watcher-framework-improvement.md`  
**Tasks:** `Docs/Tasks/D3-watcher-framework-improvement.md`

### Tasks

- [x] **Task D3.1** — Main watcher core (lockfile, control loop)
- [x] **Task D3.2** — SPAWN command
- [x] **Task D3.3** — KILL, LIST, SHUTDOWN commands
- [x] **Task D3.4** — Child watcher session support
- [x] **Task D3.5** — Child health monitoring
- [x] **Task D3.6** — Update documentation
- [x] **Task D3.7** — Progress tracker and commit

### Deliverables

- `scripts/watcher-main.ps1` — Main watcher orchestrator (new)
- `scripts/watcher.ps1` — Updated child watcher with SessionId support
- `Docs/Tooling/CASCADE_WATCHER.md` — Complete documentation rewrite

---

# App Improvements (Priority 2 — blocked until Dev Framework done)

---

## Phase 10: Free/Pro Feature-Flags + Paywall + User Profile

**Target:** 11 tasks  
**Status:** BLOCKED (9/11 tasks done, waiting for Dev Framework)  
**Spec:** `Docs/Specs/P10-monetising.md`

### Remaining Tasks

- [ ] **Task 10.10** — PlanSelector Modal
  - Files: `src/lib/components/PlanSelector.svelte`

- [ ] **Task 10.11** — E2E Tests
  - Files: `e2e/paywall.test.ts`

---

## Phase 11: AI Import (Premium Feature)

**Target:** 25 tasks  
**Status:** BLOCKED (0/25 tasks, waiting for Dev Framework)  
**Spec:** `Docs/Specs/ai-import.md`  
**Plan:** `Docs/Plans/ai-import.md`  
**Tasks:** `Docs/Tasks/ai-import.md`

### Phase 11.1: Foundation

- [ ] Task 11.1 — Types + IndexedDB Schema
- [ ] Task 11.2 — CSV Parser
- [ ] Task 11.3 — Validation Module
- [ ] Task 11.4 — Duplicate Detection

### Phase 11.2: UI Shell

- [ ] Task 11.5 — Import Route + State Machine
- [ ] Task 11.6 — Upload Component
- [ ] Task 11.7 — Progress Component
- [ ] Task 11.8 — Basic Review Table

### Phase 11.3: Review Features

- [ ] Task 11.9 — Inline Editing
- [ ] Task 11.10 — Issues Panel
- [ ] Task 11.11 — Bulk Actions
- [ ] Task 11.12 — Filter + Confidence Slider

### Phase 11.4: AI Integration

- [ ] Task 11.13 — AI API Wrapper
- [ ] Task 11.14 — Column Mapping AI
- [ ] Task 11.15 — Category Guessing AI

### Phase 11.5: Advanced Parsers

- [ ] Task 11.16 — Excel Parser
- [ ] Task 11.17 — Text Parser
- [ ] Task 11.18 — OCR Integration

### Phase 11.6: Commit + Polish

- [ ] Task 11.19 — Commit Flow
- [ ] Task 11.20 — Import Report
- [ ] Task 11.21 — Preset Save/Load
- [ ] Task 11.22 — Premium Gating

### Phase 11.7: Testing

- [ ] Task 11.23 — Unit Tests
- [ ] Task 11.24 — Integration Tests
- [ ] Task 11.25 — E2E Tests

---

---

## Phase A1: Subscription Plans

**Target:** 13 tasks  
**Status:** In Progress (12/13)  
**Spec:** `Docs/Specs/subscription-plans.md`  
**Plan:** `Docs/Plans/subscription-plans.md`  
**Tasks:** `Docs/Tasks/subscription-plans.md`

### Tasks

- [x] **Task A1.1** — ProPaywall Component
- [x] **Task A1.2** — Cloud Backup Plan Gating
- [x] **Task A1.3** — Export Module (JSON)
- [x] **Task A1.4** — Export Module (CSV)
- [x] **Task A1.5** — Export Module (PDF)
- [x] **Task A1.6** — ExportDialog Component
- [x] **Task A1.7** — Import Module (JSON)
- [x] **Task A1.8** — Import Module (Excel)
- [x] **Task A1.9** — Import Route (UI)
- [x] **Task A1.10** — Settings: Konto Section
- [x] **Task A1.11** — Settings: Daten Section
- [x] **Task A1.12** — PlanComparison Modal
- [ ] **Task A1.13** — E2E Tests

---

## Phase A1b: Multi-Arbeitgeber (Future)

**Target:** TBD  
**Status:** Not started  
**Spec:** TBD

### Planned Features

- [ ] Mehrere Arbeitgeber (AG)
- [ ] Kleine Änderungen (TBD)

---

## Phase A2: UX Improvements

**Target:** TBD  
**Status:** Not started  
**Spec:** TBD

### Planned Features

- [ ] Kategorien umbenennen
- [ ] Navigation (vor/zurück)
- [ ] Landing page Verhalten

---

## Phase A3: UI Improvements

**Target:** TBD  
**Status:** Not started  
**Spec:** TBD

### Planned Features

- [ ] UI komplett auf deutsch
- [ ] Farbschemata
- [ ] Icon design

---

## Phase A4: Bug Fixes

**Target:** TBD  
**Status:** Not started  
**Spec:** TBD

### Known Bugs

- [ ] Auto Sync bei Konflikt
- [ ] Resume button vertikale Ausrichtung

---

**END OF CURRENT TRACKER**
