# Code Quality Rules (TimeTracker)

## Warnings Policy

**Fix warnings properly, do not suppress them.**

When encountering Svelte or TypeScript warnings:

1. **Do NOT use `svelte-ignore` comments** to suppress warnings
2. **Fix the root cause** instead:
   - For `state_referenced_locally` warnings: Wrap prop access in a function before using in `$state()`
   - For `a11y_no_static_element_interactions` warnings: Add `role="button"`, `tabindex`, and `onkeydown` handler
3. **Verify with `npm run check`** that warnings are resolved (0 errors, 0 warnings)

### Example fixes:

**Bad (suppression):**

```
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={handler}>
```

**Good (proper fix):**

```
<div role="button" tabindex="0" onclick={handler} onkeydown={(e) => e.key === 'Enter' && handler()}>
```
---

## Dialog Policy

**NEVER use browser `confirm()` or `alert()` dialogs.**

These break the app design and look ugly. Instead:

1. **Use `ConfirmDialog` component** from `$lib/components/ConfirmDialog.svelte`
2. **For confirmations:** Set `type="confirm"` (default), provide `onconfirm` and `oncancel`
3. **For alerts:** Set `type="alert"`, provide only `onconfirm`

### Example usage:

**Confirmation dialog:**
```svelte
{#if showDeleteConfirm}
  <ConfirmDialog
    title="Aufgabe löschen"
    message="Aufgabe wirklich löschen?"
    confirmLabel="Löschen"
    confirmStyle="danger"
    onconfirm={handleConfirm}
    oncancel={handleCancel}
  />
{/if}
```

**Alert dialog:**
```svelte
{#if showError}
  <ConfirmDialog
    type="alert"
    title="Fehler"
    message="Fehler beim Speichern"
    onconfirm={() => (showError = false)}
  />
{/if}
```
