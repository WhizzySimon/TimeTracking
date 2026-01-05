# Phase 2 Visual Reference - Component Grouping & Screenshots

**Date:** 2026-01-05
**Purpose:** Visual baseline and component grouping for Phase 2 CSS optimization

## Screenshots Location
**Folder:** `TempAppDevDocs/QuickFixes/Phase2-Screenshots/`
- See README.md in that folder for screenshot organization
- 10 screenshots total (5 pages + 5 dialogs/settings)

## Screenshots Purpose
1. Document baseline visual state before Phase 1
2. Group similar components for Phase 2 optimization
3. Enable regression detection during refactoring
4. Guide base class extraction decisions

---

## General CSS Refactoring Rules

### Consistency Rules
- ✓ **Assume similar elements should have the same styling** - add same classes unless explicitly specified otherwise
- ✓ **All symbol buttons** - same styles for now, individualize later
- ✓ **All "Zusammenfassung" rows** - identical styling across all pages
- ✓ **All employer labels** - same styling regardless of page/row context

---

## Page Screenshots & Analysis

### 1. Add Page (Tätigkeit erstellen)
**Screenshot:** Image 1 - Add page with category list

**Visual Elements Identified:**

**Header:**
- Back/Forward navigation buttons (< >) - symbol buttons
- Employer dropdown "Kirche" - unique dropdown styles (noted)
- Sync button - symbol button
- Settings button - symbol button

**Content:**
- "VORSCHLÄGE" section header
- Chip buttons: "Gruppenvorbereitung", "Fahrt", "GD-/Predigtvorbereitung", "Religionsunterricht"
  - Note: "Chips unique, but same as small secondary button?"
- "Gruppen und Kreise" chip
- Search input "Filtern..."
- Primary action button "Tätigkeit erstellen"
- Category list rows: "Allg. Orga", "Andachten / Heimgottesdienste", etc.
  - Note: "Like other action rows, but simple content"

**Bottom Navigation:**
- Tab buttons: "+", "Tag", "Woche", "Monat", Analysis icon

**CSS Classes to Verify:**
- `.tt-header-nav-button` (< > buttons) - symbol buttons
- Employer dropdown - unique styles (keep as is)
- `.tt-button-primary` (Tätigkeit erstellen)
- Chip buttons - verify if using secondary button styles
- Category rows - action row pattern

---

### 2. Week Page (Woche)
**Screenshot:** Image 2 - Week view KW 1/2026

**Visual Elements Identified:**

**Header:**
- Back/Forward navigation (< >) - symbol buttons
- Employer dropdown "Kirche"
- Sync/Settings buttons - symbol buttons

**Week Navigation:**
- Previous week button (<) with week number "52"
- Week selector "KW 1/2026" - date selector button
- Next week button (>) with week number "2"

**Content:**
- "Wochenart" label with "Arbeitswoche" dropdown - custom dropdown
- **Zusammenfassung row** - Ist: 4,1 / Soll: 41,0 / Haben: -36,9
  - Background color, layout, typography
- Day rows: "Mo 29.12", "Di 30.12", etc.
  - Day label + "Arbeitstag" label
  - Hours display: "0,0 / 0,0 / +0,0"
  - Note: "like other action rows, but all have still wrong hover BG"
  - Note: "Lable needs lable styles and move to the right of the row"

**Bottom Navigation:**
- Same tab pattern as Add page

**CSS Classes to Verify:**
- `.tt-nav-button` (week navigation < >)
- `.tt-date-selector-button` (KW 1/2026)
- **Zusammenfassung** - verify consistent styling
- Day rows - action row pattern with hover state issue
- "Arbeitstag" label - needs label styles, right alignment

---

### 3. Analysis Page (Auswertung)
**Screenshot:** Image 3 - Analysis view 1.1.2024 – 15.3.2024

**Visual Elements Identified:**

**Header:**
- Standard header with navigation and employer dropdown

**Date Range:**
- Date range selector "1.1.2024 – 15.3.2024"

