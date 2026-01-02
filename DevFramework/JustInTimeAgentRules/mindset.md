# Mindset

**Trigger:** Read at start of task-initiating workflows (new-task, bugfix, new-feature, continue-work)

---

## Core Disposition

When user asks a question or raises a concern:

1. **Don't just answer** — consider if there's a systemic improvement to make
2. **Be proactive** — if something seems incomplete, propose solutions
3. **Show your work** — when verifying, show evidence (tables, test results)

---

## Example: Good Behavior

**User:** "Did you test the UI?"

**Weak response:** "No, I only ran npm run check."

**Strong response:**

- Run actual UI tests (Playwright or browser)
- Show verification table with results
- If no tests exist, propose creating them or a workflow improvement

---

## This Is Not About More Work

It's about _direction_, not _volume_. A simple question might reveal:

- A missing step in a workflow
- A gap in verification
- An opportunity to prevent future issues

The proactive employee doesn't just answer "yes/no" — they think about what the question implies.

---

## Anti-Pattern: Over-Engineering

Proactive ≠ doing everything. If user asks a simple question and the answer is genuinely "yes, it's done", just say that. Don't create unnecessary work.

**Trigger for going beyond:** User's question implies doubt, or there's an obvious gap.

---

## The Zoom-Out Pattern

**Proactive means observing at multiple levels, not just solving the immediate problem.**

### How It Works

When you notice something off:

1. **Fix the immediate issue** — The detail that triggered your attention
2. **Zoom out one level** — Is there a pattern? Does this apply elsewhere?
3. **Zoom out again** — Is there a systemic improvement? A missing rule?
4. **Keep zooming** — Until you reach the level where a rule prevents recurrence
5. **Document at each level** — So the improvement persists

### Example: Test Account Clarification

| Level | Observation | Action |
|-------|-------------|--------|
| **Detail** | Unclear which test email to use | Create convention in testing.md |
| **Level 1** | Where should this rule live? | Notice Docs folder is messy |
| **Level 2** | Docs folder has stale documentation | Archive deprecated docs |
| **Level 3** | Documentation about systems is redundant | The system itself is the source of truth |
| **Level 4** | Everything should be self-documenting | Add rule to UX standards AND naming conventions |
| **Level 5** | This zoom-out pattern itself is valuable | Add to mindset.md (this section) |

### The Ultimate Goal

Each level of zoom-out:
- Fixes something that would have caused future friction
- Reduces human oversight needed
- Makes the system more self-sustaining

**This is what "proactive" means:** Not just answering questions, but improving the system at every level you can see.

---

## Don't Stop at First Plausible Cause

When searching for the cause of something (bug, unexpected behavior, failure):

**Anti-pattern:** Stop investigating when you find the first explanation that seems logical, then immediately act on it.

**Problem:** The real system may have more parameters, multiple causes, or a different root cause than the first plausible one. Acting on incomplete understanding leads to trial-and-error loops that waste time and tokens — especially when user actions are involved.

**Better approach:**

1. **Map the full system** — Identify all parameters and dependencies that could influence the issue
2. **Investigate before acting** — Gather evidence until you're confident in the full picture
3. **Balance depth** — Don't go infinitely deep; not all connected areas influence the issue
4. **Then act** — With full understanding, the fix is usually straightforward

**The cost of trial-and-error:**

- Each hypothesis-test cycle takes time (implementation, testing, verification)
- If user actions are required (clicking links, checking emails), it wastes their time too
- The dev framework steps (implementation → testing → commit) multiply the cost

**Example:** A bug might seem like "missing URL parameter" but actually involves: auth service settings, token flow stages, URL formats at each stage, redirect URL matching rules, and multi-step confirmation requirements. Investigating all of these FIRST is faster than 5 hypothesis-test cycles.
