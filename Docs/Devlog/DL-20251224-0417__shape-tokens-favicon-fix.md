# Shape Design System Refinement & Favicon Override Fix

**Chat Date/Time:** 2025-12-23 14:58 - 2025-12-24 05:22 (UTC+01:00)
**Generated At:** 2025-12-24T04:17:00+01:00
**Chat topic:** Refine shape design system with consistent token usage across all UI elements and fix favicon flipping issue caused by duplicate definitions
**Workflow used:** /new-task

**Related Docs:**
- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: NONE
- Other referenced docs: NONE

## Decisions (aus Chat)

- D1: Use shape tokens (--r-btn, --r-input, --r-card, etc.) consistently across all components instead of hardcoded border-radius values — Reason: Ensure Sharp and Soft designs are properly differentiated throughout the application — Evidence: "I would like to make it more differentiated in the design... update components like TabNavigation to have pill-shaped active/hover states"

- D2: Settings page icon buttons (plus, delete, menu) must use --r-btn token to adapt to shape style — Reason: User specifically requested these elements to be rounded in Soft design — Evidence: "bei den Einstellungsseiten selbst gibt es das Plus-Icon und das Delete-Icon... die sind alle eher eckig. Kannst du die bitte alle noch rund machen für das runde Design?"

- D3: Remove duplicate favicon definition from +layout.svelte that overrides app.html favicon — Reason: Svelte logo SVG injected via <svelte:head> was overriding correct PNG favicon after hydration — Evidence: Playwright inspection showed 3 icon links (including Svelte logo SVG), network requests confirmed favicon flip behavior

- D4: Use cache-busting version parameter (?v=2025-12-23) for favicon and apple-touch-icon — Reason: Ensure browsers load updated icons — Evidence: User updated manifest and app.html with versioned filenames

- D5: Rename apple-touch-Icon.png to lowercase apple-touch-icon.png — Reason: Avoid case-sensitivity issues on Linux/production servers — Evidence: File discovery showed capital "I" in filename but HTML referenced lowercase

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)
- NONE

### Code Delta (nur aus Chat)

- src/routes/settings/+page.svelte — Updated .icon-btn, .menu-btn, .delete-btn to use var(--r-btn) instead of hardcoded 4px border-radius — Evidence: multi_edit tool call lines 703-848

- src/lib/components/AddWorkTimeModelModal.svelte — Updated .hours-input and .error to use var(--r-input) instead of 4px border-radius — Evidence: multi_edit tool call lines 521-551

- src/lib/components/AddCategoryModal.svelte — Updated .error to use var(--r-input) instead of 4px border-radius — Evidence: edit tool call lines 203-211

- src/lib/components/Modal.svelte — Updated .close-btn to use var(--r-btn) instead of 4px border-radius — Evidence: edit tool call lines 176-192

- src/lib/components/TaskItem.svelte — Updated .delete-btn to use var(--r-btn) instead of 4px border-radius — Evidence: edit tool call lines 96-114

- src/lib/components/SyncIndicator.svelte — Updated .sync-indicator to use var(--r-pill) instead of 16px border-radius — Evidence: edit tool call lines 64-76

- src/app.html — Added cache-busting version parameter to favicon and apple-touch-icon links — Evidence: multi_edit tool call lines 6-8

- src/routes/+layout.svelte — Removed import of favicon.svg and <svelte:head> block with duplicate favicon definition — Evidence: edit tool calls removing lines 7 and 175-177

- static/apple-touch-Icon.png — Renamed to apple-touch-icon.png (lowercase) — Evidence: cascade-command.txt rename command, exit code 0

### Repo-Verified Delta (optional, getrennt!)

- static/manifest.webmanifest — Contains maskable icon entries with versioned filenames (icon-192-2025-12-23.png, icon-512-2025-12-23.png, maskable-192-2025-12-23.png, maskable-512-2025-12-23.png) — Evidence: read_file lines 9-12

- static/apple-touch-icon.png — File exists with lowercase name after rename — Evidence: list_dir output showing "apple-touch-icon.png (4673 bytes)"

- src/lib/assets/favicon.svg — File exists (Svelte logo SVG that was causing the override) — Evidence: find_by_name result

- All icon files referenced in manifest exist: favicon-2025-12-23.png, apple-touch-icon-2025-12-23.png, icon-192-2025-12-23.png, icon-512-2025-12-23.png, maskable-192-2025-12-23.png, maskable-512-2025-12-23.png — Evidence: find_by_name and list_dir results

## Verification (strict)

- Claimed in chat:
  - npm run format; npm run check; npm run lint — Result: PASS (exit code 0) — Evidence: cascade-output.txt after shape token updates
  - npm run format; npm run check; npm run lint — Result: PASS (exit code 0) — Evidence: cascade-output.txt after favicon fix
  - HTTP 200 for /favicon-2025-12-23.png, /manifest.webmanifest, /icons/maskable-512.png — Result: PASS (all returned 200) — Evidence: PowerShell Invoke-WebRequest output showing "200" three times
  - Playwright icon link inspection (before fix) — Result: 3 icon links including Svelte logo SVG — Evidence: mcp1_browser_evaluate showing data:image/svg+xml Svelte logo
  - Playwright icon link inspection (after fix) — Result: 2 icon links, no Svelte logo, stable over time — Evidence: mcp1_browser_evaluate showing only PNG favicon and apple-touch-icon, checked twice with 3 second delay

- Verified now in repo (static only):
  - src/routes/+layout.svelte no longer contains "import favicon from" or "<svelte:head>" with icon link — Evidence: File read after edits shows no favicon import or svelte:head block
  - All Svelte components searched have no remaining hardcoded "border-radius: \d+px" patterns — Evidence: grep_search returned "No results found"
  - Docs/Devlog/INDEX.md contains separator line "--- | --- | --- | --- | ---" on line 2 — Evidence: read_file output line 2

## Bugs / Issues mentioned

- B1: Favicon flips from new PNG to old Svelte logo SVG after page hydration — Cause: +layout.svelte imported favicon.svg and injected it via <svelte:head>, overriding app.html favicon — Fix: Removed duplicate favicon import and <svelte:head> block from +layout.svelte — Status: DONE — Evidence: "The favicon should now stay correct and not flip back to the Svelte logo after hydration"

- B2: Settings page icon buttons remained angular in Soft design — Cause: Hardcoded 4px border-radius instead of using shape tokens — Fix: Updated to use var(--r-btn) — Status: DONE — Evidence: "die sind alle eher eckig. Kannst du die bitte alle noch rund machen"

- B3: apple-touch-Icon.png had capital "I" causing potential case-sensitivity issues — Cause: Filename mismatch with HTML reference — Fix: Renamed to lowercase apple-touch-icon.png — Status: DONE — Evidence: "This will cause issues on case-sensitive systems (like Linux servers)"

## Follow-ups

- F1: Monitor production deployment to confirm favicon no longer flips on live site (https://timetracker.samuelgross.org/) — Owner: User — Priority: High

- F2: Consider removing unused src/lib/assets/favicon.svg file since it's no longer referenced — Owner: Cascade — Priority: Low

- F3: Verify all icon files are correctly generated with proper dimensions and content (not just existence check) — Owner: User — Priority: Med

## Tags

- tags: [ui, ux, design-tokens, shape-system, favicon, pwa, icons, bugfix, settings, playwright]

## Confidence

- Medium (Shape token updates clearly documented in chat; favicon fix verified with Playwright; some production behavior assumptions not tested)
