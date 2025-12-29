# Centralized Follow-Up Tracker

All follow-ups extracted from devlog entries. Default status is OPEN unless explicitly marked DONE in the source DL.

| FollowUpID          | SourceDL         | Priority | Owner        | Status | Description                                                                              |
| ------------------- | ---------------- | -------- | ------------ | ------ | ---------------------------------------------------------------------------------------- |
| FU-20251224-0324-01 | DL-20251224-0324 | High     | User         | OPEN   | Install @sveltejs/adapter-static package                                                 |
| FU-20251224-0324-02 | DL-20251224-0324 | High     | User         | OPEN   | Run npm run build and npm run preview to test PWA                                        |
| FU-20251224-0324-03 | DL-20251224-0324 | Low      | User         | DONE   | Replace placeholder PNG icons with proper app icons                                      |
| FU-20251224-0324-04 | DL-20251224-0324 | Low      | User         | DONE   | Delete helper scripts (create-pwa-icons.ps1, create-icons.js)                            |
| FU-20251224-0336-01 | DL-20251224-0336 | High     | User         | OPEN   | Start fresh implementation chat with Opus model                                          |
| FU-20251224-0336-02 | DL-20251224-0336 | High     | Cascade      | OPEN   | Complete Task 0 (setup testing infrastructure with Vitest)                               |
| FU-20251224-0336-03 | DL-20251224-0336 | Med      | User         | OPEN   | Verify .windsurf/cascade.md auto-loads in new Cascade chat session                       |
| FU-20251224-0336-04 | DL-20251224-0336 | Med      | Cascade      | OPEN   | Test workflow enforcement (rules-read-all, read-core-docs-and-code) in new chat          |
| FU-20251224-0336-05 | DL-20251224-0336 | High     | Cascade      | OPEN   | Implement 60 tasks from Docs/Features/Tasks/timetracker-v1-implementation.md             |
| FU-20251224-0339-01 | DL-20251224-0339 | Low      | User         | OPEN   | Commit changes to git                                                                    |
| FU-20251224-0339-02 | DL-20251224-0339 | Med      | User         | OPEN   | Test /project-start workflow in new chat session                                         |
| FU-20251224-0339-03 | DL-20251224-0339 | Low      | User         | OPEN   | Consider extracting .windsurf folder as template for other projects                      |
| FU-20251224-0344-01 | DL-20251224-0344 | Med      | User/Cascade | OPEN   | Test Playwright MCP browser tools in next session to verify setup persists               |
| FU-20251224-0344-02 | DL-20251224-0344 | Low      | Cascade      | OPEN   | Consider creating E2E tests for future features using established Playwright setup       |
| FU-20251224-0344-03 | DL-20251224-0344 | Med      | Cascade      | OPEN   | Verify COMMAND_EXECUTION_RULES.md is loaded via /rules-read-all workflow in next session |
| FU-20251224-0350-01 | DL-20251224-0350 | High     | Cascade      | OPEN   | Start Phase 2 Task 2.1 (Tab Navigation)                                                  |
| FU-20251224-0350-02 | DL-20251224-0350 | Low      | User         | OPEN   | Delete empty scripts/ folder if not needed                                               |
| FU-20251224-0350-03 | DL-20251224-0350 | High     | User         | OPEN   | Test /continue-work workflow in new chat                                                 |
| FU-20251224-0353-01 | DL-20251224-0353 | Med      | User         | OPEN   | Manual testing checklist (production build, PWA installation)                            |
| FU-20251224-0353-02 | DL-20251224-0353 | Med      | User         | OPEN   | Deploy v1 to server for phone testing                                                    |
| FU-20251224-0353-03 | DL-20251224-0353 | Low      | User         | OPEN   | Consider v2 features (user asked about v2 planning)                                      |
| FU-20251224-0355-01 | DL-20251224-0355 | High     | User         | OPEN   | Use AGENTS.md for project-level Cascade instructions                                     |
| FU-20251224-0355-02 | DL-20251224-0355 | Med      | User         | OPEN   | Manually edit .windsurf/rules/ files when needed                                         |
| FU-20251224-0355-03 | DL-20251224-0355 | Low      | User         | OPEN   | Consider keeping source rules in Docs/DevFramework/ToolSetup                             |

