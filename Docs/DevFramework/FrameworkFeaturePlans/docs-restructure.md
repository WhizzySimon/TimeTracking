# docs-restructure — Plan

**Spec:** `Docs/Specs/docs-restructure.md`  
**Created:** 2025-12-26

---

## Architecture

### Current Structure

```
.windsurf/
├── cascade.md (191 lines, ~60% duplicates AGENTS.md)
├── rules/ (4 files)
└── workflows/ (9 files, flat)
    ├── project-start.md
    ├── new-feature.md
    ├── new-task.md
    ├── continue-work.md
    ├── rules-read-all.md
    ├── read-governance.md
    ├── read-core-docs-and-code.md
    ├── sdd-profile.md
    └── sdd-transcript-insights.md
```

### Target Structure

```
.windsurf/
├── cascade.md (~30 lines, config only)
├── rules/ (4 files, unchanged)
└── workflows/
    ├── entrypoints/
    │   ├── project-start.md
    │   ├── new-feature.md
    │   ├── new-task.md
    │   └── continue-work.md
    └── helpers/
        ├── rules-read-all.md
        ├── read-governance.md
        ├── read-core-docs-and-code.md
        ├── sdd-profile.md
        └── sdd-transcript-insights.md
```

## File Moves (exact paths)

| From                                             | To                                                       |
| ------------------------------------------------ | -------------------------------------------------------- |
| `.windsurf/workflows/project-start.md`           | `.windsurf/workflows/entrypoints/project-start.md`       |
| `.windsurf/workflows/new-feature.md`             | `.windsurf/workflows/entrypoints/new-feature.md`         |
| `.windsurf/workflows/new-task.md`                | `.windsurf/workflows/entrypoints/new-task.md`            |
| `.windsurf/workflows/continue-work.md`           | `.windsurf/workflows/entrypoints/continue-work.md`       |
| `.windsurf/workflows/rules-read-all.md`          | `.windsurf/workflows/helpers/rules-read-all.md`          |
| `.windsurf/workflows/read-governance.md`         | `.windsurf/workflows/helpers/read-governance.md`         |
| `.windsurf/workflows/read-core-docs-and-code.md` | `.windsurf/workflows/helpers/read-core-docs-and-code.md` |
| `.windsurf/workflows/sdd-profile.md`             | `.windsurf/workflows/helpers/sdd-profile.md`             |
| `.windsurf/workflows/sdd-transcript-insights.md` | `.windsurf/workflows/helpers/sdd-transcript-insights.md` |

## cascade.md Slim-Down

**Keep:**

- Project name
- Link to AGENTS.md for process rules
- Link to INDEX.md for doc hierarchy
- Any Windsurf-specific config (auto_execution_mode settings)

**Remove:**

- 4-phase process description (in AGENTS.md)
- Verification commands list (in AGENTS.md)
- Coding rules (in AGENTS.md)
- Communication style (in AGENTS.md)
- Quick Reference section (in AGENTS.md and BOOTSTRAP.md)

## Cross-Reference Updates

Files that reference workflow paths:

1. **AGENTS.md** — mentions workflows folder
2. **Docs/INDEX.md** — may list workflow paths
3. **Docs/Tooling/BOOTSTRAP.md** — may reference workflows
4. **Workflow files themselves** — call each other (e.g., `/rules-read-all`)

## System Naming

Add to AGENTS.md header:

```markdown
# Cascade Dev Framework — TimeTracker

This repo uses the **Cascade Dev Framework** for spec-driven development...
```

## Testing Approach

- Manual verification: run each slash command after restructuring
- Grep verification: search for old paths, should return 0 results
- Line count verification: cascade.md under 50 lines

## Error Handling

- If Windsurf doesn't find workflows in subfolders: flatten back to original structure
- If slash commands break: check Windsurf's workflow discovery mechanism

## Performance/UX Constraints

None — documentation only.
