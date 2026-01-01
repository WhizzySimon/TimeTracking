# Frontend UX Standards

**Trigger:** When working on UI (.svelte files, user flows, interactions)

---

## Canary

**When you read this file, output exactly:**

> [CANARY] frontend-ux-standards loaded

---

## Minimal Interruption Principle (MUST)

**The user should feel safe. Assume success, never imply failure.**

### Core Philosophy

- Users should trust that operations succeed silently
- Dialogs/notifications imply "something might be wrong" — avoid this feeling
- Only interrupt the user for **critical, irreversible decisions**

### When to Show a Dialog (MUST)

- Destructive actions requiring confirmation (delete, clear all)
- Irreversible changes that cannot be undone
- Critical errors that block the user from continuing

### When NOT to Show a Dialog (SHOULD)

- Success confirmations ("Saved successfully!") — just save silently
- Informational messages ("Sync complete") — use subtle indicators
- Warnings that don't require action — handle gracefully in code
- Errors that can be auto-recovered — retry silently

### Alternatives to Dialogs (SHOULD)

- **Subtle status indicators** (icons, colors) for sync/save state
- **Inline feedback** (field turns green on valid input)
- **Toast notifications** only for truly important, non-blocking info
- **Undo functionality** instead of "Are you sure?" confirmations
- **Silent retry** for transient errors

---

## Required States for Data-Driven Views (MUST)

Every view that displays data MUST handle these states:

| State       | Requirement                                                         |
| ----------- | ------------------------------------------------------------------- |
| **Loading** | Show spinner or skeleton; never blank screen                        |
| **Empty**   | Show helpful message + primary action if applicable                 |
| **Error**   | Show user-friendly message + recovery option                        |
| **Success** | For mutations: subtle feedback or silent (per minimal interruption) |

---

## Error Prevention Before Error Messages (SHOULD)

Prevent errors before they happen:

- Disable invalid options rather than allowing selection + error
- Use input constraints (min/max, pattern) before validation
- Show real-time validation hints during input
- Provide sensible defaults to reduce user decisions

---

## User Control and Freedom (MUST/SHOULD)

### Cancel/Escape (MUST)

- All dialogs closeable via Escape key
- All multi-step flows have a "Cancel" or "Back" option
- Users can exit any state without data loss (or with clear warning)

### Safe Exits (SHOULD)

- Warn before navigating away with unsaved changes
- Auto-save drafts when possible
- Prefer "Discard changes?" over blocking navigation

### Avoid Irreversible Actions (SHOULD)

- Prefer soft-delete over hard-delete when possible
- Provide undo for recent actions
- For truly irreversible actions: require explicit confirmation with action-specific label

---

## Forms UX Baseline (MUST)

### Validation Timing

- Validate on blur (when user leaves field), not on every keystroke
- Show errors after first submission attempt, then validate on change
- Never block typing while validating

### Inline Errors

- Display error message directly below/beside the field
- Use consistent error styling (color, icon)
- Clear error when user corrects the input

### Required vs Optional

- Mark required fields clearly (asterisk or "Required" label)
- Or mark optional fields if most are required
- Never leave ambiguous

### Field Grouping

- Group related fields visually (fieldset, spacing)
- Use logical tab order within groups
- Provide section headers for long forms

---

## Dialog Usage Rules (SHOULD)

### Blocking Dialogs Only When Necessary

Use blocking (modal) dialogs only for:

- Potential data loss (unsaved changes)
- Destructive action confirmation
- Critical errors requiring immediate attention

### Non-Blocking for Everything Else

Use non-blocking patterns for:

- Success feedback → silent or inline
- Informational messages → toast or banner
- Optional actions → dropdown menu or inline UI

---

## Error Handling Pattern (MUST)

**Auto-retry before giving up. Never show error dialogs for recoverable failures.**

```typescript
async function doOperation(retryCount = 0) {
	const MAX_RETRIES = 3;
	const RETRY_DELAY_MS = 500;
	try {
		await operation();
	} catch (error) {
		console.error(`Failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
		if (retryCount < MAX_RETRIES - 1) {
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
			return doOperation(retryCount + 1);
		}
		// Only after all retries fail: show subtle error indicator
		console.error('Failed after all retries');
	}
}
```

### Rules

- 3 retries with 500ms delay between attempts
- Log to console for debugging, never show dialog for recoverable errors
- User can retry manually by repeating the action if all retries fail
- Show inline error state only after exhausting retries

---

## Dialog Responsiveness (MUST)

### Immediate Close on Confirmation

**Dialogs must close immediately after the user clicks the confirm button.**

- Close the dialog BEFORE starting async operations
- Set `showDialog = false` as the first line in the handler
- Never wait for API calls or database operations before closing

**Why:** Delayed closing creates uncertainty. Users expect immediate feedback. A dialog that stays open after clicking "Confirm" makes users worry something went wrong.

```typescript
// ✓ Good - close immediately
async function handleConfirm() {
	showDialog = false; // Close first
	await performOperation(); // Then do work
}

// ✗ Bad - user waits anxiously
async function handleConfirm() {
	await performOperation(); // User stares at open dialog
	showDialog = false; // Finally closes
}
```

---

## Layout Stability (MUST)

### No Jumping Elements

**UI elements must not jump or shift when content loads asynchronously.**

- Reserve space for content that loads async (use min-height, skeleton loaders)
- Avoid inserting elements that push other content down
- Use CSS `contain: layout` for isolated sections when appropriate

**Why:** Jumping elements irritate users and can cause mis-clicks. When a button moves as the user is about to click, they may click the wrong thing.

### Techniques

1. **Skeleton loaders** - Show placeholder shapes matching final content size
2. **Fixed heights** - Use min-height for containers that will receive async content
3. **Absolute positioning** - For overlays/tooltips that shouldn't affect layout
4. **Content placeholders** - Reserve space with invisible placeholders

```css
/* Reserve space for async content */
.async-container {
	min-height: 200px; /* Prevents collapse while loading */
}

/* Skeleton loader example */
.skeleton {
	background: linear-gradient(
		90deg,
		var(--surface) 25%,
		var(--surface-hover) 50%,
		var(--surface) 75%
	);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
}
```

---
