# Spec: Code Quality Enforcement

**Created:** 2025-12-24  
**Status:** Draft  
**Phase:** P08

---

## Problem Statement

The codebase has grown organically. While tooling (Prettier, ESLint, TypeScript) is configured, some quality rules are not enforced, and some code patterns have drifted from best practices. This spec defines what "code quality" means for TimeTracker and how to enforce it systematically.

---

## Scope

### In Scope

- ESLint complexity rule enforcement
- TypeScript stricter settings (`noUnusedLocals`, `noUnusedParameters`)
- Playwright locator policy enforcement (replace brittle `getByText`)
- Documentation of quality gates in CI

### Out of Scope

- Major refactoring of existing code (separate task)
- New linting rules beyond complexity
- Performance optimization
- Accessibility audit (separate concern)

---

## Functional Requirements

- **CQ-FR-001**: ESLint must enforce cyclomatic complexity with threshold 20.
- **CQ-FR-002**: TypeScript must flag unused locals and parameters (underscore prefix allowed).
- **CQ-FR-003**: E2E tests must not introduce new `getByText` selectors for UI copy that may change.
- **CQ-FR-004**: CI must fail if any quality gate fails.

---

## Implementation Guarantees

- **CQ-IG-001**: Existing code must pass all new rules without changes (or rules must be introduced with existing violations grandfathered).
- **CQ-IG-002**: No runtime behavior changes from quality enforcement.
- **CQ-IG-003**: Developer experience must not degrade (no excessive noise from new rules).

---

## Design Decisions

- **CQ-DD-001**: Use ESLint's built-in `complexity` rule, not a third-party plugin.
- **CQ-DD-002**: Grandfather existing violations via inline comments if needed, with TODO to fix.
- **CQ-DD-003**: Playwright locator policy is enforced by code review, not automated lint.

---

## Edge Cases

- **Large legacy functions**: If a function exceeds complexity 20 and cannot be easily refactored, add inline disable comment with explanation.
- **Generated code**: Exclude from complexity checks if applicable.

---

## Acceptance Checks

| ID     | Check                                              | Maps to   |
| ------ | -------------------------------------------------- | --------- |
| AC-001 | `npm run lint` passes with complexity rule enabled | CQ-FR-001 |
| AC-002 | `npm run check` passes with stricter TS settings   | CQ-FR-002 |
| AC-003 | No new `getByText` in E2E tests (code review)      | CQ-FR-003 |
| AC-004 | CI pipeline includes all quality gates             | CQ-FR-004 |

---

## Change Log

**[2025-12-24 19:55]**

- Created: Initial spec for code quality enforcement
