# Just-in-Time Rules System Research

**Date:** 2025-12-27  
**Purpose:** Research and plan for restructuring AGENTS.md into a trigger-based "Rule Dispatcher" system

---

## Problem Statement

Current AGENTS.md is 282 lines. By the time a commit happens, rules from the beginning of the session are forgotten. This leads to repeated violations (e.g., pre-commit checklist forgotten on 2025-12-26 and 2025-12-27).

**Root cause:** Cognitive overload. Too many rules loaded upfront, attention budget depleted by the time action is needed.

---

## Industry Research

### Anthropic (Official Guidance)

Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

Key quotes:

- "Context must be treated as a finite resource with diminishing marginal returns."
- "LLMs, like humans, lose focus or experience confusion at a certain point."
- "Good context engineering means finding the **smallest possible set of high-signal tokens**."
- "System prompts should be extremely clear... specific enough to guide behavior effectively, yet flexible enough."

Recommended technique: **Structured note-taking / Agentic memory**

- "The agent regularly writes notes persisted to memory outside of the context window."
- "These notes get pulled back into the context window at later times."

### Phil Schmid (Hugging Face)

Source: https://www.philschmid.de/context-engineering

Definition:

> "Context Engineering is the discipline of designing dynamic systems that provide **the right information and tools, in the right format, at the right time**."

Key insight:

- "Context Engineering is a System, Not a String"
- "Dynamic: Created on the fly, tailored to the immediate task"

### Industry Term

This approach is called **"just-in-time context fetching"** — load rules when needed, not upfront.

---

## Current Structure Analysis

### Files to Restructure

#### AGENTS.md (282 lines) — Current Sections

| Section                      | Lines   | Trigger Point       | New Location                    |
| ---------------------------- | ------- | ------------------- | ------------------------------- |
| Start-of-session workflow    | 9-16    | Session start       | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md     |
| Mandatory doc loading        | 17-24   | Session start       | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md     |
| Source of truth              | 26-31   | Always (core)       | Keep in dispatcher              |
| Phase 1-4 Process            | 32-128  | Before implementing | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md    |
| Git workflow                 | 130-147 | Before commit       | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md        |
| Verification                 | 149-160 | After implementing  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md    |
| Coding rules                 | 162-167 | While implementing  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md    |
| PWA constraints              | 169-172 | While implementing  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md    |
| Single Source of Truth table | 174-188 | Reference           | Keep in dispatcher              |
| Self-Learning System         | 190-229 | After feedback      | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md       |
| Rules for framework changes  | 231-239 | When changing docs  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/framework-changes.md |
| Pre-commit checklist         | 241-251 | Before commit       | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md        |
| Session-end rules            | 253-271 | Session end         | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md       |
| Communication style          | 273-282 | Always (core)       | Keep in dispatcher              |

#### .windsurf/rules/ (Always-On Rules)

| File                                  | Purpose          | Keep as-is?                                |
| ------------------------------------- | ---------------- | ------------------------------------------ |
| code-quality-rules.md                 | Coding standards | Yes (always needed when coding)            |
| command-execution-rules.md            | Watcher usage    | Yes (always needed for commands)           |
| implementation-specification-rules.md | Spec writing     | Consider trigger-based                     |
| ui-design-rules.md                    | UI patterns      | Consider trigger-based (only when UI work) |

#### Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/ (Reference Docs)

| File                                  | Purpose          | Trigger                        |
| ------------------------------------- | ---------------- | ------------------------------ |
| DEVELOPMENT_GUIDELINES.md             | Coding standards | When implementing              |
| IMPLEMENTATION_SPECIFICATION_RULES.md | Spec writing     | When creating specs            |
| NAMING_CONVENTIONS.md                 | Naming           | When implementing              |
| SPEC_DRIVEN_DEVELOPMENT.md            | Full workflow    | Session start                  |
| SVELTEKIT_PWA_ADDENDUM.md             | PWA constraints  | When implementing PWA features |
| TECHNICAL_GUIDELINE_V1.md             | Architecture     | When planning                  |
| UI_LOGIC_SPEC_V1.md                   | Product spec     | When implementing UI           |

#### Docs/DevFramework/ToolSetup
Framework/ToolSetup
/ (Tool Docs)

| File               | Purpose       | Trigger               |
| ------------------ | ------------- | --------------------- |
| BOOTSTRAP.md       | Quick start   | Session start         |
| CASCADE_WATCHER.md | Watcher usage | When running commands |
| GIT_WORKFLOW.md    | Git rules     | Before commit         |

---

## Proposed Trigger Points

