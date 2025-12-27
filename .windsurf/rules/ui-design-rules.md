---
trigger: always_on
---

# UI Design Rules (TimeTracker)

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

---

## Minimal Interruption Principle

**The user should feel safe. Assume success, never imply failure.**

### Core Philosophy

- Users should trust that operations succeed silently
- Dialogs/notifications imply "something might be wrong" — avoid this feeling
- Only interrupt the user for **critical, irreversible decisions**

### When to show a dialog:

- ✅ **Destructive actions** requiring confirmation (delete, clear all)
- ✅ **Irreversible changes** that cannot be undone
- ✅ **Critical errors** that block the user from continuing

### When NOT to show a dialog:

- ❌ Success confirmations ("Saved successfully!") — just save silently
- ❌ Informational messages ("Sync complete") — use subtle indicators instead
- ❌ Warnings that don't require action — handle gracefully in code
- ❌ Errors that can be auto-recovered — retry silently

### Alternative to dialogs:

- **Subtle status indicators** (icons, colors) for sync/save state
- **Inline feedback** (field turns green on valid input)
- **Toast notifications** only for truly important, non-blocking info
- **Undo functionality** instead of "Are you sure?" confirmations
- **Silent retry** for transient errors

---

## Error Handling Pattern

**Auto-retry before giving up. Never show error dialogs for recoverable failures.**

### Implementation:

```typescript
async function doOperation(retryCount = 0) {
	const maxRetries = 3;
	try {
		await operation();
	} catch (e) {
		console.error(`Failed (attempt ${retryCount + 1}/${maxRetries}):`, e);
		if (retryCount < maxRetries - 1) {
			await new Promise((r) => setTimeout(r, 500));
			return doOperation(retryCount + 1);
		}
		console.error('Failed after all retries');
	}
}
```

### Rules:

3 retries with 500ms delay between attempts
Log to console for debugging, never show dialog
User can retry manually by repeating the action if all retries fail
