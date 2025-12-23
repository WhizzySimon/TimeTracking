# TimeTracker Theming Guide

This document explains how the theme system works and how to add new themes.

## Overview

The app uses CSS custom properties (design tokens) for consistent theming. Two independent settings are available:

### Color Themes
- **Cool** (default) - Blue-based color scheme
- **Warm** - Orange/brown-based color scheme

### Shape Styles
- **Sharp** (Eckig) - Minimal rounding for a modern, angular look
- **Soft** (Rund, default) - Generous rounding for a friendly, approachable look

Users can mix and match color themes with shape styles (e.g., Warm + Sharp, Cool + Soft).

## Architecture

### Files

| File                               | Purpose                                          |
| ---------------------------------- | ------------------------------------------------ |
| `src/lib/styles/theme.css`         | All CSS token definitions (colors + shapes)      |
| `src/lib/stores/theme.ts`          | Theme & shape stores with localStorage           |
| `src/routes/+layout.svelte`        | Theme/shape initialization on app startup        |
| `src/routes/settings/+page.svelte` | Theme and shape selector UI                      |

### How It Works

1. Color theme stored in localStorage under key `timetracker-theme`
2. Shape style stored in localStorage under key `timetracker-shape`
3. On app startup, `initTheme()` loads both and applies to `<html data-theme="..." data-shape="...">`
4. Color tokens are scoped to `[data-theme="cool"]` and `[data-theme="warm"]`
5. Shape tokens are scoped to `[data-shape="sharp"]` and `[data-shape="soft"]`
6. Components use `var(--token-name)` instead of hardcoded values

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

## Adding a New Shape Style

Add a new shape block in `src/lib/styles/theme.css`:

```css
[data-shape='your-shape'] {
	--r-card: Xpx;
	--r-btn: Xpx;
	--r-pill: Xpx;
	--r-input: Xpx;
	--r-tab: Xpx;
	--r-modal: Xpx;
	--r-banner: Xpx;
}
```

Then update `src/lib/stores/theme.ts`:
1. Add to `ShapeValue` type: `'sharp' | 'soft' | 'your-shape'`
2. Update `loadShape()` to recognize the new value

## Token Reference

### Shape Tokens (vary by data-shape)

| Token        | Sharp | Soft  | Usage                    |
| ------------ | ----- | ----- | ------------------------ |
| `--r-card`   | 4px   | 18px  | Cards, sections          |
| `--r-btn`    | 4px   | 22px  | Buttons                  |
| `--r-pill`   | 4px   | 20px  | Pills, toggles           |
| `--r-input`  | 4px   | 12px  | Input fields, selects    |
| `--r-tab`    | 0     | 16px  | Tab navigation bar       |
| `--r-modal`  | 8px   | 20px  | Modal dialogs            |
| `--r-banner` | 4px   | 12px  | Install/update banners   |

### Elevation Tokens (shared)

- `--elev-1` - Subtle shadow for cards
- `--elev-2` - Stronger shadow for modals/dropdowns

### Transition Tokens (shared)

- `--transition-fast` - 0.15s ease
- `--transition-normal` - 0.2s ease

## Best Practices

1. **Never hardcode colors or radii** - Always use `var(--token-name)`
2. **Use semantic tokens** - Prefer `--pos`/`--neg` over specific colors
3. **Test all combinations** - Verify changes look good in Cool/Warm × Sharp/Soft
4. **Keep contrast** - Ensure text is readable on all backgrounds
5. **Add tokens if needed** - If a component needs a special value, add a new token rather than inlining
