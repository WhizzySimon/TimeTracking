# css-v2-migration — Spec

**Phase:** CSS-v2  
**Created:** 2026-01-02  
**Last Updated:** 2026-01-02  
**Status:** Approved

**Depends on:**

- `TempAppDevDocs/Features/Specs/COMPONENT-MAPPING-CSS.md` (component mapping reference)

**Does not depend on:**

- Any feature specs — this is infrastructure/styling work

---

## 1) Goal / Problem

Migrate the app from scattered component-scoped CSS to the centralized `tt-design-system-v2.css` component system. This ensures visual consistency, simplifies maintenance, and enables future theming.

## 2) Scope

### In scope

- Replace component-scoped `<style>` blocks with `tt-*` CSS classes
- Wire existing Svelte components to new CSS system
- Remove deprecated theme.css styles as components migrate
- Ensure all interactive states (pressed, current, focus) work correctly
- Maintain visual parity — no visible regressions

### Out of scope

- Adding new UI features or components
- Changing component behavior/logic
- Dark mode implementation (future phase)
- New page layouts

### What we don't want

- Mixing old and new systems in same component (full migration per component)
- Breaking existing functionality during migration
- Large refactors that change component structure
- Removing any styling without replacement

## 3) Functional Requirements (FR)

- **CSS-FR-001**: All button elements use `.tt-button-*` classes with correct pressed states
- **CSS-FR-002**: All clickable list rows use `.tt-list-row-clickable` with visible touchable border
- **CSS-FR-003**: All static/info rows use `.tt-list-row-static` without interaction styles
- **CSS-FR-004**: Footer navigation uses `.tt-footer-nav` and `.tt-footer-tab` with current-tab state
- **CSS-FR-005**: All inline labels/badges use `.tt-inline-label-*` variants
- **CSS-FR-006**: All form dropdowns use `.tt-dropdown` with focus ring
- **CSS-FR-007**: All text inputs use `.tt-text-input` with focus ring
- **CSS-FR-008**: Section titles use `.tt-section-title` or `.tt-section-title-expandable`
- **CSS-FR-009**: Symbol buttons use `.tt-symbol-button` with touchable border
- **CSS-FR-010**: Chips on Add page use `.tt-chip` with selected state

## 4) Implementation Guarantees (IG)

- **CSS-IG-001**: No component uses both old theme.css classes AND new tt-\* classes
- **CSS-IG-002**: All migrated components remove their component-scoped `<style>` blocks (except layout-specific styles)
- **CSS-IG-003**: Browser default focus rings are preserved or replaced with visible focus indicators
- **CSS-IG-004**: Mobile touch feedback (:active) works on all interactive elements
- **CSS-IG-005**: No visual regressions when comparing before/after screenshots

## 5) Design Decisions (DD)

- **CSS-DD-001**: Migrate page-by-page, not component-by-component, to avoid partial states
- **CSS-DD-002**: Keep layout CSS in components (flex, grid, positioning) — only migrate visual styling
- **CSS-DD-003**: Use semantic color variables (`--tt-status-*`) not raw hex values
- **CSS-DD-004**: Pressed states use lighter colors for visibility on dark backgrounds

## 6) Edge cases

- Components with dynamic styling (e.g., conditional colors) may need CSS custom properties
- Third-party components (date pickers) may need wrapper styling
- Print styles (if any) need separate consideration

## 7) Data & privacy

- No data changes — CSS-only migration
- No storage changes
- No privacy implications

## 8) Acceptance checks (testable)

- [ ] AC-001: Day page renders correctly with new CSS classes
- [ ] AC-002: Week page renders correctly with new CSS classes
- [ ] AC-003: Month page renders correctly with new CSS classes
- [ ] AC-004: Add page renders correctly with new CSS classes
- [ ] AC-005: Settings page renders correctly with new CSS classes
- [ ] AC-006: Analysis page renders correctly with new CSS classes
- [ ] AC-007: Footer navigation shows current tab state
- [ ] AC-008: All buttons show pressed feedback when clicked
- [ ] AC-009: All form inputs show focus ring when focused
- [ ] AC-010: No component has both old and new CSS systems

## 9) Change log

**[2026-01-02 19:35]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (CSS-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (CSS-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
