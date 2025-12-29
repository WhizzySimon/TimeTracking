# docs-restructure — Tasks

**Spec:** `Docs/Specs/docs-restructure.md`  
**Plan:** `Docs/Plans/docs-restructure.md`  
**Created:** 2025-12-26

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 1: Create folder structure and move entrypoint workflows

**Files:**

- Create: `.windsurf/workflows/entrypoints/`
- Move: `project-start.md`, `new-feature.md`, `new-task.md`, `continue-work.md`

**Done when:**

- 4 files exist in `entrypoints/`
- Original files deleted from flat location

**Verify:**

- `ls .windsurf/workflows/entrypoints/` shows 4 files

**Guardrails:**

- Do not modify file contents yet

---

## Task 2: Move helper workflows

**Files:**

- Create: `.windsurf/workflows/helpers/`
- Move: `rules-read-all.md`, `read-governance.md`, `read-core-docs-and-code.md`, `sdd-profile.md`, `sdd-transcript-insights.md`

**Done when:**

- 5 files exist in `helpers/`
- Original files deleted from flat location
- `.windsurf/workflows/` contains only `entrypoints/` and `helpers/` subfolders

**Verify:**

- `ls .windsurf/workflows/helpers/` shows 5 files
- `ls .windsurf/workflows/` shows only 2 directories

**Guardrails:**

- Do not modify file contents yet

---

## Task 3: Update cross-references in workflow files

**Files:**

- All 9 workflow files (update internal references)

**Done when:**

- All `/rules-read-all`, `/read-governance`, etc. references still work
- No hardcoded paths to old locations

**Verify:**

- Grep for `.windsurf/workflows/[^eh]` returns no results

**Guardrails:**

- Only update path references, not workflow logic

---

## Task 4: Slim cascade.md

**Files:**

- `.windsurf/cascade.md`

**Done when:**

- File is under 50 lines
- Contains only: project identity, links to AGENTS.md and INDEX.md
- No duplicated content from AGENTS.md

**Verify:**

- `wc -l .windsurf/cascade.md` shows < 50
- Manual review shows no duplication

**Guardrails:**

- Keep any Windsurf-specific config that AGENTS.md doesn't cover

---

## Task 5: Update AGENTS.md with system name

**Files:**

- `AGENTS.md`

**Done when:**

- Header includes "Cascade Dev Framework"
- Brief explanation of system scope

**Verify:**

- `grep "Cascade Dev Framework" AGENTS.md` returns match

**Guardrails:**

- Minimal change to existing content

---

## Task 6: Update INDEX.md

**Files:**

- `Docs/INDEX.md`

**Done when:**

- All workflow paths updated to new locations
- System name mentioned if appropriate

**Verify:**

- All listed paths exist
- No references to old flat workflow structure

**Guardrails:**

- Preserve priority order and existing structure

---

## Task 7: Update BOOTSTRAP.md and other tooling docs

**Files:**

- `Docs/DevFramework/ToolSetup
Framework/ToolSetup
/BOOTSTRAP.md`
- Any other files referencing workflow paths

**Done when:**

- All workflow references point to new locations

**Verify:**

- Grep for old workflow paths returns no results

**Guardrails:**

- Only update paths, not documentation content

---

## Task 8: Final verification and cleanup

**Files:**

- All modified files

**Done when:**

- All acceptance checks pass (AC-001 through AC-006)
- No orphaned references
- `npm run verify` passes

**Verify:**

- Run all acceptance checks from spec
- Run `npm run verify`

**Guardrails:**

- Do not add new features or changes beyond spec scope
