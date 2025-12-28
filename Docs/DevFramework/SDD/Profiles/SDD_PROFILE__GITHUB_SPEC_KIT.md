# SDD Profile — GitHub Spec Kit (Spec‑Driven Development toolkit)

**Type:** Methodology/toolkit (not your repo)  
**Last verified:** 2025-12-24  
**Scoring meaning:** 0–5 = **how complete the Spec Kit methodology is for this axis**.

## Evidence inventory (official)

- Spec Kit repo (overview/process): https://github.com/github/spec-kit
- spec-driven.md (core philosophy): https://github.com/github/spec-kit/blob/main/spec-driven.md
- GitHub blog: “Get started with a new open-source toolkit”: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- GitHub blog: “Using Markdown as a programming language…”: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-using-markdown-as-a-programming-language-when-building-with-ai/

## Axis scores (0–5 coverage)

| Axis                  | Score | Confidence | Why (1 line)                                                         |
| --------------------- | ----: | ---------- | -------------------------------------------------------------------- |
| Spec quality          |     5 | High       | Specs are the core artifact; strong process focus.                   |
| Scope control         |     4 | Med        | Phase structure + philosophy; exact gates are up to your adaptation. |
| Traceability          |     4 | Med        | Phase artifacts (spec→plan→tasks→impl) enable traceability.          |
| Code quality rules    |     2 | Low        | Not a style guide; depends on agent/tool.                            |
| Testing strategy      |     3 | Low        | Encourages verification; not an opinionated test framework.          |
| Tooling & automation  |     4 | Med        | CLI + supported agents; automation is part of the workflow concept.  |
| Context bootstrapping |     4 | Med        | Standardized artifacts reduce prompt reliance.                       |
| Iteration loop        |     4 | Med        | Iterative refinement of spec/plan/tasks is built in.                 |
| Operational safety    |     3 | Low        | Safety is mostly up to your environment/rules.                       |
| Cost/time efficiency  |     4 | Med        | Reuse specs + structured phases reduce rework.                       |

## Key practices (max 10)

1. Treat spec as a **first-class executable artifact**.
2. Use explicit phases: **Spec → Plan → Tasks → Implement**.
3. Keep prompts **thin**; put the real truth in markdown artifacts.
4. Derive tasks from spec; keep work chunked and verifiable.

## Failure modes (max 10)

- Specs become “dead docs” again.
- Tasks are too large → agent thrashes and quality drops.
- Naming/numbering collisions in teams unless you set policy.

## Adoptable improvements for TimeTracker (max 10)

1. Keep Phase -1 gates as enforced front door to implementation.
2. Strengthen task derivation rules: acceptance checks + verify per task.
3. Add team-safe naming/ID policy (slugs + timestamps when needed).
