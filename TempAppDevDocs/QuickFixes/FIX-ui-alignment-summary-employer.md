# UI Alignment: Summary Row & Employer Label

**Date:** 2026-01-03
**Type:** [x] Improvement

## Current Behavior

1. **Summary Row (Ist/Soll/Haben)** on Day/Week/Month/Analysis pages:
   - No label identifying what the row represents
   - Values not aligned consistently

2. **Time Entry Row (Eintrag)** employer label:
   - Employer label (including "Keine Arbeitszeit") not aligned to the right
   - Should be positioned next to symbol buttons

## Desired Behavior

1. **Summary Row:**
   - Add "Zusammenfassung" label on the left side
   - Align Ist/Soll/Haben values to the right side

2. **Time Entry Row:**
   - Align employer label to the right (next to symbol-buttons)

## Analysis

### 1. Summary Row (Ist/Soll/Haben)
- **Component:** `InlineSummary.svelte` - used on Day/Week/Month/Analysis pages
- **Current:** Uses `.tt-summary-display` with flex layout, no label
- **CSS:** `tt-design-system-v2.css:776-808`
- **Solution:** Wrap in container with "Zusammenfassung" label on left, summary values on right

### 2. Time Entry Row - Employer Label
- **Component:** `TaskItem.svelte:66-70`
- **Current:** Employer label (`.tt-inline-label-employer`) and "Keine Arbeitszeit" (`.tt-inline-label-no-work`) are inline within `.tt-list-row__content-compact`
- **Layout:** Time · Separator · Category · Employer/NoWork label (all left-aligned)
- **Solution:** Move employer/no-work labels to right side, before action buttons
- **CSS Classes:** Lines 367-400 in tt-design-system-v2.css

## Changes Made

### 1. Summary Row - Added "Zusammenfassung" Label
- **File:** `src/lib/components/InlineSummary.svelte`
- **Changes:**
  - Wrapped `.tt-summary-display` in new `.summary-container` with flexbox layout
  - Added `<span class="summary-label">Zusammenfassung</span>` on the left
  - Summary values (Ist/Soll/Haben) now aligned to the right via `justify-content: space-between`
  - Added responsive layout for narrow screens (≤360px)
- **Result:** Summary row now shows "Zusammenfassung" label on left, values on right

### 2. Time Entry Row - Employer Label Right-Aligned
- **File:** `src/lib/components/TaskItem.svelte`
- **Changes:**
  - Moved employer/no-work labels out of `.tt-list-row__content-compact`
  - Created new `.employer-label-container` with `margin-left: auto` for right alignment
  - Container positioned between content and action buttons
- **Result:** Employer labels (including "Keine Arbeitszeit") now appear on the right side, next to symbol buttons

## QA Checklist

- [x] `npm run check` passes (0 errors, 5 warnings - unrelated)
- [ ] Verified change works (manual - requires visual inspection in browser)

## Additional Fixes (User Feedback)

### 3. Summary Row Layout - Removed Nested Border
- **Issue:** Summary had nested row with separate border (row in a row)
- **Fix:** Removed `.summary-container` wrapper, integrated "Zusammenfassung" label directly into `.tt-summary-display`
- **Result:** Single row with label on left, values on right, no nested borders

### 4. Primary Button Styling - Missing CSS Variables
- **Issue:** Settings page buttons (Exportieren, Stundenzettel) appeared as secondary buttons
- **Root Cause:** CSS variables `--tt-button-primary-bg`, `--tt-button-primary-hover`, `--tt-button-primary-text`, `--tt-status-danger-hover` were undefined
- **Fix:** Added missing variables to `tt-design-system-v2.css:143-147`
- **Result:** Primary buttons now display with correct blue background

### 5. Font Unification - Inconsistent Fonts
- **Issue:** "Zeitdaten" section and other elements used different fonts (Arial, system-ui mix)
- **Fix:** Added `font-family: var(--tt-font-family)` to all text elements in settings page:
  - `.page-header h1`
  - `.section-header h2`
  - `.section-toggle`
  - `.data-btn`
  - `.delete-account-btn`
  - `.account-info`
  - `.version-info`, `.version-label`, `.version-section`
- **Result:** All text now uses unified `--tt-font-family` (system-ui stack)

## Additional Fixes (Second Round)

