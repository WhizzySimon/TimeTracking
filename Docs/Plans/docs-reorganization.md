# Docs Reorganization Plan

**Goal**: Reduce redundancy in the documentation reading chain by introducing a Tooling Bootstrap layer.

**Context**: After PR #16 (script reorganization), documentation has grown organically with multiple references to the same docs.

---

## Table of Contents

1. Ist-Zustand (Current State)
2. Reading Chain Analysis
3. Redundancy Map
4. Projektspezifisch vs. Generisch
5. Best Practices Research
6. Soll-Zustand (Target State)
7. Migration Steps

---

## 1. Ist-Zustand (Current State)

### Document Categories

**Entry Points (read first):**

- `Docs/INDEX.md` — Master index, priority order
- `AGENTS.md` — Process rules (SDD workflow)
- `.windsurf/cascade.md` — Cascade-specific instructions

**Workflows (orchestration):**

- `.windsurf/workflows/project-start.md` — Session init
- `.windsurf/workflows/continue-work.md` — Resume work
- `.windsurf/workflows/new-task.md` — Start new task
- `.windsurf/workflows/new-feature.md` — New feature (SDD flow)
- `.windsurf/workflows/read-governance.md` — Load governance docs
- `.windsurf/workflows/rules-read-all.md` — Load all rules

**Rules (always-on, injected into context):**

- `.windsurf/rules/command-execution-rules.md` — Command execution limitations
- `.windsurf/rules/code-quality-rules.md` — Code quality
- `.windsurf/rules/implementation-specification-rules.md` — Spec writing
- `.windsurf/rules/ui-design-rules.md` — UI patterns

**Guidelines (detail docs):**

- `Docs/Guidelines/CASCADE_WATCHER.md` — Watcher system (tooling)
- `Docs/Guidelines/GIT_WORKFLOW.md` — Git workflow (tooling)
- `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md` — SDD complete workflow
- `Docs/Guidelines/DEVELOPMENT_GUIDELINES.md` — Coding standards
- `Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md` — Spec rules
- `Docs/Guidelines/SVELTEKIT_PWA_ADDENDUM.md` — Platform constraints
- `Docs/Guidelines/ui-logic-spec-v1.md` — Product spec
- `Docs/Guidelines/technical-guideline-v1.md` — Architecture

---

## 2. Reading Chain Analysis

### Typical Session Start Flow

```
/project-start
└─ /rules-read-all (4 rules files)
└─ /read-governance
   └─ Docs/INDEX.md
   └─ AGENTS.md
   └─ .windsurf/cascade.md
   └─ Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
   └─ Docs/Guidelines/GIT_WORKFLOW.md          <-- Tooling
   └─ Docs/Guidelines/CASCADE_WATCHER.md       <-- Tooling
└─ /read-core-docs-and-code
```

### /continue-work Flow

```
/continue-work
└─ /rules-read-all
└─ /read-governance (same as above)
└─ /read-core-docs-and-code
└─ Reads IMPLEMENTATION_PROGRESS.md
└─ References:
   └─ Docs/Guidelines/CASCADE_WATCHER.md       <-- Tooling (again)
   └─ Docs/Guidelines/GIT_WORKFLOW.md          <-- Tooling (again)
   └─ AGENTS.md                                <-- (already loaded)
```

### /new-task Flow

```
/new-task
└─ /rules-read-all
└─ /read-governance
└─ References:
   └─ CASCADE_WATCHER.md                       <-- Tooling (again)
   └─ GIT_WORKFLOW.md                          <-- Tooling (again)
   └─ AGENTS.md                                <-- (already loaded)
```

---

## 3. Redundancy Map

### CASCADE_WATCHER.md References

| Location                                   | Type        | Context              |
| ------------------------------------------ | ----------- | -------------------- |
| `read-governance.md` line 13               | Direct read | Part of governance   |
| `continue-work.md` line 17, 61             | Reference   | Setup + verification |
| `new-task.md` line 11, 43                  | Reference   | Setup + verification |
| `command-execution-rules.md` line 201, 356 | Reference   | Watcher details      |
| `GIT_WORKFLOW.md` line 76                  | Reference   | Parallel sessions    |
| `INDEX.md` line 44-45                      | Listed      | Authoritative list   |

