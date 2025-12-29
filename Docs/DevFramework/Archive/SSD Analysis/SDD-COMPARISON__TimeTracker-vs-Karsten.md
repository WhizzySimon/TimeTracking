# SDD Comparison: TimeTracker vs Karsten (SharePoint-GPT-Middleware)

**Generated:** 2025-12-24  
**Purpose:** Compare Spec-Driven Development systems between two repos

---

## 1) Executive Summary (10 bullets max)

1. **TimeTracker has formal 4-phase workflow** (Spec → Plan → Tasks → Implement) with explicit checkpoints; Karsten has spec-first culture but no formal phases
2. **TimeTracker has INDEX.md priority hierarchy** for conflict resolution; Karsten lacks explicit source-of-truth ordering
3. **Karsten has richer spec templates** (~400 lines implementation-specification-rules.md vs ~80 lines in TimeTracker)
4. **TimeTracker has dedicated devlog system** with 28 entries, follow-up tracking, metrics JSON; Karsten has none
5. **TimeTracker has explicit pre-implementation gates** (simplicity, anti-abstraction, scope-lock); Karsten lacks these
6. **Karsten has superior code formatting rules** (python-rules.md with 291 lines of examples); TimeTracker has minimal code-quality-rules.md
7. **TimeTracker has automated verification pipeline** (npm run verify, cascade-watcher.ps1); Karsten relies on manual execution
8. **TimeTracker has task templates with parallelization markers** and estimated durations; Karsten has no task decomposition system
9. **Karsten specs include dependency declarations** ("Depends on" / "Does not depend on"); TimeTracker specs lack this
10. **TimeTracker has mandatory /project-start workflow**; Karsten has /rules-read-all but no session bootstrap

---

## 2) Side-by-Side Scorecard (0-5 scale)

| Axis                     | A: TimeTracker | B: Karsten | Notes                                                                                           |
| ------------------------ | -------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 1. Spec quality          | 4              | 5          | Karsten: richer templates, dependency declarations, exhaustive examples                         |
| 2. Scope control         | 5              | 3          | TimeTracker: explicit in/out scope, pre-impl gates; Karsten: implicit                           |
| 3. Traceability          | 5              | 4          | TimeTracker: FR/IG/DD → AC mapping, devlog tracking; Karsten: FR/IG/DD only                     |
| 4. Code quality rules    | 2              | 5          | Karsten: 291-line python-rules.md with BAD/GOOD examples; TT: 43 lines                          |
| 5. Testing strategy      | 4              | 2          | TimeTracker: Playwright, Vitest, E2E; Karsten: no test infrastructure                           |
| 6. Tooling & automation  | 5              | 2          | TimeTracker: cascade-watcher, npm run verify; Karsten: manual only                              |
| 7. Context bootstrapping | 5              | 3          | TimeTracker: /project-start → /rules-read-all → /read-governance; Karsten: /rules-read-all only |
| 8. Iteration loop        | 5              | 2          | TimeTracker: task workflow, progress tracker, git commit; Karsten: ad-hoc                       |
| 9. Operational safety    | 4              | 3          | TimeTracker: COMMAND_EXECUTION_RULES.md; Karsten: no explicit safety rules                      |
| 10. Cost/time efficiency | 4              | 4          | Both emphasize simplicity; TimeTracker has more overhead but better tracking                    |
| **TOTAL**                | **43**         | **33**     |                                                                                                 |

---

## 3) Evidence Highlights

### A: TimeTracker

#### Governance / Source of Truth

- `Docs/INDEX.md` — explicit priority order (lines 7-15): INDEX > ui-logic-spec > technical-guideline > SVELTEKIT_PWA_ADDENDUM > DEVELOPMENT_GUIDELINES > IMPLEMENTATION_SPECIFICATION_RULES > AGENTS.md
- `AGENTS.md` — 166 lines defining 4-phase workflow, mandatory doc loading, verification rules

#### Spec Structure

- `Docs/Features/Specs/_template.md` — 73 lines with Goal, Scope, FR, IG, DD, Edge cases, Data & privacy, Acceptance checks, Change log, Completeness checklist
- FR/IG/DD numbering: `TT-FR-001`, `TT-IG-001`, `TT-DD-001`

#### Task Decomposition

- `Docs/Features/Tasks/_template.md` — 38 lines with Files, Done when, Verify, Guardrails, Parallel marker, Estimated duration
- Task granularity: 0.5-2h human-sized

#### Workflow Bootstrapping

- `.windsurf/workflows/project-start.md` — chains /rules-read-all → /read-governance → /read-core-docs-and-code
- `.windsurf/workflows/new-feature.md` — 115 lines guiding Spec → Plan → Tasks → Implement
- `.windsurf/workflows/continue-work.md` — auto-finds next incomplete task

#### Verification Discipline

- `package.json` scripts: `verify`, `check`, `lint`, `format`, `test:unit`, `test:e2e`, `test:webkit`, `test:ios`
- `.windsurf/rules/COMMAND_EXECUTION_RULES.md` — 408 lines defining cascade-watcher system, verification workflow

