# Devlog Canonical Tags

All devlog entries MUST use tags from this list. Use 3–7 tags per entry.

## Core Tags

| Tag          | Description                                             |
| ------------ | ------------------------------------------------------- |
| `ui`         | User interface changes                                  |
| `ux`         | User experience improvements                            |
| `pwa`        | Progressive Web App (manifest, service worker, install) |
| `auth`       | Authentication, session management                      |
| `supabase`   | Supabase integration                                    |
| `sync`       | Cloud sync, conflict detection                          |
| `indexeddb`  | Local database, persistence                             |
| `routing`    | Navigation, routes, URL handling                        |
| `settings`   | Settings page, preferences                              |
| `import`     | Data import functionality                               |
| `export`     | Data export functionality                               |
| `reporting`  | Analysis, statistics, reports                           |
| `testing`    | Test infrastructure, test utilities                     |
| `playwright` | E2E tests, browser automation                           |
| `workflow`   | Development workflow, processes                         |
| `docs`       | Documentation changes                                   |
| `bugfix`     | Bug fixes                                               |
| `refactor`   | Code refactoring                                        |
| `infra`      | Infrastructure, build, CI/CD                            |
| `ci`         | Continuous integration                                  |

## Quality Tags

| Tag             | Description                       |
| --------------- | --------------------------------- |
| `regression`    | Regression fix or prevention      |
| `flaky`         | Flaky test investigation/fix      |
| `verification`  | Verification process, checks      |
| `security`      | Security-related changes          |
| `performance`   | Performance improvements          |
| `accessibility` | Accessibility (a11y) improvements |

## Platform Tags

| Tag       | Description      |
| --------- | ---------------- |
| `ios`     | iOS-specific     |
| `android` | Android-specific |
| `windows` | Windows-specific |
| `safari`  | Safari browser   |
| `chrome`  | Chrome browser   |
| `edge`    | Edge browser     |
| `webkit`  | WebKit engine    |

## Fallback

| Tag    | Description                   |
| ------ | ----------------------------- |
| `misc` | Use only if no other tag fits |

---

## In-use Tags (Repo-derived)

Tags currently used in devlogs but not in canonical categories above. Organized by theme.

### Process / Workflow

| Tag                 | Description                     |
| ------------------- | ------------------------------- |
| `spec-driven-dev`   | Spec-driven development process |
| `automation`        | Workflow automation             |
| `progress-tracking` | Task/phase progress tracking    |
| `verification`      | Verification process, checks    |
| `command-execution` | Command execution patterns      |
| `governance`        | Governance docs/rules           |
| `naming-convention` | Doc naming conventions          |
| `reorganization`    | Doc/file reorganization         |

### Phases / Milestones

| Tag          | Description            |
| ------------ | ---------------------- |
| `milestone1` | Milestone 1 work       |
| `phase1`     | Phase 1 implementation |
| `phase2`     | Phase 2 implementation |
| `phase3`     | Phase 3 implementation |
| `phase4`     | Phase 4 implementation |
| `phase5`     | Phase 5 implementation |
| `phase7`     | Phase 7 implementation |
| `phase8`     | Phase 8 implementation |

### Features / Components

| Tag                      | Description                |
| ------------------------ | -------------------------- |
| `categories`             | Category management        |
| `week-tab`               | Week tab feature           |
| `analysis-tab`           | Analysis tab feature       |
| `settings-tab`           | Settings tab feature       |
| `plus-tab`               | Plus tab (quick-start)     |
| `work-time-models`       | Work time model management |
| `cloud-sync`             | Cloud sync feature         |
| `2-way-sync`             | Bidirectional sync         |
| `conflict-detection`     | Sync conflict detection    |
| `smart-suggestions`      | Smart category suggestions |
| `quick-start-ux`         | Quick-start UX feature     |
| `excel-import`           | Excel import feature       |
| `category-import-export` | Category import/export     |

### UI / UX

