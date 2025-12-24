# Devlog Canonical Tags

All devlog entries MUST use tags from this list. Use 3–7 tags per entry.

## Core Tags

| Tag | Description |
|-----|-------------|
| `ui` | User interface changes |
| `ux` | User experience improvements |
| `pwa` | Progressive Web App (manifest, service worker, install) |
| `auth` | Authentication, session management |
| `supabase` | Supabase integration |
| `sync` | Cloud sync, conflict detection |
| `indexeddb` | Local database, persistence |
| `routing` | Navigation, routes, URL handling |
| `settings` | Settings page, preferences |
| `import` | Data import functionality |
| `export` | Data export functionality |
| `reporting` | Analysis, statistics, reports |
| `testing` | Test infrastructure, test utilities |
| `playwright` | E2E tests, browser automation |
| `workflow` | Development workflow, processes |
| `docs` | Documentation changes |
| `bugfix` | Bug fixes |
| `refactor` | Code refactoring |
| `infra` | Infrastructure, build, CI/CD |
| `ci` | Continuous integration |

## Quality Tags

| Tag | Description |
|-----|-------------|
| `regression` | Regression fix or prevention |
| `flaky` | Flaky test investigation/fix |
| `verification` | Verification process, checks |
| `security` | Security-related changes |
| `performance` | Performance improvements |
| `accessibility` | Accessibility (a11y) improvements |

## Platform Tags

| Tag | Description |
|-----|-------------|
| `ios` | iOS-specific |
| `android` | Android-specific |
| `windows` | Windows-specific |
| `safari` | Safari browser |
| `chrome` | Chrome browser |
| `edge` | Edge browser |
| `webkit` | WebKit engine |

## Fallback

| Tag | Description |
|-----|-------------|
| `misc` | Use only if no other tag fits |

---

## Rules

1. **3–7 tags per devlog entry** — not fewer, not more
2. **Tags must be from this list** — if none fit, use `misc`
3. **Format in INDEX.md**: comma-separated, no brackets (e.g., `ui, ux, bugfix`)
4. **Case**: always lowercase
