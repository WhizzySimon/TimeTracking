# Hover State Refactoring Notes

## Current State (Jan 2026)

We implemented a Material Design 3 inspired **state layer system** for consistent hover/active states across the app.

### What Was Done

1. **Added state layer CSS variables** to `tt-design-system.css`:
   ```css
   --tt-state-hover: rgba(0, 0, 0, 0.08);
   --tt-state-pressed: rgba(0, 0, 0, 0.12);
   --tt-state-danger-hover: rgba(197, 48, 48, 0.08);
   --tt-state-danger-pressed: rgba(197, 48, 48, 0.12);
   ```

2. **Added reusable utility classes**:
   - `.tt-interactive` - Basic hover/active with state layers
   - `.tt-interactive-danger` - Danger-colored hover/active states

3. **Updated ~25 files** to use `var(--tt-state-hover)` and `var(--tt-state-pressed)` instead of hardcoded colors.

4. **Dark context override** in `.app-header`:
   ```css
   --tt-state-hover: rgba(255, 255, 255, 0.08);
   --tt-state-pressed: rgba(255, 255, 255, 0.15);
   ```

5. **Footer tabs** use `filter: brightness()` for colored backgrounds.

---

## Future Refactoring Needed

### Problem: Scattered Hover Definitions

Many components still define hover states in their local `<style>` blocks instead of using the design system classes. This creates:
- Duplication of hover logic
- Inconsistency if we change the state layer values
- More code to maintain

### Components with Local Hover Styles (to refactor)

These components have local `:hover` styles that could use `.tt-interactive` class instead:

**High Priority (frequently used):**
- `day/+page.svelte` - `.nav-btn`, `.date-title`
- `week/+page.svelte` - `.nav-btn`, `.week-title`
- `month/+page.svelte` - `.nav-btn`, `.month-title`
- `settings/+page.svelte` - `.dropdown-item`, `.logout-button`, `.reset-btn`
- `analysis/+page.svelte` - `.range-button`

**Medium Priority (import flow):**
- `import/BulkActions.svelte` - `.action-btn`, `.dropdown-item`
- `import/PresetSelector.svelte` - `.preset-btn`
- `import/IssuesPanel.svelte` - `.issue-btn`, `.clear-filter`
- `import/ImportProgress.svelte` - `.btn-cancel`
- `import/ImportUpload.svelte` - `.btn-remove`
- `import/CandidateRow.svelte` - `tr:hover`
- `import/ImportReview.svelte` - `tr:hover`

**Lower Priority (less used):**
- `CustomDropdown.svelte` - `.dropdown-button`
- `DateRangeSelector.svelte` - `.quick-btn`
- `DayPicker.svelte` - `.day-cell`
- `StundenzettelExport.svelte` - `.column-checkbox`, `tr:hover`
- `PasswordInput.svelte` - `.toggle-btn`

### Ideal Refactoring Approach

1. **For simple buttons/rows**: Add `class="tt-interactive"` to the element
2. **For danger actions**: Add `class="tt-interactive-danger"` to the element
3. **Remove local `:hover` and `:active` styles** from component `<style>` blocks

### Example Refactor

**Before:**
```svelte
<button class="nav-btn" onclick={...}>...</button>

<style>
  .nav-btn { ... }
  .nav-btn:hover { background: var(--tt-state-hover); }
  .nav-btn:active { background: var(--tt-state-pressed); }
</style>
```

**After:**
```svelte
<button class="nav-btn tt-interactive" onclick={...}>...</button>

<style>
  .nav-btn { ... }
  /* No hover/active styles needed - handled by .tt-interactive */
</style>
```

### Note on Colored Backgrounds

For elements with colored backgrounds (like footer tabs), the state layer approach doesn't work well because `rgba(0,0,0,0.08)` on a blue background looks muddy. Instead, use:
- `filter: brightness(1.1)` for hover
- `filter: brightness(1.15)` for pressed

This is already implemented for `.tt-footer-tab`.

---

## Related Files

- `src/lib/styles/tt-design-system.css` - State layer variables and `.tt-interactive` classes
- `src/routes/+layout.svelte` - Dark context override in `.app-header`
