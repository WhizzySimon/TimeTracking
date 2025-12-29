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

| Command             | Required | Notes                      |
| ------------------- | -------- | -------------------------- |
| `npm run verify`    | ✅ Yes   | Format + TypeScript + Lint |
| `npm run test:unit` | ❓       | (depends on box)           |
| `npm run test:e2e`  | ❓       | (depends on box)           |
| Browser test (MCP)  | ❓       | (depends on box)           |

---

## Audit Gate Checklist

Before marking task complete:

- [ ] Evidence Bundle created and **staged** (`Docs/DevFramework/FrameworkSelfImprovementLogs
/Evidence/<task-id>.md`)
- [ ] No unstaged changes (`git diff --name-only` empty)
- [ ] No untracked files (`git ls-files --others --exclude-standard` empty)
- [ ] `/audit` PASS (or FAIL remediated)

**Model switch behavior** (see `Docs/DevFramework/JustInTimeAgentRules/ai-config.json`):

- `switch_model_before_audit=true`: Builder stages and STOPs; user switches to GPT-5.2 Medium Reasoning and runs `/audit`
- `switch_model_before_audit=false`: Builder runs `/audit` itself

---

## High-Risk Escalation

If risk class is **high**, additionally require:

- (list extra checks for high-risk tasks)

---

## Common Failure Patterns

- (list typical mistakes and how to avoid them)
