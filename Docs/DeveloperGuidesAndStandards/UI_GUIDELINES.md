# UI Guidelines

Standards for consistent user interface design in TimeTracker.

---

## Dialog Buttons

### Standard Pattern: Cancel + OK

All dialogs should use consistent button labels:

| Button         | German Label | Purpose                       |
| -------------- | ------------ | ----------------------------- |
| **Cancel**     | `Abbrechen`  | Dismiss dialog without action |
| **OK/Confirm** | `OK`         | Confirm the action            |

### Exceptions for Contextual Actions

For destructive or specific actions, use contextual labels:

| Action Type    | Confirm Label   | Style                   |
| -------------- | --------------- | ----------------------- |
| Delete         | `Löschen`       | `confirmStyle="danger"` |
| Logout         | `Abmelden`      | `confirmStyle="danger"` |
| Delete Account | `Konto löschen` | `confirmStyle="danger"` |

### Examples

```svelte
<!-- Standard confirmation -->
<ConfirmDialog
	title="Bestätigung"
	message="Fortfahren?"
	confirmLabel="OK"
	onconfirm={handleConfirm}
	oncancel={handleCancel}
/>

<!-- Destructive action -->
<ConfirmDialog
	title="Löschen"
	message="Wirklich löschen?"
	confirmLabel="Löschen"
	confirmStyle="danger"
	onconfirm={handleDelete}
	oncancel={handleCancel}
/>

<!-- Alert (info only) -->
<ConfirmDialog
	type="alert"
	title="Hinweis"
	message="Information..."
	confirmLabel="OK"
	onconfirm={handleDismiss}
/>
```

---

## Form Controls

### Dropdowns (Select)

- **Triangle icon position:** Left side (0.75rem from left edge)
- **Padding:** `0.5rem 0.75rem 0.5rem 2rem` (extra left padding for icon)
- **Use custom styling** with `appearance: none` for cross-browser consistency

```css
.custom-select {
	padding: 0.5rem 0.75rem 0.5rem 2rem;
	appearance: none;
	-webkit-appearance: none;
	-moz-appearance: none;
	background-image: url('data:image/svg+xml,...');
	background-repeat: no-repeat;
	background-position: 0.75rem center;
	background-size: 12px;
}
```

---

## Styling

### Use CSS Variables

Always use CSS variables from `theme.css` instead of hardcoded values:

```css
/* ✓ Good */
color: var(--text);
background: var(--surface);
border-color: var(--border);

/* ✗ Bad */
color: #333;
background: #fff;
border-color: #ccc;
```

### No Hardcoded Dark Mode

Do NOT add `@media (prefers-color-scheme: dark)` blocks with hardcoded colors.
The theme system handles dark mode via CSS variables automatically.

---

## Links

Use `var(--accent)` for link colors:

```css
.links a {
	color: var(--accent);
	text-decoration: none;
}

.links a:hover {
	text-decoration: underline;
}
```

---

## Process for New UI Standards

When establishing new UI patterns:

1. **Research:** Check web best practices
2. **Review existing:** Look at current codebase patterns
3. **Compare:** Evaluate options
4. **Propose:** Get user approval before implementing
5. **Document:** Add to this guide after approval

---

## Reference Components

- `ConfirmDialog.svelte` - Standard dialog pattern
- `DayTypeSelector.svelte` - Dropdown styling reference
- `WeekTypeSelector.svelte` - Dropdown styling reference
- `login/+page.svelte` - Auth page styling reference
