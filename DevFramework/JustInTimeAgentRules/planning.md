# Planning Rules

**Trigger:** Before creating or updating a plan or tasks file

---

# Critical (Always Apply)

## Phase 2: Plan (how)

Goal: Choose architecture/approach and write it down before code.

Location: `TempAppDevDocs/Features/Plans/<feature-slug>.md` or `DevFramework/FrameworkFeaturePlans
/<feature-slug>.md`  
Template: `TempAppDevDocs/Features/Plans/_template.md` or `DevFramework/FrameworkFeaturePlans
/_template.md`

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

Location: `TempAppDevDocs/Features/Tasks/<feature-slug>.md` or `DevFramework/FrameworkFeatureTasks
/<feature-slug>.md`  
Template: `TempAppDevDocs/Features/Tasks/_template.md` or `DevFramework/FrameworkFeatureTasks
/_template.md`

### Rules

- Tasks MUST be small (ideally 0.5–2h human-sized)
- Each task MUST include:
  - Files likely touched (best guess)
  - What "done" means (including how to verify)
  - Any guardrails (must not change X, must preserve Y)

### Checkpoint to Proceed

- [ ] No task depends on "figure it out while coding"

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Checkpoint to Proceed (both phases)
- **Important:** Required Sections (Plan), Task Rules
- **Standard:** Location/Template references

---

**Next:** When tasks are defined → Read `DevFramework/JustInTimeAgentRules/implementation.md`
