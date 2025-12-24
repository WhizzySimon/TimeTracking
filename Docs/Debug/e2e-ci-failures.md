# E2E CI Failure Diary

Track CI failures to learn from mistakes and prevent recurrence.

## Format

```
### YYYY-MM-DD - [Brief description]
- **Failing tests:** [test names]
- **Root cause:** [1 sentence]
- **Fix:** [1 sentence]
- **Artifact:** [link or filename if available]
```

---

## Entries

### 2024-12-24 - IndexedDB cross-browser timeout

- **Failing tests:** All 37 tests in basic-flow.test.ts, quick-start.test.ts, milestone1.test.ts
- **Root cause:** `indexedDB.databases()` API not supported in WebKit/Safari, causing beforeEach to timeout
- **Fix:** Replaced with `indexedDB.deleteDatabase('timetracker')` which works in all browsers
- **Artifact:** playwright-report from CI run

### 2024-12-24 - CI environment differences

- **Failing tests:** Various flaky failures
- **Root cause:** CI runs on different OS (Windows), different timing, parallel execution exposing state bugs
- **Fix:** Set `workers: 1` in CI, added retries, improved artifact collection
- **Artifact:** N/A (preventive improvement)
