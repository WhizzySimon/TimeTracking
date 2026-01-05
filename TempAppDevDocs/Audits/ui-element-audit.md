# UI Element Audit

**Purpose:** Inventory all UI elements, their current styling approach, and recommendations for design system alignment.

**Audit Date:** 2026-01-05

---

## Page: Day (`src/routes/day/+page.svelte`)

### Page-Level Elements

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.day-page` | Container | Local CSS | — | ✓ OK | Page-specific layout, no class needed |
| `.loading` | Loading state | Local CSS | — | ✓ OK | Simple one-off, uses tokens |

### Date Navigation Section

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.date-nav` | Container | Local CSS | — | ✓ OK | Page-specific layout |
| `.nav-btn` | Button | Local CSS + `.tt-interactive-card` | `.tt-interactive-card` | ⚠️ Partial | Has local border/sizing, hover via class |
| `.nav-btn-prev` | Button variant | (same as nav-btn) | — | — | Left nav button |
| `.nav-btn-next` | Button variant | (same as nav-btn) | — | — | Right nav button |
| `.nav-chevron` | Icon | Local CSS | — | ✓ OK | Simple sizing |
| `.nav-label` | Text | Local CSS | — | ✓ OK | Simple styling |
| `.date-title` | Button | Local CSS + `.tt-date-selector-button` + `.tt-interactive-card` | `.tt-date-selector-button`, `.tt-interactive-card` | ⚠️ Check | Uses 2 classes, local CSS adds border/sizing |
| `.title-prefix` | Text | Local CSS | — | ✓ OK | "Heute" label |
| `.title-date` | Text | Local CSS | — | ✓ OK | Date display |

### Components Used

| Component | Location | Elements Inside | Design System Usage |
|-----------|----------|-----------------|---------------------|
| `<DayTypeSelector>` | `src/lib/components/DayTypeSelector.svelte` | `.tt-labeled-dropdown`, `<CustomDropdown>` | ✓ Uses design system classes |
| `<InlineSummary>` | `src/lib/components/InlineSummary.svelte` | `.tt-summary-display`, `.tt-summary-display__*` | ✓ Uses design system classes |
| `<TaskList>` | `src/lib/components/TaskList.svelte` | Container, empty state, `<TaskItem>` | ✓ Mostly OK |
| `<AddTaskModal>` | `src/lib/components/AddTaskModal.svelte` | Modal dialog | (needs audit) |
| `<ConfirmDialog>` | `src/lib/components/ConfirmDialog.svelte` | Dialog | (needs audit) |
| `<DayPicker>` | `src/lib/components/DayPicker.svelte` | Calendar picker | (needs audit) |

