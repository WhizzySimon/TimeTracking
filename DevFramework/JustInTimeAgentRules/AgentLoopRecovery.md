# Agent Loop Recovery

**Trigger:** When stuck in a loop — same error 3+ times, editing same file repeatedly, >2x expected time, or anomaly detector fires.

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] agent-loop-recovery loaded

---

# Critical (Always Apply)

## When to Use

- Same error appears 3+ times
- Spent >2x expected time on a task
- Editing the same file repeatedly without progress
- Touching files outside the planned scope
- Anomaly detector outputs: `repetition`, `time_over_baseline`, `churn`, or `scope_drift`

---

## The 5-Step Protocol

### Step 1: RESTATE Goal + Constraints

Write down in plain text:

```
GOAL: [What am I trying to achieve?]
CONSTRAINTS:
- [Time limit]
- [Files I should touch]
- [Dependencies I can use]
- [Quality requirements]
CURRENT STATE: [Where am I now? What's blocking?]
```

**Do not skip this.** Writing it down forces clarity.

---

### Step 2: PROPOSE 2-3 Alternative Approaches

List at least 2 different ways to solve the problem:

```
APPROACH A: [Description]
- Pros: ...
- Cons: ...
- Risk: low/medium/high

APPROACH B: [Description]
- Pros: ...
- Cons: ...
- Risk: low/medium/high

APPROACH C (optional): [Description]
- Pros: ...
- Cons: ...
- Risk: low/medium/high
```

**Rule:** If you can only think of one approach, you haven't thought hard enough.

---

### Step 3: PICK One Approach

Select one approach and state:

```
CHOSEN: Approach [A/B/C]
REASON: [Why this one?]
EXPECTED EVIDENCE: [How will I know it worked?]
ABORT CONDITION: [When will I stop if it's not working?]
```

**Rule:** Set a clear abort condition (e.g., "If not working after 15 minutes, try Approach B").

---

### Step 4: RUN Smallest Discriminating Experiment

Before implementing fully, run the smallest test that proves the approach works:

```
EXPERIMENT: [What am I testing?]
COMMAND/ACTION: [Exact command or action]
EXPECTED RESULT: [What should happen if approach is valid?]
ACTUAL RESULT: [What happened?]
VERDICT: [PASS/FAIL]
```

**Rule:** The experiment should take <5 minutes. If it takes longer, you're not testing the smallest thing.

---

### Step 5: LOG Decision and Result

Record the outcome:

**If experiment PASSED:**

```
DECISION: Proceeding with Approach [X]
EVIDENCE: [What proved it works]
NEXT STEP: [What to do now]
```

**If experiment FAILED:**

```
DECISION: Abandoning Approach [X], trying Approach [Y]
EVIDENCE: [What proved it doesn't work]
LEARNING: [What did I learn?]
```

Log to `DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md` if the learning is reusable.

---

## Quick Reference Card

| Step | Action     | Output                             |
| ---- | ---------- | ---------------------------------- |
| 1    | Restate    | GOAL + CONSTRAINTS + CURRENT STATE |
| 2    | Propose    | 2-3 approaches with pros/cons      |
| 3    | Pick       | CHOSEN + REASON + ABORT CONDITION  |
| 4    | Experiment | <5 min test with VERDICT           |
| 5    | Log        | DECISION + EVIDENCE + NEXT STEP    |

---

## Anti-Patterns

❌ **Don't:** Skip steps because "I know the answer"  
✅ **Do:** Write out all 5 steps even if it feels redundant

❌ **Don't:** Only consider one approach  
✅ **Do:** Force yourself to list at least 2 alternatives

❌ **Don't:** Run a 30-minute experiment  
✅ **Do:** Find the smallest test that discriminates

❌ **Don't:** Ignore failed experiments  
✅ **Do:** Log what you learned from failure

❌ **Don't:** Keep trying the same thing  
✅ **Do:** After 2 failures of same approach, switch approaches

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** When to Use (triggers), The 5-Step Protocol
- **Important:** Step 4 (Smallest Discriminating Experiment), Step 5 (Log Decision)
- **Standard:** Anti-Patterns
