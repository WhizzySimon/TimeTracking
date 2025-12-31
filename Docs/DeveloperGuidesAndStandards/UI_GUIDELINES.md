# UI Guidelines

Standards for consistent user interface design in TimeTracker.

---

## Dialog Buttons

### Principle: Action-Specific Labels

Based on UX research (Nielsen Norman Group, Microsoft Guidelines):

> "Avoid using the generic phrase OK for button labels in confirmation dialogs.
> Explicitly state what users are doing by pushing that button."

Use **action-specific verbs** that describe what will happen.

### Button Label Patterns

| Dialog Type | Confirm Label | Cancel Label | Style |
|-------------|---------------|--------------|-------|
| **Alert (info only)** | `OK` | — | default |
| **Save/Submit data** | `Speichern` | `Abbrechen` | default |
| **Continue/Proceed** | `Fortfahren` | `Abbrechen` | default |
| **Apply changes** | `Übernehmen` | `Abbrechen` | default |
| **Delete** | `Löschen` | `Abbrechen` | `danger` |
| **Logout** | `Abmelden` | `Abbrechen` | `danger` |
| **Delete Account** | `Konto löschen` | `Abbrechen` | `danger` |
| **Discard changes** | `Verwerfen` | `Abbrechen` | `danger` |

### When to Use Each

- **OK** — Only for information-only alerts (no action, just acknowledgment)
- **Speichern** — When saving form data, settings, or entries
- **Fortfahren** — When confirming to proceed with a multi-step action
- **Übernehmen** — When applying settings/filters without closing
- **Löschen** — When permanently removing data

### Examples

```svelte
<!-- Alert: Info only - OK is appropriate -->
<ConfirmDialog
  title="Hinweis"
  message="Keine Einträge für diesen Zeitraum."
  confirmLabel="OK"
  onconfirm={handleDismiss}
/>

<!-- Proceed confirmation - use action verb -->
<ConfirmDialog
  title="Wochenart ändern"
  message="Dies setzt die Tagesart für alle 7 Tage. Fortfahren?"
  confirmLabel="Fortfahren"
  onconfirm={handleProceed}
  oncancel={handleCancel}
/>

<!-- Save action -->
<ConfirmDialog
  title="Änderungen speichern"
  message="Möchten Sie die Änderungen speichern?"
  confirmLabel="Speichern"
  onconfirm={handleSave}
  oncancel={handleCancel}
/>

<!-- Destructive action -->
<ConfirmDialog
  title="Eintrag löschen"
  message="Dieser Eintrag wird unwiderruflich gelöscht."
  confirmLabel="Löschen"
  confirmStyle="danger"
  onconfirm={handleDelete}
  oncancel={handleCancel}
/>

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