| Tag                    | Description                |
| ---------------------- | -------------------------- |
| `responsive`           | Responsive design          |
| `polish`               | UI polish/refinement       |
| `navigation`           | Navigation patterns        |
| `dialog`               | Dialog components          |
| `confirm-dialog`       | Confirmation dialogs       |
| `tooltips`             | Tooltip handling           |
| `collapsible`          | Collapsible sections       |
| `design-tokens`        | Design token system        |
| `shape-system`         | Shape/border-radius system |
| `icons`                | Icon handling              |
| `favicon`              | Favicon management         |
| `header`               | Header component           |
| `mobile`               | Mobile-specific            |
| `minimal-interruption` | Minimal interruption UX    |

### Technical / Infrastructure

| Tag                  | Description              |
| -------------------- | ------------------------ |
| `sveltekit`          | SvelteKit framework      |
| `svelte`             | Svelte-specific          |
| `service-worker`     | Service worker           |
| `manifest`           | Web manifest             |
| `adapter-static`     | SvelteKit static adapter |
| `scaffolding`        | Project scaffolding      |
| `setup`              | Setup/configuration      |
| `vitest`             | Vitest unit testing      |
| `e2e`                | End-to-end testing       |
| `data-testid`        | Test ID attributes       |
| `mcp`                | MCP browser tools        |
| `browser-automation` | Browser automation       |
| `cross-browser`      | Cross-browser testing    |
| `4k`                 | 4K resolution testing    |
| `watcher`            | Cascade watcher system   |
| `git`                | Git operations           |
| `git-hooks`          | Git hooks                |
| `pre-commit`         | Pre-commit hooks         |
| `netlify`            | Netlify deployment       |
| `build-process`      | Build process            |
| `version-automation` | Version automation       |
| `update-detection`   | SW update detection      |
| `install-button`     | PWA install button       |
| `update-banner`      | PWA update banner        |
| `mock-api`           | Mock API implementation  |
| `session-management` | Session management       |

### Data / Calculations

| Tag                     | Description             |
| ----------------------- | ----------------------- |
| `stores`                | Svelte stores           |
| `date-utils`            | Date utility functions  |
| `calculation`           | Calculation logic       |
| `weekly-average`        | Weekly average calc     |
| `work-time-model`       | Work time model logic   |
| `iso-week-year`         | ISO week year calc      |
| `time-rounding`         | Time rounding logic     |
| `context-aware`         | Context-aware logic     |
| `algorithm`             | Algorithm design        |
| `data-analysis`         | Data analysis           |
| `frequency-calculation` | Frequency calculation   |
| `data-layer`            | Data layer architecture |
| `architecture`          | Architecture decisions  |

### Tooling / Config

| Tag                | Description             |
| ------------------ | ----------------------- |
| `windsurf`         | Windsurf IDE            |
| `cascade`          | Cascade AI              |
| `modular`          | Modular design          |
| `agents-md`        | AGENTS.md config        |
| `cascade-config`   | Cascade configuration   |
| `testing-strategy` | Testing strategy docs   |
| `reconciliation`   | Doc reconciliation      |
| `investigation`    | Investigation/debugging |
| `permissions`      | Permission issues       |
| `rules`            | Rule files              |
| `code-quality`     | Code quality rules      |
| `ui-testing`       | UI testing patterns     |
| `error-handling`   | Error handling          |
| `auto-retry`       | Auto-retry logic        |
| `new-task`         | New task workflow       |
| `ad-hoc`           | Ad-hoc tasks            |
| `spec`             | Spec documents          |
| `plan`             | Plan documents          |
| `tasks`            | Task documents          |

### Business / Product

| Tag                | Description        |
| ------------------ | ------------------ |
| `analysis`         | Analysis/reporting |
| `business-model`   | Business model     |
| `free-tier`        | Free tier features |
| `pro-tier`         | Pro tier features  |
| `product-strategy` | Product strategy   |

---

## Aliases (optional)

| Alias           | Canonical Tag           |
| --------------- | ----------------------- |
| `a11y`          | `accessibility`         |
| `ui-testing`    | `testing` (UI-specific) |
| `week-selector` | `week-tab`              |

---

## Rules

1. **3–7 tags per devlog entry** — not fewer, not more
2. **Tags must be from this list** — if none fit, use `misc`
3. **Format in INDEX.md**: comma-separated, no brackets (e.g., `ui, ux, bugfix`)
4. **Case**: always lowercase
