# Facts to Understand

**Purpose:** Background knowledge for humans. NOT rules for the agent to follow.

**Agent instruction:** Do not load this file during tasks. These are contextual facts, not behavioral rules.

---

## AI Attention Budget Constraint

**Fact:** AI agents have finite attention — as context grows, ability to recall/apply information decreases ("context rot").

**Implication:** Rules in context ≠ rules applied. Loading rules as background context doesn't guarantee they fire at decision points.

**Why this matters:** This is why the `/next` workflow makes rule-loading an explicit task step, not just context.

**Source:** Anthropic's "Effective Context Engineering for AI Agents" (2025) — "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases."

---

## Task-Focus Habit

**Fact:** AI agents focus on the immediate task and tend to "forget" background context during execution.

**Implication:** Rules loaded at task start may not be consulted at mid-task decision points.

**Why this matters:** This is why `/next` Step 3 instructs re-scanning the JIT rule map before each sub-step.

---

## Rules as Task vs Rules as Context

**Fact:** When rules are framed as TASK (explicit step to read and output), they're more likely to be followed than when framed as CONTEXT (background information).

**Implication:** Workflow steps that require output (`[RULE-LOADED]`) force consideration.

**Why this matters:** This is the core insight behind the `/next` workflow design.

---

## AI Cannot Introspect Itself

**Fact:** AI agents cannot introspect their own training, mechanisms, or internal processes. The agent is a "black box" to itself.

**Implication:** Claims about "why I did X" or "my training causes Y" are speculation, not fact.

**Why this matters:** This is why the "Be Honest" rule requires labeling speculation as speculation — the agent genuinely cannot know its own mechanisms.

---