| Trigger ID | When                          | Files to Read                                        |
| ---------- | ----------------------------- | ---------------------------------------------------- |
| T1         | Session start                 | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md                          |
| T2         | Before creating/updating spec | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/spec-writing.md                           |
| T3         | Before creating/updating plan | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/planning.md                               |
| T4         | Before implementing           | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md                         |
| T5         | Before git commit             | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md                             |
| T6         | Session end                   | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md                            |
| T7         | When changing framework docs  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/framework-changes.md                      |
| T8         | When UI work                  | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/ui-rules.md (or keep in .windsurf/rules/) |

---

## New File Structure

```
Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/                          (NEW folder)
├── session-start.md                 (T1)
├── spec-writing.md                  (T2)
├── planning.md                      (T3)
├── implementation.md                (T4)
├── pre-commit.md                    (T5)
├── session-end.md                   (T6)
└── framework-changes.md             (T7)

RULE_DISPATCHER.md                   (replaces AGENTS.md, ~50 lines)
```

---

## Slimmed Dispatcher Content (Draft)

```markdown
# Rule Dispatcher

## Core Principles (always in mind)

- Source of truth: Docs/INDEX.md
- Never use git stash
- Use && for watcher commands (cmd.exe)

## Trigger Points

| When                   | Read first                   |
| ---------------------- | ---------------------------- |
| Session start          | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-start.md  |
| Creating/updating spec | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/spec-writing.md   |
| Creating/updating plan | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/planning.md       |
| Before implementing    | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/implementation.md |
| Before git commit      | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md     |
| Session end            | Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/session-end.md    |

## Quick Reference

- Specs: Docs/Features/Specs/<feature>.md
- Plans: Docs/Features/Plans/<feature>.md
- Tasks: Docs/Features/Tasks/<feature>.md
- Changelog: Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/CHANGELOG.md
```

---

## Naming Suggestions for AGENTS.md Replacement

| Name                   | Pros                             | Cons                               |
| ---------------------- | -------------------------------- | ---------------------------------- |
| **RULE_DISPATCHER.md** | Clear function, action-oriented  | Slightly technical                 |
| **RULE_ENTRY.md**      | Simple, short                    | Less descriptive                   |
| **RULE_INDEX.md**      | Familiar pattern (like INDEX.md) | Might confuse with Docs/INDEX.md   |
| **CONTEXT_LOADER.md**  | Industry term aligned            | Too technical                      |
| **WHEN_TO_READ.md**    | Very clear intent                | Unconventional                     |
| **TRIGGER_MAP.md**     | Descriptive                      | Might be unclear                   |
| **RULES.md**           | Simple                           | Too generic                        |
| **DEV_RULES.md**       | Clear scope                      | Doesn't convey dispatcher function |
| **PROCESS_GUIDE.md**   | User-friendly                    | Doesn't convey trigger concept     |
| **GUIDE.md**           | Minimal                          | Too vague                          |

**Recommended:** `RULE_DISPATCHER.md` or `WHEN_TO_READ.md`

---

## Migration Checklist

When implementing, ensure nothing is lost:

### From AGENTS.md (282 lines)

- [ ] Start-of-session workflow → session-start.md
- [ ] Mandatory doc loading → session-start.md
- [ ] Source of truth → dispatcher (core)
- [ ] Phase 1 SPEC → spec-writing.md
- [ ] Phase 2 PLAN → planning.md
- [ ] Phase 3 TASKS → planning.md
- [ ] Phase -1 PRE-IMPLEMENTATION GATES → implementation.md
- [ ] Phase 4 IMPLEMENT → implementation.md
- [ ] Git workflow → pre-commit.md
- [ ] Verification → implementation.md
- [ ] Coding rules → implementation.md
- [ ] PWA constraints → implementation.md
- [ ] Single Source of Truth table → dispatcher (reference)
- [ ] Self-Learning System → session-end.md
- [ ] Rules for framework changes → framework-changes.md
- [ ] Pre-commit checklist → pre-commit.md
- [ ] Session-end rules → session-end.md
- [ ] Communication style → dispatcher (core)

### From .windsurf/rules/

- [ ] code-quality-rules.md → KEEP (always-on, needed when coding)
- [ ] command-execution-rules.md → KEEP (always-on, needed for watcher)
- [ ] implementation-specification-rules.md → REVIEW (might merge into Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/)
- [ ] ui-design-rules.md → REVIEW (might trigger-based for UI work only)

---

## Next Steps

See **`Docs/IMPLEMENTATION_PROGRESS.md`** → Phase D4 for detailed task breakdown.

---

## Decisions Made

- [x] Approve trigger points (T1-T7) — **APPROVED** (2025-12-27)
- [x] Choose name for dispatcher file — **RULE_MAP.md** (2025-12-27)
- [x] Confirm Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/ as location for trigger-based rules — **APPROVED** (2025-12-27)
