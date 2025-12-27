# Box: Bugfix

**Risk Class:** low (isolated fix) | medium (affects multiple files) | high (data loss risk)

---

## When to Use

- Fixing broken behavior that previously worked
- Correcting incorrect calculations or logic
- Resolving UI display issues
- Fixing crashes or errors

---

## Acceptance Criteria Format

All acceptance criteria for bugfixes MUST:

- Describe the broken behavior (what happens now)
- Describe the expected behavior (what should happen)
- Include reproduction steps
- Define how to verify the fix

**Example:**
```
AC-001: Bug: Clicking "Save to cloud" while offline shows error toast but also throws unhandled exception
AC-002: Expected: Offline modal appears, no console errors
AC-003: Repro: Toggle airplane mode, click "Save to cloud"
AC-004: Verify: Console shows no errors, modal appears
```

---

## Required Verification Commands

| Command | Required | Notes |
|---------|----------|-------|
| `npm run verify` | ✅ Yes | Format + TypeScript + Lint |
| `npm run test:unit` | ⚠️ If exists | Run existing tests for affected code |
| `npm run test:e2e` | ⚠️ If exists | Run existing E2E for affected flow |
| Browser test (MCP) | ✅ Yes | Verify fix in browser |

---

## Evidence Bundle Requirements

- [ ] Box type: `bugfix`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] Bug description (what was broken)
- [ ] Root cause identified
- [ ] Fix description (what was changed)
- [ ] Changed files list (should be minimal)
- [ ] `npm run verify` output
- [ ] Regression test (new or existing)
- [ ] Before/after comparison (if visual)

---

## High-Risk Escalation

If risk class is **high** (data loss, auth, payments):

- [ ] Create backup/rollback plan before applying fix
- [ ] Test with real data (not just test fixtures)
- [ ] Verify no side effects on related features
- [ ] Add regression test to E2E suite

---

## Common Failure Patterns

| Pattern | Prevention |
|---------|------------|
| Fixing symptoms not cause | Use ZOOM_OUT protocol after 2 failed attempts |
| Over-engineering the fix | Prefer minimal 1-3 line fixes |
| Breaking other code | Run full test suite |
| Missing regression test | Add test that would have caught this bug |
| Same bug returns | Document in LEARNINGS-INBOX.md |

---

## Bugfix Discipline

1. **Isolate first:** Confirm exact reproduction steps
2. **Minimal fix:** Change as few lines as possible
3. **Root cause:** Fix the source, not the symptom
4. **Regression test:** Ensure bug cannot return
5. **Document:** Log in CHANGELOG with bug description
