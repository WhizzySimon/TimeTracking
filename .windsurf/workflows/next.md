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

**Key question at decision points:**
> "Which of my loaded rules applies to this decision?"

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