### 6. Analysis Page - Zeitraum Full-Row Layout
- **Issue:** Zeitraum selector was inline, not full-row like Tagesart dropdown on Day page
- **Fix:** Changed from custom `.range-section` to `.tt-labeled-dropdown` class
- **Files:** `src/routes/analysis/+page.svelte:665-669, 800-816`
- **Result:** Zeitraum now displays in full-row format matching Tagesart dropdown

### 7. Date Selector Buttons - Visible Background
- **Issue:** Date selector buttons (day/week/month titles) only showed clickability on hover
- **Fix:** Added border to all date selector buttons using `--tt-border-touchable-width` and `--tt-border-touchable-color`
- **Shared Class:** Added `.tt-date-selector-button` class to all three pages for consistency
- **Files:**
  - `src/routes/day/+page.svelte:322, 455`
  - `src/routes/week/+page.svelte:287, 421`
  - `src/routes/month/+page.svelte:363, 496`
- **Result:** Date selector buttons now have visible border, making them clearly clickable without hover

## Additional Fixes (Third Round)

### 8. Stundenzettel Export Dialog - Simplified Button Layout
- **Issue:** Three buttons in footer (Abbrechen, PDF exportieren, Excel exportieren) with Abbrechen flowing to the left
- **Fix:** Redesigned dialog with radio buttons for format selection (PDF/Excel) and single "Exportieren" button
- **Files:** `src/lib/components/StundenzettelExport.svelte:62, 372-408, 588-619`
- **Changes:**
  - Added `exportFormat` state variable ('pdf' | 'excel')
  - Added "Format:" field with radio buttons for PDF/Excel selection
  - Replaced two export buttons with single "Exportieren" button
  - Button triggers appropriate export based on selected format
  - Changed button classes from `.btn-primary`/`.btn-secondary` to `.tt-button-primary`/`.tt-button-secondary`
- **Result:** Cleaner dialog layout with proper button alignment, single primary action

## Additional Fixes (Fourth Round)

### 9. Import Page - Employer Dropdown
- **Issue:** Import page was missing employer dropdown to specify which employer the imported time entries belong to
- **Fix:** Added employer selection dropdown at the top of the import page
- **Files:** `src/routes/import/+page.svelte:20-21, 28-29, 80-98, 131-136, 155-171, 243-254`
- **Changes:**
  - Added `getActiveEmployers` import and `Employer` type
  - Added `employers` and `selectedEmployerId` state variables
  - Load employers on mount, auto-select first employer
  - Added employer dropdown using `.tt-labeled-dropdown` design system class
  - Filter categories by selected employer when importing entries
  - Only match imported entries to categories belonging to selected employer
- **Result:** Users can now select which employer to import time entries for, ensuring correct category association

## Additional Fixes (Fifth Round)

### 10. Footer Bar - Border Radius Consistency
- **Issue:** Footer bar had no upper border radius, inconsistent with header bar's lower border radius
- **Fix:** Added `border-radius: var(--tt-radius-card) var(--tt-radius-card) 0 0` to `.tt-footer-nav`
- **Files:** `src/lib/styles/tt-design-system-v2.css:1052`
- **Result:** Footer bar now has rounded upper corners matching header's rounded lower corners, creating visual consistency

### 11. Settings Page - Delete Button Alignment
- **Issue:** Delete buttons in Arbeitsgeber, Arbeitszeitmodelle, Abwesenheit, and Tätigkeiten sections were not right-aligned
- **Fix:** Added `margin-left: auto` to `.tt-btn-delete` class in design system
- **Files:** `src/lib/styles/tt-design-system-v2.css:1307`
- **Result:** All delete buttons now align to the right side of their rows across all settings sections

### 12. Import Bug - Missing employerId Property
- **Issue:** Imported time entries were missing `employerId` property, causing Auswertung (Analysis) tab to not show expected hours
- **Root Cause:** Import logic created `TimeEntry` objects without setting the `employerId` field
- **Fix:** Added `employerId: selectedEmployerId` to imported entries
- **Files:** `src/routes/import/+page.svelte:109`
- **Result:** Imported entries now include correct `employerId`, allowing Auswertung to calculate and display expected hours properly

## Additional Fixes (Sixth Round)

### 13. Week Page - Wochenart Row Styling
- **Issue:** Wochenart row styling was inconsistent with other rows, user wanted border like Zusammenfassung row and filled dropdown without border
- **Fix:** Changed to use `.tt-labeled-dropdown` design system class with custom `.tt-dropdown--filled` variant
- **Files:** `src/lib/components/WeekTypeSelector.svelte:160-173, 197-214`
- **Changes:**
  - Replaced custom `.week-type-section` with `.tt-labeled-dropdown` class
  - Changed label from `<label>` to `<span class="tt-labeled-dropdown__label">`
  - Added `.tt-dropdown--filled` variant with background fill (no border)
  - Uses `--tt-background-card-hover` for fill, `--tt-background-card-pressed` for hover/focus
