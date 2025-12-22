# Safari-like Testing with Playwright WebKit

This document describes how to run Safari/WebKit-based tests using Playwright in this repo.

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

**For WebKit (Desktop Safari):**

```json
{
	"mcpServers": {
		"mcp-playwright": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "webkit"],
			"command": "npx",
			"disabled": false,
			"env": {}
		}
	}
}
```

**For Mobile Safari (iPhone emulation):**

```json
{
	"mcpServers": {
		"mcp-playwright": {
			"args": ["-y", "@playwright/mcp@latest", "--browser", "webkit", "--device", "iPhone 15"],
			"command": "npx",
			"disabled": false,
			"env": {}
		}
	}
}
```

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

## Verification

Check Playwright version:

```
npx playwright --version
```

List installed browsers:

```
npx playwright install --help
```
