# SDD Profile — Anthropic (Claude + agentic coding guidance)

**Type:** Vendor guidance (not a repo)  
**Last verified:** 2025-12-24  
**Scoring meaning:** 0–5 = **coverage quality of the guidance** for this axis.

## Evidence inventory (official)

- Claude Code best practices: https://www.anthropic.com/engineering/claude-code-best-practices
- Tool use overview (Claude docs): https://console.anthropic.com/docs/en/agents-and-tools/tool-use/overview
- Build with Claude (learning hub): https://www.anthropic.com/learn/build-with-claude
- Effective context engineering for AI agents: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Effective harnesses for long-running agents: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Writing effective tools for agents: https://www.anthropic.com/engineering/writing-tools-for-agents
- Building agents with the Claude Agent SDK: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
- Introducing advanced tool use: https://www.anthropic.com/engineering/advanced-tool-use

## Axis scores (0–5 coverage)

| Axis                  | Score | Confidence | Why (1 line)                                                            |
| --------------------- | ----: | ---------- | ----------------------------------------------------------------------- |
| Spec quality          |     3 | Med        | More “agent workflow” than formal SDD specs.                            |
| Scope control         |     3 | Med        | Emphasizes prompt structure and stepwise work; not a spec-phase system. |
| Traceability          |     2 | Low        | Less about traceable artifacts; more about process patterns.            |
| Code quality rules    |     2 | Med        | Some coding practices, but not a full style rulebook.                   |
| Testing strategy      |     3 | Med        | Encourages verification patterns; not a test-suite framework.           |
| Tooling & automation  |     5 | High       | Strong tool-use + agent SDK + tool design guidance.                     |
| Context bootstrapping |     5 | High       | Deep guidance on context engineering + harnesses.                       |
| Iteration loop        |     4 | High       | Explicit loops, harness patterns, iterative refinement.                 |
| Operational safety    |     4 | Med        | Focus on tool annotations / permissions and safer autonomy themes.      |
| Cost/time efficiency  |     4 | High       | Harness + context structure reduces wasted tokens and rework.           |

## Key practices (max 10)

1. Use **structured prompt sections** (background/instructions/tool guidance/output).
2. Build a **harness** (init prompt + persistent artifacts) so each new agent session can rehydrate context fast.
3. Invest in **tool quality**: clear tool design, annotations, and minimal surface area.
4. Prefer **explicit iteration loops** with intermediate checks (against spec/rules).
5. Use **programmatic/efficient tool calling** patterns (where available) to save context.

## Failure modes (max 10)

- No harness → repeated re-explaining + prompt bloat.
- Tools without clear contracts → misfires, unsafe calls, debugging hell.
- Mixed goals/instructions in one blob → low adherence.

## Adoptable improvements for TimeTracker (max 10)

1. Add a “Harness” concept to `Docs/DevFramework/DevFramework/DeveloperGuidesAndStandards
/SPEC_DRIVEN_DEVELOPMENT.md` (what artifacts must exist so future chats start fast).
2. Add a standard “Rules conformance review” step (you already added gates; keep it explicit).
3. Define tool contracts for your watcher/verify workflow (what’s allowed, what’s destructive, what must be confirmed).