- **Result:** Wochenart row now has consistent border styling like Zusammenfassung, dropdown has light background fill without border

### 14. Employer Selection Persistence
- **Issue:** Selected employer in header dropdown not persisting on page reload, always resetting to "Alle Arbeitgeber"
- **Root Cause:** `selectedEmployerId` store had no localStorage persistence
- **Fix:** Created custom store with localStorage support
- **Files:** `src/lib/stores/index.ts:57-87`
- **Implementation:**
  - Loads initial value from `localStorage.getItem('tt-selected-employer-id')` on store creation
  - Saves to localStorage on every `set()` call
  - Removes from localStorage when set to `null`
- **Result:** Selected employer now persists across page reloads

## Additional Fixes (Seventh Round)

### 15. Dropdown Chevron Icon Positioning
- **Issue:** Wochenart dropdown missing chevron icon, inconsistent dropdown styling across app
- **Fix:** Added chevron icon to Wochenart dropdown, audited all dropdowns for consistency
- **Files:** 
  - `src/lib/components/WeekTypeSelector.svelte:200-217` (added chevron to filled dropdown variant)
  - `DevFramework/JustInTimeAgentRules/frontend-ui-standards.md:149-169` (added UI design rule)
- **Changes:**
  - Added chevron icon to `.tt-dropdown--filled` variant using background-image
  - Updated UI standards: **Chevron ALWAYS on the RIGHT side** (universal standard)
  - All dropdowns now use `background-position: right var(--tt-space-12) center`
- **Result:** All dropdowns have chevron on right, consistent with platform standards (iOS, Android, Windows, macOS, web)

### 16. Time Values Right-Alignment in Day/Week Rows
- **Issue:** Time values (Ist/Soll/Saldo) in day rows not right-aligned, causing visual inconsistency
- **Fix:** Added `margin-left: auto` to time display containers
- **Files:**
  - `src/routes/week/+page.svelte:467` (day-hours container)
  - `src/routes/month/+page.svelte:536` (week-hours container)
- **Result:** Time values now right-aligned in all day/week rows across Week and Month pages

## Additional Fixes (Eighth Round)

### 17. Comprehensive Hover Effect System
- **Issue:** Hover effects removed for mobile-first approach, but user wants them for mouse interaction
- **Solution:** Implemented progressive state system with proper light/dark background handling
- **Files:**
  - `src/lib/styles/tt-design-system-v2.css:1-24, 54-61, 150-161, 214-219, 329-344, 541-562, 1125-1149, 1188-1193, 1222-1227, 1365-1370, 1396-1401` (design system updates)
  - `DevFramework/JustInTimeAgentRules/frontend-ui-standards.md:47-105` (UI design rule)

**State Progression System:**
- **Order:** normal → hover → selected/current → pressed
- **Light backgrounds:** States become progressively darker
  - Example: `#ffffff` → `#f5f8fc` → `#edf2f7` → `#e2e8f0`
- **Dark backgrounds:** States become progressively lighter
  - Example: `#2526a9` → `#3334b8` → `#4a4bc5` → `#5c5dd0`

**CSS Variables Added:**
```css
/* Light backgrounds */
--tt-background-card: #ffffff;           /* Normal */
--tt-background-card-hover: #f5f8fc;     /* Hover (darker) */
--tt-background-card-selected: #edf2f7;  /* Selected (darker) */
--tt-background-card-pressed: #e2e8f0;   /* Pressed (darkest) */

/* Dark backgrounds (buttons) */
--tt-button-primary-bg: #2526a9;         /* Normal */
--tt-button-primary-hover: #3334b8;      /* Hover (lighter) */
--tt-button-primary-selected: #4a4bc5;   /* Selected (lighter) */
--tt-button-primary-pressed: #5c5dd0;    /* Pressed (lightest) */
```

**Components Updated with Hover:**
- `.tt-list-row-clickable` - Clickable list rows
- `.tt-selection-row` - Selection/category rows
- `.tt-chip` - Interactive chips (normal and selected states)
- `.tt-button-primary` - Primary action buttons
- `.tt-btn-delete` - Delete buttons
- `.tt-footer-tab` - Footer navigation tabs (normal and current states)
- `.tt-dropdown` - Dropdown selects
- `.tt-text-input` - Text input fields

