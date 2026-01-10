# Frontend UI Standards

**Trigger:** When working on UI (.svelte files, components, styling)

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] frontend-ui-standards loaded

---

# Critical (Always Apply)

## Design System Foundation

**Trigger:** New project setup OR adding new UI component patterns

### Source of Truth

The design system architecture is documented in `src/lib/styles/tt-design-system.css` header.

**3-Layer Architecture:**

1. **Layer 1: Scheme Colors** — Raw primitives (`--tt-brand-primary-500`)
2. **Layer 2: Semantic Tokens** — Purpose-based (`--tt-background-card`, `--tt-text-muted`)
3. **Layer 3: Component Classes** — Multi-property bundles (`.tt-button-primary`, `.tt-list-row-clickable`)

### Rules for Adding to Design System

| What           | Rule                                          | Example                                       |
| -------------- | --------------------------------------------- | --------------------------------------------- |
| **Tokens**     | Create when same PURPOSE exists in 2+ places  | `--tt-border-default` for all default borders |
| **Classes**    | Create when same UI PATTERN is used 3+ times  | `.tt-button-primary` for all primary buttons  |
| **Single-use** | Use semantic tokens directly, no class needed | Custom modal with unique layout               |

### For New Projects

1. Create `src/lib/styles/tt-design-system.css` with 3-layer architecture
2. Define color scales, semantic tokens, spacing, typography
3. Optionally create `/dev/styleguide` page as exploration sandbox (temporary)
4. Build real UI using design system classes

### For Existing Projects

- **New patterns** → Add to design system first, then use in components
- **Hardcoded values** → Replace with semantic tokens
- **Repeated CSS (3+ times)** → Extract to component class

### Refactoring Check (MUST for every UI change)

**When making ANY UI change, automatically check:**

#### CSS/Styling

1. **Is there a design system class for this?** → Use `.tt-*` class instead of local CSS
2. **Is there a semantic token for this value?** → Use `var(--tt-*)` instead of hardcoded
3. **Is the component using old patterns?** → Migrate to design system while touching the file

#### Components

4. **Does a reusable component already exist?** → Use it instead of individual HTML
   - Check `src/lib/components/` for existing components (Modal, ConfirmDialog, CustomDropdown, etc.)
5. **Is this UI pattern repeated 2-3+ times?** → Create a new component
   - Extract to `src/lib/components/<ComponentName>.svelte`
   - Replace all instances with the new component

**Example A:** User asks "fix this button hover color"

- ❌ Wrong: Add/change local `.my-button:hover { background: #xyz; }`
- ✅ Right: Check if `.tt-button-*` exists, use that class, remove local CSS

**Example B:** User asks "add a confirmation before delete"

- ❌ Wrong: Create inline confirm logic with local styling
- ✅ Right: Use existing `<ConfirmDialog>` component

**Example C:** You notice same card layout in 3 places

- ✅ Right: Create `<SummaryCard>` component, replace all instances

**This is automatic.** Do not ask user for permission to refactor — just do it as part of the fix.

### Naming Convention

- Variables: `--tt-{category}-{property}-{variant}`
- Classes: `.tt-{component}-{variant}` or `.tt-{component}--{modifier}`
- Child elements: BEM-like (`.tt-list-row__time`, `.tt-list-row__actions`)

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

| State        | Requirement                                   | Implementation                          |
| ------------ | --------------------------------------------- | --------------------------------------- |
| **default**  | Normal appearance                             | Base background/color                   |
| **hover**    | Visual feedback on mouse over                 | Background changes (see rules below)    |
| **selected** | Current/active item (tabs, chips, selections) | Distinct background, maintains contrast |
| **pressed**  | Pressed/clicked state (touch/mouse down)      | Strongest visual feedback               |
| **disabled** | Grayed out, non-interactive                   | Reduced opacity, no cursor              |
| **focus**    | Visible focus ring (keyboard navigation)      | Outline or box-shadow, never hidden     |

### Background Progression Rules

**Material Design 3 State Layers (Preferred):**

Use `color-mix()` to create state layer overlays instead of predefined color variants:

```css
/* Light backgrounds - dark overlay */
.element {
	background: var(--tt-background-card);
}

@media (hover: hover) {
	.element:hover {
		background: color-mix(in srgb, var(--tt-text-primary) 8%, var(--tt-background-card));
	}
}

.element:active {
	background: color-mix(in srgb, var(--tt-text-primary) 12%, var(--tt-background-card));
}

/* Dark backgrounds - white overlay */
.dark-element {
	background: var(--tt-brand-primary-500);
}

@media (hover: hover) {
	.dark-element:hover {
		background: color-mix(in srgb, white 8%, var(--tt-brand-primary-500));
	}
}

.dark-element:active {
	background: color-mix(in srgb, white 12%, var(--tt-brand-primary-500));
}
```

**Overlay percentages:**