**Content:**
- **Zusammenfassung row** - Ist: 464,6 / Soll: 357,0 / Haben: +107,6
  - Same styling as Week/Month pages
- Collapsible section "▼ Zeiten"
  - Month rows: "Januar 2024", "Februar 2024", "März 2024"
  - Hours display pattern
- Collapsible section "▼ Einträge"
  - Column headers: "Gesamt", "Ø/Woche"
  - "Summe" row (highlighted)
  - Category rows: "Gruppenvorbereitung", "Konvente / Ephoralkonferenzen", etc.
  - Hours display in two columns

**CSS Classes to Verify:**
- **Zusammenfassung** - consistent across all pages
- Collapsible section toggles (▼)
- Month/category rows - action row pattern
- "Summe" row - highlighted/emphasized style
- Column headers - table header pattern

---

### 4. Month Page (Monat)
**Screenshot:** Image 4 - Month view Januar 2026

**Visual Elements Identified:**

**Header:**
- Standard header pattern

**Month Navigation:**
- Previous month button (<) with "Dez"
- Month selector "Aktueller Monat / Januar 2026" - date selector button
- Next month button (>) with "Feb"

**Content:**
- **Zusammenfassung row** - Ist: 2,8 / Soll: 23,0 / Haben: -20,2
  - Same styling as other pages
- Week rows: "KW 1", "KW 2", "KW 3", "KW 4", "KW 5"
  - Date range: "1.–4. (4 Tage)", "5.–11. (7 Tage)", etc.
  - Hours display: "2,8 / 23,0 / -20,3"

**CSS Classes to Verify:**
- `.tt-nav-button` (month navigation)
- `.tt-date-selector-button` (month selector)
- **Zusammenfassung** - consistent styling
- Week rows - action row pattern

---

### 5. Day Page (Tag)
**Screenshot:** Image 5 - Day view So 4.1.2026

**Visual Elements Identified:**

**Header:**
- Standard header pattern

**Day Navigation:**
- Previous day button (<) with "Mo"
- Date selector "So 4.1.2026" - date selector button
  - Note: "Similar in week and month page"
- Next day button (>) with "Mo"

**Content:**
- "Tagesart" label with "Arbeitstag" dropdown
  - Note: "Similar in week page"
  - Note: "like other custom dropdowns"
- **Zusammenfassung row** - Ist: 2,8 / Soll: 0,0 / Haben: +2,8
  - Note: "Same in week, month, analysis"
- Time entry rows:
  - "19:35 – 20:40" | "Bauberatung" | "Kirche" label | ▶ | 🗑️
    - Note: "default lable"
  - "18:05 – 19:25" | "Ausschuss sonstiges" | "Kirche" label | ▶ | 🗑️
    - Note: "like other action rows"
  - "17:40 – 18:00" | "GD-/Predigtvorbereitung" | "Kirche" label | ▶ | 🗑️

**CSS Classes to Verify:**
- `.tt-nav-button` (day navigation)
- `.tt-date-selector-button` (date selector)
- Custom dropdown (Arbeitstag) - same as Week page
- **Zusammenfassung** - consistent styling
- Time entry rows - action row pattern
- "Kirche" employer label - default label style, consistent across all pages
- Symbol buttons (▶ play, 🗑️ delete)

---

## Component Groups for Phase 2 Optimization

### Group 1: Navigation Patterns (CONSISTENT)
**Components:** Day, Week, Month pages
**Shared Elements:**
- Previous/Next navigation buttons (< >)
- Date/Week/Month selector buttons
- Navigation labels (day names, week numbers, month names)

**Current Classes:**
- `.tt-nav-button` ✓
- `.tt-nav-button__chevron` ✓
- `.tt-nav-button__label` ✓
- `.tt-date-selector-button` ✓
- `.tt-date-selector-button__prefix` ✓
- `.tt-date-selector-button__date` ✓

**Phase 2 Action:** Verify these share base styles, extract common properties

---

### Group 2: Zusammenfassung Rows (MUST BE IDENTICAL)
**Pages:** Day, Week, Month, Analysis
**Rule:** All "Zusammenfassung" rows must have identical styling

