# Playwright WebKit & Safari Testing Setup

**Chat Date/Time:** 2025-12-22 09:42 (UTC+01:00)
**Generated At:** 2025-12-24 04:11 (UTC+01:00)
**Chat topic:** Enable Safari-like testing by adding Playwright WebKit + Mobile Safari projects and integrating with cascade-watcher workflow
**Workflow used:** /new-task

**Related Docs:**

- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: NONE
- Other referenced docs: `scripts/cascade-watcher.ps1`, `Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/testing-safari-like.md` (created)

## Decisions (aus Chat)

- D1: Add three Playwright projects (chromium, webkit, Mobile Safari) to enable cross-browser testing — Reason: User requested Safari-like testing capability for PWA validation — Evidence: User request "Enable Safari-like testing in this repo by adding Playwright WebKit + 'Mobile Safari' projects"

- D2: Use cascade-watcher.ps1 workflow for command execution instead of direct terminal commands — Reason: Cascade cannot run terminal commands directly; repo uses watcher pattern for autonomous command execution — Evidence: User request explicitly states "wiring them into our existing cascade-watcher.ps1 workflow (Cascade cannot run terminal commands directly)"

- D3: Create dedicated install script (install-playwright-webkit.ps1) following repo conventions — Reason: Maintain consistency with existing scripts (verify-code.ps1) and enable idempotent installation — Evidence: User request Step 1 "Create/extend a PowerShell script... named scripts/install-playwright-webkit.ps1"

- D4: Add npm scripts for webkit and Mobile Safari testing — Reason: Provide convenient shortcuts for common test commands — Evidence: User request Step 3 "Add npm scripts (optional but recommended)"

- D5: Create runbook documentation in Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/ folder — Reason: Document exact watcher-triggered commands for future reference — Evidence: User request Step 4 "output a short 'Runbook' in a markdown file, e.g. docs/testing-safari-like.md"

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- NONE — No spec/plan/tasks created (ad-hoc task)

### Code Delta (nur aus Chat)

- `scripts/install-playwright-webkit.ps1` — Created new PowerShell script for WebKit installation (idempotent, follows repo conventions with Set-Location to project root) — Evidence: Chat implementation step

- `playwright.config.ts` — Added devices import and three projects: chromium (Desktop Chrome), webkit (Desktop Safari), Mobile Safari (iPhone 13) — Evidence: Chat implementation step

- `package.json` — Added four npm scripts: test:webkit, test:ios, test:webkit:ui, test:ios:ui — Evidence: Chat implementation step

- `Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/testing-safari-like.md` — Created runbook with watcher commands, npm scripts reference, and verification steps — Evidence: Chat implementation step (user moved from Docs/ to Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/)

### Repo-Verified Delta (optional, getrennt!)

- `scripts/install-playwright-webkit.ps1` — File exists at path — Evidence: File created during chat session

- `playwright.config.ts` — Contains three projects (chromium, webkit, Mobile Safari) with devices import — Evidence: File modified during chat session

- `package.json` — Contains test:webkit, test:ios, test:webkit:ui, test:ios:ui scripts — Evidence: File modified during chat session

- `Docs/DevFramework/ToolSetup
Framework/NewFeatureTesting
/testing-safari-like.md` — File exists (user moved it to Testing folder) — Evidence: User action log shows file move

## Verification (strict)

- Claimed in chat:
  - `npx playwright --version` — Result: PASS (v1.57.0) — Evidence: cascade-output.txt showed "Version 1.57.0"
  - `npx playwright install webkit` — Result: PASS (exit code 0) — Evidence: cascade-output.txt showed exit code 0
  - `npx playwright test --project=webkit --list` — Result: PASS (9 tests found) — Evidence: cascade-output.txt listed 9 tests from basic-flow.test.ts and milestone1.test.ts
  - `npx playwright test --project="Mobile Safari" --list` — Result: PASS (9 tests found) — Evidence: cascade-output.txt listed 9 tests with [Mobile Safari] prefix

- Verified now in repo (static only):
  - Playwright v1.57.0 is installed as devDependency — Evidence: package.json line 25 shows "@playwright/test": "^1.57.0"
  - WebKit project configured in playwright.config.ts — Evidence: playwright.config.ts lines 11-14
  - Mobile Safari project configured in playwright.config.ts — Evidence: playwright.config.ts lines 15-18

## Bugs / Issues mentioned

- NONE

## Follow-ups

- F1: Run actual e2e tests on webkit/Mobile Safari projects (not just --list) to verify full functionality — Owner: User — Priority: Med

- F2: Consider adding webkit/Mobile Safari to CI pipeline if automated testing is desired — Owner: User — Priority: Low

- F3: Test PWA-specific features (offline, install prompt, etc.) on Mobile Safari to validate iOS behavior — Owner: User — Priority: Med

## Tags

tags: playwright, webkit, safari, ios, testing, pwa, browser-automation

## Confidence

- High (all steps were executed via watcher with verified output, files created/modified as specified, user confirmed functionality)