**Hover Implementation:**
- All hover states wrapped in `@media (hover: hover)` to respect touch devices
- Smooth transitions using `--tt-transition-fast` (0.15s ease)
- Contrast verified for all states (≥4.5:1 for normal text, ≥3:1 for large text)

**Result:** Comprehensive hover feedback system for mouse users while maintaining touch-friendly design. All interactive elements now provide progressive visual feedback through all states.

### 18. Analysis Page - Time Values and Date Range Alignment
- **Issue:** 
  1. Ist/Soll/Haben values in week/month rows not right-aligned in Zeiten section
  2. Zeitraum date range button taking full width instead of auto-width and right-aligned
- **Fix:** 
  1. Added `margin-left: auto` to `.period-hours` container
  2. Changed Zeitraum from `.tt-labeled-dropdown` to custom `.range-selector-row` with `justify-content: space-between`
- **Files:** `src/routes/analysis/+page.svelte:665-670, 800-835, 850-856`
- **Changes:**
  - Period hours (Ist/Soll/Haben) now right-aligned in all period rows (works for both week and month views)
  - Zeitraum row uses flexbox with space-between: label on left, button on right
  - Date range button has auto-width (`white-space: nowrap`) and only as wide as content
  - Added hover state with `@media (hover: hover)` for consistency
- **Result:** Time values right-aligned in Zeiten section, Zeitraum button right-aligned with auto-width

### 19. Missing Hover/Pressed States Fixes
- **Issue:** Several interactive elements missing hover or pressed states:
  1. Month page title button - hover works but no pressed state
  2. Header sync icon - no hover background, no border
  3. Header profile icon - hover too light, no pressed state
  4. Employer dropdown - no pressed state on button or selected option
  5. Vor/Zurück buttons - had background by default (should be transparent), no hover state
- **Fix:** Added comprehensive hover/pressed states to all mentioned elements
- **Files:**
  - `src/routes/month/+page.svelte:509-517` (month title pressed state)
  - `src/lib/styles/tt-design-system-v2.css:754, 762-772` (symbol buttons hover)
  - `src/lib/components/BackButton.svelte:62, 70-78` (back button hover, transparent default)
  - `src/lib/components/ForwardButton.svelte:38, 46-54` (forward button hover, transparent default)
  - `src/lib/components/EmployerSelector.svelte:131, 143-152, 211-234` (dropdown hover/pressed)
  - `src/routes/+layout.svelte:697-715, 742-760` (sync icon border + hover, profile button pressed)
- **Changes:**
  - **Month title button:** Added `:active` state with `--tt-background-card-pressed`
  - **Symbol buttons (`.tt-symbol-button`):** Added hover state with `@media (hover: hover)`, transition for smooth feedback
  - **Sync indicator:** Added border (`1px solid var(--tt-header-border)`), hover and pressed states
  - **Profile button:** Adjusted hover to lighter color (`rgba(255,255,255,0.1)`), added pressed state
  - **Vor/Zurück buttons:** Changed default from `rgba(255,255,255,0.1)` to `transparent`, added hover state
  - **Employer dropdown:** Added pressed state to button and options, enhanced selected option hover/pressed states
- **Result:** All interactive elements now have complete state progression (normal → hover → pressed) with proper visual feedback

### 20. Analysis Page Einträge Section - Emphasis Switch
- **Issue:** In Einträge section, total hours (Gesamt) was emphasized (bold/primary color) over average hours (Ø/Woche)
- **User Request:** Switch emphasis - make average hours stronger/more prominent than total hours
- **Fix:** Swapped styling classes while keeping values in correct column positions
- **Files:** `src/routes/analysis/+page.svelte:737-742, 756-757`
- **Changes:**
  - Total hours (Gesamt): Changed from `summary-value--primary` to `summary-value--secondary` (font-weight: 500, muted color)
  - Average hours (Ø/Woche): Changed from `summary-value--secondary` to `summary-value--primary` (font-weight: 700, brand primary color)
  - Applied to both Summe row and all category rows
- **Result:** Average hours per week now emphasized with bold font and brand color, total hours shown in normal weight and muted color

