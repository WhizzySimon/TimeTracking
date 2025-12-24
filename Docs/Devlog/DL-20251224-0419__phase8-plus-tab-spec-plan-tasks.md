# Phase 8: Plus-Tab Spec, Plan & Tasks Creation

**Chat Date/Time:** 2025-12-23 21:28 - 2025-12-24 04:19 (UTC+01:00)  
**Generated At:** 2025-12-24T04:19:00+01:00  
**Chat topic:** Phase 8 Plus-Tab feature specification, planning, and task breakdown with documentation reorganization  
**Workflow used:** /new-feature (extended from Phase 7)

**Related Docs:**

- Spec: Docs/Specs/P07-20251223-quick-start-ux.md (Phase 8 section)
- Plan: Docs/Plans/P07-20251223-quick-start-ux.md (Phase 8 section)
- Tasks: Docs/Tasks/P07-20251223-quick-start-ux.md (Phase 8 tasks 8.1-8.8)
- Progress: Docs/IMPLEMENTATION_PROGRESS.md (Phase 8 section added, 86/94 tasks, 91%)
- Other referenced docs: Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md (naming convention added)

## Decisions (aus Chat)

- D1: Update existing quick-start-ux spec instead of creating new spec — Reason: Phase 8 is extension of Phase 7 Quick-Start UX, not separate feature — Evidence: "Und die Frage ist, ob wir die bestehenden, also das, was wir vorher gemacht haben, jetzt leicht abgeändert wird, updaten oder eine komplett neue schreiben. Was denkst du?"

- D2: Plus-Tab as first tab (left of Tag) with only "+" symbol — Reason: Primary action should be most accessible — Evidence: "Der Plus-Tab, der sollte der allererste Tab sein, also links neben dem Tag und am besten nur ein Plus-Symbol beinhalten"

- D3: Remove sorting toggle from settings — Reason: No longer needed with Plus-Tab fixed sorting (Top 5 + A-Z) — Evidence: "Des Weiteren haben wir in den Einstellungen jetzt einen Toggle für Häufigkeit, Sortierung oder alphabetische Sortierung, den würde ich jetzt rausnehmen"

- D4: Remove "+ Aufgabe hinzufügen" button from Tag-Tab — Reason: Plus-Tab becomes dedicated place for adding tasks — Evidence: "ich würde sagen, das streichen wir auch raus, was denkst du?" (User agreed to remove it)

- D5: Implement phase/date naming convention for all docs — Reason: Prevent confusion, enable chronological sorting, clear phase assignment — Evidence: "wenn du neue Specs anlegst, bitte irgendwie mit einem Datum versehen oder mit einer Tasknummer... damit kein Durcheinander später da ist"

- D6: Add naming convention to guidelines — Reason: Ensure future docs follow same pattern — Evidence: "addiere in die Specs, genau dort, wo es hingehört, genau das, dass dass jedes neue Dokument oder Speck oder Plan oder Guideline für jedes Feature bitte auch ein Datum oder eine Nummer oder vielleicht am besten beides bekommt"

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- Docs/Specs/P07-20251223-quick-start-ux.md — Added Phase 8 section with FR-020 to FR-032, updated scope, added cleanup requirements — Evidence: Chat shows spec updates with Plus-Tab requirements

- Docs/Plans/P07-20251223-quick-start-ux.md — Added Phase 8 architecture section with new route /add, CategoryList component, cleanup items — Evidence: Chat shows plan creation with 8-step implementation order

- Docs/Tasks/P07-20251223-quick-start-ux.md — Added Phase 8 tasks 8.1-8.8 (Plus-Tab route, CategoryList, Ein-Klick-Start, Navigation, Default-Tab logic, Cleanup Tag-Tab, Cleanup Settings, E2E tests) — Evidence: Chat shows task breakdown

- Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md — Added "Namenskonvention für Dokumente" section with P<phase>-<YYYYMMDD>-<slug>.md format — Evidence: Chat shows guideline update

- Docs/IMPLEMENTATION_PROGRESS.md — Added Phase 8 section with 8 tasks, updated header to 86/94 tasks (91%) — Evidence: Chat shows progress tracker update

### Code Delta (nur aus Chat)

- NONE — No code implementation in this chat, only documentation phase

### Repo-Verified Delta (optional, getrennt!)

- Docs/Specs/P07-20251223-quick-start-ux.md — File exists, contains Phase 8 metadata (Phase 7+8, Created 2025-12-23, Last Updated 2025-12-23) — Evidence: File read shows metadata header

- Docs/Plans/P07-20251223-quick-start-ux.md — File exists, contains Phase 8 section starting at line 181 — Evidence: File read shows "# Phase 8: Plus-Tab (Ein-Klick-Workflow)"

- Docs/Tasks/P07-20251223-quick-start-ux.md — File exists, contains Phase 8 tasks 8.1-8.8 starting at line 190 — Evidence: File read shows task list

- Docs/IMPLEMENTATION_PROGRESS.md — File exists, Phase 8 section exists at line 959, header shows 86/94 tasks — Evidence: File read shows Phase 8 tracker

- Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md — File exists, naming convention section exists at line 273 — Evidence: File read shows "Namenskonvention für Dokumente"

- All P07 files renamed from original names (quick-start-ux.md → P07-20251223-quick-start-ux.md) — Evidence: find_by_name results show P07-20251223-quick-start-ux.md in Specs, Plans, Tasks

- All P06, P01, P00 files also renamed with phase/date prefix — Evidence: Cascade output shows git rename operations

## Verification (strict)

- Claimed in chat:
  - git commit "docs: reorganize docs with phase/date naming convention" — Result: PASS (16 files changed, 162 insertions) — Evidence: cascade-output.txt shows commit hash 4cbcb54
  - git commit "docs: add Phase 8 Plus-Tab plan and tasks" — Result: PASS (5 files changed, 315 insertions) — Evidence: cascade-output.txt shows commit hash 6f2e9f1
  - File renames via cascade-watcher — Result: PASS (all files renamed successfully) — Evidence: Multiple cascade-output.txt reads showing exit code 0

- Verified now in repo (static only):
  - Docs/Specs/P07-20251223-quick-start-ux.md exists — Evidence: find_by_name result
  - Docs/Plans/P07-20251223-quick-start-ux.md exists — Evidence: find_by_name result
  - Docs/Tasks/P07-20251223-quick-start-ux.md exists — Evidence: find_by_name result
  - Phase 8 section exists in all three files — Evidence: read_file results show Phase 8 content
  - Naming convention documented in SPEC_DRIVEN_DEVELOPMENT.md — Evidence: read_file shows section at line 273

## Bugs / Issues mentioned

- NONE — No bugs or issues mentioned in this chat

## Follow-ups

- F1: Implement Phase 8 tasks 8.1-8.8 (Plus-Tab route, CategoryList, Ein-Klick-Start logic, Navigation, Default-Tab, Cleanup, E2E tests) — Owner: Cascade — Priority: High

- F2: User asked about communicating Phase 8 location to another chat — Owner: User — Priority: Low

- F3: Verify /continue-work workflow can find Phase 8 tasks automatically — Owner: Cascade — Priority: Medium

## Tags

- tags: [phase8, plus-tab, spec, plan, tasks, docs, naming-convention, reorganization]

## Confidence

- High (all decisions explicitly confirmed by user, all file operations verified via cascade-watcher output, repo state verified via read_file)
