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

## Step 0: Load Rule-Structure Guidelines

**Before starting, read:** `DevFramework/JustInTimeAgentRules/rule-structure.md`

This contains the principles for what makes a good rule (mid-level vs low-level, goal-tracing, etc.).

> [RULE-LOADED] rule-structure guidelines loaded

---

## Step 1: Determine Scope

1. Check if this chat has previous "Capture Learnings Summary" blocks
2. If yes → Only analyze messages AFTER the last summary
3. If no → Analyze entire chat

---

## Step 2: Scan for Reasoning Patterns

**Focus:** Capture HOW the user thinks, not just WHAT we did.

**Apply rule-structure.md principles** (loaded in Step 0):
- Goal-trace each observation to quality + speed + human time
- Find existing mid-level rules to attach examples to
- Verify vs speculate — label accordingly

Scan for patterns in these categories:

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
   - Does this principle already exist? → Skip
   - If similar but different → Note the nuance
4. **Apply rule-structure.md decision criteria:**
   - New rule or example? (default to example)
   - Check example value (skip if too similar)
5. **Determine destination** (which JIT file and which existing rule)

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

**All rule-structure principles are in:** `DevFramework/JustInTimeAgentRules/rule-structure.md` (loaded in Step 0)

This includes: goal-tracing, mid-level vs low-level, what NOT to capture, hierarchy for learnings, etc.

**Quick reference (details in rule-structure.md):**
- Goal-trace to quality + speed + human time
- Find existing mid-level rules → add examples
- Verify vs speculate — label accordingly
- Different domain test — would this apply to cooking/banking/game app?
