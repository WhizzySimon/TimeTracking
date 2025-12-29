# guidance-system-v2 — Spec

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- Docs/DevFramework/Archive
  /SCHUBLADENDENKEN-AUDIT-2025-12-27.md (audit findings)

**Does not depend on:**

- Any feature specs (this is framework/tooling work, not app functionality)

---

## 1) Goal / Problem

The current guidance system has three issues:

1. **No verification** that JIT rules are loaded at trigger points (violations on 2025-12-26, 2025-12-27)
2. **Session-end is unreliable** — Cascade doesn't know when a session ends; user may forget to trigger it
3. **Editability problem** — `.windsurf/rules/` files cannot be edited by Cascade, but contain full rules (203 lines) that should be maintainable

## 2) Scope

### In scope

- Add canary marker to `pre-commit.md` to verify rule loading
- Merge session-end checks INTO pre-commit (eliminate separate session-end trigger)
- Make `.windsurf/rules/` files reference-only, move actual rules to editable `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/`
- Fix stale `AGENTS.md` references in workflow files

### Out of scope

- Changing the JIT rule trigger structure
- Adding new rules or triggers
- Modifying the learning loop process (already documented correctly)

### What we don't want

- Over-engineering: canary markers should be 3-5 lines
- Breaking existing workflows
- Multiple places to maintain the same rule

## 3) Functional Requirements (FR)

- **GS-FR-001**: When Cascade reads `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md`, it MUST output `[CANARY] pre-commit rules loaded` before any commit-related action.
- **GS-FR-002**: Pre-commit rules MUST include all critical session-end checks (push verification, learning promotion, clean working tree) so every commit completes the full cycle.
- **GS-FR-003**: All `.windsurf/rules/*.md` files MUST be reference-only (≤15 lines each), pointing to editable files in `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/`.
- **GS-FR-004**: Actual rule content MUST live in `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/` where Cascade can edit it.
- **GS-FR-005**: All workflow files MUST reference `RULE_MAP.md` or `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/*.md` instead of `AGENTS.md`.

## 4) Implementation Guarantees (IG)

- **GS-IG-001**: Total `.windsurf/rules/*.md` content MUST be ≤60 lines after implementation (currently ~260 lines).
- **GS-IG-002**: Existing rule content MUST NOT be lost — only moved to `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/`.
- **GS-IG-003**: Canary marker MUST be visible in chat output (not hidden or conditional).
- **GS-IG-004**: After implementation, all rules MUST be editable by Cascade (no rules locked in uneditable files).

## 5) Design Decisions (DD)

- **GS-DD-001**: Canary format is `[CANARY] <filename> loaded` — simple, grep-able, unambiguous.
- **GS-DD-002**: `.windsurf/rules/` files become 10-15 line pointers with format: "Read `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/<name>.md` for full rules."
- **GS-DD-003**: Session-end is eliminated as a separate trigger; its checks merge into pre-commit.
- **GS-DD-004**: Domain prefix `GS-` (Guidance System) used for this spec.

## 6) Edge cases

- **EC-001**: What if Cascade forgets to output canary? — The missing marker proves the rule was not loaded; this is the detection mechanism.
- **EC-002**: What if user closes chat without committing? — Work may be lost, but this is existing behavior. Pre-commit ensures committed work is complete.
- **EC-003**: What if AGENTS.md is referenced in new code? — File doesn't exist, read fails obviously (self-correcting).

## 7) Data & privacy

- No user data involved
- No persistence changes
- Framework documentation only

## 8) Acceptance checks (testable)

- [ ] **AC-001**: `[CANARY] pre-commit rules loaded` appears in chat before any commit (maps to GS-FR-001)
- [ ] **AC-002**: Pre-commit checklist includes push, learning promotion, clean tree checks (maps to GS-FR-002)
- [ ] **AC-003**: Each file in `.windsurf/rules/` is ≤15 lines (maps to GS-FR-003)
- [ ] **AC-004**: Total `.windsurf/rules/*.md` is ≤60 lines (maps to GS-IG-001)
- [ ] **AC-005**: `grep -r "AGENTS.md" .windsurf/` returns no matches (maps to GS-FR-005)
- [ ] **AC-006**: All rule content exists in `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/` and is editable (maps to GS-IG-004)
- [ ] **AC-007**: Full test: complete a task, commit, verify canary appears and all checks pass

## 9) Change log

**[2025-12-27 14:15]**

- Changed: Merged session-end into pre-commit (GS-FR-002, GS-DD-003)
- Changed: All .windsurf/rules/ files become reference-only (GS-FR-003, GS-FR-004)
- Changed: Target ≤60 lines for always-on context (was 160)
- Added: GS-IG-004 editability guarantee
- Removed: Session-end canary (no longer needed)

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
