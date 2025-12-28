# Box: <box-name>

**Risk Class:** low | medium | high

---

## When to Use

- (describe typical scenarios for this box type)

---

## Acceptance Criteria Format

All acceptance criteria for this box MUST:

- (list required format/structure for acceptance criteria)

---

## Required Verification Commands

Before marking task complete:

1) Ensure you have a frozen staged snapshot (required for `/audit`):
- No unstaged changes:
  - `git diff --name-only` must be empty
- No untracked files:
  - `git ls-files --others --exclude-standard` must be empty
- Must have staged changes:
  - `git diff --staged --name-only` must be non-empty
- Evidence Bundle must be staged and included in:
  - `git diff --staged --name-only`

2) Run `/audit` and write an Audit Report after the verdict (report does not need to be staged during preconditions).

3) Run verification commands:

| Command             | Required | Notes                      |
| ------------------- | -------- | -------------------------- |
| `npm run verify`    | ✅ Yes   | Format + TypeScript + Lint |
| `npm run test:unit` | ❓       | (depends on box)           |
| `npm run test:e2e`  | ❓       | (depends on box)           |
| Browser test (MCP)  | ❓       | (depends on box)           |

---

## Evidence Bundle Requirements

The evidence bundle MUST include:

- [ ] Box type declared
- [ ] Acceptance criteria listed
- [ ] Planned scope listed (or explicitly "NOT PROVIDED" + risk flag)
- [ ] Preconditions captured (staged snapshot policy):
  - [ ] `git diff --name-only` output pasted (must be empty)
  - [ ] `git ls-files --others --exclude-standard` output pasted (must be empty)
  - [ ] `git diff --staged --name-only` output pasted (must be non-empty)
  - [ ] Evidence Bundle file appears in `git diff --staged --name-only`
- [ ] Frozen snapshot captured (staged-only):
  - [ ] `BASE_HEAD` (`git rev-parse HEAD`) recorded
  - [ ] `STAGED_DIFF_HASH` recorded
  - [ ] `git diff --staged --stat` pasted (recommended)
  - [ ] `git diff --staged` pasted
- [ ] Verification command results (minimum `npm run verify`)
- [ ] Audit Report link added (report generated after verdict; references this bundle; no separate ACP file)
- [ ] (additional box-specific requirements)

---

## High-Risk Escalation

If risk class is **high**, additionally require:

- (list extra checks for high-risk tasks)

---

## Common Failure Patterns

- (list typical mistakes and how to avoid them)
