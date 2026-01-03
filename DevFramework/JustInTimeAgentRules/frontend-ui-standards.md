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

Every interactive component must define these states with progressive visual feedback:

### State Progression

**State order:** normal → hover → selected/current → pressed

| State            | Requirement                                    | Implementation                          |
| ---------------- | ---------------------------------------------- | --------------------------------------- |
| **default**      | Normal appearance                              | Base background/color                   |
| **hover**        | Visual feedback on mouse over                  | Background changes (see rules below)    |
| **selected**     | Current/active item (tabs, chips, selections)  | Distinct background, maintains contrast |
| **pressed**      | Pressed/clicked state (touch/mouse down)       | Strongest visual feedback               |
| **disabled**     | Grayed out, non-interactive                    | Reduced opacity, no cursor              |
| **focus**        | Visible focus ring (keyboard navigation)       | Outline or box-shadow, never hidden     |

### Background Progression Rules

**Light backgrounds (white, light gray):**
- States become **progressively darker**
- Normal → Hover (slightly darker) → Selected (darker) → Pressed (darkest)
- Example: `#ffffff` → `#f5f8fc` → `#edf2f7` → `#e2e8f0`

**Dark backgrounds (brand colors, dark UI):**
- States become **progressively lighter**
- Normal → Hover (slightly lighter) → Selected (lighter) → Pressed (lightest)
- Example: `#2526a9` → `#3334b8` → `#4a4bc5` → `#5c5dd0`

### Contrast Verification (MUST)

**All states must maintain readable contrast:**
- Verify text contrast ratio ≥ 4.5:1 for normal text
- Verify text contrast ratio ≥ 3:1 for large text (18pt+)
- If contrast becomes too low in any state, adjust text color accordingly
- Use `--tt-text-primary` on light backgrounds
- Use `#ffffff` on dark backgrounds

### Hover Implementation

**Always use `@media (hover: hover)` to respect user preferences:**

```css
/* ✓ CORRECT - respects touch devices */
@media (hover: hover) {
	.tt-button:hover {
		background: var(--tt-background-card-hover);
	}
}

/* ✗ WRONG - applies on touch devices */
.tt-button:hover {
	background: var(--tt-background-card-hover);
}
```

**Why:** Touch devices don't have hover. Using `@media (hover: hover)` prevents hover styles from interfering with touch interactions.

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

### Panic-Close Button (MUST)

**Every dialog MUST have an X button in the top-right corner.**

This is the "panic button" - users need an immediate, obvious way to close any dialog without reading or understanding content. Users may be overwhelmed, confused, or simply want out immediately.

```svelte
<button class="close-btn" onclick={handleClose} aria-label="Schließen">×</button>
```

**Styling requirements:**

- Position: `absolute` at `top: 1rem; right: 1rem`
- Size: 32×32px minimum
- Font-size: 1.5rem
- Color: `var(--muted)` default, `var(--text)` on hover
- Background: transparent default, `var(--surface-hover)` on hover
- z-index: 1 (above dialog content)

**Why:** Standard UI convention. Users expect X in top-right corner. They may not understand button labels like "Weiter mit Free" or may not want to read anything. The X is universally understood as "close this now."

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

**Chevron icon position: ALWAYS on the RIGHT side**

- Chevron icon position: **Right side** (var(--tt-space-12) from right edge)
- Padding: `var(--tt-space-8) var(--tt-space-32) var(--tt-space-8) var(--tt-space-12)` (extra right padding for icon)
- Use `appearance: none` for cross-browser consistency
- **NEVER place dropdown chevron icons on the left side**

```css
/* Standard dropdown styling - chevron ALWAYS on right */
.tt-dropdown {
	appearance: none;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
	background-position: right var(--tt-space-12) center;
	background-repeat: no-repeat;
	padding-right: var(--tt-space-32);
}
```

**Why:** Right-aligned chevrons are the universal standard for dropdowns across all major platforms (iOS, Android, Windows, macOS, web). Users expect the chevron on the right to indicate "this opens a menu".

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

### Dialog Closing Behavior (MUST)

**Dialogs must NOT close on backdrop click.**

Dialogs should only close via:

- Close button (×)
- Escape key
- Explicit action buttons (Cancel, Confirm, etc.)

**Why:** Accidental backdrop clicks cause data loss and frustration. Users expect explicit actions to dismiss dialogs.

### Touch/Click Targets

- Minimum size: **44×44px** (or 48×48px for primary actions)
- Minimum spacing between targets: **8px**
- Exception: Inline text links may be smaller if surrounded by sufficient whitespace

---

## Delete Button Icons (MUST)

**Use trash SVG icon for delete buttons, not "×" character.**

```svelte
<button class="delete-btn" onclick={handleDelete}>
	<svg viewBox="0 0 24 24" width="16" height="16">
		<path
			d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
			stroke="currentColor"
			stroke-width="2"
			fill="none"
		/>
	</svg>
</button>
```

**Why:** Trash icon is universally understood as "delete". The × character is ambiguous (could mean close, cancel, or delete).

---

## Conditional Form Fields (MUST)

**Hide form fields that don't apply semantically.**

Examples:

- No employer dropdown for absence categories (absences aren't work time)
- No date range for single-day operations
- No optional fields that have no effect in current context

**Why:** Showing irrelevant fields confuses users and clutters the UI.

---

## Reference Components

- `ConfirmDialog.svelte` — Standard dialog pattern
- `DayTypeSelector.svelte` — Dropdown styling reference
- `WeekTypeSelector.svelte` — Dropdown styling reference
- `login/+page.svelte` — Auth page styling reference
- `TaskItem.svelte` — Trash icon reference

---
