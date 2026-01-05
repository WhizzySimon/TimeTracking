# Frontend CSS Architecture Rules

**Trigger:** When refactoring CSS, creating design systems, or fixing styling bugs

---

## Canary

**When you read this file, output exactly:**

> [CANARY] frontend-css-architecture loaded

---

## 1. Design System Architecture (GENERAL)

### 1.1 Three-Layer Architecture

**Applies to:** All frameworks (React, Svelte, Vue, Angular, vanilla)

Build CSS in three semantic layers:

| Layer | Purpose | Example | When to Create |
|-------|---------|---------|----------------|
| **L1: Primitives** | Raw color/sizing scales | `--brand-primary-500: #374CA7` | Once per project |
| **L2: Semantic Tokens** | Purpose-based values | `--background-card`, `--text-muted` | When same PURPOSE exists in 2+ places |
| **L3: Component Classes** | Multi-property bundles | `.button-primary`, `.list-row` | When same UI PATTERN is used 3+ times |

**Why this works:**
- L1 is stable (rarely changes)
- L2 enables theming (change once, apply everywhere)
- L3 ensures visual consistency (same button everywhere)

### 1.2 Single Source of Truth

**All visual styling should live in the design system file, not component files.**

| What | Design System | Component File |
|------|--------------|----------------|
| Colors | ✓ Always | ✗ Never hardcode |
| Typography | ✓ Always | ✗ Never hardcode |
| Borders/Shadows | ✓ Always | ✗ Never hardcode |
| Hover/Active states | ✓ Always | ⚠️ Only if scoped (see Section 3) |
| Layout (flex/grid) | ✗ Component-specific | ✓ Local CSS |
| Positioning | ✗ Component-specific | ✓ Local CSS |
| Unique spacing | ✗ Component-specific | ✓ Use semantic variables |

**Benefits:**
- **Searchable:** `grep .tt-button` finds all button styling
- **Consistent:** Same pattern everywhere
- **Documentable:** CSS file IS the visual documentation
- **No "where do I look?" confusion**

### 1.3 Naming Convention

Use prefixed, semantic names:

```css
/* Variables: --{prefix}-{category}-{property}-{variant} */
--tt-brand-primary-500
--tt-background-card-hover
--tt-text-muted

/* Classes: .{prefix}-{component}-{variant} */
.tt-button-primary
.tt-button-danger
.tt-button-small

/* Child elements (BEM-like): .{prefix}-{component}__{element} */
.tt-list-row__time
.tt-list-row__actions

/* Modifiers: .{prefix}-{component}--{modifier} */
.tt-text-input--narrow
.tt-text-input--full
```

---

## 2. CSS Variable Best Practices (GENERAL)

### 2.1 Never Hardcode Repeated Values

**Replace hardcoded values with semantic variables:**

```css
/* ✗ WRONG - Hardcoded rgba values scattered across files */
.component-a { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.component-b { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }

/* ✓ RIGHT - Define once, use everywhere */
:root {
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.component-a { box-shadow: var(--shadow-dropdown); }
.component-b { box-shadow: var(--shadow-dropdown); }
```

### 2.2 Semantic Over Literal Names

**Name variables by purpose, not appearance:**

```css
/* ✗ WRONG - Literal names */
--blue-500: #374CA7;
--light-gray: #f5f8fc;

/* ✓ RIGHT - Semantic names */
--brand-primary-500: #374CA7;
--background-card-hover: #f5f8fc;
```

### 2.3 Common Variable Categories

Define variables for:

```css
:root {
  /* State layers (for hover/active overlays) */
  --state-hover: rgba(0, 0, 0, 0.08);
  --state-pressed: rgba(0, 0, 0, 0.12);
  
  /* Shadows */
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-modal: 0 4px 20px rgba(0, 0, 0, 0.25);
  
  /* Backdrop */
  --backdrop-bg: rgba(0, 0, 0, 0.5);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
}
```

---

## 3. Component Scoped CSS Issues (FRAMEWORK-SPECIFIC)

### 3.1 The Scoping Problem

**Applies to:** Svelte, Vue, Angular, CSS Modules in React

Modern frameworks scope component CSS by adding unique identifiers (hash classes or data attributes). This increases CSS specificity.

**Example (Svelte):**
```css
/* Your CSS: */
.my-btn { background: white; }

/* Compiled output: */
.my-btn.svelte-abc123 { background: white; }
```

**The problem:** Scoped CSS overrides global design system classes because it has higher specificity.

