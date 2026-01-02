# Cross-Browser Testing with Playwright

This document describes how to run cross-browser tests using Playwright in this repo, including Safari/WebKit, Chrome, and mobile device emulation.

## Two Testing Modes

1. **Automated E2E Tests** - Fast, headless tests via `npm run test:webkit` and `npm run test:ios`
2. **Interactive MCP Browser** - Cascade controls a real WebKit browser window for manual verification

## Prerequisites

The cascade-watcher must be running (for automated tests):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/cascade-watcher.ps1
```

## Step A: Install WebKit Browser

Write this command to `scripts/cascade-command.txt`:

```
powershell -ExecutionPolicy Bypass -File scripts/install-playwright-webkit.ps1
```

Or run directly in terminal:

```powershell
npx playwright install webkit
```

## Step B: Run Tests

### Available npm Scripts

| Script                   | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `npm run test:webkit`    | Run all e2e tests on Desktop Safari (WebKit)   |
| `npm run test:ios`       | Run all e2e tests on Mobile Safari (iPhone 13) |
| `npm run test:webkit:ui` | Open Playwright UI for webkit tests            |
| `npm run test:ios:ui`    | Open Playwright UI for Mobile Safari tests     |

### Via Watcher Commands

Write any of these to `scripts/cascade-command.txt`:

**Headless (CI-style):**

```
npx playwright test --project=webkit
```

```
npx playwright test --project="Mobile Safari"
```

**Headed (visible browser):**

```
npx playwright test --headed --project=webkit
```

```
npx playwright test --headed --project="Mobile Safari"
```

**UI Mode (interactive debugging):**

```
npx playwright test --ui --project=webkit
```

```
npx playwright test --ui --project="Mobile Safari"
```

## Playwright Config

The projects are defined in `playwright.config.ts`:

- **chromium** - Desktop Chrome (default)
- **webkit** - Desktop Safari
- **Mobile Safari** - iPhone 13 viewport/user-agent

## MCP Playwright with WebKit (Interactive Testing)

Cascade can use the MCP Playwright tools to interactively test the app in WebKit. This requires configuring the MCP server to use WebKit instead of the default Chromium.

### First-time Setup (Step by Step)

1. **Open Windsurf Settings** → gear icon → "Windsurf Settings"
2. **Search "MCP"** → click "Open MCP Marketplace"
3. **Search "Playwright"** → click on "Playwright" (Official) → click "Install"
4. **Edit the config file** at `C:\Users\<USERNAME>\.codeium\windsurf\mcp_config.json`
5. **Add `"--browser", "webkit"`** to the args array (see config below)
6. **First use**: If WebKit browser is not installed, Cascade will call `browser_install` automatically

### Configuration File

Location: `C:\Users\<USERNAME>\.codeium\windsurf\mcp_config.json`

**Full Multi-Browser Configuration (recommended):**

```json
{
	"mcpServers": {
		"playwright-webkit": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "webkit"],
			"command": "npx",
			"disabled": false,
			"env": {}
		},
		"playwright-chrome": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "chrome"],
			"command": "npx",
			"disabled": false,
			"env": {}
		},
		"playwright-mobile-safari": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "webkit", "--device", "iPhone 15"],
			"command": "npx",
			"disabled": false,
			"env": {}
		},
		"playwright-chrome-4k": {
			"args": [
				"-y",
				"@playwright/mcp@latest",
				"--browser",
				"chrome",
				"--viewport-size",
				"3840x2160"
			],
			"command": "npx",
			"disabled": false,
			"env": {}
		},
		"playwright-android": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "chrome", "--device", "Pixel 7"],
			"command": "npx",
			"disabled": false,
			"env": {}
		}
	}
}
```

### MCP Tool Mapping

When multiple Playwright MCP servers are configured, Windsurf maps them to prefixed tool names:

| MCP Server                 | Tool Prefix      | Description               |
| -------------------------- | ---------------- | ------------------------- |
| `playwright-webkit`        | `mcp0_browser_*` | Desktop Safari (WebKit)   |
| `playwright-chrome`        | `mcp1_browser_*` | Desktop Chrome            |
| `playwright-mobile-safari` | `mcp2_browser_*` | iPhone 15 (Mobile Safari) |
| `playwright-chrome-4k`     | `mcp3_browser_*` | Chrome 4K (3840x2160)     |
| `playwright-android`       | `mcp4_browser_*` | Pixel 7 (Android Chrome)  |

**Note:** The "duplicate tool name" warning is expected and can be ignored.

### Troubleshooting

**"Invalid JSON in MCP config file" error:**

- The config file may have encoding issues (BOM from PowerShell)
- Solution: Delete the file, reinstall Playwright from MCP Marketplace, then manually edit

**"Browser specified in your config is not installed" error:**

- Cascade will automatically call `browser_install` to fix this
- Or manually run: `npx playwright install webkit`

**MCP tools not available after restart:**

- Check MCP Marketplace shows "Playwright" under "Installed MCPs"
- Verify the config file exists and has valid JSON
- Try disabling and re-enabling the MCP server

### Usage

Once configured, Cascade can use MCP browser tools (`browser_navigate`, `browser_click`, `browser_snapshot`, etc.) to interactively test the app in a real WebKit browser window.

**Available browser arguments:**

- `--browser webkit` - Desktop Safari
- `--browser firefox` - Firefox
- `--browser chrome` - Chrome (default)
- `--device "iPhone 15"` - Mobile device emulation (combine with `--browser webkit`)

## Cross-Browser UI Test Checklist

When testing across different browsers and viewports, verify these aspects:

### Font Rendering

- [ ] Text is readable and properly anti-aliased
- [ ] German umlauts (ä, ö, ü) display correctly
- [ ] Numbers align properly in tables/summaries

### Wide Screen (4K / Large Monitors)

- [ ] Content is centered and not stretched edge-to-edge
- [ ] Max-width constraints are respected (600px for main content)
- [ ] Navigation stays accessible
- [ ] No excessive whitespace that looks broken

### Mobile Responsiveness

- [ ] Navigation tabs fit and are tappable
- [ ] Forms are usable (inputs not too small)
- [ ] Dialogs/modals fit within viewport
- [ ] Text doesn't overflow containers
- [ ] Touch targets are adequately sized (44px minimum)

### Browser-Specific Issues

- [ ] WebKit: Check date inputs, flexbox layouts
- [ ] Chrome: Check scrollbar styling
- [ ] Mobile: Check viewport meta, zoom behavior

## Verification

Check Playwright version:

```
npx playwright --version
```

List installed browsers:

```
npx playwright install --help
```
