# Testing Rules (Project-Specific)

**Trigger:** Running Playwright tests, browser testing, or test verification

---

## Canary

**When you read this file, output exactly:**

> [CANARY] project-specific testing rules loaded

---

## Test Account Conventions

### Default Test Account

**Always use `TEST_EMAIL` (whizzysimon@gmail.com) unless explicitly told otherwise.**

Available test accounts in `.env.local`:

| Variable                         | Email                      | Purpose                                    |
| -------------------------------- | -------------------------- | ------------------------------------------ |
| `TEST_EMAIL` / `TEST_PASSWORD`   | whizzysimon@gmail.com      | **Default** — use for all standard testing |
| `TEST_EMAIL2` / `TEST_PASSWORD2` | samuel.gross.000@gmail.com | Secondary — multi-user scenarios only      |
| `TEST_EMAIL3` / `TEST_PASSWORD3` | Kristallkind00@gmail.com   | Tertiary — multi-user scenarios only       |

**When to use TEST_EMAIL2/3:**

- Explicitly requested by user
- Testing multi-user features (sharing, collaboration, etc.)
- Testing account switching

---

## Login Flow

### Standard Login Process

1. Navigate to `http://localhost:5173`
2. Wait 2 seconds for app initialization (IndexedDB, categories)
3. If login required, use credentials from `.env.local`
4. Verify login success before proceeding with tests

---

## App-Specific Test Patterns

### Dev Server Requirement

**Always verify dev server is running before Playwright tests:**

- App runs on `http://localhost:5173`
- Start with: `npm run dev`
- Browser navigation will fail with `ERR_CONNECTION_RESET` if server isn't running

### Wait Times

- **After navigation:** 2 seconds (app initialization)
- **After user actions:** 1 second (state updates)
- **After API calls:** Check network requests for completion

---

## Verification Checklist

When testing, always verify:

- [ ] Dev server is running
- [ ] Using correct test account (TEST_EMAIL by default)
- [ ] Console has no errors (check with `mcp0_browser_console_messages()`)
- [ ] Network requests succeeded (check with `mcp0_browser_network_requests()`)

---
