# Box: Infra/Build

**Risk Class:** low (docs/config) | medium (build/deps) | high (CI/deploy)

---

## When to Use

- Build configuration changes (vite.config.ts, svelte.config.js)
- Dependency updates (package.json)
- CI/CD pipeline changes
- Tooling scripts (scripts/ folder)
- Development environment setup
- Documentation updates

---

## Acceptance Criteria Format

All acceptance criteria for infra/build MUST:

- Specify what command/process is affected
- Define success condition (exit code, output)
- Include rollback procedure for high-risk

**Example:**

```
AC-001: Add `ai:log-event` script to package.json
AC-002: Running `npm run ai:log-event -- --help` exits with code 0
AC-003: Script creates JSONL file in scripts/CascadeAgentTools/logs/
AC-004: Existing `npm run verify` still passes
```

---

## Required Verification Commands

| Command             | Required            | Notes                   |
| ------------------- | ------------------- | ----------------------- |
| `npm run verify`    | ✅ Yes              | Must not break existing |
| `npm run build`     | ⚠️ If build touched | Production build works  |
| `npm run test:unit` | ⚠️ If deps changed  | Tests still pass        |
| `npm run test:e2e`  | ⚠️ If deps changed  | E2E still works         |

---

## Evidence Bundle Requirements

- [ ] Box type: `infra-build`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] What was changed (config, deps, scripts)
- [ ] `npm run verify` output
- [ ] New command outputs (if adding scripts)
- [ ] Build output (if build config changed)
- [ ] Dependency diff (if package.json changed)

---

## High-Risk Escalation

If risk class is **high** (CI/deploy changes):

- [ ] Test locally with production build: `npm run build && npm run preview`
- [ ] Document rollback procedure
- [ ] Test deployment to staging first
- [ ] Verify PWA still works (service worker, manifest)

---

## Common Failure Patterns

| Pattern                                | Prevention                    |
| -------------------------------------- | ----------------------------- |
| Breaking existing scripts              | Run all scripts after changes |
| Dependency conflicts                   | Use `npm ls` to check tree    |
| Build works locally, fails in CI       | Test with clean `npm ci`      |
| Forgetting to commit package-lock.json | Always commit lock file       |
| Undocumented scripts                   | Add to README or Docs         |

---

## Infra Discipline

1. **Test locally first:** Run the exact commands that CI will run
2. **Minimal changes:** One concern per commit
3. **Document:** Update README or Docs for new scripts
4. **Lock files:** Always commit package-lock.json
5. **Backwards compatible:** Don't rename existing scripts
