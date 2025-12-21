# TimeTracker Docs Index (Authoritative)

## Rule
Cascade MUST read this file first. Cascade MUST only treat docs listed here as authoritative.

## Priority order (when conflicts exist)
1) Docs/DevelopmentSpecs/AGENTS.md (principles + process)
2) UI & logic specification (product truth)
3) Technical guideline (architecture truth)
4) PWA/SvelteKit addendum (platform constraints)
5) Development guidelines (coding + repo rules)
6) Project scaffold checklist (setup completeness)

## Authoritative documents
### Development process (how we work)
- Docs/DevelopmentSpecs/AGENTS.md  
  Purpose: spec-driven process, how to plan tasks, how to verify.

### Product spec (what we build)
- Docs/Guidelines/UI & Logik Spezifikation v1.md  
  Purpose: screens, flows, rules, acceptance criteria for the app.

### Architecture & implementation rules
- Docs/Guidelines/technical-guideline-v1.md  
  Purpose: project structure, module boundaries, data model, decisions.
- Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md  
  Purpose: SvelteKit + PWA constraints (offline-first, Safari behavior, etc.)
- Docs/Guidelines/DEVELOPMENT_GUIDELINES.md  
  Purpose: coding standards, practices, guardrails.

### Setup checklist
- Docs/Guidelines/PROJECT_SCAFFOLD_CHECKLIST.md  
  Purpose: ensure project skeleton and tooling are complete.

## Required “Doc Inventory” in every Cascade answer
At the top of every response, Cascade must list:
- Docs read (exact paths)
- Any conflicts found + which doc won by priority
- Assumptions (only if unavoidable) + where they should be specified in docs
