# New Task Workflow Creation

**Chat Date/Time:** 2025-12-23 00:07 UTC+01:00
**Generated At:** 2025-12-24T03:16:00Z
**Chat topic:** User requested analysis of workflows/rules and creation of a new `/new-task` workflow for ad-hoc tasks after project completion
**Workflow used:** UNKNOWN

**Related Docs:**
- Spec: NONE
- Plan: NONE
- Tasks: NONE
- Progress: Docs/IMPLEMENTATION_PROGRESS.md (not mentioned in chat, but implied context: 100% complete)
- Other referenced docs: 
  - .windsurf/workflows/continue-work.md
  - .windsurf/workflows/project-start.md
  - .windsurf/workflows/read-core-docs-and-code.md
  - .windsurf/workflows/read-governance.md
  - .windsurf/workflows/rules-read-all.md
  - .windsurf/rules/COMMAND_EXECUTION_RULES.md
  - .windsurf/rules/code-quality-rules.md
  - .windsurf/rules/implementation-specification-rules.md
  - .windsurf/rules/ui-design-rules.md
  - .windsurf/cascade.md

## Decisions (aus Chat)

- D1: Create new `/new-task` workflow for ad-hoc tasks — Reason: User completed all tasks in IMPLEMENTATION_PROGRESS.md and needs lighter workflow than `/continue-work` which searches for tasks and reads entire codebase — Evidence: "da ich jetzt den Progress Tracker schon implementation-progress.md komplett 100% fertig habe und keine weiteren Tasks drin stehen, brauche ich nur noch ein Workflow"
- D2: New workflow reads only rules + governance docs, not entire codebase — Reason: Faster startup, reads code only on-demand via code_search/grep_search — Evidence: "nur die Guidelines, Die wichtig sind, um einfach eine neue Aufgabe zu bekommen"
- D3: Include mandatory verification steps in `/new-task` workflow — Reason: User requested same testing workflow as `/continue-work` after task completion — Evidence: "Bitte inkludiere in den Workflow New Task auch Docs, die sagen, dass nach einer Task auch getestet werden muss"

## Deltas

### Spec/Plan/Tasks Delta (nur aus Chat)
- NONE — No spec/plan/tasks created, only workflow file

### Code Delta (nur aus Chat)
- .windsurf/workflows/new-task.md — Created new workflow file with rules/governance loading + optional doc loading + mandatory verification steps — Evidence: Cascade created file in response to user request

### Repo-Verified Delta (optional, getrennt!)
- .windsurf/workflows/new-task.md — File exists with 61 lines — Evidence: File created during chat session
- .windsurf/workflows/continue-work.md — File exists, reads all rules + governance + core docs + entire codebase, searches IMPLEMENTATION_PROGRESS.md for next task — Evidence: Read in chat
- .windsurf/workflows/project-start.md — File exists, orchestrates 3 sub-workflows — Evidence: Read in chat
- .windsurf/workflows/read-core-docs-and-code.md — File exists, reads all Guidelines + entire src/ + e2e/ + config files — Evidence: Read in chat
- .windsurf/workflows/read-governance.md — File exists, reads INDEX.md + AGENTS.md + cascade.md + IMPL_SPEC_RULES — Evidence: Read in chat
- .windsurf/workflows/rules-read-all.md — File exists, reads all .windsurf/rules/*.md files — Evidence: Read in chat

## Verification (strict)

- Claimed in chat:
  - NONE — No commands executed, no tests run
- Verified now in repo (static only):
  - .windsurf/workflows/new-task.md exists with 61 lines — Evidence: File created during session
  - Workflow includes sections: "Cascade Workflow", "Optional doc loading", "After task completion (mandatory)", "Report format" — Evidence: File content from edit operation

## Bugs / Issues mentioned

- NONE

## Follow-ups

- F1: User should test `/new-task` workflow in next chat session to verify it works as expected — Owner: User — Priority: Med
- F2: Consider if Docs/Devlog/INDEX.md separator line needs to be added (file already has separator) — Owner: Cascade — Priority: Low
- F3: Monitor if `/new-task` workflow needs adjustments based on actual usage patterns — Owner: User — Priority: Low

## Tags

- tags: [workflow, windsurf, new-task, ad-hoc, rules, governance, verification, testing, docs]

## Confidence

- High (User request was clear, workflow structure follows existing patterns, verification steps copied from COMMAND_EXECUTION_RULES.md)