#### Devlog/Decision Tracking

- `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/INDEX.md` — 28 devlog entries with Date, Title, Path, Status, Tags
- `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/FOLLOW-UPS.md` — 84 follow-ups with FollowUpID, SourceDL, Priority, Owner, Status
- `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/DEVLOG_METRICS.json` — automated metrics (113 decisions, 84 follow-ups)

#### Code-Quality Guardrails

- `.windsurf/rules/code-quality-rules.md` — 43 lines (warnings policy, no svelte-ignore)
- `.windsurf/rules/ui-design-rules.md` — 105 lines (dialog policy, minimal interruption, error handling)
- Pre-implementation gates in AGENTS.md: Simplicity (≤3 files), Anti-Abstraction, Integration-First, Scope-Lock, Test-Ready

### B: Karsten (SharePoint-GPT-Middleware)

#### Governance / Source of Truth

- **No AGENTS.md** — no explicit process rules
- **No INDEX.md** — no priority hierarchy
- README.md serves as project overview (374 lines) but not governance

#### Spec Structure

- `.windsurf/rules/implementation-specification-rules.md` — 399 lines with:
  - 15 required sections (Overview, TOC, Scenario, Context, FR, IG, DD, Domain Objects, User Actions, UX Design, Key Mechanisms, Action Flow, Data Structures, Implementation Details, Spec Changes)
  - Dependency declarations: "Depends on" / "Does not depend on"
  - Spec length guidelines: small ~500 lines, medium ~1000 lines, complex ~2500 lines
  - Extensive BAD/GOOD examples
- FR/IG/DD numbering: `XXXX-FR-01`, `XXXX-IG-01`, `XXXX-DD-01` (domain prefix)
- Example specs: `_V2_SPEC_ROUTERS.md` (1680 lines), `_V2_SPEC_COMMON_UI_FUNCTIONS.md` (1240 lines)

#### Task Decomposition

- **No task templates** — no Docs/Features/Tasks/ folder
- **No task granularity rules** — work is spec-driven but not task-decomposed

#### Workflow Bootstrapping

- `.windsurf/workflows/rules-read-all.md` — reads .windsurf/rules/\*.md
- `.windsurf/workflows/read-all-md-files.md` — reads all .md files
- **No /project-start equivalent** — no mandatory session bootstrap

#### Verification Discipline

- **No package.json** (Python project uses requirements.txt)
- **No automated verification scripts** — manual execution assumed
- **No cascade-watcher equivalent**

#### Devlog/Decision Tracking

