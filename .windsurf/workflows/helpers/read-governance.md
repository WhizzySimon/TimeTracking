---
description: Read governance/process docs (INDEX + AGENTS + Cascade + spec rules)
auto_execution_mode: 1
---

Read:

- Docs/INDEX.md
- .windsurf/cascade.md

All other docs are loaded just-in-time via `Docs/DevFramework/Rules/_entrypoint-jit-rule-map.md`.

## Health Checks (run after reading docs)

1. **Check current branch:** Ensure on `dev` branch

If not on dev, switch to dev before starting new work.

Return only a single line:
"Read governance docs, [z]k context tokens"