**Total: 6+ explicit references**

### GIT_WORKFLOW.md References

| Location                     | Type        | Context               |
| ---------------------------- | ----------- | --------------------- |
| `read-governance.md` line 12 | Direct read | Part of governance    |
| `continue-work.md` line 77   | Reference   | Script locations      |
| `new-task.md` line 24, 59    | Reference   | Branch rules, scripts |
| `AGENTS.md` line 164         | Reference   | Troubleshooting       |
| `INDEX.md` line 46-47        | Listed      | Authoritative list    |

**Total: 5+ explicit references**

### AGENTS.md Duplications

Content duplicated or near-duplicated:

- 4-phase process: Also in `cascade.md`, `SPEC_DRIVEN_DEVELOPMENT.md`
- Git workflow: Also in `GIT_WORKFLOW.md`
- Verification rules: Also in `command-execution-rules.md`

---

## 4. Projektspezifisch vs. Generisch

### Generisch (reusable across projects)

**Tooling docs:**

- `CASCADE_WATCHER.md` — Multi-instance watcher system
- `GIT_WORKFLOW.md` — Git + PR workflow

**Rules:**

- `code-quality-rules.md` — Code quality patterns
- `implementation-specification-rules.md` — Spec writing rules

### Projektspezifisch (TimeTracker only)

**Product docs:**

- `ui-logic-spec-v1.md` — TimeTracker product spec
- `technical-guideline-v1.md` — TimeTracker architecture

**Process docs:**

- `AGENTS.md` — TimeTracker SDD process
- `SPEC_DRIVEN_DEVELOPMENT.md` — TimeTracker workflow details
- `IMPLEMENTATION_PROGRESS.md` — Current work state

**Rules:**

- `ui-design-rules.md` — TimeTracker UI patterns (ConfirmDialog, etc.)

---

## 5. Best Practices Research

### From SPEC_DRIVEN_DEVELOPMENT.md

- Single Source of Truth: Each concept documented once
- Pointer statt Duplikation: Reference docs, don't copy content
- Templates: `_template.md` pattern for consistency

### Modular Documentation Principles

1. **Layered Structure**: Entry point → Category → Detail
2. **Single Point of Reference**: Each doc referenced from ONE authoritative location
3. **Bootstrap Pattern**: One "start here" doc per category
4. **No Inline Details in Workflows**: Workflows should orchestrate, not contain

### Anti-Patterns Found

- **Scattered References**: Same doc referenced from 5+ locations
- **Duplicated Instructions**: Git workflow in AGENTS.md AND GIT_WORKFLOW.md
- **Mixed Concerns**: Tooling docs mixed with process docs
- **Deep Nesting**: Workflows reference workflows that reference docs

---

## 6. Soll-Zustand (Target State)

### New Structure

```
Docs/
├── INDEX.md                           # Master index (unchanged)
├── IMPLEMENTATION_PROGRESS.md         # Progress tracker
├── Guidelines/                        # Product/architecture docs
│   ├── ui-logic-spec-v1.md
│   ├── technical-guideline-v1.md
│   ├── SVELTEKIT_PWA_ADDENDUM.md
│   ├── DEVELOPMENT_GUIDELINES.md
│   └── IMPLEMENTATION_SPECIFICATION_RULES.md
├── Tooling/                           # NEW: All tooling docs
│   ├── BOOTSTRAP.md                   # NEW: Single entry point for tooling
│   ├── CASCADE_WATCHER.md             # Moved from Guidelines/
│   └── GIT_WORKFLOW.md                # Moved from Guidelines/
├── Specs/
├── Plans/
├── Tasks/
└── ...

.windsurf/
├── cascade.md                         # Simplified: points to INDEX.md + AGENTS.md
├── rules/                             # Stays lean, high-level
│   ├── command-execution-rules.md     # Points to Docs/Tooling/
│   └── ...
└── workflows/                         # Orchestration only
    ├── read-governance.md             # Points to Docs/Tooling/BOOTSTRAP.md
    └── ...
```

