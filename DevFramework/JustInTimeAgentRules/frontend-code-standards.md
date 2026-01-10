# Frontend Code Standards

**Trigger:** When writing/editing frontend code (.svelte, .ts files in src/)

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] frontend-code-standards loaded

---

## TypeScript Strictness (MUST)

### No New `any` Without Justification

- Never introduce `any` type without explicit comment explaining why
- Prefer `unknown` + type narrowing over `any`
- Use generics when type varies but structure is known

```typescript
// ✗ BAD
function process(data: any) { ... }

// ✓ GOOD
function process<T extends BaseType>(data: T) { ... }

// ✓ ACCEPTABLE with justification
// any required: third-party API returns untyped response
function handleLegacyApi(data: any) { ... }
```

### Strict Null Checks

- Handle null/undefined explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Never suppress null warnings with `!` without justification

---

## Svelte/Component Predictability (MUST)

### No Side Effects in Reactive Statements

```svelte
<!-- ✗ BAD: Side effect in $: -->
$: {
  fetch('/api/data'); // Don't do this
  saveToLocalStorage(value); // Don't do this
}

<!-- ✓ GOOD: Use onMount/event handlers for side effects -->
<script>
  import { onMount } from 'svelte';
  onMount(() => {
    fetch('/api/data');
  });
</script>
```

### Effects Have Correct Dependencies

- Reactive statements (`$:`) should only reference values they depend on
- Avoid stale closures in event handlers
- Use `{#key}` blocks when component needs full re-render on data change

### Keep Components Reasonably Pure

- Components should be predictable: same props → same output
- Extract business logic to separate functions/modules
- Minimize component-level mutable state

---

## State Discipline (SHOULD)

### Avoid Redundant State

```typescript
// ✗ BAD: Derived state stored separately
let items = [];
let itemCount = 0; // Redundant!

// ✓ GOOD: Derive from source
let items = [];
$: itemCount = items.length;
```

### Single Source of Truth

- Each piece of data has ONE authoritative source
- Derived/computed values use `$:` reactive statements
- Props flow down, events flow up (no two-way binding unless intentional)

### State Location

- **Component state:** UI-only state (open/closed, hover, etc.)
- **Store state:** Shared across components
- **URL state:** Shareable/bookmarkable state
- **Server state:** Authoritative data (sync via API)

---

## Formatting / Lint / Typecheck (MUST)

All code must pass:

```bash
npm run format   # Prettier
npm run check    # svelte-check + TypeScript
npm run lint     # ESLint (if configured)
```

### Lint Error Resolution

When a lint fix fails, **STOP and analyze**:

1. Do NOT iterate on syntax blindly
2. Research the rule — read official documentation
3. Question the pattern — is the approach correct?
4. Consider alternatives — the linter may be revealing a design problem

---

## Accessibility-Critical Code (MUST)

### Focus Management in Dialogs

```typescript
// When opening dialog:
function openDialog() {
	showDialog = true;
	// Focus first focusable element after render
	tick().then(() => {
		dialogRef?.querySelector('button, input, [tabindex]')?.focus();
	});
}

// When closing dialog:
function closeDialog() {
	showDialog = false;
	// Return focus to trigger
	triggerRef?.focus();
}
```

### Focus Trap Implementation

Dialogs must trap focus:

```typescript
function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Tab') {
		const focusable = dialog.querySelectorAll(
			'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
		);
		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	if (event.key === 'Escape') {
		closeDialog();
	}
}
```

### Keyboard Event Handlers

- All clickable elements must also handle Enter/Space
- Use `<button>` for actions (not `<div onclick>`)
- Provide `aria-` attributes where semantic HTML is insufficient

---

## Code Naming (MUST)

From `code-quality.md` — names must be self-explanatory:

| ❌ Unclear            | ✓ Self-Explanatory        |
| --------------------- | ------------------------- |
| `proc()`              | `processTimeEntry()`      |
| `data`                | `userSettings`            |
| `temp`                | `unsavedDraft`            |
| `flag`                | `isTimerRunning`          |
| `.filter((e) => ...)` | `.filter((entry) => ...)` |

---

## Imports (MUST)

- All imports at top of file
- No local imports inside functions
- Group: standard library → third-party → internal modules

```typescript
// Standard/built-in
import { onMount, tick } from 'svelte';

// Third-party
import { format } from 'date-fns';

// Internal
import { userStore } from '$lib/stores/user';
import type { TimeEntry } from '$lib/types';
```

---

## No Hardcoded Values (MUST)

### URLs

- Use environment variables (`PUBLIC_API_URL`, etc.)
- Exception: Protocol-relative paths (`/api/...`) are acceptable

### File Paths

- Never hardcode absolute paths
- Use relative paths or path utilities

### Configuration

- No hardcoded secrets, API keys, tokens
- Magic numbers → extract to named constants

```typescript
// ✗ BAD
setTimeout(fn, 5000);

// ✓ GOOD
const DEBOUNCE_MS = 5000;
setTimeout(fn, DEBOUNCE_MS);
```

---

## Documentation (SHOULD)

- Avoid comments that restate obvious code
- Comment intent, edge cases, non-obvious behavior
- No docstrings for small single-purpose functions with self-explanatory names
- Use JSDoc for complex functions (>5 args, complex returns)

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Reactivity Rules, Store Pattern (writableValue)
- **Important:** Component Structure, Accessibility, Keyboard Event Handlers
- **Standard:** Patterns Examples, Documentation
