# Spec-Driven Development Comparison & Upgrade Blueprint

**Generated:** 2025-12-24T06:15:00+01:00  
**Scope:** WhizzySimon/TimeTracking repository  
**Purpose:** Compare TimeTracker's SDD system against industry best practices and propose concrete upgrades

---

## 1. Current SDD in This Repo (Step-by-Step)

### Entry Points

The system provides three workflow entry points based on context:

| Workflow         | Trigger                           | File                                   |
| ---------------- | --------------------------------- | -------------------------------------- |
| `/project-start` | New session                       | `.windsurf/workflows/project-start.md` |
| `/continue-work` | Resume existing tasks             | `.windsurf/workflows/continue-work.md` |
| `/new-feature`   | New feature requiring spec        | `.windsurf/workflows/new-feature.md`   |
| `/new-task`      | Ad-hoc task, bugfix, small change | `.windsurf/workflows/new-task.md`      |

### 4-Phase Process

**Source:** `AGENTS.md`, `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/SPEC_DRIVEN_DEVELOPMENT.md`

```
Phase 1: SPEC (what/why)
├── Create: Docs/Features/Specs/<feature-slug>.md
├── Template: Docs/Features/Specs/_template.md
├── Required: Goal, Scope, FR/IG/DD, Edge cases, Data & privacy, Acceptance checks
└── Checkpoint: No ambiguous terms, all FR/IG/DD numbered and testable

Phase 2: PLAN (how)
├── Create: Docs/Features/Plans/<feature-slug>.md
├── Required: Architecture, Data model, UI state, Error handling, Testing strategy
└── Checkpoint: Plan executable as tasks without new decisions

Phase 3: TASKS (small steps)
├── Create: Docs/Features/Tasks/<feature-slug>.md
├── Format: Files, Done when, Verify, Guardrails
├── Size: 0.5-2h per task
└── Checkpoint: No task depends on "figure it out while coding"

Phase 4: IMPLEMENT (one task at a time)
├── Code → npm run verify → Unit tests → MCP Playwright UI test
├── Update: Docs/IMPLEMENTATION_PROGRESS.md
├── Commit: git add -A; git commit -m "feat: description"
└── Repeat for next task
```

### Requirement Format (FR/IG/DD)

**Source:** `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`

- **TT-FR-xxx**: Functional Requirements — user-observable behavior
- **TT-IG-xxx**: Implementation Guarantees — constraints that must always hold
- **TT-DD-xxx**: Design Decisions — deliberate choices to lock in

### Verification Gates

**Source:** `.windsurf/rules/COMMAND_EXECUTION_RULES.md`

1. `npm run verify` (format + typecheck + lint)
2. `npm run test:unit` (Vitest)
3. MCP Playwright browser test (UI verification)
4. `npm run test:e2e` (Playwright E2E)

### Documentation Hierarchy

**Source:** `Docs/INDEX.md`

Priority order (0 = highest): 0. `Docs/INDEX.md` (single source of truth)

1. `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/ui-logic-spec-v1.md` (product truth)
2. `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/technical-guideline-v1.md` (architecture)
3. `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/SVELTEKIT_PWA_ADDENDUM.md` (platform)
4. `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/DEVELOPMENT_GUIDELINES.md` (coding rules)
5. `DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` (spec format)
6. `AGENTS.md` (Cascade process rules)

---

## 2. Strengths (Keep These)

| Strength                             | Evidence                     | Why It Works                                     |
| ------------------------------------ | ---------------------------- | ------------------------------------------------ |
| **Explicit priority order**          | `Docs/INDEX.md` lines 7-13   | Eliminates doc conflicts; single source of truth |
| **Numbered requirements (FR/IG/DD)** | `DevFramework/ToolSetup |

Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`   | Traceable, testable, unambiguous                         |
| **Structured devlog format**             | 28 entries in`DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/`with identical template       | Decisions, deltas, verification, follow-ups all captured |
| **Mandatory verification before commit** |`.windsurf/rules/COMMAND_EXECUTION_RULES.md`lines 283-303 | Catches errors before they enter codebase                |
| **Phase-based progress tracking**        |`Docs/IMPLEMENTATION_PROGRESS.md`                         | 94 tasks tracked with checkboxes, visible progress       |
| **Separation of spec/plan/tasks**        |`Docs/Features/Specs/`, `Docs/Features/Plans/`, `Docs/Features/Tasks/`               | Prevents scope creep; each doc has clear purpose         |
| **Workflow automation**                  | 7 workflows in`.windsurf/workflows/`                     | Reduces manual steps; enforces process                   |
| **Canonical tag system**                 |`DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/TAGS.md`                                     | Consistent categorization across 28 devlogs              |
| **Human-in-the-loop checkpoints**        |`AGENTS.md` Phase 1-3 checkpoints | User confirms spec/plan/tasks before implementation |

