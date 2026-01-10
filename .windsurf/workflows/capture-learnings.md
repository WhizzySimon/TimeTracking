---
description: Capture learnings from chat - unified workflow for all learning categories
---

# Capture Learnings

**Trigger:** Before closing a chat (or on-demand for specific topic)

**Purpose:** Systematically capture learnings from the chat session and route them to appropriate JIT rule files.

---

## Model Recommendation

**Recommended:** Opus 4 Thinking (5x credits)

**Why:** Proper learning capture requires deep reasoning — tracing chains to the main goal, distinguishing verified facts from speculation, finding mid-level principles rather than surface-level extractions. Sonnet tends to stop at first plausible abstraction.

**Downgrade to Sonnet 4.5 (2x):** Only for very short chats with obvious, already-documented patterns.

---

## Usage

- `/capture-learnings` — Scan all categories
- `/capture-learnings <category>` — Scan only specified category

**Categories:** `behavioral`, `ui-ux`, `code`, `backend`, `state-data`, `testing`, `debugging`, `framework`, `process`, `task-patterns`

---

## Step 1: Determine Scope

1. Check if this chat has previous "Capture Learnings Summary" blocks
2. If yes → Only analyze messages AFTER the last summary
3. If no → Analyze entire chat

---

## Step 2: Scan for Reasoning Patterns

**Focus:** Capture HOW the user thinks, not just WHAT we did.

### The Goal-Tracing Requirement

**Don't stop at the first abstraction.** Keep asking "why?" until you reach the main goal (quality + speed + human time).

```
Observation → Why? → Why that? → Why that? → Main goal
```

**Example:**

- Observation: User says "delete promoted entries from INBOX"
- Why? → Promoted items don't belong in pending storage
- Why does that matter? → Reduces noise, maintains clarity
- Why does THAT matter? → No confusion, no maintenance overhead
- Connection to goal: → Quality + speed + human time saved

**The principle is the MID-LEVEL connection, not the task-specific detail.**

### Find Existing Rules, Don't Create New Low-Level Ones

Before creating a new rule, ask: Does an existing mid-level rule cover this?

**Structure for learnings:**
```
Mid-level rule:     [existing rule in JIT file, e.g., "Single Source of Truth"]
                           ↑
Lower-level example: [specific instance from this chat]
                           ↓
Chain to goal:      [how this serves quality + speed + human time]
```

**Concrete example:**
- Observation: "Delete promoted entries from INBOX"
- ❌ Wrong (too low): "Storage containers should only hold items in their intended state"
- ✅ Right (mid-level): Attach to existing rule **"Single Source of Truth"**
- Chain to goal: No duplication → no confusion → no maintenance overhead → quality + speed + human time

**Add examples to existing rules rather than creating rule bloat.**

### Honesty Check

Before capturing any learning:

- Is this verified or speculation? Label accordingly.
- Am I taking user's words as law, or tracing what's behind them?
- Am I stopping at first plausible abstraction, or tracing to goal?

---

**Only capture learnings that pass the generalizability test:**

- Would this principle apply to a completely different app (cooking, banking, game)?
- Does it explain "why it works" not just "what we did"?
- If it's just task documentation (file names, specific timing, one-time decisions) → Skip it.

---

### Look for moments where the user:

**1. Thinks ahead:**

- "What happens if...?"
- "What about edge case X?"
- Catches consequences you missed

**Example:**

- User: "What happens with learnings in INBOX after promotion?"
- Principle: **Think ahead — trace the full lifecycle before finalizing a design**
- Applies to: Any system design, database schemas, workflow planning

**2. Questions assumptions:**

- "Why not...?"
- "Have you considered...?"
- Challenges your approach
- Reveals redundancy or inefficiency

**Example:**

- User: "If learnings go to JIT files, why duplicate in LEARNINGS.md?"
- Principle: **Challenge every piece of storage — does it serve a unique purpose?**
- Applies to: Database design, file systems, caching strategies

**3. Reveals decision criteria:**

- Explains WHY they prefer X over Y
- Shows trade-offs they consider
- Demonstrates consistent principles

**Example:**

- User: "Let's do one workflow for all, categorized inside"
- Principle: **Consolidation over fragmentation when core process is the same**
- Applies to: Code architecture, API design, workflow design

**4. Corrects your thinking:**

- Not just the solution, but HOW to think about it
- Mental models you were missing
- Patterns you should recognize

**Example:**

- User: "See how fast that was? I give you one good example and you immediately get the whole idea"
- Principle: **Examples anchor principles instantly — show the pattern once, AI extracts the rule**
- Applies to: Documentation, teaching, onboarding, API design

**5. Provides examples that clarify instantly:**

