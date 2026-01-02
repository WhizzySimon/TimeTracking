# css-v2-migration - Plan

**Phase:** CSS-v2  
**Created:** 2026-01-02  
**Last Updated:** 2026-01-02  
**Based on Spec:** `TempAppDevDocs/Features/Specs/css-v2-migration.md`

---

## Architecture / modules

### CSS System Structure

```
src/lib/styles/
├── tt-design-system-v2.css   # Single source of truth for component styles
├── theme.css                 # Legacy (to be deprecated, cool theme only)
└── app.css                   # Global app styles, imports both
```

### Migration Pattern Per Component

1. **Identify** current styling (component `<style>` block + theme.css classes)
2. **Map** to tt-\* class equivalents (use COMPONENT-MAPPING-CSS.md)
3. **Replace** class names in template
4. **Remove** component-scoped CSS that is now in design system
5. **Keep** layout CSS (flex, grid, positioning) in component
6. **Verify** visual parity

### Pages to Migrate (in order)

| Priority | Page     | Components                                |
| -------- | -------- | ----------------------------------------- |
| 1        | Day      | TimeEntryRow, SummaryDisplay, ActionTitle |
| 2        | Week     | DayRow, SummaryDisplay, ActionTitle       |
| 3        | Month    | WeekRow, SummaryDisplay, ActionTitle      |
| 4        | Add      | Chips, CategorySelect, SuggestionRow      |
| 5        | Settings | SettingsRow, CategoryList, EmployerList   |
| 6        | Analysis | ExpandableSection, TimeList, SummaryRow   |
| 7        | Layout   | Header, TabNavigation, EmployerSelector   |

## Data model

- No data model changes — CSS only

## UI state model

- No state changes — styling only
- Existing state (isActive, isSelected, etc.) maps to CSS class modifiers

## Error handling

- Visual regression = bug — compare screenshots before/after
- If component breaks, revert that component only
- Keep migration atomic per page

## Testing strategy

### Manual Testing (Primary)

- Before/after screenshot comparison per page
- Interactive state testing (click, focus, press)
- Mobile viewport testing (375px, 414px)

### Automated Testing

- Existing E2E tests should pass without changes
- Add visual snapshot tests if time permits (optional)

### Verification Per Task

```bash
npm run check      # TypeScript + Svelte check
npm run format     # Prettier
# Manual: Open page in browser, verify visuals
```

## Risks / constraints

| Risk                          | Mitigation                                  |
| ----------------------------- | ------------------------------------------- |
| Visual regression             | Screenshot comparison before/after          |
| Breaking existing tests       | Run E2E after each page migration           |
| CSS specificity conflicts     | Remove old classes completely, don't mix    |
| Missing hover states on touch | Design system is mobile-first, uses :active |
| Focus ring removal            | Audit each component for focus visibility   |

## Migration Order Rationale

1. **Day page first** — Most used, establishes patterns
2. **Week/Month next** — Similar structure to Day
3. **Add page** — Different component types (chips, inputs)
4. **Settings** — Complex with many sub-components
5. **Analysis** — Expandable sections, unique layout
6. **Layout last** — Header/Footer affect all pages, highest risk

## CSS Class Mapping Reference

| Old Pattern                   | New Class                |
| ----------------------------- | ------------------------ |
| `.time-entry`, `.entry-row`   | `.tt-list-row-clickable` |
| `.summary`, `.info-row`       | `.tt-list-row-static`    |
| `.btn`, `.button`             | `.tt-button-*`           |
| `.badge`, `.label`            | `.tt-inline-label-*`     |
| `.tab`, `.nav-item`           | `.tt-footer-tab`         |
| `.section-header`             | `.tt-section-title`      |
| `.icon-button`, `.action-btn` | `.tt-symbol-button`      |
| `.chip`, `.category-chip`     | `.tt-chip`               |
| `select`, `.select-dropdown`  | `.tt-dropdown`           |
| `input[type="text"]`          | `.tt-text-input`         |
