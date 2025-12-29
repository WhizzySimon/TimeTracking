# Schubladendenken Audit — TimeTracker Guidance System

**Date:** 2025-12-27  
**Scope:** Complete audit of rules, workflows, memory artifacts, and learning loops

---

## I. Current System Snapshot

### A. Instruction Surface Inventory

| Path                                                    | Scope  | Trigger/Load Method            | Size       | Priority        |
| ------------------------------------------------------- | ------ | ------------------------------ | ---------- | --------------- |
| **Always-On Rules (.windsurf/rules/)**                  |
| `.windsurf/rules/code-quality-rules.md`                 | Global | `trigger: always_on` (auto)    | 94 lines   | Core invariant  |
| `.windsurf/rules/command-execution-rules.md`            | Global | `trigger: always_on` (auto)    | 16 lines   | Core invariant  |
| `.windsurf/rules/implementation-specification-rules.md` | Global | `trigger: always_on` (auto)    | 38 lines   | Core invariant  |
| `.windsurf/rules/ui-design-rules.md`                    | Global | `trigger: always_on` (auto)    | 109 lines  | Core invariant  |
| **Rule Dispatcher**                                     |
| `RULE_MAP.md`                                           | Global | Manual reference               | 52 lines   | Core dispatcher |
| **JIT Rules (Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/)**                             |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md`                           | Phase  | Manual (at session start)      | 33 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/spec-writing.md`                            | Phase  | Manual (when creating spec)    | 38 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/planning.md`                                | Phase  | Manual (when planning)         | 51 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md`                          | Phase  | Manual (before coding)         | 66 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md`                              | Phase  | Manual (before commit)         | 50 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md`                             | Phase  | Manual (at session end)        | 85 lines   | Phase-specific  |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/framework-changes.md`                       | Phase  | Manual (when changing docs)    | 37 lines   | Phase-specific  |
| **Workflows (.windsurf/workflows/)**                    |
| `entrypoints/new-task.md`                               | Entry  | `/new-task` slash command      | 69 lines   | Entry point     |
| `entrypoints/new-feature.md`                            | Entry  | `/new-feature` slash command   | 121 lines  | Entry point     |
| `entrypoints/continue-work.md`                          | Entry  | `/continue-work` slash command | 71 lines   | Entry point     |
| `entrypoints/continue-work-auto-continue.md`            | Entry  | `/continue-work-auto-continue` | 89 lines   | Entry point     |
| `helpers/read-governance.md`                            | Helper | Called by entrypoints          | 23 lines   | Internal        |
| `helpers/rules-read-all.md`                             | Helper | Called by entrypoints          | 17 lines   | Internal        |
| `helpers/read-core-docs-and-code.md`                    | Helper | Called by entrypoints          | 55 lines   | Internal        |
| `helpers/sdd-profile.md`                                | Helper | Manual                         | 31 lines   | Utility         |
| `helpers/sdd-transcript-insights.md`                    | Helper | Manual                         | —          | Utility         |
| **Doc Hierarchy**                                       |
| `Docs/INDEX.md`                                         | Global | Referenced as source of truth  | 116 lines  | Core invariant  |
| `.windsurf/cascade.md`                                  | Global | Windsurf-specific config       | 44 lines   | Core invariant  |
| `START_HERE.md`                                         | Info   | Human quickstart (non-auth)    | 49 lines   | Reference       |
| **Guidelines (Reference Docs)**                         |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/SPEC_DRIVEN_DEVELOPMENT.md`            | Ref    | Manual                         | 330 lines  | Reference       |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` | Ref    | Manual                         | 118 lines  | Reference       |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/DEVELOPMENT_GUIDELINES.md`             | Ref    | Manual                         | 6525 bytes | Reference       |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/UI_LOGIC_SPEC_V1.md`                   | Ref    | Manual                         | 8032 bytes | Reference       |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/TECHNICAL_GUIDELINE_V1.md`             | Ref    | Manual                         | 9070 bytes | Reference       |
| `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/SVELTEKIT_PWA_ADDENDUM.md`             | Ref    | Manual                         | 4748 bytes | Reference       |
| **Learning/Memory Artifacts**                           |
| `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS.md`                              | Memory | Manual (session start)         | 31 lines   | Core memory     |
| `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS-INBOX.md`                        | Memory | Manual (session end)           | 40 lines   | Capture buffer  |
| `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/DECISIONS.md`                              | Memory | Manual                         | 94 lines   | Decision log    |
| `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/CHANGELOG.md`                              | Memory | Manual (pre-commit)            | 58 lines   | History         |

**Total Always-On Context:** ~257 lines (4 files in `.windsurf/rules/`)  
**Total JIT Context:** ~360 lines (7 files in `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/`)

---

### B. Knowledge Box Map (Current vs Intended)

