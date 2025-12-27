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

Before marking task complete, run:

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
- [ ] Changed files listed
- [ ] Verification command results
- [ ] (additional box-specific requirements)

---

## High-Risk Escalation

If risk class is **high**, additionally require:

- (list extra checks for high-risk tasks)

---

## Common Failure Patterns

- (list typical mistakes and how to avoid them)