---

## 3. Failure Modes Observed

### From Devlogs

| Failure Mode                     | Evidence                                               | Impact                                        |
| -------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| **Tag drift**                    | `AUDIT-2025-12-24` found 80+ tags in use vs 35 defined | Inconsistent categorization, harder to search |
| **PARTIAL status entries stuck** | `DL-0408`, `DL-0416` marked PARTIAL with no resolution | Open loops never closed                       |
| **Workflow field UNKNOWN**       | 10/28 devlogs have "Workflow used: UNKNOWN"            | Can't track which workflow was actually used  |
| **Timestamp inconsistency**      | "2025-12-22 UNKNOWN" in `INDEX.md` row 10              | Unsortable, unclear when work happened        |
| **Follow-ups scattered**         | 84 follow-ups across 28 devlogs, no rollup             | Lost items, no visibility into open work      |
| **Phase numbering gaps**         | P01, P06, P07 exist; P02-P05 missing                   | Historical confusion                          |

### From Workflows

| Failure Mode                   | Evidence                                                                                            | Impact                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **Commit step forgotten**      | Memory `066ef418` explicitly warns "most commonly forgotten step"                                   | Uncommitted work lost between sessions |
| **Spec template not enforced** | `Docs/Features/Specs/_template.md` exists but no validation                                         | Some specs missing sections            |
| **Duplicate rules files**      | `implementation-specification-rules.md` in both `.windsurf/rules/` and `DevFramework/ToolSetup |

Framework/DeveloperGuidesAndStandards
/` | Potential drift between copies |

### Where Specs Are Ambiguous

| Issue                              | Example                                     | Fix Needed                     |
| ---------------------------------- | ------------------------------------------- | ------------------------------ |
| **Vague terms without metrics**    | "fast", "simple", "works offline"           | Require measurable definitions |
| **Missing edge cases**             | Some specs lack failure state documentation | Template enforcement           |
| **Acceptance criteria not mapped** | AC-xxx not always linked to FR/IG/DD        | Require explicit mapping       |

### Where Tests Miss Bugs

| Issue                            | Evidence                                                                  | Fix Needed                                        |
| -------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------- |
| **No coverage tracking**         | `AUDIT-2025-12-24` notes "No metric for unit/e2e test coverage per phase" | Add coverage column to progress tracker           |
| **Text-based selectors brittle** | `DL-20251224-0415-e2e` fixed with `data-testid`                           | Proactive data-testid on all interactive elements |

---

## 4. Comparison Matrix

### TimeTracker SDD vs External Sources

| Dimension                | TimeTracker                                                    | GitHub Spec Kit                                                | Anthropic Claude Code                        | OpenAI Agents                    | Microsoft/Copilot SDD                                          |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| **Spec format**          | FR/IG/DD numbered, template-based                              | PRD → Plan → Tasks, template-driven                            | CLAUDE.md per folder, iterative tuning       | Structured outputs (JSON schema) | Constitution + templates                                       |
| **Planning phase**       | Docs/Features/Plans/ with architecture, data model, UI state   | `/speckit.plan` auto-generates from spec                       | "Explore, plan, code, commit" workflow       | Agent loops with guardrails      | Enterprise constitution enforcement                            |
| **Task breakdown**       | Docs/Features/Tasks/ with Files, Done when, Verify, Guardrails | `/speckit.tasks` with parallelization markers `[P]`            | Checklists in Markdown, scratchpads          | Multi-agent handoffs             | Task derivation from contracts                                 |
| **Implementation rules** | No free refactors, minimal diffs, test obligations             | Test-first imperative (Article III), library-first (Article I) | TDD: write tests → confirm fail → implement  | Structured outputs, guardrails   | Constitutional gates (simplicity, anti-abstraction)            |
| **Quality gates**        | npm run verify, MCP Playwright, E2E                            | Pre-Implementation Gates (Phase -1)                            | Course correct early, /clear context         | Input/output guardrails          | Simplicity Gate, Anti-Abstraction Gate, Integration-First Gate |
| **Logging/traceability** | Devlogs with Decisions, Deltas, Follow-ups                     | Living specs in feature branches                               | Conversation history, /clear resets          | Tracing in Agents SDK            | Versioned specs in branches                                    |
| **Human-in-the-loop**    | Phase checkpoints, user confirms spec/plan/tasks               | User reviews before code generation                            | Escape to interrupt, double-Escape to rewind | Human-in-the-loop demos          | Team-reviewed specs, branch merges                             |

