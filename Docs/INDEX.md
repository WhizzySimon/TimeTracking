# TimeTracker Docs Index (Authoritative)

## Rule

Cascade MUST read this file first. Cascade MUST only treat docs listed here as authoritative.

## Priority order (when conflicts exist)

0. Docs/INDEX.md (this file)
1. Docs/Guidelines/ui-logic-spec-v1.md (product truth)
2. Docs/Guidelines/technical-guideline-v1.md (architecture truth)
3. Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md (platform constraints)
4. Docs/Guidelines/DEVELOPMENT_GUIDELINES.md (coding/repo rules)
5. Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md (how to write specs)
6. AGENTS.md (Cascade process rules)

## Authoritative documents

### Development process (how we work)

- AGENTS.md (repo root)  
  Purpose: spec-driven process, how to plan tasks, how to verify.
- Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md  
  Purpose: **Complete workflow guide** — 4 Phasen, Task-Workflow, Progress Tracking, Commit-Regeln.

### Product spec (what we build)

- Docs/Guidelines/ui-logic-spec-v1.md  
  Purpose: screens, flows, rules, acceptance criteria for the app.

### Architecture & implementation rules

- Docs/Guidelines/technical-guideline-v1.md  
  Purpose: project structure, module boundaries, data model, decisions.
- Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md  
  Purpose: SvelteKit + PWA constraints (offline-first, Safari behavior, etc.)
- Docs/Guidelines/DEVELOPMENT_GUIDELINES.md  
  Purpose: coding standards, practices, guardrails.
- Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
  Purpose: spec writing rules (FR/IG/DD), verification loop, self-documenting requirement.

### Cascade tooling

- Docs/Tooling/BOOTSTRAP.md  
  Purpose: **Single entry point** for all tooling docs. Quick start commands and links.
- Docs/Tooling/CASCADE_WATCHER.md  
  Purpose: Multi-instance watcher system for command execution.
- Docs/Tooling/GIT_WORKFLOW.md  
  Purpose: Git workflow, branch naming, PR process, script locations.

### Setup checklist

- Docs/Guidelines/PROJECT_SCAFFOLD_CHECKLIST.md  
  Purpose: ensure project skeleton and tooling are complete.

### Code quality

- Docs/Standards/code-quality-standard.md  
  Purpose: Code quality rules (formatting, linting, complexity, test stability).
- Docs/Reports/code-quality-style-audit.md  
  Purpose: Audit of current tooling and code hotspots (read-only snapshot).

### Feature specs (P08 — Code Quality Enforcement)

- Docs/Specs/P08-code-quality.md  
  Purpose: Spec for future code quality enforcement work.
- Docs/Plans/P08-code-quality.md  
  Purpose: Plan for code quality enforcement.
- Docs/Tasks/P08-code-quality.md  
  Purpose: Task breakdown for code quality enforcement.

### Feature specs (P11 — AI Import)

- Docs/Specs/ai-import.md  
  Purpose: Spec for AI-powered import from CSV/Excel/Text/Images (Premium feature).
- Docs/Plans/ai-import.md  
  Purpose: Architecture and implementation plan for AI Import.
- Docs/Tasks/ai-import.md  
  Purpose: Task breakdown for AI Import (25 tasks in 7 sub-phases).

## Required "Doc Inventory" in every Cascade answer

At the top of every response, Cascade must list:

- Docs read (exact paths)
- Any conflicts found + which doc won by priority
- Assumptions (only if unavoidable) + where they should be specified in docs
