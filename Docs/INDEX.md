# TimeTracker Docs Index (Authoritative)

## Rule
Cascade MUST read this file first. Cascade MUST only treat docs listed here as authoritative.

## Priority order (when conflicts exist)
0) Docs/INDEX.md (this file)
1) Docs/Guidelines/ui-logic-spec-v1.md (product truth)
2) Docs/Guidelines/technical-guideline-v1.md (architecture truth)
3) Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md (platform constraints)
4) Docs/Guidelines/DEVELOPMENT_GUIDELINES.md (coding/repo rules)
5) Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md (how to write specs)
6) AGENTS.md (Cascade process rules)


## Authoritative documents
### Development process (how we work)
- AGENTS.md (repo root)  
  Purpose: spec-driven process, how to plan tasks, how to verify.

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


### Setup checklist
- Docs/Guidelines/PROJECT_SCAFFOLD_CHECKLIST.md  
  Purpose: ensure project skeleton and tooling are complete.

## Required "Doc Inventory" in every Cascade answer
At the top of every response, Cascade must list:
- Docs read (exact paths)
- Any conflicts found + which doc won by priority
- Assumptions (only if unavoidable) + where they should be specified in docs
