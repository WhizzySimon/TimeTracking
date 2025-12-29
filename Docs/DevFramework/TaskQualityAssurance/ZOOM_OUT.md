# ZOOM_OUT Protocol

**Trigger:** When anomaly detector fires OR after 2+ failed attempts at the same problem.

This protocol provides a deterministic recovery procedure when development is stuck.

---

## When to Use

- Anomaly detector outputs: `repetition`, `time_over_baseline`, `churn`, or `scope_drift`
- Same error appears 3+ times
- Spent >2x expected time on a task
- Editing the same file repeatedly without progress
- Touching files outside the planned scope

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

Log to `Docs/DevFramework/DevFramework/FrameworkSelfImprovementLogs
/LEARNINGS-INBOX.md` if the learning is reusable.

---

## Example: Fixing a Lint Error Loop

### Step 1: RESTATE

```
GOAL: Fix ESLint error "prefer-const" in sync.ts
CONSTRAINTS:
- Must not change behavior
- Must pass npm run verify
- Should be a 1-line fix
CURRENT STATE: Changed let→const 3 times, each time introduces new error
```

### Step 2: PROPOSE

```
APPROACH A: Read ESLint documentation for prefer-const rule
- Pros: Understand the exact rule
- Cons: Takes time
- Risk: low

APPROACH B: Disable the rule for this line with eslint-disable comment
- Pros: Quick fix
- Cons: Technical debt
- Risk: medium

APPROACH C: Refactor the variable usage to not need reassignment
- Pros: Cleaner code
- Cons: More changes, risk of behavior change
- Risk: medium
```

### Step 3: PICK

```
CHOSEN: Approach A
REASON: Understanding the rule will prevent future similar errors
EXPECTED EVIDENCE: I can explain why my fix should work
ABORT CONDITION: If docs don't clarify in 10 minutes, try Approach B
```

### Step 4: EXPERIMENT

```
EXPERIMENT: Read prefer-const rule documentation
COMMAND: Search ESLint docs for prefer-const
EXPECTED RESULT: Clear explanation of when let vs const is required
ACTUAL RESULT: Rule requires const when variable is never reassigned after declaration
VERDICT: PASS - I was reassigning in a loop but could use different pattern
```

### Step 5: LOG

```
DECISION: Proceeding with Approach A - restructure to use const
EVIDENCE: ESLint docs show const is required for non-reassigned variables
NEXT STEP: Use array destructuring instead of reassignment
LEARNING: prefer-const triggers when variable is assigned once in all code paths
```

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
