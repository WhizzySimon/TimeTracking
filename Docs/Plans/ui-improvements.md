# ui-improvements — Plan

**Phase:** A5  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/ui-improvements.md`

---

## Architecture / Modules

### New/Modified Files

- `src/lib/i18n/de.ts` — German translations (or inline in components)
- `src/lib/themes/schemes.ts` — Color scheme definitions
- `src/lib/themes/utils.ts` — Color calculation utilities
- `src/app.css` — CSS custom properties for theming

### Modified Components

- `LoginForm.svelte` — German error messages
- `SettingsPage.svelte` — Color scheme picker (5 options)
- All form components — German validation messages

---

## Data Model

### User Preferences

```typescript
interface UserPreferences {
  colorScheme: 'cool' | 'warm' | 'green' | 'purple' | 'neutral';
  // existing fields...
}
```

Stored in localStorage and synced to Supabase `user_profiles.preferences`.

---

## UI State Model

### Theme State

- `colorScheme` store — Current selected scheme
- Reactive CSS custom properties update on scheme change

### CSS Custom Properties

```css
:root {
  --color-primary: hsl(var(--scheme-hue), 70%, 50%);
  --color-primary-light: hsl(var(--scheme-hue), 70%, 90%);
  --color-primary-dark: hsl(var(--scheme-hue), 70%, 30%);
  /* etc. */
}
```

---

## Color Scheme Definitions

| Scheme | Base Hue | Primary | Description |
|--------|----------|---------|-------------|
| Cool | 210 | #3b82f6 | Blue (current) |
| Warm | 25 | #f97316 | Orange (current) |
| Green | 142 | #22c55e | Nature/Growth |
| Purple | 270 | #a855f7 | Creative/Premium |
| Neutral | 215 | #64748b | Professional/Minimal |

---

## Error Handling

| Error | Handling | User Feedback |
|-------|----------|---------------|
| Invalid scheme value | Default to 'cool' | No error |
| Scheme sync fails | Keep local preference | Subtle sync indicator |

---

## Testing Strategy

### Unit Tests

- Color calculation functions
- Contrast ratio validation

### E2E Tests

- German text visible on login error
- Scheme change applies colors
- Scheme persists after reload

### Manual Testing

- Contrast check with browser dev tools
- Visual review of all 5 schemes

---

## Risks / Constraints

- **Contrast:** Must maintain WCAG AA (4.5:1)
  - Mitigation: Validate all combinations, use HSL lightness
- **Consistency:** All components must use CSS variables
  - Mitigation: Audit for hardcoded colors

---

## Tasks

| # | Task | Estimate | Dependencies |
|---|------|----------|--------------|
| A5.1 | Audit all UI for English text | 1h | - |
| A5.2 | Translate login error messages | 1h | A5.1 |
| A5.3 | Translate form validation messages | 1h | A5.1 |
| A5.4 | Translate remaining UI text | 1h | A5.1 |
| A5.5 | Define color scheme constants (5 schemes) | 1h | - |
| A5.6 | Color calculation utilities (HSL variants) | 1h | A5.5 |
| A5.7 | CSS custom properties for theming | 1h | A5.5 |
| A5.8 | Color scheme picker in Settings | 1h | A5.7 |
| A5.9 | Persist scheme to localStorage | 0.5h | A5.8 |
| A5.10 | Sync scheme to Supabase for Pro | 1h | A5.9 |
| A5.11 | Contrast ratio validation | 1h | A5.6 |
| A5.12 | E2E tests | 1h | A5.1-A5.11 |

**Total estimate:** ~11.5 hours