**Visual Properties:**
- Background color (light purple/lavender)
- Padding/spacing
- Typography (labels and values)
- Border/shadow
- Layout (flex, alignment)

**Current Classes:**
- Varies by page - needs consolidation

**Phase 2 Action:** 
- Create single `.tt-summary-row` base class
- Ensure identical across all pages
- Extract shared background, padding, typography

---

### Group 3: Employer Labels (MUST BE IDENTICAL)
**Context:** Appears in Day page time entries, other action rows
**Rule:** All employer labels same styling regardless of page/row

**Visual Properties:**
- "Kirche" label style (noted as "default lable")
- Background color
- Text color
- Padding
- Border-radius
- Font size

**Current Classes:**
- Needs verification

**Phase 2 Action:**
- Create `.tt-employer-label` class
- Ensure consistent across all contexts
- Extract shared visual properties

---

### Group 4: Action Rows (SIMILAR PATTERN)
**Context:** Category list (Add), Day rows (Week), Time entries (Day), Month rows (Analysis)
**Note:** "Like other action rows, but simple content"
**Issue:** "all have still wrong hover BG" (Week page day rows)

**Visual Properties:**
- Row background
- Hover state background (needs fix)
- Padding/spacing
- Border/shadow
- Typography
- Layout pattern

**Current Classes:**
- Varies - needs consolidation

**Phase 2 Action:**
- Create `.tt-action-row` base class
- Fix hover state background
- Extract shared layout and visual properties
- Allow content variations

---

### Group 5: Custom Dropdowns (UNIQUE BUT CONSISTENT)
**Context:** Employer dropdown (header), Wochenart/Tagesart dropdowns
**Note:** "unique dropdown styles", "like other custom dropdowns"

**Visual Properties:**
- Dropdown button style
- Dropdown menu style
- Selected state
- Hover/focus states

**Current Classes:**
- Needs verification

**Phase 2 Action:**
- Verify if `.tt-dropdown` exists and is used
- Ensure consistency across all custom dropdowns
- Extract shared properties

---

### Group 6: Symbol Buttons (MUST BE IDENTICAL)
**Context:** Header (< > ⟳ ⚙), Time entries (▶ 🗑️), Bottom nav
**Rule:** "Give all symbol buttons the same styles for now, lets individualize later"

**Visual Properties:**
- Size (44x44 touch target)
- Padding
- Border
- Background
- Icon size
- Hover/active states

**Current Classes:**
- `.tt-header-nav-button` (header < >)
- `.tt-symbol-button` (settings, close)
- Needs consolidation

**Phase 2 Action:**
- Create single `.tt-symbol-button` base class
- Apply to all symbol buttons (header, actions, nav)
- Extract shared size, padding, states
- Ensure 44x44 touch target

---

### Group 7: Chip Buttons vs Secondary Buttons
**Context:** Add page "VORSCHLÄGE" section
**Note:** "Chips unique, but same as small secondary button?"

**Visual Properties:**
- Padding (smaller than regular buttons)
- Border
- Background
- Typography
- Hover state

**Current Classes:**
- Needs verification

**Phase 2 Action:**
- Determine if chips should use `.tt-button-secondary` with size modifier
- Or create separate `.tt-chip-button` class
- Ensure consistency with design system

---

## Known Issues to Fix in Phase 2

### Issue 1: Week Page Day Row Hover State
**Screenshot:** Image 2
**Note:** "like other action rows, but all have still wrong hover BG"
**Fix:** Correct hover background color for day rows

### Issue 2: Week Page Label Positioning
**Screenshot:** Image 2
**Note:** "Lable needs lable styles and move to the right of the row"
**Fix:** 
- Apply label styles to "Arbeitstag" labels
- Position to right side of row

---

## Regression Checkpoints

After Phase 2 refactoring, verify these elements remain visually identical:

