# guidance-system-v2 — Spec

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- Docs/Reports/SCHUBLADENDENKEN-AUDIT-2025-12-27.md (audit findings)

**Does not depend on:**

- Any feature specs (this is framework/tooling work, not app functionality)

---

## 1) Goal / Problem

The current guidance system has JIT rules but no verification that rules are loaded at trigger points. Additionally, `ui-design-rules.md` (109 lines) loads always-on even for non-UI work, and several files reference `AGENTS.md` which no longer exists.

## 2) Scope

### In scope

- Add canary markers to critical JIT rules (`pre-commit.md`, `session-end.md`)
- Move `ui-design-rules.md` from always-on to JIT
- Fix stale `AGENTS.md` references in workflow files

### Out of scope

- Changing the JIT rule structure itself
- Adding new rules or triggers
- Modifying the learning loop process (already documented correctly)

### What we don't want

- Over-engineering: canary markers should be 3-5 lines, not complex verification systems
- Breaking existing workflows
- Adding more always-on context

## 3) Functional Requirements (FR)

- **GS-FR-001**: When Cascade reads `Docs/Rules/pre-commit.md`, it MUST output `[CANARY] pre-commit rules loaded` before any commit-related action.
- **GS-FR-002**: When Cascade reads `Docs/Rules/session-end.md`, it MUST output `[CANARY] session-end rules loaded` before any session-end action.
- **GS-FR-003**: UI design rules (`ConfirmDialog`, minimal interruption, retry pattern) MUST only load when Cascade is about to modify UI components (`.svelte` files or UI-related code).
- **GS-FR-004**: All workflow files MUST reference `RULE_MAP.md` or `Docs/Rules/*.md` instead of `AGENTS.md`.

## 4) Implementation Guarantees (IG)

- **GS-IG-001**: Always-on context (`.windsurf/rules/*.md`) MUST be ≤160 lines after implementation (currently ~257 lines).
- **GS-IG-002**: Existing rule content MUST NOT be lost — only moved or referenced differently.
- **GS-IG-003**: All canary markers MUST be visible in chat output (not hidden or conditional).

## 5) Design Decisions (DD)

- **GS-DD-001**: Canary format is `[CANARY] <filename> loaded` — simple, grep-able, unambiguous.
- **GS-DD-002**: UI rules move to `Docs/Rules/ui-work.md` (new JIT file), with a 10-line pointer remaining in `.windsurf/rules/ui-design-rules.md`.
- **GS-DD-003**: Domain prefix `GS-` (Guidance System) used for this spec to avoid collision with `TT-` app requirements.

## 6) Edge cases

- **EC-001**: What if Cascade forgets to output canary? — This is the problem we're solving; the marker proves compliance or reveals failure.
- **EC-002**: What if UI rules are needed but not loaded? — The 10-line pointer in always-on tells Cascade when to load the full file.
- **EC-003**: What if someone references AGENTS.md in new code? — Not a concern; AGENTS.md doesn't exist, so file read fails obviously.

## 7) Data & privacy

- No user data involved
- No persistence changes
- Framework documentation only

## 8) Acceptance checks (testable)

- [ ] **AC-001**: `[CANARY] pre-commit rules loaded` appears in chat before any commit (maps to GS-FR-001)
- [ ] **AC-002**: `[CANARY] session-end rules loaded` appears in chat before session end (maps to GS-FR-002)
- [ ] **AC-003**: Line count of `.windsurf/rules/*.md` totals ≤160 lines (maps to GS-IG-001)
- [ ] **AC-004**: `grep -r "AGENTS.md" .windsurf/` returns no matches (maps to GS-FR-004)
- [ ] **AC-005**: UI-only session does NOT fail — `Docs/Rules/ui-work.md` loads correctly when triggered (maps to GS-FR-003)

## 9) Change log

**[2025-12-27 11:30]**

- Added: Initial spec created based on audit findings

---

## 10) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (GS-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (GS-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