```svelte
<!-- BROKEN: Local background overrides global hover -->
<button class="my-btn tt-interactive">Click</button>

<style>
  .my-btn {
    background: var(--background-card); /* Wins over .tt-interactive:hover */
  }
</style>
```

### 3.2 Solution: Composite Classes

**Bundle base background + hover states in the design system class:**

```css
/* Design system file */
.tt-interactive-card {
  background: var(--background-card);  /* Base state */
  transition: background var(--transition-fast);
}

@media (hover: hover) {
  .tt-interactive-card:hover {
    background: var(--background-card-hover);  /* Hover state */
  }
}

.tt-interactive-card:active {
  background: var(--background-card-pressed);  /* Pressed state */
}
```

**Usage in component:**
```svelte
<button class="my-btn tt-interactive-card">Click</button>

<style>
  .my-btn {
    /* NO background here - tt-interactive-card handles it */
    padding: var(--space-8);
    border: 1px solid var(--border-default);
  }
</style>
```

**Rule:** When using composite interactive classes, **never set local `background`** in component CSS.

### 3.3 Common Composite Class Patterns

| Class | Base Background | Hover | Use Case |
|-------|----------------|-------|----------|
| `.tt-interactive` | transparent | black 8% overlay | Transparent elements |
| `.tt-interactive-card` | white card | solid hover color | Buttons on light bg |
| `.tt-interactive-dark` | transparent | white 12% overlay | Header buttons (dark bg) |
| `.tt-interactive-accent` | accent-100 | accent-200 | Running task, highlights |
| `.tt-interactive-danger` | transparent | red overlay | Delete buttons |

### 3.4 Transparent Overlay vs Solid Color

**When using transparent overlays:**
```css
.tt-interactive:hover {
  background: rgba(0, 0, 0, 0.08);  /* Overlays on existing bg */
}
```
This ADDS to the existing background - works for transparent elements.

**When replacing background entirely:**
```css
.tt-interactive-card:hover {
  background: var(--background-card-hover);  /* REPLACES bg with solid color */
}
```
This REPLACES the background - use solid colors, not transparent overlays.

**Common bug:** Using transparent overlay to replace a solid background results in a dark/wrong color because the overlay has no base color to layer on.

---

## 4. Reducing CSS Duplication (GENERAL)

### 4.1 Extract Shared Base Properties

When multiple classes share properties, use comma-separated selectors:

```css
/* ✗ BEFORE - 84 lines duplicated */
.tt-inline-label {
  display: inline-flex;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 4px;
  background: var(--gray-100);
  color: var(--gray-700);
}
.tt-inline-label-employer {
  display: inline-flex;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 4px;
  background: var(--brand-primary-100);
  color: var(--brand-primary-700);
}
/* ... 5 more similar classes ... */

/* ✓ AFTER - Shared base, variant-only overrides */
.tt-inline-label,
.tt-inline-label-employer,
.tt-inline-label-success,
.tt-inline-label-warning,
.tt-inline-label-danger {
  display: inline-flex;
  padding: 2px 8px;
  font-size: 0.75rem;
  border-radius: 4px;
}

.tt-inline-label { background: var(--gray-100); color: var(--gray-700); }
.tt-inline-label-employer { background: var(--brand-primary-100); color: var(--brand-primary-700); }
/* ... only color overrides ... */
```

### 4.2 Identify Duplicate Class Definitions

Watch for classes defined multiple times in the same file (different sections):

```css
/* Line 970 - Date navigation */
.tt-nav-button { display: flex; align-items: center; justify-content: center; }

/* Line 1734 - Tab navigation (CONFLICT!) */
.tt-nav-button { display: flex; flex-direction: column; align-items: center; }
```

**Fix:** Rename one to avoid conflicts (e.g., `.tt-tab-button`).

### 4.3 Organize by Component Group

Structure CSS file with clear section headers:

```css
/* ============================================================================
   INTERACTIVE STATES
   ============================================================================ */

/* ============================================================================
   BUTTONS
   ============================================================================ */

/* ============================================================================
   FORM CONTROLS
   ============================================================================ */

/* ============================================================================
   LIST ROWS
   ============================================================================ */
```

---

## 5. Hover State Best Practices (GENERAL)

### 5.1 Use Media Query for Hover

**Always wrap hover styles in `@media (hover: hover)`:**

```css
/* ✓ CORRECT - respects touch devices */
@media (hover: hover) {
  .button:hover {
    background: var(--background-card-hover);
  }
}

/* ✗ WRONG - applies on touch devices */
.button:hover {
  background: var(--background-card-hover);
}
```