- [ ] **Zusammenfassung rows** - identical across Day, Week, Month, Analysis
- [ ] **Employer labels** - identical across all pages/contexts
- [ ] **Symbol buttons** - identical across header, actions, navigation
- [ ] **Navigation buttons** - consistent across Day, Week, Month
- [ ] **Action rows** - consistent pattern with correct hover states
- [ ] **Custom dropdowns** - consistent across all instances
- [ ] **Bottom navigation tabs** - identical across all pages

---

---

## Dialog & Modal Screenshots & Analysis

### 6. Settings Page - Expanded Sections
**Screenshot:** Image 1 - Settings with Tätigkeiten section expanded

**Visual Elements Identified:**

**Header:**
- Standard header with navigation and employer dropdown

**Content:**
- Collapsible section "▶ Tätigkeiten" with menu button (⋮)
- "Zeitdaten" section header
- Primary action buttons:
  - "Exportieren"
  - "Stundenzettel"
  - "Importieren"
- Secondary action button: "Excel-Datei importieren"
- Danger button: "Zeitdaten löschen" (red text)
- Version info: "Version v1.0.0-228-g28a8bd5"
- Collapsible section "▼ Entwicklung"
- "Farbschema" dropdown with "Original (#374CA7)"
- Color preview buttons: "Primary #374CA7", "Secondary #37BDF6"
- Action button: "Cache leeren & neu laden"
- Danger button: "Konto löschen" (red background)

**CSS Classes to Verify:**
- `.tt-button-primary` (Exportieren, Stundenzettel, Importieren)
- `.tt-button-secondary` (Excel-Datei importieren)
- Danger button styles (red text vs red background)
- Collapsible section toggles
- Color preview buttons (unique)

---

### 7. AddWorkTimeModelModal Dialog
**Screenshot:** Image 2 - Neues Arbeitszeitmodell

**Visual Elements Identified:**

**Dialog Structure:**
- Modal title "Neues Arbeitszeitmodell" with close button (×)
- Form layout with vertical spacing

**Form Fields:**
- "Name:" label with text input "z.B. Vollzeit 40h"
- "Gültig ab:" label with text input "5.1.2026"
- "Arbeitgeber:" label with custom dropdown "Kirche"
  - Note: "Default custom dropdown"
- Summary display: "Wochenstunden: 40.0h | Arbeitstage: 5"
  - Light blue background

**Weekday Grid:**
- Section header "Wochentage"
- Table headers: "Tag", "Arbeitstag", "Stunden"
- Rows: Mo, Di, Mi, Do, Fr (checked), Sa, So (unchecked)
- Hour inputs: "8" for workdays, "0" for non-workdays
  - Note: "input much more narrow"

**Dialog Actions:**
- "Abbrechen" button (secondary)
- "Speichern" button (primary)

**Important Note:**
- "For all dialogs: no horizontal scrollbar and no overflow"

**CSS Classes to Verify:**
- `.tt-form-field` ✓
- `.tt-form-field__label` ✓
- `.tt-text-input` ✓
- Custom dropdown (default style)
- Summary display (light blue background)
- Weekday grid (unique layout)
- Hour inputs (narrow width)
- `.tt-form-actions` ✓
- `.tt-button-secondary` ✓
- `.tt-button-primary` ✓

**Phase 2 Action:**
- Verify no horizontal overflow in all dialogs
- Ensure hour inputs have appropriate narrow width
- Summary display may need extraction if used elsewhere

---

### 8. Plan Selection Dialog (Paywall)
**Screenshot:** Image 3 - Plan wählen

**Visual Elements Identified:**

**Dialog Structure:**
- Modal title "Plan wählen" with close button (×)
- Three-column card layout

**Plan Cards:**
1. **Free Plan:**
   - Title "Free"
   - Price "0 €"
   - Feature list with checkmarks (✓) and dashes (—)
   - Button "Free wählen" (primary)

2. **Pro Plan (Current):**
   - Title "Pro" with badge "Aktuell"
   - Price "4,99 € / Monat"
   - Feature list with checkmarks (✓) and dashes (—)
   - Border highlight (selected state)

