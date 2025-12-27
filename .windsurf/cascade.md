# Cascade Dev Framework — TimeTracker

**This file is Windsurf/Cascade-specific configuration.**

For the complete development process, see:

- **JIT Rule Map:** `Docs/Rules/_entrypoint-jit-rule-map.md` (loaded via always-on.md)
- **Doc hierarchy:** `Docs/INDEX.md`
- **Tooling setup:** `Docs/Tooling/BOOTSTRAP.md`

---

## Start-of-session (mandatory)

Run `/project-start` before doing anything else.

---

## Workflow Structure

```
.windsurf/workflows/
├── entrypoints/    # User-facing entry points
│   ├── project-start.md
│   ├── new-feature.md
│   ├── new-task.md
│   └── continue-work.md
└── helpers/        # Called by entrypoints
    ├── rules-read-all.md
    ├── read-governance.md
    └── ...
```

---

## JIT Rule System

**One always-on rule** in `.windsurf/rules/always-on.md` points to the trigger table.

**All rules** are in `Docs/Rules/`:
- `_entrypoint-jit-rule-map.md` — trigger table (loaded first)
- `code-quality.md`, `command-execution.md`, `pre-commit.md`, etc.

Each rule has a **canary marker** to verify it was read.
