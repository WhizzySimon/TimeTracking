# Frontend UI Standards

**Trigger:** When working on UI (.svelte files, components, styling)

---

## Canary

**When you read this file, output exactly:**

> [CANARY] frontend-ui-standards loaded

---

## UI Quality Gate (MUST)

**Definition of Done for any UI change — Evidence Bundle requirements:**

1. **Screenshot(s)** of changed UI (before/after if modifying existing)
2. **Keyboard-tab walkthrough note** confirming navigation works
3. **States validated list:** loading / empty / error / success (as applicable)

Include this in your Evidence Bundle before commit.

---

## One Primary Action Per View (SHOULD)

Each view or section should have **one clear primary action**.

- Primary action uses prominent styling (colored button, larger)
- Secondary actions are visually subordinate
- **Exception:** Complex dashboards may have multiple entry points — document justification

---

## Destructive Actions (MUST)

Destructive actions are **never styled as primary**.

- Use `confirmStyle="danger"` (red) for delete/remove/discard
- Always require confirmation or provide undo
- Never auto-execute destructive actions

---

## Component States (MUST)

Every interactive component must define these states:

| State        | Requirement                              |
| ------------ | ---------------------------------------- |
| **default**  | Normal appearance                        |
| **hover**    | Visual feedback on mouse over            |
| **active**   | Pressed/clicked state                    |
| **disabled** | Grayed out, non-interactive              |
| **focus**    | Visible focus ring (keyboard navigation) |

**Focus must be visible and not obscured by other elements.**

---

## Design System Discipline (MUST)

Use design tokens/CSS variables only. No ad-hoc style values.

```css
/* ✓ MUST use variables */
color: var(--text);
background: var(--surface);
border-color: var(--border);
border-radius: var(--radius);

/* ✗ FORBIDDEN */
color: #333;
background: #fff;
border-color: #ccc;
border-radius: 8px;
```

**No hardcoded dark mode:**
Do NOT add `@media (prefers-color-scheme: dark)` blocks.
The theme system handles dark mode via CSS variables automatically.

---

## Dialog Standards (MUST)

### Use ConfirmDialog Component

**NEVER use browser `confirm()` or `alert()` dialogs.**

```svelte
{#if showDeleteConfirm}
	<ConfirmDialog
		title="Eintrag löschen"
		message="Dieser Eintrag wird unwiderruflich gelöscht."
		confirmLabel="Löschen"
		confirmStyle="danger"
		onconfirm={handleDelete}
		oncancel={handleCancel}
	/>
{/if}
```

### Button Labels

| Dialog Type           | Confirm Label | Cancel Label | Style   |
| --------------------- | ------------- | ------------ | ------- |
| **Alert (info only)** | `OK`          | —            | default |
| **Save/Submit**       | `Speichern`   | `Abbrechen`  | default |
| **Continue/Proceed**  | `Fortfahren`  | `Abbrechen`  | default |
| **Apply changes**     | `Übernehmen`  | `Abbrechen`  | default |
| **Delete**            | `Löschen`     | `Abbrechen`  | danger  |
| **Logout**            | `Abmelden`    | `Abbrechen`  | danger  |
| **Discard changes**   | `Verwerfen`   | `Abbrechen`  | danger  |

### Button Order & Placement

- **Cancel/Secondary on LEFT, Confirm/Primary on RIGHT**
- Group buttons at **bottom-right** of dialog
- Gap between buttons: `0.75rem`

---

## Form Controls (MUST)

### Dropdowns (Select)

- Triangle icon position: Left side (0.75rem from left edge)
- Padding: `0.5rem 0.75rem 0.5rem 2rem` (extra left padding for icon)
- Use `appearance: none` for cross-browser consistency

### Links

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

## Accessibility Baseline (MUST)

Minimum requirements for any UI change:

### Keyboard Navigation

- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows logical reading order
- [ ] No keyboard traps (can always Tab out)

### Focus Visibility

- [ ] Focus ring is visible on all focusable elements
- [ ] Focus is not obscured by overlays or other elements
- [ ] Custom focus styles maintain sufficient contrast

### Dialog Accessibility

- [ ] Focus moves INTO dialog when opened
- [ ] Focus is TRAPPED inside dialog (Tab cycles within)
- [ ] Focus RETURNS to trigger element when closed
- [ ] Escape key closes dialog

### Touch/Click Targets

- Minimum size: **44×44px** (or 48×48px for primary actions)
- Minimum spacing between targets: **8px**
- Exception: Inline text links may be smaller if surrounded by sufficient whitespace

---

## Reference Components

- `ConfirmDialog.svelte` — Standard dialog pattern
- `DayTypeSelector.svelte` — Dropdown styling reference
- `WeekTypeSelector.svelte` — Dropdown styling reference
- `login/+page.svelte` — Auth page styling reference

---
