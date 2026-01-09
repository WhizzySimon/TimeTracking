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
4. **Determine destination** (which JIT file)
5. **Check LEARNINGS-INBOX.md** for similar entries

---

## Step 4: Check for Promotion

If 2+ similar entries exist in LEARNINGS-INBOX.md:

### 4a: Web Research

Before proposing promotion, research best practices:

```
Search: "[topic] best practices" OR "[pattern] industry standard"
```

Summarize findings (3-5 bullet points).

### 4b: Present Both

Present to user:

- **Your learning:** [extracted principle]
- **Industry best practices:** [research summary]
- **Proposed rule:** [combined/refined rule]
- **Target file:** [JIT file path]

### 4c: Wait for Approval

**Do NOT add to JIT file without explicit user approval.**

---

## Step 5: Add to INBOX or JIT

**If new learning (no similar entries):**

- Add to `LEARNINGS-INBOX.md` with category tag

**If approved for promotion:**

- Add to appropriate JIT file
- **Delete the promoted entries from LEARNINGS-INBOX.md** — the INBOX should only contain pending items
- The JIT file is now the permanent home for the learning

---

## Step 6: Summary

Output a summary block:

```markdown
## Capture Learnings Summary

**Scope:** [first commit / incremental after X]
**Categories scanned:** [all / specific]

| Category   | Learnings Found | Action                              |
| ---------- | --------------- | ----------------------------------- |
| Behavioral | 0               | —                                   |
| UI/UX      | 1               | Added to INBOX                      |
| Backend    | 1               | Proposed promotion (2nd occurrence) |
| ...        | ...             | ...                                 |

**Promotions proposed:** X
**Awaiting approval:** [list if any]
```

---

## LEARNINGS-INBOX.md Entry Format

```markdown
| Date | Reasoning Pattern | User's Question/Correction | Principle Extracted | Destination | Status |
| YYYY-MM-DD | [thinks ahead / questions assumptions / etc.] | [what user said/asked] | [transferable principle + example] | [target file] | Pending |
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

### Hierarchy for Learnings

```
Main goal:        Quality + Speed + Human time
                         ↑
Mid-level rule:   [existing JIT rule]
                         ↑
Lower-level:      [example from this chat]
```

Add examples to rules. Don't create new low-level rules.
