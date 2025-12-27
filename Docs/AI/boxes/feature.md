# Box: Feature

**Risk Class:** medium (default) | high (if touching auth, payments, data model)

---

## When to Use

- New user-facing functionality
- New screens, components, or routes
- New API endpoints
- Extending existing features with new capabilities

---

## Acceptance Criteria Format

All acceptance criteria for features MUST:

- Be user-observable (what the user sees/does)
- Include specific UI states (loading, success, error)
- Define edge cases (empty state, max limits)
- Map to testable assertions

**Example:**
```
AC-001: User can click "Export" button on Settings page
AC-002: Export dialog shows format options (JSON, CSV, PDF)
AC-003: Clicking "Download" generates file with correct format
AC-004: Error toast appears if export fails
```

---

## Required Verification Commands

| Command | Required | Notes |
|---------|----------|-------|
| `npm run verify` | ✅ Yes | Format + TypeScript + Lint |
| `npm run test:unit` | ✅ Yes | If feature has logic |
| `npm run test:e2e` | ✅ Yes | For user flows |
| Browser test (MCP) | ✅ Yes | Visual verification |

---

## Evidence Bundle Requirements

- [ ] Box type: `feature`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] Acceptance criteria with pass/fail status
- [ ] Changed files list
- [ ] `npm run verify` output (ALL PASSED)
- [ ] Unit test results (if applicable)
- [ ] E2E test results
- [ ] Screenshot or browser snapshot
- [ ] Spec/Plan reference links

---

## High-Risk Escalation

If risk class is **high** (auth, payments, data model):

- [ ] Review data migration strategy
- [ ] Check for backwards compatibility
- [ ] Test on multiple browsers (Chrome, Safari, Mobile)
- [ ] Verify offline behavior (PWA)
- [ ] Document rollback procedure

---

## Common Failure Patterns

| Pattern | Prevention |
|---------|------------|
| Missing loading states | Always add loading UI before async |
| Forgetting error handling | Every async must have try/catch with user feedback |
| Breaking existing tests | Run full test suite before commit |
| Scope creep | Stick to spec; log new ideas for future |
| Skipping mobile test | Always check 375px viewport |