### BOOTSTRAP.md Content

Single entry point for tooling documentation:

```markdown
# Cascade Tooling Bootstrap

Read this file to understand the tooling setup.

## Watcher System

See: CASCADE_WATCHER.md

## Git Workflow

See: GIT_WORKFLOW.md

## Quick Reference

[Condensed commands and paths]
```

### Simplified Reference Pattern

**Before:**

```
read-governance.md → CASCADE_WATCHER.md
continue-work.md → CASCADE_WATCHER.md
new-task.md → CASCADE_WATCHER.md
command-execution-rules.md → CASCADE_WATCHER.md
```

**After:**

```
read-governance.md → Docs/Tooling/BOOTSTRAP.md
└─ BOOTSTRAP.md → CASCADE_WATCHER.md (if needed)
└─ BOOTSTRAP.md → GIT_WORKFLOW.md (if needed)
```

---

## 7. Migration Steps

### Phase 1: Create New Structure (no breaking changes)

- [x] **Task 1.1**: Create `Docs/Tooling/` folder
- [x] **Task 1.2**: Create `Docs/Tooling/BOOTSTRAP.md` (single entry point)
- [x] **Task 1.3**: Copy CASCADE_WATCHER.md to Docs/Tooling/ (keep original temporarily)
- [x] **Task 1.4**: Copy GIT_WORKFLOW.md to Docs/Tooling/ (keep original temporarily)
- [x] **Task 1.5**: Update INDEX.md to list Docs/Tooling/

### Phase 2: Update References (one at a time)

- [x] **Task 2.1**: Update `read-governance.md` to reference BOOTSTRAP.md instead of individual docs
- [x] **Task 2.2**: Update `continue-work.md` to reference BOOTSTRAP.md
- [x] **Task 2.3**: Update `new-task.md` to reference BOOTSTRAP.md
- [x] **Task 2.4**: Update `command-execution-rules.md` to reference Docs/Tooling/
- [x] **Task 2.5**: Update AGENTS.md to reference Docs/Tooling/

### Phase 3: Cleanup

- [x] **Task 3.1**: Remove Docs/Guidelines/CASCADE_WATCHER.md (now in Tooling/)
- [x] **Task 3.2**: Remove Docs/Guidelines/GIT_WORKFLOW.md (now in Tooling/)
- [x] **Task 3.3**: Verify no broken references (grep for old paths)

### Phase 4: Documentation

- [x] **Task 4.1**: Add "Where to put new docs" section to AGENTS.md — SKIPPED (already documented in INDEX.md)
- [x] **Task 4.2**: Document the Tooling/ pattern in INDEX.md — DONE (BOOTSTRAP.md listed as entry point)

---

## Risks and Mitigations

| Risk                               | Mitigation                                                      |
| ---------------------------------- | --------------------------------------------------------------- |
| Broken references during migration | Phase 1 keeps originals; Phase 3 removes after all refs updated |
| Stale memories in Cascade          | Memories reference old paths; update memories after migration   |
| User confusion                     | BOOTSTRAP.md provides clear entry point                         |

---

## Success Criteria

- [ ] CASCADE_WATCHER.md referenced from exactly 1 location (BOOTSTRAP.md)
- [ ] GIT_WORKFLOW.md referenced from exactly 1 location (BOOTSTRAP.md)
- [ ] All workflows reference Docs/Tooling/BOOTSTRAP.md for tooling
- [ ] No duplicate instructions between AGENTS.md and GIT_WORKFLOW.md
- [ ] grep for "Guidelines/CASCADE_WATCHER" returns 0 results
- [ ] grep for "Guidelines/GIT_WORKFLOW" returns 0 results

---

## Change Log

- 2025-12-25: Created — Analysis of documentation redundancies and migration plan