### 21. Day and Week Page Date Selector Pressed State
- **Issue:** Date selector buttons (Tag, Woche) missing pressed/active state - only hover worked, Month page worked correctly
- **Root Cause:** Day and Week pages had only `:hover` state, Month page already had `:active` state
- **Fix:** Added `:active` state with `--tt-background-card-pressed` to Day and Week date selectors
- **Files:**
  - `src/routes/day/+page.svelte:468-476` (date-title button)
  - `src/routes/week/+page.svelte:434-442` (week-title button)
- **Changes:**
  - Wrapped hover in `@media (hover: hover)` for consistency
  - Added `:active` state with `--tt-background-card-pressed` background
- **Result:** Day and Week date selector buttons now show visual feedback when clicked/touched, matching Month page behavior

### 22. Running Task Bar Button States
- **Issue:** Running task bar (shown below title bar when task is running) has incomplete interaction states:
  1. Task row itself - no hover or pressed states
  2. "Beenden" (End) button - hover works but no pressed state
  3. Delete button - pressed state works but no hover state
- **Root Cause:** 
  - Task row uses `.tt-list-row-clickable` which already has hover/pressed states (fixed in #19)
  - Primary button (`.tt-button-primary`) missing hover state in first definition
  - Duplicate `.tt-button-primary` definition at line 1395 was overriding hover/pressed states
  - Delete button (`.tt-delete-button`) had comment "Mobile-first: no hover, only press state"
- **Fix:** Added missing hover and pressed states to button classes, fixed duplicate CSS definition
- **Files:** 
  - `src/lib/styles/tt-design-system-v2.css:626, 629-637` (primary button - first definition)
  - `src/lib/styles/tt-design-system-v2.css:1401-1411` (primary button - duplicate definition, added pressed state)
  - `src/lib/styles/tt-design-system-v2.css:829, 832-842` (delete button)
- **Changes:**
  - **Primary button (Beenden):** Added hover state with `--tt-button-primary-hover`, added pressed state to duplicate definition, added transition
  - **Delete button:** Added hover state with danger colors, added transition
  - Both wrapped in `@media (hover: hover)` for touch device compatibility
- **Result:** Running task bar now has complete interaction states - row, End button, and Delete button all show proper hover and pressed feedback

### 23. Add Page Chip Padding Fix
- **Issue:** Chips in "Vorschläge" section on Add page have no real padding - text appears cramped
- **Root Cause:** Chip styling uses `var(--tt-space-6)` for vertical padding, but `--tt-space-6` variable was not defined in design system v2
- **Fix:** Added missing `--tt-space-6: 0.375rem` to spacing scale
- **Files:** `src/lib/styles/tt-design-system-v2.css:123`
- **Changes:**
  - Added `--tt-space-6: 0.375rem` (6px) to spacing variables
  - Fills gap between `--tt-space-4` (0.25rem/4px) and `--tt-space-8` (0.5rem/8px)
  - Chip now has proper padding: `0.375rem 0.75rem` (6px vertical, 12px horizontal)
- **Result:** Chips in Vorschläge section now have proper padding, text is no longer cramped

### 24. Dialog Buttons and Profile Menu States
- **Issue:** Missing interaction states in multiple locations:
  1. Dialog OK buttons (e.g., data sync confirmation) - hover works but no pressed state
  2. Profile menu "Abmelden" - hover too strong, no pressed state
  3. Profile menu "Einstellungen" - no hover or pressed states
- **Root Cause:**
  - Secondary button (`.tt-button-secondary`) missing hover state
  - Danger button (`.tt-button-danger`) missing hover state
  - Profile menu items (`.menu-item`) missing pressed state, using wrong color variables
- **Fix:** Added complete hover and pressed states to all dialog buttons and menu items
- **Files:**
  - `src/lib/styles/tt-design-system-v2.css:664, 667-671, 701, 704-708` (button states)
  - `src/routes/+layout.svelte:802, 809, 812-820, 826-834` (menu item states)
- **Changes:**
  - **Secondary button:** Added hover state with `--tt-background-card-hover`, added transition
  - **Danger button:** Added hover state with `--tt-status-danger-hover`, added transition
  - **Menu items:** Fixed color to use `--tt-text-primary`, added hover with `--tt-background-card-hover`, added pressed state
  - **Logout menu item:** Kept danger color, added pressed state with darker danger background
  - All wrapped in `@media (hover: hover)` for touch device compatibility
- **Result:** All dialog buttons and profile menu items now have complete hover and pressed states with proper visual feedback

### 25. Style Guide Page Background and Width
- **Issue:** Style guide page has white background instead of app background color, and doesn't match the width of title bar and footer bar
- **Root Cause:** Style guide page was using default white background with 900px max-width instead of app's background color and 600px max-width
- **Fix:** Applied app background color and matching max-width to style guide page
- **Files:** `src/routes/dev/styleguide/+page.svelte:1052-1062`
- **Changes:**
  - Added `:global(body)` style to set background to `--tt-background-page` (#e8f0f8 - light blue-gray)
  - Changed `.styleguide` max-width from 900px to 600px (matches app container)
  - Added `background: var(--tt-background-page)` to `.styleguide` container
  - Added `min-height: 100vh` to ensure full-height background
- **Result:** Style guide page now has proper app background color and width matches title/footer bars (600px max-width)

### 26. Delete Button Hover and Pressed States (Global Fix)
- **Issue:** All delete buttons (day page task rows, running task bar, etc.) have issues:
  1. Hover background too strong (danger-faded = 10% opacity)
  2. Missing distinct pressed/touched state
- **Root Cause:** Both `.tt-delete-button` and `.tt-btn-delete` classes using same color for hover and active states
- **Fix:** Adjusted hover to be lighter, made pressed state use the original hover color
- **Files:** 
  - `src/lib/styles/tt-design-system-v2.css:846-856` (`.tt-delete-button`)
  - `src/lib/styles/tt-design-system-v2.css:1437-1447` (`.tt-btn-delete`)
- **Changes:**
  - **Hover state:** Changed from `rgba(197, 48, 48, 0.1)` to `rgba(197, 48, 48, 0.03)` (3% opacity - very subtle)
  - **Pressed state:** Now uses `var(--tt-status-danger-800)` (10% opacity - stronger than hover)
  - Added missing `:active` state to `.tt-btn-delete`
- **State Progression:**
  - Normal: White/transparent background, muted gray icon
  - Hover: Very subtle red background (3% opacity), red icon
  - Pressed: Light red background (10% opacity), red icon
- **Result:** All delete buttons throughout the app now have proper hover (very subtle) and pressed (distinct, stronger) states

### 27. Profile Menu Hover Intensity Adjustment
- **Issue:** Profile menu hover states inconsistent and too strong:
  1. Einstellungen hover much weaker than Abmelden hover
  2. Abmelden hover too strong (10% opacity red)
- **Root Cause:** Einstellungen using `--tt-background-card-hover` (light blue-gray), Abmelden using `--tt-status-danger-faded` (10% red)
- **Fix:** Made hover intensities consistent and reduced Abmelden intensity
- **Files:** `src/routes/+layout.svelte:826-834`
- **Changes:**
  - **Abmelden hover:** Changed from `var(--tt-status-danger-800)` (10%) to `rgba(197, 48, 48, 0.05)` (5% opacity)
  - **Abmelden pressed:** Changed from `rgba(197, 48, 48, 0.2)` to `rgba(197, 48, 48, 0.1)` (10% opacity)
  - Einstellungen hover remains `--tt-background-card-hover` (similar intensity)
- **State Progression:**
  - **Einstellungen:** Normal → Light blue-gray hover → Darker blue-gray pressed
  - **Abmelden:** Normal → Subtle red hover (5%) → Light red pressed (10%)
- **Result:** Both menu items now have consistent, subtle hover states that are not too strong

### 28. Native Select Dropdown Chevron and Option Styling
- **Issue:** Tagesart dropdown (native `<select>`) has multiple issues:
  1. Chevron icon disappears on hover and press, appears to move
  2. Dropdown options missing pressed/active state
  3. Employer dropdown in header has better styling and behavior
- **Root Cause:** 
  - Hover/active states using `background` shorthand which overwrites `background-image` (chevron)
  - Native `<select>` options have very limited CSS styling support (browser-dependent)
  - Employer dropdown uses custom component with full control over styling
- **Fix:** Fixed chevron issue, added option styling (limited browser support)
- **Files:** `src/lib/styles/tt-design-system-v2.css:1224-1262`
- **Changes:**
  - **Chevron fix:** Changed from `background` to `background-color` in hover/active states, explicitly re-declared `background-image`, `background-repeat`, and `background-position`
  - **Option styling:** Added `.tt-dropdown option` styles with hover (blue background, white text) and checked states
- **Limitations:**
  - Native `<select>` option styling has **very limited browser support**
  - `:hover` on options works in some browsers but not all
  - `:active` state on options is not supported by browsers
  - For full control, would need to convert to custom dropdown component (like EmployerSelector)
- **Result:** Chevron now stays visible on hover/press. Option styling added but may not work consistently across all browsers due to native select limitations.

**Note:** For consistent dropdown behavior across the app, consider converting all native `<select>` dropdowns to custom components like `EmployerSelector.svelte` in future refactoring.

### 29. Empty State Button Underline Removal
- **Issue:** Day page empty state button "Füge eine Tätigkeit hinzu" has text underline
- **Root Cause:** Button is implemented as `<a>` link element (for navigation to /add page), which has default browser underline styling for links
- **Fix:** Added `text-decoration: none` to remove underline
- **Files:** `src/lib/components/TaskList.svelte:44, 83-85`
- **Changes:**
  - Added `.empty-state-button` class to the link element
  - Added CSS rule: `text-decoration: none` to remove underline
  - Button already uses `.tt-button-primary` class for unified primary button styling
- **Why underline existed:** The element is an `<a href="/add">` link (for proper navigation), not a `<button>`. Links have default underline styling in browsers. The `.tt-button-primary` class provides button appearance but doesn't override link text-decoration.
- **Result:** Empty state button now displays without underline, maintaining unified primary button styling throughout the app

### 30. App Layout Width and Background Unification
- **Issue:** Footer bar (tab navigation) too wide compared to title bar and app content; background colors were inverted
- **Root Cause:** 
  - Hardcoded `600px` values in multiple places instead of using CSS variable
  - Background colors were inverted (app was white, outside was light blue-gray)
- **Fix:** Created CSS variable for app width and corrected background colors
- **Files:** 
  - `src/lib/styles/tt-design-system-v2.css:54-59` (added `--tt-app-max-width` and `--tt-background-outside`)
  - `src/routes/+layout.svelte:644, 652-654`
  - `src/lib/components/TabNavigation.svelte:77`
  - `src/routes/dev/styleguide/+page.svelte:1053, 1058`
- **Changes:**
  - **New CSS variable:** `--tt-app-max-width: 600px` - single source of truth for app width
  - **New CSS variable:** `--tt-background-outside: #ffffff` - white background outside app
  - **Body background:** `var(--tt-background-outside)` (white - outside the app)
  - **App container background:** `var(--tt-background-page)` (light blue-gray #e8f0f8 - the app itself)
  - **App container max-width:** `var(--tt-app-max-width)` (uses CSS variable)
  - **Footer max-width:** `var(--tt-app-max-width)` (uses CSS variable)
  - **Style guide:** Updated to use same variables
- **Layout Structure:**
  - Body: White background (`--tt-background-outside`) - visible outside app on wide screens
  - App container: Light blue-gray background (`--tt-background-page`), max-width from CSS variable, centered
  - Title bar: Inside app container, full width of container
  - Content: Inside app container, full width of container
  - Footer: Fixed position, max-width from CSS variable, centered (matches app container exactly)
- **Result:** Title bar, app content, and footer bar now all have consistent width from single CSS variable. App has light blue-gray background, area outside app is white.

### 31. Dropdown Unification - Custom Dropdown Component
- **Issue:** Native `<select>` dropdowns (Tagesart, Wochenart) have inconsistent styling and limited control over hover/pressed states compared to custom dropdowns (EmployerSelector)
- **Root Cause:** Native `<select>` elements have severe browser-imposed styling limitations
- **Fix:** Created reusable `CustomDropdown` component and converted Tagesart/Wochenart to use it
- **Files Created:**
  - `src/lib/components/CustomDropdown.svelte` - New reusable dropdown component
- **Files Modified:**
  - `src/lib/components/DayTypeSelector.svelte` - Now uses CustomDropdown
  - `src/lib/components/WeekTypeSelector.svelte` - Now uses CustomDropdown
- **CustomDropdown Features:**
  - Consistent styling across all dropdowns
  - Full control over hover and pressed states
  - Chevron icon always visible (SVG, not background-image)
  - Proper accessibility with ARIA attributes
  - Options with hover (blue background, white text) and pressed states
- **Styling Applied:**
  - **Button hover:** Light gray background (`--tt-background-card-hover`)
  - **Button pressed:** Darker gray background (`--tt-background-card-pressed`)
  - **Option hover:** Blue background (`--tt-brand-primary`), white text
  - **Option pressed:** Darker blue background, white text
  - **Selected option:** Light blue background (`--tt-brand-primary-faded`), blue text
- **Result:** Tagesart and Wochenart dropdowns now have unified styling matching the EmployerSelector, with proper hover and pressed states for both the button and options

### 32. Vorschläge Grouped by Employer
- **Issue:** On Add page, when "Alle Arbeitgeber" is selected, Vorschläge (suggestions) are mixed from different employers, causing confusion
- **Root Cause:** Top categories were displayed in a flat list without employer context
- **Fix:** Group Vorschläge by employer when "Alle Arbeitgeber" is selected
- **Files:** `src/lib/components/CategoryList.svelte:42-80, 167-201, 314-322`
- **Changes:**
  - Added `groupedTopCategories` derived state that groups top categories by employer
  - Modified template to show separate sections: "Vorschläge [Employer Name]" for each employer
  - Added `.suggestion-group` CSS class for proper spacing between groups
  - When specific employer is selected, shows single "Vorschläge" section (unchanged behavior)
- **Display:**
  - **"Alle Arbeitgeber" selected:** Shows "Vorschläge Employer1", "Vorschläge Employer2", etc.
  - **Specific employer selected:** Shows single "Vorschläge" section (existing behavior)
- **Result:** Vorschläge are now clearly organized by employer when viewing all employers, making it easy to identify which suggestions belong to which employer

## Status: DONE

**Note:** Manual verification recommended to confirm:
1. Summary rows show "Zusammenfassung" label inside single row (no nested border)
2. Ist/Soll/Haben values aligned to the right
3. Time entry rows show employer labels on the right side (next to action buttons)
4. Settings page "Exportieren" and "Stundenzettel" buttons show primary blue styling
5. All fonts unified across settings page (no Arial/mixed fonts)
6. Analysis page Zeitraum selector displays in full-row format like Tagesart
7. Day/Week/Month date selector buttons have visible border (clickable without hover)
8. Stundenzettel export dialog has radio buttons for format selection and single Export button
9. Import page has employer dropdown to select which employer to import entries for
10. Footer bar has rounded upper corners matching header's rounded lower corners
11. Settings page delete buttons (Arbeitsgeber, Arbeitszeitmodelle, Abwesenheit, Tätigkeiten) are right-aligned
12. Imported time entries include employerId property and show correct expected hours in Auswertung
13. Week page Wochenart row has border like Zusammenfassung, dropdown has light background fill without border
14. Employer selection in header persists across page reloads
15. All dropdowns have chevron icon on the right (universal standard), UI design rule added
16. Time values (Ist/Soll/Saldo) right-aligned in day/week rows across Week and Month pages
17. Comprehensive hover effect system with progressive states (normal → hover → selected → pressed) for all interactive elements
18. Analysis page: Time values right-aligned in Zeiten section, Zeitraum button right-aligned with auto-width
19. Missing hover/pressed states fixed: Month title, sync/profile icons (with borders), employer dropdown, Vor/Zurück buttons
20. Analysis page Einträge section: Average hours (Ø/Woche) now emphasized over total hours (Gesamt)
21. Day and Week page date selector buttons now have pressed/active state (matching Month page)
22. Running task bar: End button and Delete button now have complete hover/pressed states
23. Add page Vorschläge chips now have proper padding (fixed missing --tt-space-6 variable)
24. Dialog buttons and profile menu items now have complete hover/pressed states
25. Style guide page background and width now match app layout (600px, light blue-gray background)
26. Delete buttons globally fixed: very subtle hover state (3% opacity), distinct pressed state
27. Profile menu hover intensities now consistent: Einstellungen and Abmelden have similar, subtle hover states
28. Native select dropdown chevron fixed (stays visible on hover/press), option styling added (limited browser support)
29. Empty state button underline removed (Day page "Füge eine Tätigkeit hinzu" button)
30. App layout width and background unified: title bar, content, and footer all 600px max-width with proper background colors
31. Dropdown unification: Created CustomDropdown component, converted Tagesart and Wochenart to use it with proper hover/pressed states
32. Vorschläge grouped by employer: When "Alle Arbeitgeber" selected, shows "Vorschläge [Employer Name]" sections
33. All employer dropdowns unified: Converted all native select dropdowns to CustomDropdown across all dialogs and pages
34. Settings page Tätigkeiten menu: Added hover/pressed states matching profile menu styling

<!-- Update to: DONE → VERIFIED → COMMITTED -->

**Note on Dropdown Unification:** The Tagesart dropdown uses native `<select>` which has severe styling limitations (especially for options). The Employer dropdown uses a custom component (`EmployerSelector.svelte`) with full styling control. For truly unified dropdown behavior, all dropdowns should be converted to custom components in future refactoring.
