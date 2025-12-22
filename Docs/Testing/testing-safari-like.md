# Safari-like Testing with Playwright WebKit

This document describes how to run Safari/WebKit-based tests using Playwright in this repo.

## Prerequisites

The cascade-watcher must be running:

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

## Verification

Check Playwright version:

```
npx playwright --version
```

List installed browsers:

```
npx playwright install --help
```
