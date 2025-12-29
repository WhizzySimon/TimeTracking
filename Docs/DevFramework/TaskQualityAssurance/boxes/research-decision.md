# Box: Research/Decision

**Risk Class:** low (no code changes) | medium (experimental code)

---

## When to Use

- Investigating options before implementation
- Architecture Decision Records (ADR)
- Spike/proof-of-concept work
- Evaluating libraries or approaches
- Documenting rejected alternatives

---

## Acceptance Criteria Format

All acceptance criteria for research MUST:

- Define the question being answered
- List options considered
- Document decision with rationale
- Capture in appropriate doc (DECISIONS.md, spec, or dedicated doc)

**Example:**

```
AC-001: Question: Which PDF library to use for export?
AC-002: Options evaluated: jspdf, pdfmake, @react-pdf/renderer
AC-003: Decision documented in Docs/DevFramework/DevFramework/FrameworkSelfImprovementLogs
/DECISIONS.md
AC-004: Includes: pros/cons, bundle size, API complexity
```

---

## Required Verification Commands

| Command             | Required    | Notes                           |
| ------------------- | ----------- | ------------------------------- |
| `npm run verify`    | ⚠️ If code  | Only if experimental code added |
| `npm run test:unit` | ❌ No       | Research doesn't need tests     |
| `npm run test:e2e`  | ❌ No       | Research doesn't need tests     |
| Browser test (MCP)  | ⚠️ Optional | Only for UI spikes              |

---

## Evidence Bundle Requirements

- [ ] Box type: `research-decision`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] Question/problem statement
- [ ] Options considered (minimum 2)
- [ ] Decision made
- [ ] Rationale (why this option)
- [ ] Rejected alternatives (why not)
- [ ] Document location (DECISIONS.md or spec)
- [ ] Decision logged in `Docs/DevFramework/DevFramework/FrameworkSelfImprovementLogs
/DECISIONS.md` with ADR format
- [ ] Follow-up tasks identified (if any)

---

## High-Risk Escalation

Research is inherently exploratory; no high-risk escalation needed.

However, if research leads to **implementation**:

- [ ] Create proper spec before coding
- [ ] Switch to appropriate box (feature, refactor, etc.)

---

## Common Failure Patterns

| Pattern                     | Prevention                          |
| --------------------------- | ----------------------------------- |
| Researching too long        | Timebox to 1-2 hours max            |
| Not documenting findings    | Always write DECISIONS.md entry     |
| Jumping to implementation   | Research is for decisions, not code |
| Only considering one option | Always list 2+ alternatives         |
| Forgetting rejected options | Document why NOT as well as why     |

---

## Research Discipline

1. **Timebox:** Set max time before starting (e.g., 1 hour)
2. **Document early:** Write findings as you go
3. **Multiple options:** Always consider 2+ approaches
4. **Capture rejections:** Why NOT is as valuable as why
5. **Clear handoff:** End with actionable next step or decision