### TaskList Component (`src/lib/components/TaskList.svelte`)

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.task-list` | Container | Local CSS | — | ✓ OK | Simple flex layout |
| `.empty-state` | Container | Local CSS | — | ✓ OK | Centered layout |
| `.empty-text` | Text | Local CSS | — | ✓ OK | Uses tokens |
| `.empty-state-button` | Link/Button | `.tt-button-primary` | `.tt-button-primary` | ✓ OK | Design system class |

### TaskItem Component (`src/lib/components/TaskItem.svelte`)

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| Row (normal) | Clickable row | `.tt-list-row-clickable` | `.tt-list-row-clickable` | ✓ OK | Design system class |
| Row (running) | Clickable row | `.tt-list-row-clickable` + `.tt-interactive-accent` + `.task-item-running` | `.tt-interactive-accent` | ✓ OK | Accent hover, local border override |
| `.tt-list-row__content-compact` | Container | Design system | `.tt-list-row__content-compact` | ✓ OK | — |
| `.tt-list-row__time` | Text | Design system | `.tt-list-row__time` | ✓ OK | — |
| `.tt-list-row__separator` | Decorator | Design system | `.tt-list-row__separator` | ✓ OK | — |
| `.tt-list-row__category` | Text | Design system | `.tt-list-row__category` | ✓ OK | — |
| `.tt-list-row__detail` | Text | Design system | `.tt-list-row__detail` | ✓ OK | — |
| `.employer-label-container` | Container | Local CSS | — | ✓ OK | Simple positioning |
| `.tt-inline-label-employer` | Label/Chip | Design system | `.tt-inline-label-employer` | ✓ OK | — |
| `.tt-inline-label-no-work` | Label/Chip | Design system | `.tt-inline-label-no-work` | ✓ OK | — |
| `.tt-list-row__actions` | Container | Design system | `.tt-list-row__actions` | ✓ OK | — |
| Beenden button | Button | `.tt-button-primary` + `.tt-button-small` | `.tt-button-primary`, `.tt-button-small` | ✓ OK | — |
| Resume button | Icon button | `.tt-symbol-button` | `.tt-symbol-button` | ⚠️ Check | Needs hover audit |
| Delete button | Icon button | `.tt-delete-button` | `.tt-delete-button` | ⚠️ Check | Needs hover audit |

### InlineSummary Component (`src/lib/components/InlineSummary.svelte`)

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.tt-summary-display` | Container | Design system | `.tt-summary-display` | ✓ OK | — |
| `.summary-label` | Text | Local CSS | — | ⚠️ Consider | Could be `.tt-summary-display__label` |
| `.tt-summary-display__item` | Container | Design system | `.tt-summary-display__item` | ✓ OK | — |
| `.tt-summary-display__label` | Text | Design system | `.tt-summary-display__label` | ✓ OK | — |
| `.tt-summary-display__value` | Text | Design system | `.tt-summary-display__value` | ✓ OK | — |
| `.tt-summary-display__value-positive` | Modifier | Design system | `.tt-summary-display__value-positive` | ✓ OK | — |
| `.tt-summary-display__value-negative` | Modifier | Design system | `.tt-summary-display__value-negative` | ✓ OK | — |

### DayTypeSelector Component (`src/lib/components/DayTypeSelector.svelte`)

| Element | Type | Current Styling | Design System Class | Status | Notes |
|---------|------|-----------------|---------------------|--------|-------|
| `.tt-labeled-dropdown` | Container | Design system | `.tt-labeled-dropdown` | ✓ OK | — |
| `.tt-labeled-dropdown__label` | Text | Design system | `.tt-labeled-dropdown__label` | ✓ OK | — |
| `<CustomDropdown>` | Component | — | — | ✓ OK | Separate component |

---

## Summary: Day Page

### What's Working Well ✓
- **TaskItem** uses design system classes extensively (`.tt-list-row-*`)
- **InlineSummary** uses design system classes (`.tt-summary-display*`)
- **DayTypeSelector** uses design system classes (`.tt-labeled-dropdown`)
- **Buttons** use `.tt-button-primary`, `.tt-button-small`
- **Hover states** on nav buttons and date title use `.tt-interactive-card`

### Issues Found ⚠️

| Issue | Element | Current | Recommendation |
|-------|---------|---------|----------------|
| 1 | `.nav-btn` | Local CSS + class | Consider `.tt-nav-button` class if pattern repeats in Week/Month |
| 2 | `.date-title` | Local CSS + 2 classes | Verify `.tt-date-selector-button` exists and is complete |
| 3 | `.tt-symbol-button` | Unknown hover | Audit hover state |
| 4 | `.tt-delete-button` | Unknown hover | Audit hover state (should use `.tt-interactive-danger`) |
| 5 | `.summary-label` | Local CSS | Could be part of `.tt-summary-display` pattern |

### Cross-Page Pattern Candidates

| Pattern | Description | Appears In | Action |
|---------|-------------|------------|--------|
| Nav button (prev/next) | Arrow + weekday label | Day, Week, Month | Create `.tt-nav-button` if identical |
| Date selector button | Clickable date title | Day, Week, Month | Verify `.tt-date-selector-button` |
| Task row | Time + category + actions | Day, Week, Month | ✓ Already `.tt-list-row-clickable` |
| Summary display | Ist/Soll/Saldo | Day, Week | ✓ Already `.tt-summary-display` |

---

## Next Steps

1. **Confirm this format works** before continuing with other pages
2. **Audit Week and Month pages** to identify shared patterns with Day
3. **Audit remaining pages** (Add, Analysis, Settings)
4. **Audit all components** in `src/lib/components/`
5. **Create final recommendations** for new classes and refactoring

