---
description: Start any task - ensures rules are loaded and compliance is tracked
---

# Next Task

**Purpose:** Universal entry point that makes rule-loading part of the TASK (not just context), and requires rule compliance output.

**Usage:** `/next [your task description]`

---

## Step 1: Read JIT Rule Map

Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Scan the trigger table and identify which rules apply to this task based on:
- Task type (bugfix, feature, refactor, etc.)
- Keywords in the task description
- Context clues

---

## Step 2: Load Applicable Rules

For each triggered rule:
1. Read the rule file
2. Output: `[RULE-LOADED] {rule name}`

If no specific rules triggered, load at minimum:
- `mindset.md` (always applicable)

---

## Step 3: Execute Task

Proceed with the user's task, keeping loaded rules in active consideration.

**Before each sub-step or decision point:**
1. Re-scan the JIT rule map triggers
2. Ask: "Does this sub-step trigger a rule I haven't loaded yet?"
3. If yes → Load it now, output: `[RULE-LOADED-MID-TASK] {rule name}`

### Mid-Task Output Requirement (MANDATORY)

**⚠️ THIS IS NOT OPTIONAL. For significant decisions, you MUST output BEFORE acting:**

```
[CONSULTING] {rule name} → {specific principle or section}
[DECISION] {what you decided} because {rule-based reason}
```

**If you skip this, you are not following the workflow.** The user will see if you made decisions without consulting rules.

**What counts as "significant decision":**
- Design choices (how to structure something)
- Behavioral choices (how something should work)
- Trade-off choices (option A vs B)
- Anything you'd explain to a code reviewer

**NOT required for:**
- Trivial actions (read file, run safe command)
- Mechanical steps (formatting, imports)

**Why this is mandatory:** Reading rules at the start isn't enough — they fade from attention during execution. This output requirement forces you to actively consult rules AT THE MOMENT of decision, not just remember them from earlier.

---

## Step 3.5: Self-Review (Before Completing)

**Before marking task complete or presenting final output, pause and switch to critical reviewer mindset.**

### The Review Protocol

1. **Re-read your outputs** — Scan what you produced as if seeing it for the first time
2. **Check against loaded rules** — For each rule loaded, ask: "Did I actually apply this?"
3. **Challenge your assumptions** — List assumptions you made. Are any unverified?
4. **Look for shortcuts** — Did you defer work that should be done now? ("Who will do this, when?")
5. **Trace to goal** — Does this output serve quality + speed + human time? Or just "complete the task"?

### Quick Questions (answer honestly)

- Would a careful human reviewer catch something I missed?
- Did I stop at "good enough" or push for "actually good"?
- If this fails later, what would I wish I had checked now?

### When to Do Deep vs Light Review

| Task Type | Review Depth |
|-----------|--------------|
| Simple question/answer | Skip (just Rule Compliance) |
| Code changes | Light (check assumptions, test coverage) |
| Architecture/design decisions | Deep (all 5 steps above) |
| Framework/rule changes | Deep (trace consequences) |

**If issues found → Fix before completing. Don't document problems without addressing them.**

---

## Step 4: Rule Compliance Output (REQUIRED)

**At the end of EVERY response, include this section:**

```markdown
---
## Rule Compliance

**Rules loaded:** [list rules you loaded in Step 2]
**Decision points:** [key decisions made during task]
**Rules applied:** [which rules you consulted at each decision point]
**Rules missed:** [any rules you realize in hindsight should have applied] (be honest)
```

**For non-trivial tasks, also include:**

```markdown
**Assumptions made:** [list assumptions — things you took as true without verifying]
**Alternatives considered:** [other approaches you evaluated and why you rejected them]
```

This section is MANDATORY. If you skip it, you are not following this workflow.

---

## Why This Works

1. **Rules become TASK, not context** — Reading the JIT map is Step 1 of the task
2. **Output requirement forces consideration** — You must OUTPUT which rules you applied, so you must THINK about them
3. **Honesty check built in** — "Rules missed" forces reflection on what you didn't catch
4. **User can verify** — The compliance section lets user see if you're actually following rules

---

## Notes

- This workflow replaces the need to remember to read rules — it makes it explicit
- Use `/next` for any task where rule compliance matters
- For quick questions that don't need rule compliance, you can skip this workflow
- If you find yourself missing rules repeatedly, add them to the "Rules missed" section honestly — this helps improve the system
