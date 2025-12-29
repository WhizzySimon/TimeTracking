# docs-restructure — Spec

**Phase:** Standalone (infrastructure improvement)  
**Created:** 2025-12-26  
**Last Updated:** 2025-12-26  
**Status:** Draft

**Depends on:** None

**Does not depend on:** Any feature specs (P08, P10, P11)

---

## 1) Goal / Problem

The documentation/workflow system has grown organically and now has duplication, unclear hierarchy, and no clear system identity. This spec defines restructuring for better discoverability, maintainability, and portability.

## 2) Scope

### In scope

- Restructure `.windsurf/workflows/` into `entrypoints/` and `helpers/` subfolders
- Slim `.windsurf/cascade.md` to remove duplication with `AGENTS.md`
- Update all cross-references after file moves
- Choose and document a system name
- Update `Docs/INDEX.md` to reflect new structure

### Out of scope

- Changing any functionality (code, tests, build)
- Adding new workflows
- Modifying content of guidelines in `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/`
- Changing the SDD profile system

### What we don't want

- Deep nesting (max 2 levels under `.windsurf/workflows/`)
- Duplicate content between files
- Orphaned references to moved files

## 3) Functional Requirements (FR)

- **DR-FR-001**: Workflows are organized into two categories: `entrypoints/` (user-facing) and `helpers/` (called by entrypoints)
- **DR-FR-002**: `cascade.md` contains only Cascade-specific configuration, not duplicated process rules
- **DR-FR-003**: All slash commands (`/project-start`, `/new-task`, etc.) continue to work after restructuring
- **DR-FR-004**: `Docs/INDEX.md` lists all authoritative documents with correct paths
- **DR-FR-005**: The system has a documented name in `AGENTS.md` and `INDEX.md`

## 4) Implementation Guarantees (IG)

- **DR-IG-001**: No broken cross-references after restructuring (all file paths updated)
- **DR-IG-002**: No duplicate content between `cascade.md` and `AGENTS.md`
- **DR-IG-003**: Folder structure is self-explanatory (human can understand hierarchy from names alone)
- **DR-IG-004**: Result is portable (structure can be extracted as template for other repos)

## 5) Design Decisions (DD)

- **DR-DD-001**: System name is **"Cascade Dev Framework"** (captures: Cascade agent, development process, framework of docs/rules/workflows)
- **DR-DD-002**: Entrypoint workflows: `project-start`, `new-feature`, `new-task`, `continue-work`
- **DR-DD-003**: Helper workflows: `rules-read-all`, `read-governance`, `read-core-docs-and-code`, `sdd-profile`, `sdd-transcript-insights`
- **DR-DD-004**: `cascade.md` becomes a thin config file pointing to `AGENTS.md` for process rules

## 6) Edge cases

- Workflow files reference each other (e.g., `/project-start` calls `/rules-read-all`) — must update paths
- External tools may cache old workflow paths — acceptable, they'll find new paths on next run
- User muscle memory for old paths — slash commands still work, just files moved

## 7) Data & privacy

- No user data involved
- No storage changes
- Documentation only

## 8) Acceptance checks (testable)

- [ ] AC-001: `.windsurf/workflows/entrypoints/` contains exactly 4 files (project-start, new-feature, new-task, continue-work)
- [ ] AC-002: `.windsurf/workflows/helpers/` contains remaining workflow files
- [ ] AC-003: `cascade.md` is under 50 lines and contains no duplicated content from `AGENTS.md`
- [ ] AC-004: `grep -r "\.windsurf/workflows/[^eh]"` returns no results (no references to old flat structure)
- [ ] AC-005: System name "Cascade Dev Framework" appears in `AGENTS.md` header
- [ ] AC-006: `Docs/INDEX.md` lists correct paths to all moved files

## 9) Change log

**[2025-12-26 12:58]**

- Added: Initial spec created based on user requirements

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (DR-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (DR-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