3. **Premium Plan:**
   - Title "Premium" with badge "Kommt bald"
   - Price "Kommt bald"
   - Feature list (grayed out)
   - No button (disabled state)

**Dialog Actions:**
- "Schließen" button (bottom right, secondary)

**Visual Properties:**
- Card borders
- Badge styles ("Aktuell", "Kommt bald")
- Selected card highlight
- Disabled/grayed state
- Feature list typography
- Checkmark/dash icons

**CSS Classes to Verify:**
- Card container styles
- Badge styles (may need extraction)
- Selected state styling
- Disabled state styling
- Feature list layout

**Phase 2 Action:**
- Badge styles may be reusable (extract if used elsewhere)
- Card layout is unique to paywall (keep local)

---

### 9. Settings Page - Account Section
**Screenshot:** Image 4 - Einstellungen (Konto section)

**Visual Elements Identified:**

**Header:**
- Page title "Einstellungen"

**Konto Section:**
- "Abmelden" button (top right, with icon)
- Info rows:
  - "Name" | "Simon Whizzy" | edit icon (✏️)
  - "E-Mail" | "whizzysimon@gmail.com" | edit icon (✏️)
  - "Plan" | "Pro" (blue text) | edit icon (✏️)

**Collapsible Sections:**
- "▶ Arbeitgeber" with add button (+)
- "▶ Arbeitszeitmodelle" with add button (+)
- "▶ Abwesenheit" with add button (+)
- "▶ Tätigkeiten" with menu button (⋮)

**Zeitdaten Section:**
- Same as Image 1

**CSS Classes to Verify:**
- Info row layout (label | value | icon)
- Edit icon buttons (symbol buttons)
- "Pro" text styling (brand color)
- Section headers with action buttons
- Add buttons (+) - symbol buttons

---

### 10. Settings Page - Expanded Sections Detail
**Screenshot:** Image 5 - Settings with multiple sections expanded

**Visual Elements Identified:**

**Arbeitgeber Section (Expanded):**
- Row: "Kirche" with delete icon (🗑️)

**Arbeitszeitmodelle Section (Expanded):**
- Row: "Vollzeit 41h" with metadata "41h/Woche • 6 Tage • ab 2024-01-01" and delete icon
  - Note: Arrow pointing to "41h/Woche" (metadata styling)

**Abwesenheit Section (Expanded):**
- Rows with labels:
  - "Feiertag" | "Keine Arbeitszeit" badge | delete icon
    - Note: Arrow pointing to badge (label styling)
  - "Joggen" | "Keine Arbeitszeit" badge | red line | delete icon
    - Note: Red line indicates some state/issue
  - "Krank" | "Keine Arbeitszeit" badge | red line
  - "Pause" | "Keine Arbeitszeit" badge
  - "Urlaub" | "Keine Arbeitszeit" badge

**Tätigkeiten Section (Expanded):**
- Category rows:
  - "Allg. Orga" | "Kirche" label | delete icon
  - "Andachten / Heimgottesdienste" | "Kirche" label | delete icon
  - "Andachtenvorbereitung" | "Kirche" label | delete icon

**CSS Classes to Verify:**
- Row layout with delete icons
- Metadata text styling (smaller, muted)
- "Keine Arbeitszeit" badge (label style)
- "Kirche" employer label (consistent with Day page)
- Red line/indicator (state visualization)
- Delete icon (symbol button)

**Phase 2 Action:**
- "Keine Arbeitszeit" badge should use label styles
- Employer labels must be identical to Day page
- Metadata styling may be reusable

---

## Updated Component Groups

### Group 8: Dialog/Modal Structure (CONSISTENT)
**Components:** AddWorkTimeModelModal, Plan Selection, Category/Employer dialogs
**Rule:** "For all dialogs: no horizontal scrollbar and no overflow"

**Shared Elements:**
- Modal backdrop
- Modal container (max-width, padding)
- Modal header (title + close button)
- Modal body (content area)
- Modal footer (action buttons)

**Current Classes:**
- `Modal` component handles structure ✓
- `.tt-symbol-button` (close button) ✓
- `.tt-form-actions` (footer buttons) ✓

