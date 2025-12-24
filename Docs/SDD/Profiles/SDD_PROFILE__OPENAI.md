# SDD Profile — OpenAI (GPT + OpenAI API)

**Type:** Vendor guidance (not a repo)  
**Last verified:** 2025-12-24  
**Scoring meaning:** 0–5 = **coverage quality of the guidance** for this axis (not “does your repo have it”).

## Evidence inventory (official)

- OpenAI — Prompt engineering guide: https://platform.openai.com/docs/guides/prompt-engineering
- OpenAI — Prompting guide: https://platform.openai.com/docs/guides/prompting
- OpenAI — Function calling guide: https://platform.openai.com/docs/guides/function-calling
- OpenAI — Structured Outputs guide: https://platform.openai.com/docs/guides/structured-outputs
- OpenAI — Structured Outputs announcement: https://openai.com/index/introducing-structured-outputs-in-the-api/
- OpenAI — Evaluation best practices: https://platform.openai.com/docs/guides/evaluation-best-practices
- OpenAI — Evals guide: https://platform.openai.com/docs/guides/evals
- OpenAI Cookbook — GPT‑5 prompting guide: https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide
- OpenAI Cookbook — GPT‑5.2 prompting guide: https://cookbook.openai.com/examples/gpt-5/gpt-5-2_prompting_guide

## Axis scores (0–5 coverage)

| Axis                  | Score | Confidence | Why (1 line)                                                                   |
| --------------------- | ----: | ---------- | ------------------------------------------------------------------------------ |
| Spec quality          |     3 | Med        | Strong structure/prompt tactics; less “SDD phases” guidance.                   |
| Scope control         |     3 | Med        | Emphasizes constraints/clarity; less formal “gates” standard.                  |
| Traceability          |     2 | Low        | Mentions structured outputs; not a traceability methodology.                   |
| Code quality rules    |     1 | Med        | Minimal direct “code style” guidance.                                          |
| Testing strategy      |     4 | High       | Strong evals guidance (design + running).                                      |
| Tooling & automation  |     5 | High       | Function calling + structured outputs + eval tooling.                          |
| Context bootstrapping |     3 | Med        | Reusable prompts + prompt caching; state management is addressed elsewhere.    |
| Iteration loop        |     4 | High       | Iterative eval-driven improvement is a core theme.                             |
| Operational safety    |     3 | Med        | Verification for high-impact ops is recommended, but not a full safety system. |
| Cost/time efficiency  |     4 | High       | Prompt caching + structured outputs reduce retries and parsing failures.       |

## Key practices (max 10)

1. Use **Structured Outputs** (JSON schema / strict tool schemas) to eliminate “almost JSON” failures.
2. Prefer **function calling** when the model must invoke capabilities; keep tool definitions crisp and explicit.
3. Treat quality as **measurable**: write evals, run them, iterate.
4. Use reusable prompts + versioning (where applicable) to reduce drift across environments.
5. Optimize for cost/latency by stabilizing the “static” part of prompts and using caching strategies.

## Failure modes (max 10)

- Free-text outputs used where schema should be enforced → brittle pipelines.
- No evals → regressions are invisible.
- “One huge prompt does everything” → unclear scope, higher variance.

## Adoptable improvements for TimeTracker (max 10)

1. Add a small “Evals mindset” section to `Docs/Guidelines/SPEC_DRIVEN_DEVELOPMENT.md` (treat acceptance checks like an eval suite).
2. For agent tools you control, require strict schemas (mirror the “Structured Outputs” intent).
3. Add a lightweight “gold questions” benchmark file to validate prompts/workflows after changes.