### Key Insights from Each Source

#### GitHub Spec Kit

- **Constitution concept**: Immutable principles that govern all generated code (`memory/constitution.md`)
- **Nine Articles**: Library-first, CLI mandate, test-first, simplicity, anti-abstraction, integration-first
- **Phase -1 Gates**: Pre-implementation checkpoints that block progress until satisfied
- **Parallelization markers**: `[P]` in tasks.md for independent tasks

#### Anthropic Claude Code

- **CLAUDE.md hierarchy**: Root, parent, child folders each can have instructions
- **Explore → Plan → Code → Commit**: Explicit workflow with subagent usage
- **TDD with agentic coding**: Write tests → confirm fail → implement → iterate
- **Course correction tools**: Escape, double-Escape, /clear, undo
- **Checklists as scratchpads**: Markdown files for complex multi-step workflows

#### OpenAI Agents

- **Structured outputs**: JSON schema constraints for reliable parsing
- **Guardrails**: Input validation, output validation, jailbreak prevention
- **Tracing**: Built-in monitoring for agent workflows
- **Multi-agent handoffs**: Orchestration patterns for complex tasks

#### Microsoft/Copilot SDD

- **Enterprise focus**: Security, performance, compliance encoded in constitution
- **Intent-first philosophy**: Natural language as lingua franca
- **Living specifications**: Specs stay in sync because they generate code
- **CI/CD integration**: Specs integrated into DevOps pipelines

---

## 5. "Best-of" SDD Blueprint for Cascade

### Spec Format (Merged)

```markdown
# Feature: <name>

## Problem Statement

1-3 sentences describing the problem.

## Scope

- **In scope:** ...
- **Out of scope:** ...

## Functional Requirements (FR)

- **TT-FR-001**: <user-observable behavior>
- **TT-FR-002**: ...

## Implementation Guarantees (IG)

- **TT-IG-001**: <constraint that must always hold>
- **TT-IG-002**: ...

## Design Decisions (DD)

- **TT-DD-001**: <deliberate choice with rationale>
- **TT-DD-002**: ...

## Edge Cases & Failure States

| Scenario | Expected Behavior | FR/IG Reference |
| -------- | ----------------- | --------------- |
| ...      | ...               | TT-FR-001       |

## Data & Privacy

- What is stored, where, retention policy

## Acceptance Checks

| AC-ID  | Criterion | Maps to   | Testable? |
| ------ | --------- | --------- | --------- |
| AC-001 | ...       | TT-FR-001 | Yes       |

## Change Log

| Date       | Change       |
| ---------- | ------------ |
| YYYY-MM-DD | Initial spec |
```

### Planning/Task Breakdown Format (Merged)

**Plan (Docs/Features/Plans/):**

```markdown
## Architecture

- Components, responsibilities, dependencies

## Data Model

- New/changed structures

## UI State Model

- What state exists, where it lives

## Error Handling Strategy

- What can fail, how we respond

## Testing Strategy

- Unit/Integration/E2E coverage targets

## Pre-Implementation Gates (from Spec Kit)

- [ ] Simplicity: ≤3 new files for initial implementation?
- [ ] Anti-abstraction: Using framework directly, no unnecessary wrappers?
- [ ] Integration-first: Contracts defined before implementation?
```

**Tasks (Docs/Features/Tasks/):**

```markdown
## Task X - <description>

- **Files:** `path/to/file.ts`
- **Done when:** Specific, testable criteria
- **Verify:** `npm run verify`, `npm run test:unit`
- **Guardrails:** Must not change X, must preserve Y
- **Parallel:** [P] if independent, blank if sequential
- **Estimated:** 0.5h / 1h / 2h
```

### Implementation Rules (Merged)