**Phase 2 Action:**
- Verify Modal component prevents horizontal overflow
- Ensure consistent max-width across all dialogs
- Extract shared padding/spacing

---

### Group 9: Badges & Labels (MUST BE CONSISTENT)
**Context:** Plan badges ("Aktuell", "Kommt bald"), Absence labels ("Keine Arbeitszeit"), Employer labels ("Kirche")

**Types Identified:**
1. **Status badges** - "Aktuell", "Kommt bald" (Plan dialog)
2. **Absence labels** - "Keine Arbeitszeit" (Settings)
3. **Employer labels** - "Kirche" (Day page, Settings, everywhere)

**Visual Properties:**
- Background color
- Text color
- Padding
- Border-radius
- Font size

**Current Classes:**
- Employer labels need `.tt-employer-label` (must be identical everywhere)
- Absence labels may share same style
- Status badges may be unique to paywall

**Phase 2 Action:**
- Create `.tt-label` base class
- Create `.tt-label--employer`, `.tt-label--absence`, `.tt-label--status` variants
- Ensure employer labels identical across all contexts

---

### Group 10: Info/Settings Rows (SIMILAR PATTERN)
**Context:** Settings page account info, expanded section rows

**Visual Properties:**
- Row layout (label | value | action)
- Padding/spacing
- Border/divider
- Hover state
- Typography

**Current Classes:**
- Similar to action rows but different context

**Phase 2 Action:**
- Determine if can share base with action rows
- Or create separate `.tt-info-row` class
- Extract shared layout properties

---

### Group 11: Form Input Widths (NEEDS STANDARDIZATION)
**Context:** AddWorkTimeModelModal hour inputs
**Note:** "input much more narrow"

**Issue:** Hour inputs need specific narrow width

**Phase 2 Action:**
- Create input width modifiers or utilities
- `.tt-text-input--narrow` for hour inputs
- `.tt-text-input--medium` for dates
- `.tt-text-input--full` (default)

---

### Group 12: Metadata/Secondary Text (REUSABLE)
**Context:** Work time model metadata "41h/Woche • 6 Tage • ab 2024-01-01"

**Visual Properties:**
- Smaller font size
- Muted color
- Spacing between items (•)

**Phase 2 Action:**
- Create `.tt-metadata` or `.tt-text-muted` class
- Extract font size and color
- May be reusable across app

---

## Updated Known Issues

### Issue 3: Dialog Overflow Prevention
**Screenshot:** Image 2
**Note:** "For all dialogs: no horizontal scrollbar and no overflow"
**Fix:** Ensure Modal component and all dialog content prevents horizontal overflow

### Issue 4: Input Width Standardization
**Screenshot:** Image 2
**Note:** "input much more narrow" for hour inputs
**Fix:** Create input width variants (narrow, medium, full)

### Issue 5: Red Line Indicator
**Screenshot:** Image 5
**Note:** Red line appears on some absence rows (Joggen, Krank)
**Investigation:** Determine what this indicates and ensure consistent styling

---

## Updated Regression Checkpoints

After Phase 2 refactoring, verify these elements remain visually identical:

- [ ] **Zusammenfassung rows** - identical across Day, Week, Month, Analysis
- [ ] **Employer labels** - identical across Day, Settings, all contexts
- [ ] **Symbol buttons** - identical across header, dialogs, actions, navigation
- [ ] **Navigation buttons** - consistent across Day, Week, Month
- [ ] **Action rows** - consistent pattern with correct hover states
- [ ] **Custom dropdowns** - consistent across all instances
- [ ] **Bottom navigation tabs** - identical across all pages
- [ ] **Dialog structure** - no horizontal overflow, consistent padding
- [ ] **Form fields** - consistent across all dialogs
- [ ] **Badges/labels** - consistent styling by type
- [ ] **Info rows** - consistent layout in Settings
- [ ] **Metadata text** - consistent muted styling

---

**Status:** COMPLETE - All screenshots analyzed, component groups identified
