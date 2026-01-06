# PWA Update Fix & Version Automation

**Chat Date/Time:** 2025-12-23T06:28:00Z (estimated start)
**Generated At:** 2025-12-24T03:17:00Z
**Chat topic:** Fix PWA update button not appearing by ensuring sw.js changes bytewise on each build, then automate version increment on every git commit via pre-commit hook
**Workflow used:** UNKNOWN

**Related Docs:**

- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: NONE
- Other referenced docs: DevFramework/ToolSetup
  Framework/DeveloperGuidesAndStandards
  /SVELTEKIT_PWA_ADDENDUM.md, static/sw.js, scripts/update-version.js, netlify.toml

## Decisions (aus Chat)

- D1: Use sw.template.js approach instead of modifying sw.js directly — Reason: Avoids dirty working tree by generating sw.js during build from template — Evidence: User request "the user wants to implement a clean fix" and "rename static/sw.js to static/sw.template.js"
- D2: Embed BUILD_ID marker (version + buildTime) in sw.js first line — Reason: Forces bytewise difference on every build so browser detects new Service Worker — Evidence: "The core problem is that static/sw.js does not change between deployments, preventing the browser from detecting a new Service Worker"
- D3: Auto-increment version on every commit via pre-commit hook — Reason: User wants version to increase with each commit, not just on deployment — Evidence: User chose option "2" (pre-commit hook) when asked
- D4: Make setup-hooks.js exit gracefully (code 0) when .git/hooks missing — Reason: Netlify CI doesn't have .git/hooks, causing build failure — Evidence: Netlify error log "Error: .git/hooks directory not found. Is this a git repository?"

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)

- NONE — no spec/plan/tasks created or modified

### Code Delta (nur aus Chat)

- static/sw.js → static/sw.template.js — renamed, added BUILD_ID marker line at top — Evidence: "Rename static/sw.js to static/sw.template.js (keep content identical) and ensure the first line is: // **BUILD_ID** = "dev""
- .gitignore — added static/sw.js to ignore generated file — Evidence: "Add to .gitignore: # Generated service worker (built from sw.template.js) static/sw.js"
- scripts/update-version.js — extended to read sw.template.js, replace BUILD_ID marker, write sw.js — Evidence: "Update scripts/update-version.js: Read static/sw.template.js, replace the marker line with: // **BUILD_ID** = "<version>-<buildTime>""
- scripts/pre-commit — created shell script that runs update-version.js and stages files — Evidence: Chat shows creation of pre-commit hook
- scripts/setup-hooks.js — created to install pre-commit hook to .git/hooks/ — Evidence: Chat shows creation and execution of setup-hooks.js
- package.json — added setup-hooks script and modified prepare script — Evidence: "Add setup-hooks script and run it on npm install via prepare"
- scripts/setup-hooks.js — changed exit(1) to exit(0) when .git/hooks missing — Evidence: "Exit gracefully with code 0 when .git/hooks is missing (CI environment like Netlify)"

### Repo-Verified Delta (optional, getrennt!)

- static/sw.template.js — exists with BUILD_ID marker on line 1 — Evidence: read_file showed "// **BUILD_ID** = "dev"" at line 1
- .gitignore — contains "static/sw.js" at line 28 — Evidence: read_file showed entry at line 28
- scripts/update-version.js — imports existsSync, reads swTemplatePath, writes swJsPath — Evidence: read_file lines 1, 9-10, 46-60
- scripts/pre-commit — exists in scripts/ directory — Evidence: write_to_file created file
- scripts/setup-hooks.js — exists and exits with code 0 when hooksDir missing — Evidence: read_file lines 18-20 show "process.exit(0)"
- package.json — contains "setup-hooks" script at line 11 — Evidence: edit tool updated package.json
- static/version.json — version is "1.0.0.24", buildTime is "2025-12-23T07:08:53.537Z" — Evidence: cascade-output.txt showed this content

## Verification (strict)

- Claimed in chat:
  - npm run verify — Result: PASS — Evidence: cascade-output.txt "Verification complete: ALL PASSED"
  - git commit (with pre-commit hook) — Result: PASS (version incremented from 1.0.0.23 to 1.0.0.24) — Evidence: cascade-output.txt showed version.json content after commit
  - node scripts/setup-hooks.js — Result: PASS — Evidence: cascade-output.txt "Git pre-commit hook installed successfully"
- Verified now in repo (static only):
  - static/sw.template.js exists with BUILD_ID marker — Evidence: file content read shows line 1 contains marker
  - .gitignore contains static/sw.js entry — Evidence: file content read shows line 28
  - scripts/setup-hooks.js exits with code 0 when .git/hooks missing — Evidence: file content shows process.exit(0) at line 20

## Bugs / Issues mentioned

- B1: PWA update button never appears — Cause: sw.js never changes bytewise between builds, browser doesn't detect new Service Worker — Fix: Generate sw.js from template with BUILD_ID marker containing version + buildTime — Status: DONE — Evidence: User initial request "Fix PWA Update Button" and root cause analysis
- B2: Netlify build fails with "Error: .git/hooks directory not found" — Cause: setup-hooks.js exits with code 1 when .git/hooks missing in CI — Fix: Changed to exit(0) with log message — Status: DONE — Evidence: User provided Netlify error log and fix was implemented

## Follow-ups

- F1: Test PWA update flow end-to-end on deployed Netlify site after next deployment — Owner: User — Priority: High
- F2: Verify pre-commit hook works correctly on next local commit — Owner: User — Priority: Medium
- F3: Consider if version should only increment on deployment (npm run build) instead of every commit — Owner: User — Priority: Low

## Tags

tags: pwa, service-worker, update-detection, version-automation, git-hooks, pre-commit, netlify

## Confidence

- Medium (implementation details are clear from chat, but end-to-end PWA update flow not verified in production)
