# SDD Profile — Windsurf (Cascade + Workflows)
**Type:** Tooling platform (not your repo)  
**Last verified:** 2025-12-24  
**Scoring meaning:** 0–5 = **coverage/strength of the platform features** for this axis.

## Evidence inventory (official)
- Workflows: https://docs.windsurf.com/windsurf/cascade/workflows
- Cascade (overview/model selection): https://docs.windsurf.com/windsurf/cascade/cascade
- Models (Cascade model dropdown): https://docs.windsurf.com/windsurf/models
- Terminal integration: https://docs.windsurf.com/windsurf/terminal
- MCP integration: https://docs.windsurf.com/windsurf/cascade/mcp

## Axis scores (0–5 coverage)
| Axis | Score | Confidence | Why (1 line) |
|---|---:|---|---|
| Spec quality | 2 | Med | Not a spec methodology; executes the process you encode. |
| Scope control | 4 | High | Workflows can enforce scope and forbid “free refactors”. |
| Traceability | 3 | Med | Achievable via workflows + logs; not automatic. |
| Code quality rules | 3 | Med | You can encode rules; enforcement depends on discipline. |
| Testing strategy | 3 | Med | Can run tests via terminal integration; not a test framework itself. |
| Tooling & automation | 5 | High | Workflows + terminal + MCP enable strong automation. |
| Context bootstrapping | 4 | High | Workflow-driven doc loading is repeatable. |
| Iteration loop | 4 | High | Planning/workflows support structured iteration. |
| Operational safety | 3 | Med | Depends on your command-execution rules; platform supports structure. |
| Cost/time efficiency | 4 | Med | High leverage when workflows reduce repeated prompting. |

## Key practices (max 10)
1) Encode your process as **Workflows** (markdown), invoked by slash commands.
2) Use workflow steps to **load rules/docs** every session (compensate for session amnesia).
3) Use terminal integration for verification and tight feedback loops.
4) Use MCP to integrate external tools when needed.

## Failure modes (max 10)
- Workflows too vague → agent improvises and drifts.
- Duplicate sources of truth (rules in multiple places) → contradictions.
- No enforced “verify” step → regressions.

## Adoptable improvements for TimeTracker (max 10)
1) Keep enforcement in workflows (not just docs): gates + verify.
2) Maintain one canonical ruleset; keep `.windsurf/rules` as pointers if needed.
3) Add “analysis-only workflows” for audits (like your devlog audit).
