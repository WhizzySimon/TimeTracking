# Analysis Tab Weekly Average Calculation Fix

**Chat Date/Time:** 2025-12-22T23:49:00+01:00
**Generated At:** 2025-12-24T04:16:00+01:00
**Chat topic:** Fix weekly average calculation in Analysis tab to correctly use WorkTimeModel weekdays instead of calendar days
**Workflow used:** UNKNOWN

**Related Docs:**

- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: NONE
- Other referenced docs: `e:\Private\Dev\Timekeeping\TimeTracker\src\lib\types.ts` (WorkTimeModel interface)

## Decisions (aus Chat)

- D1: Weekly average calculation must use WorkTimeModel to determine which weekdays are active work days — Reason: Excel calculation was inconsistent because it didn't filter weekends/non-work days properly — Evidence: User message "Also weder Option A noch Option B. Lass uns nicht daran orientieren, wie Excel das macht. Lass uns das gleich korrekt machen."
- D2: Only count days as work days if both conditions are met: (1) weekday is active in WorkTimeModel (hours > 0) AND (2) day is not marked as urlaub/krank/feiertag — Reason: Correct calculation requires checking both the model configuration and actual day type — Evidence: User message "Und wenn die Daten nicht gut genug sind, dann sag Bescheid, vielleicht kann ich noch welche erfinden zum Testen. Aber wir sollten definitiv die Nicht-Arbeitstage ausschließen."
- D3: Effective weeks = counted work days / work days per week from model — Reason: Different WorkTimeModels can have different numbers of work days per week (5-day vs 7-day) — Evidence: User message "Und wie viele Arbeitstage pro Woche sind, das steht in den Einstellungen in Arbeitszeitmodell. Da sind ja manchmal fünf Tage oder sieben Tage."

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- NONE — No spec/plan/tasks documents were created or modified in this chat

### Code Delta (nur aus Chat)

- `src/routes/analysis/+page.svelte` — Added functions: `getWeekdayKey()`, `isWeekdayActiveInModel()`, `getWorkDaysPerWeekFromModel()`, rewrote `countWorkDaysInRange()` to check both WorkTimeModel and DayTypes, added `calculateEffectiveWeeks()` to use work days per week from model — Evidence: Checkpoint summary "Modified the `$derived` calculation for `totalCategoryHours` in `src/routes/analysis/+page.svelte` to filter categories by `cat.countsAsWorkTime === true`" and commit message "fix: correct weekly average calculation using WorkTimeModel weekdays"
- `src/routes/analysis/+page.svelte` — Removed unused `workDaysInRange` variable to fix lint error — Evidence: Checkpoint summary "Error: Lint error in `src/routes/analysis/+page.svelte` about `workDaysInRange` being defined but never used"

### Repo-Verified Delta (optional, getrennt!)

- `src/lib/types.ts` lines 61-74 — WorkTimeModel interface exists with fields: id, name, validFrom, monday-sunday (number|null), createdAt, updatedAt — Evidence: Read from repo file
- `src/routes/analysis/+page.svelte` lines 174-265 — Contains new calculation logic with functions getWeekdayKey, isWeekdayActiveInModel, getWorkDaysPerWeekFromModel, countWorkDaysInRange, calculateEffectiveWeeks — Evidence: Read from repo file after edit
- `DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/INDEX.md` — Contains 16 existing devlog entries — Evidence: Read from repo file

## Verification (strict)

- Claimed in chat:
  - `npm run lint` — Result: PASS — Evidence: Checkpoint summary "Verification will be performed by running `npm run verify` after each significant code change" and cascade-status.txt showing "DONE:SUCCESS"
  - Git commit successful — Result: PASS — Evidence: cascade-output.txt "[main a20c329] fix: correct weekly average calculation using WorkTimeModel weekdays / 1 file changed, 75 insertions(+), 8 deletions(-)"
- Verified now in repo (static only):
  - `src/routes/analysis/+page.svelte` contains function `calculateEffectiveWeeks()` at line 249 — Evidence: Repo file read showing function definition
  - `src/routes/analysis/+page.svelte` contains function `getWorkDaysPerWeekFromModel()` at line 198 — Evidence: Repo file read showing function definition

## Bugs / Issues mentioned

- B1: Total sum in Analysis tab included non-work-time categories (Pause, etc.) — Cause: Filter was missing in calculation — Fix: Added `.filter((cat) => cat.countsAsWorkTime)` to totalCategoryHours calculation — Status: DONE — Evidence: Checkpoint summary "Error: The total sum in the Analysis tab was significantly higher than Excel values because it included non-work-time categories (like 'Pause')"
- B2: Weekly average calculation used calendar days (74 days / 7) instead of actual work days from WorkTimeModel — Cause: Old logic counted all days as potential work days including weekends — Fix: Implemented new logic checking WorkTimeModel weekday configuration and DayTypes — Status: DONE — Evidence: User message "Ja, ich glaube, das Excel-Sheet macht das nicht so explizit, dass es die Krankheits-, also die Nicht-Arbeitstage gut rausfiltert"
- B3: No WorkTimeModel exists for 2024 data (only 2025-12-21 onwards) — Cause: User's WorkTimeModel starts from 2025-12-21, but test data is from 2024-01-01 to 2024-03-14 — Fix: UNKNOWN (user needs to create WorkTimeModel with validFrom: 2024-01-01) — Status: OPEN — Evidence: Playwright browser showing "Vollzeit 40h 40h/Woche • 5 Tage • ab 2025-12-21" and user request "Also es stimmt noch nicht, kannst du bitte mit dem Playwright-Dev-Browser alles selbst checken"

## Follow-ups

- F1: User needs to create WorkTimeModel with validFrom: 2024-01-01 to test 2024 data — Owner: User — Priority: High
- F2: Verify calculation with real 2024 data after WorkTimeModel is created — Owner: Cascade — Priority: High
- F3: Consider handling multiple WorkTimeModels across a date range (currently uses model at range start) — Owner: Cascade — Priority: Low

## Tags

tags: analysis-tab, calculation, work-time-model, weekly-average, bugfix, indexeddb, playwright

## Confidence

- Medium (calculation logic is clear and implemented, but verification incomplete due to missing 2024 WorkTimeModel data)
