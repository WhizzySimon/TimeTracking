# Session Start Rules

**Trigger:** Beginning of any new session

---

## Workflow

1. Check you're on `dev` branch: `git branch --show-current`
2. If not on dev, switch: `git checkout dev && git pull origin dev`

(Rules are loaded automatically via `.windsurf/rules/always-on.md` → JIT rule map)

## Mandatory Doc Loading

Before planning or coding, ALWAYS:

Start every response with a "Doc Inventory" section listing exactly what was read (exact file paths + headings/sections used)

If required info is missing, STOP and propose an update to the relevant doc (spec/plan/tasks) before coding.

## Memory Policy

- **Do NOT use `create_memory` tool** — this project uses file-based documentation
- All learnings handled via `self-learning-system.md` at pre-commit
- All rules go to `DevFramework/JustInTimeAgentRules/` or `.windsurf/rules/`
- IDE-independent system — no reliance on Cascade memories

---

**Next:** After session start, proceed to appropriate trigger:

- Creating spec? → Read `DevFramework/JustInTimeAgentRules/spec-writing.md`
- Creating plan? → Read `DevFramework/JustInTimeAgentRules/planning.md`
- Implementing? → Read `DevFramework/JustInTimeAgentRules/implementation.md`
