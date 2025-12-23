# TimeTracker Theming Guide

This document explains how the theme system works and how to add new themes.

## Overview

The app uses CSS custom properties (design tokens) for consistent theming. Two themes are available:

- **Cool** (default) - Blue-based color scheme
- **Warm** - Orange/brown-based color scheme

## Architecture

### Files

| File                               | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `src/lib/styles/theme.css`         | All CSS token definitions                 |
| `src/lib/stores/theme.ts`          | Theme store with localStorage persistence |
| `src/routes/+layout.svelte`        | Theme initialization on app startup       |
| `src/routes/settings/+page.svelte` | Theme selector UI                         |

### How It Works

1. Theme is stored in localStorage under key `timetracker-theme`
2. On app startup, `initTheme()` loads the saved theme and applies it to `<html data-theme="...">`
3. CSS tokens are scoped to `[data-theme="cool"]` and `[data-theme="warm"]`
4. Components use `var(--token-name)` instead of hardcoded colors

## Adding a New Theme

### Step 1: Define Theme Tokens

Add a new theme block in `src/lib/styles/theme.css`:

```css
[data-theme='your-theme'] {
	/* Background colors */
	--bg: #...;
	--surface: #...;
	--surface-hover: #...;
	--surface-active: #...;

	/* Text colors */
	--text: #...;
	--text-secondary: #...;
	--muted: #...;

	/* Brand/accent */
	--accent: #...;
	--accent-hover: #...;
	--accent-light: rgba(...);

	/* Semantic colors */
	--pos: #...;
	--pos-light: rgba(...);
	--neg: #...;
	--neg-light: rgba(...);
	--warning: #...;
	--warning-light: rgba(...);

	/* Borders */
	--border: #...;
	--border-light: rgba(...);

	/* Header/Nav specific */
	--header-bg: #...;
	--header-text: #...;
	--header-text-muted: rgba(...);
	--header-border: rgba(...);

	/* Nav tabs */
	--nav-bg: #...;
	--nav-text: rgba(...);
	--nav-text-active: #...;
	--nav-active-bg: rgba(...);

	/* Buttons */
	--btn-primary-bg: #...;
	--btn-primary-text: #...;
	--btn-primary-hover: #...;
	--btn-secondary-bg: #...;
	--btn-secondary-text: #...;
	--btn-secondary-border: #...;
	--btn-secondary-hover: #...;
	--btn-danger-bg: #...;
	--btn-danger-text: #...;
	--btn-danger-hover: #...;

	/* Inputs */
	--input-bg: #...;
	--input-border: #...;
	--input-focus-border: #...;
	--input-text: #...;
	--input-placeholder: #...;

	/* Cards */
	--card-bg: #...;
	--card-border: #...;
	--card-hover-border: #...;

	/* Summary bar */
	--summary-bg: #...;
	--summary-label: #...;
	--summary-value: #...;
}
```

### Step 2: Update Theme Store

In `src/lib/stores/theme.ts`:

1. Add the new theme to the `ThemeValue` type:

   ```typescript
   export type ThemeValue = 'cool' | 'warm' | 'your-theme';
   ```

2. Update the `loadTheme()` function to recognize the new value:
   ```typescript
   if (stored === 'cool' || stored === 'warm' || stored === 'your-theme') {
   	return stored;
   }
   ```

### Step 3: Add UI Option

In `src/routes/settings/+page.svelte`, add a new button in the theme toggle:

```svelte
<button
	class="theme-option"
	class:active={currentTheme === 'your-theme'}
	onclick={() => handleThemeChange('your-theme')}
>
	Your Theme
</button>
```

## Token Reference

### Shape Tokens (shared)

- `--r-card` - Card border radius (18px)
- `--r-btn` - Button border radius (22px)
- `--r-pill` - Pill/toggle border radius (20px)
- `--r-input` - Input border radius (8px)

### Elevation Tokens (shared)

- `--elev-1` - Subtle shadow for cards
- `--elev-2` - Stronger shadow for modals/dropdowns

### Transition Tokens (shared)

- `--transition-fast` - 0.15s ease
- `--transition-normal` - 0.2s ease

## Best Practices

1. **Never hardcode colors** - Always use `var(--token-name)`
2. **Use semantic tokens** - Prefer `--pos`/`--neg` over specific colors
3. **Test both themes** - Verify changes look good in Cool and Warm
4. **Keep contrast** - Ensure text is readable on all backgrounds
5. **Add tokens if needed** - If a component needs a special color, add a new token rather than inlining
