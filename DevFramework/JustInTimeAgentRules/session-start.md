# Session Start Rules

**Trigger:** Beginning of any new session

---

# Critical (Always Apply)

## Workflow

1. Check you're on `dev` branch: `git branch --show-current`
2. If not on dev, switch: `git checkout dev && git pull origin dev`

(Rules are loaded automatically via `.windsurf/rules/always-on.md` → JIT rule map)

# Important (Context-Dependent)

## Mandatory Doc Loading

Before planning or coding, ALWAYS:

Start every response with a "Doc Inventory" section listing exactly what was read (exact file paths + headings/sections used)

If required info is missing, STOP and propose an update to the relevant doc (spec/plan/tasks) before coding.

## Memory Policy

- **Do NOT use `create_memory` tool** — this project uses file-based documentation
- All learnings captured via `/capture-learnings` workflow at chat-close
- All rules go to `DevFramework/JustInTimeAgentRules/` or `.windsurf/rules/`
- IDE-independent system — no reliance on Cascade memories

---

# Standard (Good Practices)

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Workflow (git branch check), Memory Policy (no create_memory)
- **Important:** Mandatory Doc Loading
- **Standard:** Next steps guidance

---

**Next:** After session start, proceed to appropriate trigger:

- Creating spec? → Read `DevFramework/JustInTimeAgentRules/spec-writing.md`
- Creating plan? → Read `DevFramework/JustInTimeAgentRules/planning.md`
- Implementing? → Read `DevFramework/JustInTimeAgentRules/implementation.md`
