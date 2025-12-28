# SDD Profile — Microsoft / GitHub Copilot (prompting + best practices)

**Type:** Vendor guidance (not your repo)  
**Last verified:** 2025-12-24  
**Scoring meaning:** 0–5 = **coverage quality of the guidance** for this axis.

## Evidence inventory (official)

- GitHub docs — Prompt engineering for Copilot Chat: https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering
- GitHub docs — Best practices for using Copilot: https://docs.github.com/en/copilot/get-started/best-practices
- Microsoft Learn — Intro to prompt engineering with GitHub Copilot: https://learn.microsoft.com/en-us/training/modules/introduction-prompt-engineering-with-github-copilot/
- Microsoft Learn — Copilot learning path: https://learn.microsoft.com/en-us/training/paths/copilot/

## Axis scores (0–5 coverage)

| Axis                  | Score | Confidence | Why (1 line)                                                     |
| --------------------- | ----: | ---------- | ---------------------------------------------------------------- |
| Spec quality          |     3 | Med        | Emphasizes good prompts + examples; not full SDD artifacts.      |
| Scope control         |     3 | High       | Clear advice: break down work, be specific.                      |
| Traceability          |     2 | Low        | Not an artifact/traceability methodology.                        |
| Code quality rules    |     3 | High       | Explicitly ties output quality to clean code practices.          |
| Testing strategy      |     3 | High       | Recommends unit tests + checking the model’s work.               |
| Tooling & automation  |     3 | Med        | Agent/task workflows exist; depth depends on product surface.    |
| Context bootstrapping |     3 | Med        | Guidance on context and chat-history management.                 |
| Iteration loop        |     3 | Med        | Review + iterate prompts is a core recommendation.               |
| Operational safety    |     4 | Med        | Strong emphasis on reviewing and verifying outputs.              |
| Cost/time efficiency  |     4 | Med        | Pragmatic guidance minimizes thrash: specificity, decomposition. |

## Key practices (max 10)

1. Break down complex work into smaller prompts/tasks.
2. Be specific: constraints, acceptance criteria, and format.
3. Provide examples (input/output/implementation hints).
4. Keep code readable so the agent has better “local signals”.
5. Always review and test generated changes.

## Failure modes (max 10)

- Using Copilot on messy code → lower quality suggestions.
- Treating suggestions as correct by default.
- Over-broad prompts that hide scope.

## Adoptable improvements for TimeTracker (max 10)

1. Add “codebase readability helps the agent” to `.windsurf/rules/code-quality-rules.md`.
2. Make “review + verify” a mandatory checkbox in `Docs/Tasks/_template.md` (if not already enforced).
3. Add a short human prompt checklist (goal, constraints, examples, output format).
