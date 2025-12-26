# Cascade Dev Framework — TimeTracker

**This file is Windsurf/Cascade-specific configuration.**

For the complete development process, see:

- **Process rules:** `AGENTS.md`
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

## Rules Location

Always-on rules are in `.windsurf/rules/`:

- `code-quality-rules.md`
- `command-execution-rules.md`
- `implementation-specification-rules.md`
- `ui-design-rules.md`