- Hover: 8% overlay
- Pressed: 12% overlay
- Selected: Use distinct background (e.g., white on colored tabs, or inverted color)

**Legacy approach (if color-mix not supported):**

**Light backgrounds (white, light gray):**

- States become **progressively darker**
- Normal → Hover (slightly darker) → Selected (darker) → Pressed (darkest)
- Example: `#ffffff` → `#f5f8fc` → `#edf2f7` → `#e2e8f0`

**Dark backgrounds (brand colors, dark UI):**

- States become **progressively lighter**
- Normal → Hover (slightly lighter) → Selected (lighter) → Pressed (lightest)
- Example: `#2526a9` → `#3334b8` → `#4a4bc5` → `#5c5dd0`

**Why Material Design 3 approach:** State layers with `color-mix()` provide consistent, predictable feedback without needing to define multiple color variants. The overlay percentage is constant (8%/12%), making the system more maintainable.

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

### Use Custom Components Over Native Controls

**Replace native form controls with custom components for consistency.**

Native HTML controls (`<select>`, `<input type="date">`, etc.) have browser-specific styling that varies across platforms:

- Chevron position and styling differs
- Colors and borders are inconsistent
- Touch targets may be too small
- Dark mode support is unpredictable

**Solution:** Use custom Svelte components that implement consistent styling:

```svelte
<!-- ✗ WRONG - native select has inconsistent styling -->
<select bind:value={selectedYear}>
	{#each years as year}
		<option value={year}>{year}</option>
	{/each}
</select>

<!-- ✓ CORRECT - CustomDropdown has consistent styling -->
<CustomDropdown
	options={yearOptions}
	value={String(selectedYear)}
	onchange={(value) => (selectedYear = parseInt(value))}
/>
```

**Available custom components:**

- `CustomDropdown.svelte` - Replaces `<select>`
- `ConfirmDialog.svelte` - Replaces `window.confirm()`
- `Modal.svelte` - Base modal component
- Check `src/lib/components/` for more

**When to use native controls:**

- Text inputs (`<input type="text">`) - styling is consistent enough
- Checkboxes/radio buttons - if styled with custom CSS
- File uploads - no good alternative exists

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

## Svelte-Specific: CSS Scoping & Hover States (MUST)

### The Problem

Svelte scopes component CSS by adding a hash class (e.g., `.my-btn.svelte-abc123`). This increases specificity, causing **local CSS to override global design system classes**.

```svelte
<!-- BROKEN: Local background overrides global hover -->
<button class="my-btn tt-interactive">Click</button>

<style>
	.my-btn {
		background: var(--tt-background-card); /* Wins over .tt-interactive:hover */
	}
</style>
```

### Solution 1: Composite Classes (Preferred)

Use design system classes that bundle **base background + hover states** together:

| Class                    | Base Background | Hover              | Use Case                 |
| ------------------------ | --------------- | ------------------ | ------------------------ |
| `.tt-interactive`        | transparent     | black 8% overlay   | Transparent elements     |
| `.tt-interactive-card`   | white card      | black 8% overlay   | Buttons on light bg      |
| `.tt-interactive-dark`   | transparent     | white 12% overlay  | Header buttons (dark bg) |
| `.tt-interactive-accent` | accent-100      | accent-200         | Running task banner      |
| `.tt-interactive-danger` | transparent     | red overlay + text | Delete buttons           |

```svelte
<!-- CORRECT: Let the class handle background -->
<button class="my-btn tt-interactive-card">Click</button>

<style>
	.my-btn {
		/* NO background here - tt-interactive-card handles it */
		padding: var(--tt-space-8);
		border: 1px solid var(--tt-border-default);
	}
</style>
```

**Rule:** When using `.tt-interactive-*` classes, **never set local `background`** in component CSS.

### Solution 2: `:global()` Escape (For One-Off Elements)

For unique elements where creating a design system class isn't worth it, use Svelte's `:global()` modifier:

```svelte
<button class="unique-btn tt-interactive">Click</button>

<style>
	.unique-btn {
		background: var(--tt-special-background);
	}

	/* Escape scoping for hover - global rule wins */
	.unique-btn:global(.tt-interactive):hover {
		background: var(--tt-state-hover);
	}

	.unique-btn:global(.tt-interactive):active {
		background: var(--tt-state-pressed);
	}
</style>
```

### When to Use Which

| Situation                          | Approach                                 |
| ---------------------------------- | ---------------------------------------- |
| Background used in 2+ components   | Create `.tt-interactive-{variant}` class |
| Truly one-off unique element       | Use `:global()` escape                   |
| Element inherits/has no background | Use `.tt-interactive` (transparent)      |

### Reference

See `src/lib/styles/tt-design-system.css` section "INTERACTIVE STATE CLASSES" for full documentation.

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Design System Foundation, Token Usage, Interactive State Pattern
- **Important:** Component Patterns, Color Usage, Spacing Rules
- **Standard:** Complex Component Patterns, Edge Case Handling
