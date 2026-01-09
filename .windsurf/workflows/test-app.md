---
description: AI-driven E2E testing - analyzes app, creates temp test spec, runs live tests via Playwright
---

# Test App Workflow

For verifying the app works correctly before/after changes. Creates temporary test specs, executes them live.

---

## Model Recommendation

**Recommended:** Opus 4 (4x credits)

**Why:** E2E testing requires good judgment for test case design, handling async operations, and debugging test failures. Opus provides better reliability for Playwright interactions.

**Upgrade to Opus 4 Thinking (5x):** If tests fail unexpectedly and root cause is unclear.

---

## When to Use

- **Before major changes:** Baseline what works
- **After major changes:** Verify nothing broke
- **On-demand QA:** Full app verification
- **Visual audit:** Check styling consistency

---

## Step 0: Setup

1. Ensure dev server is running (`npm run dev`)
2. Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md` (JIT trigger table)
3. Read `DevFramework/JustInTimeAgentRules/mindset.md` (testing mindset)
4. Read `DevFramework/JustInTimeAgentRules/ProjectSpecific/testing.md` for test account info

---

## Step 1: Create Test Spec

**Agent creates:** `TempAppDevDocs/TestRuns/TEST-<date>-<purpose>.md`

Example: `TEST-2026-01-04-pre-design-system-refactor.md`

### Spec Template:

```markdown
# Test Run: <purpose>

**Date:** <date>
**Type:** [ ] Pre-change baseline / [ ] Post-change verification / [ ] Full QA
**Trigger:** <what prompted this test run>

## Scope

### 1. Functional Tests

#### Authentication

- [ ] Login with valid credentials
- [ ] Login error shows German message
- [ ] Logout works
- [ ] Password visibility toggle

#### Navigation

- [ ] All tabs load (Day, Week, Month, Add, Analysis)
- [ ] Tab switching works
- [ ] Back/Forward buttons work
- [ ] Date navigation (prev/next day/week/month)

#### Core Features

- [ ] Start a task from Plus-Tab
- [ ] Running task shows warning banner
- [ ] End a running task
- [ ] Resume a completed task
- [ ] Task persists after reload

#### Settings

- [ ] Settings page loads
- [ ] Employer CRUD works
- [ ] Category CRUD works
- [ ] Export dialog opens
- [ ] Buttons styled correctly

#### Data

- [ ] Day view shows entries
- [ ] Week view shows summary
- [ ] Month view shows calendar

### 2. Visual/Styling Tests

#### Design System Consistency

- [ ] Primary buttons: Same blue, same hover effect
- [ ] Secondary buttons: Same border style, same hover
- [ ] Danger buttons: Same red, same hover
- [ ] Header: Consistent background, icon colors
- [ ] Footer tabs: Consistent active/hover states
- [ ] Cards: Consistent borders, shadows, radius

#### Interactive States

- [ ] Hover states visible on all interactive elements
- [ ] Active/pressed states provide feedback
- [ ] Selected states clearly distinguishable
- [ ] Disabled states grayed out

#### Responsive

- [ ] Mobile viewport renders correctly
- [ ] No horizontal scroll
- [ ] Touch targets adequate size

### 3. Console/Network

- [ ] No console errors
- [ ] No failed network requests
- [ ] No warnings (except expected deprecations)

## Results

<!-- Fill during test execution -->

### Passed

-

### Failed

-

### Screenshots

-

## Status: PENDING

<!-- Update to: IN_PROGRESS → PASSED / FAILED -->
```

---

## Step 2: Execute Tests

For each test item in the spec:

1. **Navigate** to relevant page via Playwright
2. **Perform** the action
3. **Verify** expected outcome
4. **Screenshot** if visual test or failure
5. **Mark** checkbox in spec

### Playwright Commands:

- `mcp1_browser_navigate` - Go to URL
- `mcp1_browser_click` - Click element
- `mcp1_browser_snapshot` - Get accessibility tree
- `mcp1_browser_take_screenshot` - Capture visual
- `mcp1_browser_console_messages` - Check for errors
- `mcp1_browser_network_requests` - Check API calls

### Visual Testing Approach:

1. Take screenshot of element/page
2. Describe what you see (colors, spacing, alignment)
3. Compare against design system expectations
4. Note any inconsistencies

---

## Step 3: Report

Update the test spec with:

- All checkboxes marked
- Failed items with details
- Screenshots attached (save to `TempAppDevDocs/TestRuns/screenshots/`)
- Final status

### If Pre-Change Baseline:

- Keep spec for comparison after changes
- Note any existing issues

### If Post-Change Verification:

- Compare against pre-change baseline
- Highlight regressions
- Confirm fixes worked

---

## Step 4: Cleanup

After verification complete:

- If all passed: Archive or delete test spec
- If failures found: Keep spec until issues resolved
- Move to `TempAppDevDocs/Archive/TestRuns/` when done

---

## Quick Test Mode

For fast verification of specific areas:

```
/test-app auth        → Test authentication only
/test-app navigation  → Test navigation only
/test-app settings    → Test settings page only
/test-app visual      → Visual consistency check only
/test-app full        → Complete test suite
```

Agent interprets the scope and creates abbreviated spec.

---

## What to Analyze/Test

| Category          | What to Check                                  |
| ----------------- | ---------------------------------------------- |
| **Functionality** | Features work as expected, user flows complete |
| **Workflows**     | Multi-step processes succeed end-to-end        |
| **Styling**       | Colors, spacing, typography consistent         |
| **States**        | Hover, active, selected, disabled all work     |
| **Feedback**      | User actions produce visible responses         |
| **Errors**        | Error states display correctly                 |
| **Performance**   | Pages load reasonably fast                     |
| **Accessibility** | Elements have proper labels                    |