- **No Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/** folder
- **No follow-up tracking**
- **No metrics tracking**
- Spec Changes sections in individual specs serve as changelog

#### Code-Quality Guardrails

- `.windsurf/rules/python-rules.md` — 291 lines with:
  - MAX_LINE_CHARS = 220, TAB = 2 spaces
  - Import grouping rules
  - Logging format with `[ x / n ]` iteration, `( x / n )` retry
  - Function grouping with START/END markers
  - Extensive BAD/GOOD examples for every rule
  - Singular/plural message handling
- **No pre-implementation gates**
- **No simplicity/anti-abstraction rules**

---

## 4) Best-of Merge (Top 10 Practices to Adopt into TimeTracker)

### 1. Spec Dependency Declarations — APPLIED 2025-12-24

**What:** Add "Depends on" / "Does not depend on" sections to spec template  
**Target:** `Docs/Features/Specs/_template.md`  
**Change:** Add after header block:

```markdown
**Depends on:**

- (list specs that must be read first)

**Does not depend on:**

- (explicitly exclude related-but-not-required specs)
```

### 2. Spec Length Guidelines — APPLIED 2025-12-24

**What:** Add recommended spec length by complexity  
**Target:** `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`  
**Change:** Add section:

```markdown
## Spec Length Guidelines

- Small task: ~100-200 lines
- Medium task: ~300-500 lines
- Complex task: ~800-1500 lines
```

### 3. Domain Prefix for FR/IG/DD — APPLIED 2025-12-24

**What:** Use feature-specific prefixes instead of generic TT-  
**Target:** `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`  
**Change:** Added "Domain Prefix Convention" section with examples and usage guidance.

### 4. Exhaustive BAD/GOOD Examples in Code Rules

**What:** Add concrete BAD/GOOD code examples to code-quality-rules.md  
**Target:** `.windsurf/rules/code-quality-rules.md`  
**Change:** Add examples section with TypeScript/Svelte patterns (similar to python-rules.md structure)

### 5. Logging Format Standardization

**What:** Define iteration `[ x / n ]` and retry `( x / n )` log format  
**Target:** `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/DEVELOPMENT_GUIDELINES.md`  
**Change:** Add logging section with format rules

### 6. Function Grouping Markers

**What:** Use START/END comment markers for function groups  
**Target:** `.windsurf/rules/code-quality-rules.md`  
**Change:** Add:

```markdown
## Function Grouping

Use markers for related functions:
// --------- START: Topic A ---------
// --------- END: Topic A ---------
```

### 7. "What we don't want" Section — APPLIED 2025-12-24

**What:** Add explicit anti-patterns section to spec template  
**Target:** `Docs/Features/Specs/_template.md`  
**Change:** Add after Scope section:

```markdown
## What we don't want

- (explicit anti-patterns and rejected approaches)
```

### 8. Layer Architecture Diagrams

**What:** Encourage ASCII box diagrams for multi-layer systems  
**Target:** `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`  
**Change:** Add diagram example section

### 9. Spec Changes Timestamp Format — APPLIED 2025-12-24

**What:** Use `**[YYYY-MM-DD HH:MM]**` format with action prefixes  
**Target:** `Docs/Features/Specs/_template.md` + `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md`  
**Change:** Updated Change log section in template and added "Change Log Format" section in guidelines.

### 10. Singular/Plural Message Handling Rule

**What:** Add rule for correct singular/plural in user messages  
**Target:** `.windsurf/rules/code-quality-rules.md`  
**Change:** Add:

```markdown
## Singular/Plural Messages

Handle correctly: "0 items", "1 item", "2 items"
Avoid: "1 item(s)"
```

---

## 5) Next Actions (exactly 3 bullets)

1. ~~**Update `Docs/Features/Specs/_template.md`**~~ — DONE 2025-12-24: Added dependency declarations, "What we don't want" section, and timestamped changelog format
2. **Expand `.windsurf/rules/code-quality-rules.md`** — Add BAD/GOOD examples, function grouping markers, logging format, singular/plural rules (NOT DONE - .windsurf/rules protected)
3. ~~**Add spec length guidelines**~~ — DONE 2025-12-24: Added to `Docs/DevFramework/ToolSetup
Framework/DeveloperGuidesAndStandards
/IMPLEMENTATION_SPECIFICATION_RULES.md` with complexity-based recommendations + domain prefix convention

---

## Missing Files in Karsten Repo (blocked comparison)

- **No AGENTS.md** — could not compare process governance
- **No Docs/Features/Tasks/ folder** — could not compare task decomposition
- **No Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/ folder** — could not compare decision tracking
- **No package.json or test scripts** — could not compare verification automation
- **No CI/CD configuration** — could not compare continuous integration

---

## Scoring Policy

**Missing systems:** When a repo lacks a system entirely (e.g., no devlog, no task templates), score = 0 for that capability within the axis. Process maturity requires evidence.

**Confidence per axis:**
| Axis | A: TimeTracker | B: Karsten |
|---------------------------|----------------|------------|
| 1. Spec quality | High | High |
| 2. Scope control | High | Med |
| 3. Traceability | High | Med |
| 4. Code quality rules | High | High |
| 5. Testing strategy | High | Low |
| 6. Tooling & automation | High | Low |
| 7. Context bootstrapping | High | Med |
| 8. Iteration loop | High | Low |
| 9. Operational safety | High | Low |
| 10. Cost/time efficiency | Med | Med |

**Confidence definitions:**

- **High:** Direct repo evidence (files, scripts, templates)
- **Med:** Partial evidence or inferred from patterns
- **Low:** No repo evidence; scored based on absence

---

## Appendix: Transcript-derived Insights

**Source:** `KARSTEN-MEETING-INSIGHTS.md` (derived from meeting transcript 2025-12-18)

### Insights NOT proven by repo evidence

1. **Model benchmarking with "gold standard" question set**
   - Karsten uses 10+ canonical questions to evaluate models before adoption
   - Axis: Tooling & automation
   - Repo evidence: None found; this is a runtime practice not captured in docs

2. **Rule-compliance checks as explicit iteration step**
   - Agent reviews its own output against rules/spec before proceeding
   - Axis: Iteration loop
   - Repo evidence: None; no workflow file mandates this step

3. **Browser-first exploration principle**
   - Prefers GET-accessible endpoints to avoid Postman/curl friction
   - Axis: Cost/time efficiency
   - Repo evidence: None; API design philosophy not documented

### CONFLICT: Transcript vs Repo Evidence

1. **CONFLICT: Iteration loop score**
   - Transcript suggests active rule-compliance loops (would raise score to 3-4)
   - Repo shows no workflow/automation for this (scored 2)
   - Resolution: Keep score at 2; undocumented practices don't count for process maturity

2. **CONFLICT: Tooling & automation score**
   - Transcript mentions model benchmarking tooling (would raise score)
   - Repo shows no benchmark scripts or test harness (scored 2)
   - Resolution: Keep score at 2; verbal claims without repo artifacts don't raise score

3. **CONFLICT: Context bootstrapping score**
   - Transcript emphasizes "self-documenting endpoints" as core principle
   - Repo has /rules-read-all but no explicit self-documentation mandate (scored 3)
   - Resolution: Keep score at 3; philosophy stated but not codified