1. **No free refactors** — Only refactor if explicitly tasked (`AGENTS.md`)
2. **Minimal diffs** — Prefer small, focused changes (`AGENTS.md`)
3. **Test-first when possible** — Write tests → confirm fail → implement (Anthropic TDD)
4. **Library-first for new modules** — Abstract before integrating (Spec Kit Article I)
5. **Preserve existing behavior** — Unless spec explicitly changes it (`AGENTS.md`)
6. **Update docs if reality differs** — Spec drift is a bug (`AGENTS.md`)

### Quality Gates (Merged)

| Gate                  | When                  | Command/Action                     | Blocks           |
| --------------------- | --------------------- | ---------------------------------- | ---------------- |
| **Format/Lint/Type**  | Every task            | `npm run verify`                   | Commit           |
| **Unit tests**        | Every task with logic | `npm run test:unit`                | Commit           |
| **UI verification**   | Every UI change       | MCP Playwright snapshot            | Commit           |
| **E2E tests**         | End of phase          | `npm run test:e2e`                 | Phase completion |
| **Spec completeness** | Before Phase 2        | Template checklist                 | Plan creation    |
| **Plan gates**        | Before Phase 4        | Pre-Implementation Gates checklist | Implementation   |

### Logging/Traceability (Merged)

1. **Devlog per session** — Decisions, Deltas, Verification, Bugs, Follow-ups
2. **Centralized follow-up tracker** — `DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/FOLLOW-UPS.md` with rollup
3. **Progress tracker** — `Docs/IMPLEMENTATION_PROGRESS.md` with task checkboxes
4. **Commit messages** — Conventional commits with task references

### Human-in-the-Loop Points (Merged)

| Point                   | When                  | What User Does                            |
| ----------------------- | --------------------- | ----------------------------------------- |
| **Spec review**         | After Phase 1         | Confirm FR/IG/DD, edge cases              |
| **Plan review**         | After Phase 2         | Confirm architecture, testing strategy    |
| **Tasks review**        | After Phase 3         | Confirm task breakdown, estimates         |
| **Design/UX decisions** | During implementation | Approve visual changes via MCP screenshot |
| **Acceptance testing**  | End of phase          | Verify acceptance criteria met            |

---

## 6. Concrete Repo Changes (High-Leverage)

### Priority 1: Critical (Do First)

| #   | File Path                    | Exact Change | Status | Why |
| --- | ---------------------------- | ------------ | ------ | --- |
| 1   | `DevFramework/ToolSetup |

Framework/FrameworkSelfImprovementLogs
/FOLLOW-UPS.md`                 | Centralized tracker with 84 follow-ups                                                  | ✅ DONE                         | Single view of all open work; prevents lost follow-ups                  |
| 2   |`Docs/Features/Specs/\_template.md`                   | Add "Completeness Checklist" section at bottom with all required sections as checkboxes | ✅ DONE                         | Self-documenting spec validation                                        |
| 3   |`.windsurf/rules/\*.md`                      | Keep pointer files; canonical rules live in`DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/`                         | ✅ DONE (architecture decision) | Windsurf auto-loads .windsurf/rules/; pointers reference canonical docs |
| 4   |`DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/SPEC_DRIVEN_DEVELOPMENT.md`| Add "Phase -1 / Pre-Implementation Gates" section (≤5 checkboxes)                       | ✅ DONE                         | Catch over-engineering before coding                                    |
| 5   |`Docs/Features/Tasks/\_template.md`                   | Add`**Parallel:** [P] / blank`and`**Estimated:** 0.5h / 1h / 2h` fields | ✅ DONE | Enable parallelization, better planning |

### Priority 2: Important (Do Soon)

| #   | File Path                         | Exact Change                                | Status | Why                          |
| --- | --------------------------------- | ------------------------------------------- | ------ | ---------------------------- |
| 6   | `Docs/IMPLEMENTATION_PROGRESS.md` | Add "Test Coverage" column to phase headers | TODO   | Visibility into testing gaps |
| 7   | `DevFramework/ToolSetup      |

Framework/FrameworkSelfImprovementLogs
/chat-history-analysis.md`| Workflow field from enum`{/project-start, /continue-work, /new-feature, /new-task, NONE}`(no UNKNOWN) | ✅ DONE | Consistent, sortable devlogs                |
| 8   |`AGENTS.md`                           | Add "Phase -1 / Pre-Implementation Gates" section (≤5 checkboxes)                                       | ✅ DONE | Block implementation until gates pass       |
| 9   |`.windsurf/workflows/new-feature.md`  | Add step: "Verify Pre-Implementation Gates pass before starting Task 1"                                 | TODO    | Enforce gates in workflow                   |
| 10  |`DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/TAGS.md` | All in-use tags reconciled | ✅ DONE | 229 lines with comprehensive tag categories |