**Why:** Touch devices don't have hover. Without the media query, hover styles can get "stuck" after touch interactions.

### 5.2 Background Progression Rules

**Light backgrounds → progressively darker:**
```
Normal → Hover → Pressed
#ffffff → #f5f8fc → #edf2f7
```

**Dark backgrounds → progressively lighter:**
```
Normal → Hover → Pressed
#2526a9 → #3334b8 → #4a4bc5
```

### 5.3 Define All Interactive States

Every interactive element needs:

| State | Requirement |
|-------|-------------|
| **default** | Base appearance |
| **hover** | Visual feedback on mouse over |
| **active/pressed** | Stronger feedback on click |
| **focus** | Visible focus ring for keyboard nav |
| **disabled** | Grayed out, non-interactive |

---

## 6. Visual Consistency Rules (GENERAL)

### 6.1 Same Element = Same Styling

**From visual reference document:**

> "Assume similar elements should have the same styling — add same classes unless explicitly specified otherwise"

| Element Type | Rule |
|--------------|------|
| Summary rows | Identical styling across all pages |
| Employer labels | Identical regardless of page/context |
| Symbol buttons | Same base styles (can individualize later) |
| Navigation buttons | Consistent across Day/Week/Month |

### 6.2 When Fixing Bugs

1. **Identify the root cause** - Is it a design system issue or component issue?
2. **Fix at the right level** - Prefer design system fixes over component patches
3. **Apply existing classes** - Don't create new ad-hoc styles
4. **Test similar elements** - If one was wrong, others might be too

### 6.3 Regression Checkpoints

After CSS refactoring, verify:
- [ ] All similar elements still look identical
- [ ] Hover states work correctly
- [ ] No unexpected color/spacing changes
- [ ] Touch interactions still work

---

## 7. Refactoring Workflow (GENERAL)

### 7.1 Three-Phase Approach

**Phase 1: Extract Visual Styles**
- Move visual styles from component files to design system
- Keep single-use layouts local
- Test after each component

**Phase 2: Organize Design System**
- Group similar patterns
- Extract shared base properties
- Fix duplicate definitions
- Add documentation comments

**Phase 3: Variable Optimization**
- Replace hardcoded values with semantic variables
- Create new variables for repeated patterns
- Update both design system and component files

### 7.2 Single-Use CSS Rules

When keeping CSS in component files:

1. **Use semantic variables** - Never hardcode colors, shadows, etc.
2. **Add comment** - Mark as "Single-use" or "Component-specific"
3. **Keep it minimal** - Layout and positioning only

```svelte
<style>
  /* Single-use: Weekday grid layout for AddWorkTimeModelModal */
  .weekday-grid {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--space-8);  /* ✓ Uses semantic variable */
  }
</style>
```

### 7.3 Testing Strategy

After each change:
1. **Visual test** - Does it look the same?
2. **Hover test** - Do interactive states work?
3. **Responsive test** - Does it work on mobile?
4. **`npm run check`** - No build errors?

---

## 8. Common Bug Patterns (LESSONS LEARNED)

### 8.1 Hover Not Working

**Cause:** Component scoped CSS overrides design system hover.

**Fix:** Use composite classes that bundle background + hover (Section 3.2).

### 8.2 Hover Color Too Dark

**Cause:** Transparent overlay replacing solid background instead of layering.

**Fix:** Use solid hover color for elements with solid backgrounds:
```css
/* ✗ WRONG */
.card:hover { background: rgba(0, 0, 0, 0.08); }  /* Replaces white, shows gray */

/* ✓ RIGHT */
.card:hover { background: var(--background-card-hover); }  /* Solid color */
```

### 8.3 Inconsistent Elements

**Cause:** Same visual element using different classes or local styles.

**Fix:** Audit all instances, apply same design system class to all.

### 8.4 Duplicate Class Definitions

**Cause:** Multiple sections of CSS file define same class name.

**Fix:** Search for class name in file, rename or merge duplicates.

---

## References

- `src/lib/styles/tt-design-system.css` - Design system implementation
- `frontend-ui-standards.md` - UI interaction standards
- `TempAppDevDocs/QuickFixes/Refactor-CSS-Visual-Styles-To-Classes.md` - Refactoring plan
- `TempAppDevDocs/QuickFixes/CSS-Phase2-Visual-Reference.md` - Visual baseline reference

---
