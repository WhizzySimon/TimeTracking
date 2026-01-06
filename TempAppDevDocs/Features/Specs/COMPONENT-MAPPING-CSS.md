# Component Mapping: Excel → CSS Design System

This document maps the component names from the Excel specification to their CSS class equivalents.

---

## Buttons

| Excel Name          | CSS Class              | Where Used                                                                            |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| **PrimaryButton**   | `.tt-button-primary`   | Add: Vorgeschlagene Einträge, Update verfügbar, App installieren, Tätigkeit erstellen |
| **SecondaryButton** | `.tt-button-secondary` | Dialogs: Confirmative action, Cancel, close                                           |
| **DangerButton**    | `.tt-button-danger`    | Settings: Zeitdaten löschen, Konto löschen                                            |

---

## Rows

| Excel Name      | CSS Class                                      | Where Used                                                                | Clickable            |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------- | -------------------- |
| **ActionRow**   | `.tt-list-row-clickable`                       | Add: Start Eintrag; Day: Einträge                                         | ✓ Yes                |
| **ActionTitle** | `.tt-action-title` (NEW)                       | Day: Ausgewählter Tag; Week: Ausgewählte Woche; Month: Ausgewählter Monat | ✓ Yes (opens picker) |
| **InfoRow**     | `.tt-list-row-static` or `.tt-summary-display` | Day/Week/Month/Analysis: SummaryIstSollHaben; Settings: Summe (Einträge)  | ✗ No                 |

---

## Navigation

| Excel Name       | CSS Class                 | Where Used                             |
| ---------------- | ------------------------- | -------------------------------------- |
| **NavBar**       | `.tt-navbar` (NEW)        | All: Titlebar, FootBar                 |
| **NavButton**    | `.tt-nav-button` (NEW)    | All: Plus, Tag, Week, Month, Sync tabs |
| **NavDirection** | `.tt-nav-direction` (NEW) | All: Vor/Zurück; Day: Gestern, morgen  |

---

## Form Elements

| Excel Name    | CSS Class              | Where Used                                                         |
| ------------- | ---------------------- | ------------------------------------------------------------------ |
| **Dropdown**  | `.tt-dropdown` (NEW)   | All: Arbeitgeber; Day: Tagesart-Dropdown; Week: Wochenart-Dropdown |
| **TextInput** | `.tt-text-input` (NEW) | Add: Filter Einträge                                               |

---

## Sections

| Excel Name                   | CSS Class                            | Where Used                                                                                      |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Section-title**            | `.tt-section-title` (NEW)            | Add: Vorschläge; Settings: Konto, Erscheinungsbild, Daten                                       |
| **Section-title-expandable** | `.tt-section-title-expandable` (NEW) | Analysis: Zeiten, Einträge; Settings: Arbeitgeber, Arbeitszeitmodelle, Abwesenheit, Tätigkeiten |

---

## Labels/Badges

| Excel Name | CSS Class                   | Where Used                     |
| ---------- | --------------------------- | ------------------------------ |
| **Flag**   | `.tt-inline-label-employer` | Day: Arbeitgeber in Eintrag    |
| **Label**  | `.tt-inline-label-neutral`  | Day: Tagesart; Week: Wochenart |

---

## Icons/Symbols

| Excel Name        | CSS Class                                 | Where Used                                                       |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| **ActionSymbols** | `.tt-action-button` + `.tt-delete-button` | All: Profile + Sync in TitleBar; Day: Resume + Delete in Eintrag |

---

## Dialogs (Structural Components)

| Excel Name                | Trigger Component                   | Notes                                          |
| ------------------------- | ----------------------------------- | ---------------------------------------------- |
| **Day-Picker**            | `.tt-action-title`                  | Opens from ActionTitle on Day/Week pages       |
| **Week-Picker**           | `.tt-action-title`                  | Opens from ActionTitle on Week page            |
| **Month-Picker**          | `.tt-action-title`                  | Opens from ActionTitle on Month/Analysis pages |
| **TimeRange-Picker**      | `.tt-action-title`                  | Opens from ActionTitle on Analysis page        |
| **Add Arbeitgeber**       | Plus button in section title        | Settings                                       |
| **Add Arbeitszeitmodell** | Plus button in section title        | Settings                                       |
| **Add Abwesenheit**       | Plus button in section title        | Settings                                       |
| **Add Tätigkeit**         | Button "Tätigkeit erstellen" / Menu | Add page, Settings                             |

---

## Coverage Analysis

### ✅ Already Implemented in CSS v2

- PrimaryButton → `.tt-button-primary`
- SecondaryButton → `.tt-button-secondary`
- DangerButton → `.tt-button-danger`
- ActionRow → `.tt-list-row-clickable`
- InfoRow → `.tt-list-row-static`, `.tt-summary-display`
- Flag → `.tt-inline-label-employer`
- Label → `.tt-inline-label-neutral`
- ActionSymbols → `.tt-action-button`, `.tt-delete-button`, `.tt-play-icon`
- Selection chips → `.tt-chip`
- Selection rows → `.tt-selection-row`

### 🆕 Need to Add to CSS v2

- ActionTitle (clickable date header)
- NavBar (top/bottom navigation bar structure)
- NavButton (tab navigation buttons)
- NavDirection (forward/back arrows)
- Dropdown (styled select elements)
- TextInput (styled input fields)
- Section-title (section headers)
- Section-title-expandable (collapsible sections)

---

## Implementation Priority

1. **High** - ActionTitle (used on every main page)
2. **High** - Section-title (used in Add and Settings)
3. **Medium** - NavBar, NavButton, NavDirection (already styled in theme.css, may just need aliases)
4. **Medium** - Dropdown (already styled in theme.css)
5. **Low** - TextInput (standard styling sufficient)
6. **Low** - Section-title-expandable (enhancement)