### Priority 3: Nice-to-Have (Do Later)

| #   | File Path                         | Exact Change                                                | Status  | Why                                  |
| --- | --------------------------------- | ----------------------------------------------------------- | ------- | ------------------------------------ |
| 11  | `scripts/validate-devlog-tags.js` | Script validates DL-\*.md and INDEX.md tags against TAGS.md | ✅ DONE | Automated tag validation (178 lines) |
| 12  | `DevFramework/ToolSetup      |

Framework/FrameworkSelfImprovementLogs
/PHASE-HISTORY.md`   | Create file documenting what P02-P05 covered (retroactive)  | TODO    | Historical clarity                   |
| 13  |`Docs/Features/Plans/\_template.md`        | Add "Pre-Implementation Gates" section with checkboxes      | TODO    | Template enforcement                 |
| 14  |`.windsurf/cascade.md`           | Add "Constitution" section with immutable principles        | TODO    | Architectural discipline             |
| 15  |`scripts/verify-code.ps1`        | Devlog tag validation integrated into`npm run verify` | ✅ DONE | Runs as Step 0 in verify-code.ps1 |

---

## 7. How to Compare with Karsten Repo

### Adding as Second Folder in Windsurf Workspace (Multi-Root)

1. **Clone Karsten repo locally** (if not already present):

   ```bash
   git clone <karsten-repo-url> E:\Private\Dev\Karsten
   ```

2. **Add to Windsurf workspace**:
   - File → Add Folder to Workspace
   - Select `E:\Private\Dev\Karsten`
   - Save workspace as `.code-workspace` file

3. **Verify multi-root setup**:
   - Both folders should appear in Explorer sidebar
   - Each folder has its own `.windsurf/` config (if present)

### Re-Running Analysis

Once Karsten repo is present locally, run the same audit:

1. Read Karsten's equivalent files:
   - `Docs/INDEX.md` or equivalent priority doc
   - `AGENTS.md` or equivalent process doc
   - `DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/` or equivalent logging
   - `.windsurf/workflows/` if present
   - `.windsurf/rules/` if present

2. Apply the same audit template from `AUDIT-2025-12-24__spec-driven-development.md`:
   - System Map
   - Metrics (devlog counts, decisions, follow-ups, tags)
   - Strengths (max 8)
   - Weaknesses (max 10)
   - Quality Gates (existing vs missing)
   - Top 10 Improvements

3. Add appendix section below.

---

## Appendix: TimeTracker vs Karsten SDD

**Status:** PENDING — Karsten repo not present locally

When available, this section will contain:

| Dimension         | TimeTracker                  | Karsten | Winner | Notes |
| ----------------- | ---------------------------- | ------- | ------ | ----- |
| Spec format       | FR/IG/DD                     | TBD     | TBD    |       |
| Planning phase    | 4-phase                      | TBD     | TBD    |       |
| Task breakdown    | Files/Done/Verify/Guardrails | TBD     | TBD    |       |
| Quality gates     | verify + MCP + E2E           | TBD     | TBD    |       |
| Logging           | Devlogs + FOLLOW-UPS         | TBD     | TBD    |       |
| Human-in-the-loop | Phase checkpoints            | TBD     | TBD    |       |

---

## Sources

| Title                                                    | Domain                     | Relevance                                       |
| -------------------------------------------------------- | -------------------------- | ----------------------------------------------- |
| Specification-Driven Development (SDD)                   | github.com/github/spec-kit | Core SDD methodology, commands, constitution    |
| Claude Code: Best practices for agentic coding           | anthropic.com/engineering  | CLAUDE.md, TDD workflow, course correction      |
| Building agents                                          | developers.openai.com      | Structured outputs, guardrails, tracing         |
| Implement Spec-Driven Development using GitHub Spec Kit  | learn.microsoft.com        | Enterprise SDD, constitution, CI/CD integration |
| Diving Into Spec-Driven Development With GitHub Spec Kit | developer.microsoft.com    | BMAD agents, context-engineered development     |

---

_End of comparison document_
