---
description: Capture learnings from chat - unified workflow for all learning categories
---

# Capture Learnings

**Trigger:** Before closing a chat (or on-demand for specific topic)

**Purpose:** Systematically capture learnings from the chat session and route them to appropriate JIT rule files.

---

## Model Recommendation

**Recommended:** Sonnet 4.5 (2x credits)

**Why:** Chat analysis and pattern extraction require good reasoning but not complex code generation. Sonnet excels at reading conversation history, categorizing learnings, and extracting principles.

**Upgrade to Opus 4 Thinking (5x):** Only if the chat is extremely long (>100 messages) or contains complex architectural discussions requiring deep analysis.

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

- **Capture HOW the user thinks, not WHAT we did**
- Focus on **reasoning patterns** that reveal principles
- Principles must be **transferable** (different domain test)
- **Verify against existing JIT rules** before adding to INBOX
- Examples anchor principles — one good example > detailed instructions
- Web research adds industry context before promotion
- User approval required before adding to JIT files
