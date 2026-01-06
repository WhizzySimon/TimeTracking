# <feature-slug> — Spec

<!--
SPEC LENGTH GUIDELINES:
- Small task: ~100-200 lines (single component, minor feature)
- Medium task: ~300-500 lines (multi-component feature, integration)
- Complex task: ~800-1500 lines (cross-cutting feature, major subsystem)
Write as much as necessary, but not more.

SPEC DRIFT RULE:
If code behavior changes, update this spec in the same commit.
-->

**Phase:** <Phase-Nummer aus IMPLEMENTATION_PROGRESS.md>  
**Created:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD  
**Status:** Draft | In Review | Approved | Implemented

**Depends on:**

- (list specs that must be read first to understand this spec)

**Does not depend on:**

- (explicitly exclude specs that might seem related but are not required)

---

## 1) Goal / Problem

(1–3 sentences)

## 2) Scope

### In scope

- ...

### Out of scope

- ...

### What we don't want

- (explicit anti-patterns and rejected approaches)

## 3) Functional Requirements (FR)

<!--
PREFIX CONVENTION:
- Default: TT-FR-001, TT-IG-001, TT-DD-001
- For large features: Use domain prefix (QS-, CS-, AN-) when feature spans multiple specs
-->

- **TT-FR-001**: ...
- **TT-FR-002**: ...

## 4) Implementation Guarantees (IG)

- **TT-IG-001**: ...
- **TT-IG-002**: ...

## 5) Design Decisions (DD) (optional)

- **TT-DD-001**: ...

## 6) Edge cases

- ...

## 7) Data & privacy

- What is stored?
- Where?
- Retention?
- Export/delete expectations?

## 8) Acceptance checks (testable)

- [ ] AC-001: ...
- [ ] AC-002: ...

## 9) Change log

**[YYYY-MM-DD HH:MM]**

- Added: Initial spec created

**[YYYY-MM-DD HH:MM]**

- Changed: ...
- Fixed: ...

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [ ] Goal / Problem statement (1-3 sentences)
- [ ] Scope: In scope + Out of scope defined
- [ ] Functional Requirements (FR) — all numbered (TT-FR-xxx)
- [ ] Implementation Guarantees (IG) — all numbered (TT-IG-xxx)
- [ ] Edge cases documented
- [ ] Data & privacy notes complete
- [ ] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [ ] No ambiguous terms without measurable definitions