Framework/DeveloperGuidesAndStandards
/ and manually copying to .windsurf/rules/ |
| FU-20251224-0358-01 | DL-20251224-0358 | Med | User/Cascade | OPEN | Continue with Phase 4 (Sync & Polish) |
| FU-20251224-0358-02 | DL-20251224-0358 | Low | User | OPEN | No v2 discussion in this chat |
| FU-20251224-0358-03 | DL-20251224-0358 | Low | Cascade | OPEN | Work time model validFrom displays in ISO format (minor UX: could format as German date) |
| FU-20251224-0403-01 | DL-20251224-0403 | Low | User | OPEN | Cascade cannot close IDE tabs (manual workaround: Ctrl+K, V) |
| FU-20251224-0403-02 | DL-20251224-0403 | Med | Cascade | OPEN | Consider adding Playwright UI verification to standard task workflow |
| FU-20251224-0403-03 | DL-20251224-0403 | High | Cascade | OPEN | Phase 3 Week Tab implementation (next tasks) |
| FU-20251224-0405-01 | DL-20251224-0405 | High | Cascade | OPEN | Implement Task 2.4 (calculation utility functions) |
| FU-20251224-0405-02 | DL-20251224-0405 | High | Cascade | OPEN | Continue with remaining Phase 2 tasks (InlineSummary component, etc.) |
| FU-20251224-0405-03 | DL-20251224-0405 | Low | User/Cascade | OPEN | Consider documenting watcher system limitations/troubleshooting |
| FU-20251224-0408-01 | DL-20251224-0408 | Med | User | OPEN | Fix COMMAND_EXECUTION_RULES.md step order contradiction (lines 299-308) |
| FU-20251224-0408-02 | DL-20251224-0408 | Low | User | OPEN | Add Documentation Style rule to code-quality-rules.md (no fenced code blocks in .windsurf/rules/) |
| FU-20251224-0408-03 | DL-20251224-0408 | High | Cascade | OPEN | Continue with Task 4.5 (Create sync status indicator component) in next chat |
| FU-20251224-0408-04 | DL-20251224-0408 | Low | User | OPEN | Consider adding Error Handling Pattern section to ui-design-rules.md with code example |
| FU-20251224-0411-01 | DL-20251224-0411 | Med | User | OPEN | Run actual e2e tests on webkit/Mobile Safari projects (not just --list) to verify full functionality |
| FU-20251224-0411-02 | DL-20251224-0411 | Low | User | OPEN | Consider adding webkit/Mobile Safari to CI pipeline if automated testing is desired |
| FU-20251224-0411-03 | DL-20251224-0411 | Med | User | OPEN | Test PWA-specific features (offline, install prompt, etc.) on Mobile Safari to validate iOS behavior |
| FU-20251224-0412-01 | DL-20251224-0412 | High | User | OPEN | Replace mock auth with real backend API |
| FU-20251224-0412-02 | DL-20251224-0412 | High | User | OPEN | Add environment variables for API endpoints (VITE_API_URL, etc.) |
| FU-20251224-0412-03 | DL-20251224-0412 | High | User | OPEN | Implement actual password reset email flow on backend |
| FU-20251224-0412-04 | DL-20251224-0412 | Med | Cascade | OPEN | Add e2e tests for auth flows (login, signup, logout) |
| FU-20251224-0412-05 | DL-20251224-0412 | Low | User | OPEN | Consider adding OAuth providers (Google, GitHub) in future |
| FU-20251224-0415-e2e-01 | DL-20251224-0415-e2e | Low | Cascade | OPEN | Consider adding data-testid to other critical UI elements proactively |
| FU-20251224-0415-e2e-02 | DL-20251224-0415-e2e | Low | User | OPEN | Document data-testid naming conventions in testing guidelines |
| FU-20251224-0415-e2e-03 | DL-20251224-0415-e2e | Med | Cascade | OPEN | Review other E2E tests for potential brittleness with text-based selectors |
| FU-20251224-0415-mcp-01 | DL-20251224-0415-mcp | Low | User | OPEN | Document why MCP Playwright sometimes uninstalls itself |
| FU-20251224-0415-mcp-02 | DL-20251224-0415-mcp | Low | User | OPEN | Consider adding Firefox to MCP config for even broader cross-browser coverage |
| FU-20251224-0415-mcp-03 | DL-20251224-0415-mcp | Med | User | OPEN | Test app on actual iOS/Android devices (not just emulation) |
| FU-20251224-0415-pwa-01 | DL-20251224-0415-pwa | High | User | OPEN | Test install button on Android Chrome after deployment |
| FU-20251224-0415-pwa-02 | DL-20251224-0415-pwa | High | User | OPEN | Test update banner when new SW version is deployed |
| FU-20251224-0415-pwa-03 | DL-20251224-0415-pwa | Med | User | OPEN | Verify iOS Safari standalone detection works correctly |
| FU-20251224-0416-analysis-01 | DL-20251224-0416-analysis | High | User | OPEN | User needs to create WorkTimeModel with validFrom: 2024-01-01 to test 2024 data |
| FU-20251224-0416-analysis-02 | DL-20251224-0416-analysis | High | Cascade | OPEN | Verify calculation with real 2024 data after WorkTimeModel is created |
| FU-20251224-0416-analysis-03 | DL-20251224-0416-analysis | Low | Cascade | OPEN | Consider handling multiple WorkTimeModels across a date range (currently uses model at range start) |
| FU-20251224-0416-new-task-01 | DL-20251224-0416-new-task | Med | User | OPEN | User should test /new-task workflow in next chat session to verify it works as expected |
| FU-20251224-0416-new-task-02 | DL-20251224-0416-new-task | Low | Cascade | OPEN | Consider if Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/INDEX.md separator line needs to be added (file already has separator) |
| FU-20251224-0416-new-task-03 | DL-20251224-0416-new-task | Low | User | OPEN | Monitor if /new-task workflow needs adjustments based on actual usage patterns |
| FU-20251224-0416-ui-01 | DL-20251224-0416-ui | Low | Cascade | OPEN | Consider adding E2E test for week type selector behavior across week navigation |
| FU-20251224-0416-ui-02 | DL-20251224-0416-ui | Low | Cascade | OPEN | Consider documenting ISO week year calculation edge cases in date utils |
| FU-20251224-0417-pwa-01 | DL-20251224-0417-pwa | High | User | OPEN | Test PWA update flow end-to-end on deployed Netlify site after next deployment |
| FU-20251224-0417-pwa-02 | DL-20251224-0417-pwa | Med | User | OPEN | Verify pre-commit hook works correctly on next local commit |
| FU-20251224-0417-pwa-03 | DL-20251224-0417-pwa | Low | User | OPEN | Consider if version should only increment on deployment (npm run build) instead of every commit |
| FU-20251224-0417-shape-01 | DL-20251224-0417-shape | High | User | OPEN | Monitor production deployment to confirm favicon no longer flips on live site |
| FU-20251224-0417-shape-02 | DL-20251224-0417-shape | Low | Cascade | OPEN | Consider removing unused src/lib/assets/favicon.svg file since it's no longer referenced |
| FU-20251224-0417-shape-03 | DL-20251224-0417-shape | Med | User | OPEN | Verify all icon files are correctly generated with proper dimensions and content |
| FU-20251224-0417-ui-01 | DL-20251224-0417-ui | Low | User | OPEN | Consider removing timestamp display from other areas if mobile UX is priority |
| FU-20251224-0417-ui-02 | DL-20251224-0417-ui | Med | User | OPEN | Test collapsible sections UX on mobile devices to validate persistent summary pattern |
| FU-20251224-0417-ui-03 | DL-20251224-0417-ui | High | User | OPEN | Verify Excel import auto-create categories works with real Excel files |
| FU-20251224-0418-sync-01 | DL-20251224-0418-sync | High | User | OPEN | Manual E2E testing of all sync scenarios (fresh install, conflict, upload, restore, noop) |
| FU-20251224-0418-sync-02 | DL-20251224-0418-sync | Med | Cascade | OPEN | Update IMPLEMENTATION_PROGRESS.md with completed tasks |
| FU-20251224-0418-sync-03 | DL-20251224-0418-sync | Low | User | OPEN | Consider adding sync status indicator beyond button state |
| FU-20251224-0418-free-01 | DL-20251224-0418-free | Low | User | OPEN | Free/Pro-Limitierung implementieren (wenn entschieden) |
| FU-20251224-0418-free-02 | DL-20251224-0418-free | Low | Cascade | OPEN | Spec für Free/Pro-Tier erstellen (falls Implementierung gewünscht) |
| FU-20251224-0418-free-03 | DL-20251224-0418-free | Low | Cascade | OPEN | UI-Anpassungen für gesperrte Features (Paywall-Screens) |
| FU-20251224-0418-quick-01 | DL-20251224-0418-quick | High | User | OPEN | Begin implementation of Task 7.1 (Frequency Utils) in new chat session |
| FU-20251224-0418-quick-02 | DL-20251224-0418-quick | Med | Cascade | OPEN | Verify Phase numbering discrepancy (chat mentions Phase 7, but IMPLEMENTATION_PROGRESS.md shows Phase 8) |
| FU-20251224-0418-quick-03 | DL-20251224-0418-quick | High | User | OPEN | User should start new chat with /continue-work workflow |
| FU-20251224-0419-header-01 | DL-20251224-0419-header | Low | Cascade | OPEN | Consider if AddTaskModal.svelte local roundToFiveMinutes should be removed or kept for UI consistency |
| FU-20251224-0419-header-02 | DL-20251224-0419-header | Low | Cascade | OPEN | Verify Excel import also benefits from centralized rounding (uses saveTimeEntry) |
| FU-20251224-0419-header-03 | DL-20251224-0419-header | Med | User | OPEN | Document architectural decision about data-layer normalization in technical guidelines |
| FU-20251224-0419-plus-01 | DL-20251224-0419-plus | High | Cascade | OPEN | Implement Phase 8 tasks 8.1-8.8 (Plus-Tab route, CategoryList, Ein-Klick-Start logic, Navigation, Default-Tab, Cleanup, E2E tests) |
| FU-20251224-0419-plus-02 | DL-20251224-0419-plus | Low | User | OPEN | User asked about communicating Phase 8 location to another chat |
| FU-20251224-0419-plus-03 | DL-20251224-0419-plus | Med | Cascade | OPEN | Verify /continue-work workflow can find Phase 8 tasks automatically |
| FU-20251224-0419-smart-01 | DL-20251224-0419-smart | High | Cascade | OPEN | Implement Task 8.1 (Plus-Tab Route erstellen) |
| FU-20251224-0419-smart-02 | DL-20251224-0419-smart | High | Cascade | OPEN | Implement Task 8.2 (Smart Suggestions Algorithmus) with unit tests |
| FU-20251224-0419-smart-03 | DL-20251224-0419-smart | Med | User | OPEN | Verify algorithm with real user data after implementation |

---

## Summary

- **Total Follow-ups:** 84
- **High Priority:** 28
- **Medium Priority:** 31
- **Low Priority:** 25
- **Status OPEN:** 82
- **Status DONE:** 2
