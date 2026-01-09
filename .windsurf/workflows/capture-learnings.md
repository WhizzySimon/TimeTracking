---
description: Capture learnings from chat - unified workflow for all learning categories
---

# Capture Learnings

**Trigger:** Before closing a chat (or on-demand for specific topic)

**Purpose:** Systematically capture learnings from the chat session and route them to appropriate JIT rule files.

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

## Step 2: Scan Categories

For each category (or specified category), scan the chat for learnings.

### Category 0: Disagreements & Alternative Suggestions (→ appropriate JIT file)

**Scan for:**

- Moments where user disagreed with agent's suggestion
- Moments where user proposed a different approach
- Moments where user corrected agent's direction

**For each disagreement found:**

1. Identify WHAT the user preferred
2. Ask one level higher: **What higher principle or reason is behind that decision?**
3. Extract the underlying principle (not just the specific choice)
4. Route to appropriate JIT file based on the principle's domain

**Triggers:** "no", "instead", "I prefer", "let's do X instead", "actually", "not quite", "I disagree"

**Example:**

- Agent suggests: "Create separate workflow for each topic"
- User says: "Let's do one workflow for all, categorized inside"
- Higher principle: "Consolidation over fragmentation when the core process is the same"
- Route to: `framework-principles.md` or relevant workflow file

---

### Category 1: Behavioral (→ mindset.md)

**Scan for:**

- Corrections: "Don't do X", "Always do Y", "You should have..."
- Positive feedback on specific behavior (not vague praise)
- Agent disposition improvements
- Proactive behavior examples

**Triggers:** User frustration, explicit correction, behavioral praise

---

### Category 2: UI/UX Principles (→ frontend-ui-standards.md / frontend-ux-standards.md)

**Scan for:**

- WHY behind visual decisions (not just WHAT changed)
- Layout, spacing, typography reasoning
- Interaction pattern reasoning
- Accessibility insights
- Responsive design patterns

**Triggers:** "because", "the reason is", "users expect", "it looks better when"

---

### Category 3: Code Quality (→ code-quality.md)

**Scan for:**

- Code style insights
- Architecture patterns
- Component design principles
- Error handling patterns
- Performance considerations

**Triggers:** "cleaner way", "better pattern", "should always", "anti-pattern"

---

### Category 4: Backend Patterns (→ backend-patterns.md)

**Scan for:**

- API design patterns
- Auth flow patterns (Supabase, tokens, sessions)
- Data sync strategies
- External service integration
- Error handling for async operations

**Triggers:** "Supabase", "API", "auth", "sync", "token", "endpoint"

---

### Category 5: State & Data (→ state-data-patterns.md)

**Scan for:**

- State management patterns (Svelte stores)
- Caching strategies
- Persistence patterns (IndexedDB, localStorage)
- Offline-first patterns
- Data flow insights

**Triggers:** "store", "cache", "persist", "offline", "IndexedDB", "localStorage"

---

### Category 6: Testing (→ ProjectSpecific/testing.md)

**Scan for:**

- E2E test strategies
- Test organization patterns
- Test data management
- Playwright patterns
- Test reliability insights

**Triggers:** "test", "E2E", "Playwright", "assertion", "fixture"

---

### Category 7: Debugging (→ debugging.md)

**Scan for:**

- Root cause analysis techniques
- Debugging strategies that worked
- Tools or approaches that helped
- Anti-patterns in debugging

**Triggers:** "root cause", "found the issue", "the problem was", "debugging"

---

### Category 8: Framework Meta (→ framework-principles.md)

**Scan for:**

- What made the framework/workflow better
- Rule effectiveness insights
- Workflow improvements
- Agent behavior patterns that worked
- Meta-observations about the development process

**Triggers:** "the framework should", "this workflow", "the rule", "meta", "process improvement"

---

### Category 9: Process (→ workflow files or implementation.md)

**Scan for:**

- Workflow refinements
- Checklist additions
- Process improvements
- Efficiency gains

**Triggers:** "workflow", "checklist", "step", "process", "before/after"

---

### Category 10: Task-Type Patterns (→ TaskTypeRules/\*.md)

**Scan for:**

- New failure patterns discovered (add to "Common Failure Patterns")
- New prevention strategies
- Discipline rules that worked
- Task-specific insights

**Match to task type:** bugfix, feature, ui-ux, refactor, research-decision, infra-build

**Triggers:** Task type keywords, "pattern", "always fails when", "worked because"

---

## Step 3: Extract Learnings

For each learning found:

1. **Identify the principle** (app-independent rule)
2. **Note the example** (app-specific instance)
3. **Determine destination** (which JIT file)
4. **Check LEARNINGS-INBOX.md** for similar entries

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
| Date | Category | Context | Learning | Destination | Status |
| YYYY-MM-DD | [category] | [brief context] | [principle + example] | [target file] | Pending / Promoted |
```

---

## Notes

- This workflow captures **reasoning**, not just changes
- Focus on **transferable principles**, not one-off fixes
- Keep principles **app-independent** with **app-specific examples**
- Web research adds industry context to learnings
- User approval required before adding to JIT files