| Trigger/Phase      | What SHOULD Load                                          | What CURRENTLY Loads                                                                       | Gap Analysis                                                                      |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Session Start**  | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md`, `LEARNINGS.md`, `INDEX.md` | Via `/new-task` or `/continue-work`: reads `.windsurf/rules/*`, `INDEX.md`, `LEARNINGS.md` | ✅ Mostly correct. Gap: Not all workflows call `/rules-read-all` first.           |
| **Spec Writing**   | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/spec-writing.md`, spec template               | Manual — must remember to read                                                             | ⚠️ Gap: No automatic trigger. Relies on RULE_MAP reference in always-on rule.     |
| **Planning**       | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/planning.md`, plan template                   | Manual — must remember to read                                                             | ⚠️ Gap: No automatic trigger.                                                     |
| **Implementation** | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md`, relevant spec/plan/tasks  | Manual — must remember to read                                                             | ⚠️ Gap: No automatic trigger. Workflows reference it but don't enforce reading.   |
| **Pre-commit**     | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md`                                | Manual — must remember to read                                                             | ⚠️ Gap: Critical! Pre-commit rules forgotten (violations 2025-12-26, 2025-12-27). |
| **Session End**    | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md`, `LEARNINGS-INBOX.md`         | Manual — must remember to read                                                             | ⚠️ Gap: Self-learning not reliably invoked.                                       |
| **Debugging**      | N/A (no specific rules)                                   | N/A                                                                                        | ✅ OK — uses general implementation rules.                                        |
| **UI Work**        | `.windsurf/rules/ui-design-rules.md`                      | Always-on (auto-loaded)                                                                    | ⚠️ Overload: Loaded even for non-UI work. 109 lines always in context.            |

---

## II. Findings (Ranked)

### Must-Fix (Causing Rule Ignoring, Overload, Repeated Mistakes)

1. **Pre-commit rules not enforced at trigger point**
   - **Evidence:** `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/LEARNINGS.md` line 17: "ESCALATED: Added mandatory pre-commit checklist to AGENTS.md after violations on 2025-12-26 and 2025-12-27"
   - **Problem:** AGENTS.md was replaced by RULE_MAP.md, but pre-commit rules still require manual lookup
   - **Impact:** Changelog/learnings updates forgotten repeatedly

2. **JIT rules rely on manual memory, not automatic injection**
   - **Evidence:** All `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/*.md` files say "Read X before doing Y" but there's no mechanism to enforce this
   - **Problem:** "Context rot" — by the time commit happens, session-start rules are forgotten
   - **Impact:** The Schubladendenken structure exists but isn't reliably triggered

3. **Always-on rules are ~257 lines — at the upper limit**
   - **Evidence:** `.windsurf/rules/*.md` totals: 94 + 16 + 38 + 109 = 257 lines
   - **Problem:** `ui-design-rules.md` (109 lines) loads even for non-UI work
   - **Impact:** Context budget consumed by potentially irrelevant rules

### Should-Fix (Quality/Consistency)

4. **Workflows contain process instructions that duplicate doc content**
   - **Evidence:** `new-task.md` lines 38-69 duplicate "After task completion" steps
   - **Problem:** Violates `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/framework-changes.md` line 10: "Workflows only orchestrate"
   - **Impact:** Stale instructions when docs are updated

5. **No canary/verification that JIT rules were actually loaded**
   - **Evidence:** No mechanism exists to confirm rule loading worked
   - **Problem:** Silent failures — Cascade may not have read the right rule
   - **Impact:** No way to debug rule compliance issues

6. **LEARNINGS-INBOX promotion is manual and inconsistent**
   - **Evidence:** `LEARNINGS-INBOX.md` has 8 pending items, some from 2025-12-26
   - **Problem:** No defined cadence for promotion review
   - **Impact:** Learnings accumulate without enforcement

### Could-Fix (Nice-to-Have)

7. **RULE_MAP.md could include inline core principles**
   - Currently 52 lines, could absorb 3-line core principles from always-on rules to reduce duplication

8. **`sdd-profile.md` and `sdd-transcript-insights.md` are utility workflows**
   - Could be moved to a separate `research/` folder to clarify they're not part of normal flow

---

## III. Concrete Improvements (Minimal Disruption)

### A. Proposed Dispatcher/Map Changes

**Current:** `RULE_MAP.md` is a passive reference. JIT rules require manual lookup.

**Proposed:** Add "Rule Loading Verification" section to each JIT rule file:

```markdown
## Verification (add to top of each Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/\*.md)

When you read this file, output:

> [RULE-LOADED] pre-commit.md

This confirms the rule was loaded at the correct trigger.
```

**Implementation:**

- Add 3-line "Verification" header to each `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/*.md` file
- Cascade outputs marker when rule is loaded, enabling audit trail

### B. Proposed Workflow Updates

| Workflow           | Current Issue                            | Proposed Fix                                                                                           |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `new-task.md`      | Duplicates "After task completion" steps | Remove lines 38-69, replace with: "Follow `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md` then `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md`" |
| `continue-work.md` | Same duplication                         | Same fix                                                                                               |
| `new-feature.md`   | Same duplication                         | Same fix                                                                                               |

### C. Proposed Rule Splitting/Summarization

| File                                                    | Current Lines | Proposed Action                                                                       |
| ------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `.windsurf/rules/ui-design-rules.md`                    | 109           | Move to `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/ui-work.md` (JIT), keep 10-line summary in always-on with pointer |
| `.windsurf/rules/code-quality-rules.md`                 | 94            | Keep as-is (genuinely always needed)                                                  |
| `.windsurf/rules/command-execution-rules.md`            | 16            | Keep as-is (critical for watcher)                                                     |
| `.windsurf/rules/implementation-specification-rules.md` | 38            | Keep as-is (bootstrap pointer to JIT rules)                                           |

**Net effect:** Always-on context reduced from ~257 to ~158 lines.

### D. Proposed Learning-Loop Process

#### Current State

- **Capture:** `LEARNINGS-INBOX.md` (working)
- **Promote:** Manual, no defined cadence
- **Enforce:** Promoted items go to `LEARNINGS.md` but may not reach trigger rules

#### Proposed Process

```
┌─────────────────────────────────────────────────────────────────────┐
│  CAPTURE                                                             │
│  └─ After each feedback: add to LEARNINGS-INBOX.md                   │
│     Format: | Date | Context | Feedback | Promoted? |                │
│                                                                     │
│  PROMOTE (at session-end, if any Pending items)                     │
│  └─ Check: Repeated 2+ times OR explicitly marked by maintainer?    │
│  └─ If yes: Add to LEARNINGS.md with category                       │
│                                                                     │
│  ENFORCE (if category = "Hard Rule")                                │
│  └─ Add to the appropriate Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/*.md file                     │
│  └─ NOT to .windsurf/rules/ (those are always-on, limited budget)   │
│                                                                     │
│  CLEANUP (monthly)                                                   │
│  └─ Hard cap: 30 items in LEARNINGS.md                              │
│  └─ Prune: Items not referenced in 10+ sessions                     │
│  └─ Merge: Duplicates and overlapping rules                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Key addition:** Explicit "Enforce" step that routes Hard Rules to specific trigger files.

---

## IV. Verification Plan

### A. Canary Test Design

**Purpose:** Prove that JIT rule loading works at the correct trigger point.

**Marker Rule:** Add to `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md`:

```markdown
## Canary (verification marker)

**CANARY-PC-001:** When loading pre-commit rules, output exactly:

> [CANARY] pre-commit rules loaded

If this marker does not appear before a commit, the rule was not loaded.
```

**Test Scenario:**

| Step | Action                                             | Expected                                 |
| ---- | -------------------------------------------------- | ---------------------------------------- |
| 1    | User says "I want to commit my changes"            | Cascade reads `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md` |
| 2    | Cascade outputs `[CANARY] pre-commit rules loaded` | Confirms rule was loaded                 |
| 3    | Cascade follows pre-commit checklist               | Confirms rule was applied                |

**Pass/Fail Criteria:**

- **PASS:** Canary marker appears before any commit-related action
- **FAIL:** Commit happens without canary marker

**If Fail:** Check:

1. Is `RULE_MAP.md` referenced in always-on rules? ✅ (in `implementation-specification-rules.md`)
2. Did the workflow invoke rule reading? Check workflow file
3. Cascade context may have rotted — consider smaller always-on set

### B. Ongoing Regression Checks

| Check                    | Frequency    | How                                                  |
| ------------------------ | ------------ | ---------------------------------------------------- |
| Pre-commit canary fires  | Every commit | Look for `[CANARY]` in chat                          |
| LEARNINGS-INBOX reviewed | Session end  | Check for new Pending items                          |
| Always-on context size   | Weekly       | Count lines in `.windsurf/rules/*.md` (target: <200) |
| Stale INBOX items        | Weekly       | Items pending >7 days should be triaged              |

---

## V. Summary

### Does the Current System Implement Schubladendenken?

**Verdict: Partially implemented (70%)**

| Concept                     | Implemented? | Notes                                                             |
| --------------------------- | ------------ | ----------------------------------------------------------------- |
| Knowledge boxes (JIT rules) | ✅ Yes       | `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/` folder with 7 trigger-based files                   |
| Finite attention management | ⚠️ Partial   | Always-on rules at ~257 lines (borderline); UI rules could be JIT |
| Learning loop               | ⚠️ Partial   | Capture works; promotion manual; enforcement unclear              |
| Phase awareness             | ✅ Yes       | RULE_MAP.md defines 7 trigger points                              |
| Verification (canary)       | ❌ No        | No mechanism exists                                               |

### Priority Actions (in order)

1. **Add canary markers** to `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md` and `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md`
2. **Move `ui-design-rules.md`** from always-on to JIT (reduces context by 109 lines)
3. **Remove workflow duplication** — workflows should reference rules, not embed them
4. **Define promotion cadence** — review INBOX at session-end, promote or reject

### Minimal Disruption Principle

All proposed changes:

- Add 3-10 lines per file (canary markers)
- Move 1 file (ui-design-rules)
- Remove ~30 lines per workflow (duplication)
- No structural changes to existing docs

---

**End of Audit**
