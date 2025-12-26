---
description: Read governance/process docs (INDEX + AGENTS + Cascade + spec rules)
auto_execution_mode: 1
---

Read:

- Docs/INDEX.md
- AGENTS.md
- .windsurf/cascade.md
- Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
- Docs/Tooling/BOOTSTRAP.md (tooling entry point — includes watcher + git workflow)

## Health Checks (run after reading docs)

1. **Check for orphaned branches:** `git branch --no-merged main`
   - See `.windsurf/workflows/helpers/check-orphaned-branches.md` for action

2. **Check for pending/failed PRs:** `powershell -File scripts/git/check-prs.ps1`
   - See `.windsurf/workflows/helpers/check-pending-prs.md` for action

If either check finds issues, handle them before starting new work.

Return only a single line:
"Read governance docs, [z]k context tokens"