- One good example that makes everything click
- Analogies to different domains
- Concrete instances of abstract principles

**Example:**

- User: "Would this apply to a cooking app? A banking app?"
- Principle: **Different domain test — if it doesn't transfer, it's not a rule**
- Applies to: Any abstraction, documentation, teaching

---

### Skip these (not learnings):

- ❌ Implementation details (file names, paths, timing)
- ❌ Task documentation ("we moved X to Y")
- ❌ One-time decisions specific to this project
- ❌ Solutions without the reasoning behind them

---

## Step 3: Extract & Verify

For each reasoning pattern found:

1. **Extract the principle** (app-independent, transferable)
2. **Note the example** (specific instance from this chat)
3. **Verify against existing JIT rules:**
   - Check relevant JIT files (mindset.md, framework-principles.md, debugging.md, etc.)
   - Does this principle already exist?
   - If yes → Skip (don't duplicate)
   - If similar but different → Note the nuance
4. **Decide: New rule or example?**
   - Does an existing mid-level rule cover this? → **Add as example** to that rule
   - Is this a genuinely new principle not covered? → **Create new rule**
   - Default to example — new rules should be rare
5. **Check example value:**
   - Is this example different enough from existing examples?
   - Does it illustrate a distinct aspect of the rule?
   - If too similar to existing examples → Skip (reduce noise)
6. **Determine destination** (which JIT file and which existing rule)

---

## Step 3.5: Web Research (Standard Step)

Before presenting learnings for approval, research best practices:

1. **Search** for industry best practices on the topic
2. **Summarize** findings (3-5 bullet points)
3. **Compare** your learning vs industry standards

Present comparison table to user:

| Aspect | Our Learning | Industry Best Practice | Aligned? |
|--------|--------------|------------------------|----------|
| ... | ... | ... | ✅/❌ |

This grounds learnings in external validation and helps decide if we're on the right track or need adjustment.

---

## Step 4: Present for Approval

For each learning found, present to user:

- **Observation:** What user said/did
- **Type:** New rule OR Example (to which existing rule?)
- **Proposed addition:** The specific text to add (framed as question when possible — questions trigger thinking better than statements)
- **Goal connection:** How this serves quality + speed + human time
- **Confidence:** High/Medium/Low (affects weight/placement)
- **Industry context:** What web research found (if applicable)

### Format

```markdown
## Learning [N]: [Title]

**Observation:** [what happened in chat]
**Type:** [New rule / Example to: {existing rule}]
**Proposed text:** [the actual text to add, preferably as a question]
**Chain to goal:** [connection to quality/speed/time]
**Confidence:** [High/Medium/Low]
**Industry context:** [web research findings, if done]
```

**Wait for user approval before adding to JIT files.**

---

## Step 5: Add to JIT Files or INBOX

**High confidence + approved:**
- Add example directly to the appropriate JIT rule
- Include the goal connection chain

**Medium/Low confidence + approved:**
- Add to `DevFramework/FrameworkSelfImprovementLogs/LEARNINGS-INBOX.md`
- Wait for 2+ occurrences (Medium) or 3+ occurrences (Low) before promoting to JIT

**Rejected:**
- Discard

---

## Step 6: Summary

Output a summary block:

```markdown
## Capture Learnings Summary

**Scope:** [entire chat / incremental after X]
**Learnings found:** X
**Presented for approval:** X
**Approved and added:** X (after user confirmation)
**Rejected:** X
```

---

## Notes

### Core Principles

- **Be honest** — Only claim what you can verify. Label speculation as speculation.
- **Trace to goal** — Keep asking "why?" until you reach quality + speed + human time
- **Mid-level, not low-level** — Find existing rules and add examples, don't create rule bloat
- **Verify user input** — User's words are data, not law. Trace what's behind them.
- **Concise principles > detailed checklists** — Detailed steps create mechanical following; concise principles force thinking

### Quality Checks

- **Different domain test** — Would this apply to a cooking/banking/game app?
- **Goal connection test** — Can you trace this to quality + speed + human time?
- **Existing rule test** — Does a mid-level rule already cover this?
- **Speculation test** — Is this verified or hypothesis?

### What NOT to Capture

- ❌ Task documentation ("we did X")
- ❌ Low-level details that should be examples under existing rules
- ❌ Speculation presented as fact
- ❌ First-abstraction principles without goal connection
- ❌ Rules for things agent already does correctly — only add rules for behaviors that FAIL without the rule

### Hierarchy for Learnings

```
Main goal:        Quality + Speed + Human time
                         ↑
Mid-level rule:   [existing JIT rule]
                         ↑
Lower-level:      [example from this chat]
```

Add examples to rules. Don't create new low-level rules.
