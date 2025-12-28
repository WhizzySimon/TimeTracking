# Planning Rules

**Trigger:** Before creating or updating a plan or tasks file

---

## Phase 2: Plan (how)

Goal: Choose architecture/approach and write it down before code.

Location: `Docs/AppDocs/Plans/<feature-slug>.md` or `Docs/DevFramework/Plans/<feature-slug>.md`

### Required Sections

Each plan MUST contain:

- A minimal architecture sketch (components/modules + responsibilities)
- Data model changes (if any)
- UI state model (what state exists, where it lives)
- Error handling strategy
- Performance/UX constraints relevant to the feature
- Testing approach (unit/integration/e2e; what is realistically automatable)

### Checkpoint to Proceed

- [ ] Plan can be executed as tasks without requiring new decisions

---

## Phase 3: Tasks (small, verifiable steps)

Goal: Break plan into reviewable, independently testable units.

Location: `Docs/AppDocs/Tasks/<feature-slug>.md` or `Docs/DevFramework/Tasks/<feature-slug>.md`

### Rules

- Tasks MUST be small (ideally 0.5–2h human-sized)
- Each task MUST include:
  - Files likely touched (best guess)
  - What "done" means (including how to verify)
  - Any guardrails (must not change X, must preserve Y)

### Checkpoint to Proceed

- [ ] No task depends on "figure it out while coding"

---

**Next:** When tasks are defined → Read `Docs/DevFramework/Rules/implementation.md`
