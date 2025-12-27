# autonomy-stack-v2 — Spec

**Phase:** D5  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- Existing devlog system (`Docs/Devlog/`)
- Existing watcher system (`scripts/watcher*.ps1`)
- Existing verification commands (`npm run verify`)

**Does not depend on:**

- Any specific app features (A1-A6)
- Supabase or external services

---

## 1) Goal / Problem

Cascade-driven development currently lacks evidence-based completion verification, leading to undetected regressions, repetitive loops on the same errors, and scope drift. This spec defines an "Autonomy Stack" that adds structured task routing, machine-readable telemetry, anomaly detection, and evidence bundles to increase development speed and quality.

## 2) Scope

### In scope

- **Box Router:** Task-type classification with per-box checklists
- **Telemetry:** JSONL event logging for commands, edits, errors
- **Anomaly Detection:** Repetition, time-over-baseline, churn, scope-drift triggers
- **Zoom-Out Protocol:** Deterministic recovery when anomalies fire
- **Evidence Bundles:** Per-task completion artifacts
- **Learning Extraction:** Pipeline to propose principles from evidence

### Out of scope

- Full MCP server implementation (optional, low priority)
- Integration with external CI/CD systems
- Real-time dashboards or visualization
- Automatic code generation based on telemetry

### What we don't want

- Replacing the existing devlog/learnings system — extend it
- Heavy dependencies (keep scripts simple, Node.js only)
- Breaking existing `npm run verify` or watcher functionality
- Overly complex schemas that are hard to maintain

## 3) Functional Requirements (FR)

### Box Router

- **TT-FR-001**: System provides 6 task boxes: Feature, Bugfix, Refactor, Infra/Build, Research/Decision, UI/UX
- **TT-FR-002**: Each box has a checklist defining required acceptance criteria format, minimum verification commands, evidence requirements, and risk class
- **TT-FR-003**: Cascade can read box definitions from `Docs/AI/boxes/` to determine which checks apply

### Telemetry

- **TT-FR-004**: A CLI tool writes JSONL events with schema: `{ts, event_type, box, message, [file], [command], [exit_code], [duration_ms], [error_fingerprint]}`
- **TT-FR-005**: Each session creates a timestamped log file in `scripts/ai/logs/`
- **TT-FR-006**: CLI provides commands: `log-event`, `start-command`, `end-command`, `fingerprint-error`
- **TT-FR-007**: `fingerprint-error` produces a stable hash from normalized error text

### Anomaly Detection

- **TT-FR-008**: Detector reads current session log and raises anomalies for:
  - `repetition`: same `error_fingerprint` ≥3 times
  - `time_over_baseline`: command duration >2× rolling median for box
  - `churn`: same file modified >N times in session (default N=5)
  - `scope_drift`: files touched outside planned list
- **TT-FR-009**: When anomaly triggers, detector outputs structured alert with type and details
- **TT-FR-010**: Baselines accumulate from past session logs; new sessions start fresh if no history

### Zoom-Out Protocol

- **TT-FR-011**: A `ZOOM_OUT.md` protocol file defines 5 steps: restate goal, propose alternatives, pick one, run experiment, log decision
- **TT-FR-012**: Anomaly detector output includes a reference to ZOOM_OUT.md when triggered

### Evidence Bundle

- **TT-FR-013**: A generator script creates a Markdown file per completed task containing:
  - Box type
  - Acceptance criteria (from task definition)
  - Changed files list
  - Commands run + results (from telemetry)
  - What was not tested and why
  - Links to specs/docs used
  - Commit hash (after changes committed)
- **TT-FR-014**: Evidence bundles are stored in `Docs/Devlog/Evidence/`

### Learning Extraction

- **TT-FR-015**: A pipeline command reads recent evidence bundles + anomalies
- **TT-FR-016**: Pipeline proposes candidate principles with: evidence links, counter-pattern, generalization
- **TT-FR-017**: Output appends to `Docs/Devlog/LEARNINGS-INBOX.md` (does not overwrite)
- **TT-FR-028**: LEARNINGS-INBOX reviewed weekly; items older than 14 days archived or promoted

## 4) Implementation Guarantees (IG)

- **TT-IG-001**: All scripts are Node.js (no external runtime dependencies beyond what's in package.json)
- **TT-IG-002**: Telemetry files use JSONL format (one JSON object per line)
- **TT-IG-003**: Scripts must not modify existing verification commands or watcher scripts
- **TT-IG-004**: All new npm scripts are additive (no changes to existing script names)
- **TT-IG-005**: Telemetry log files are append-only during a session
- **TT-IG-006**: Error fingerprints are deterministic (same error → same hash)
- **TT-IG-007**: Box checklists reference existing repo commands (`npm run verify`, `npm run test:unit`, etc.)

## 5) Design Decisions (DD)

- **TT-DD-001**: Use JSONL over structured JSON files for append-friendly logging
- **TT-DD-002**: Store AI tooling in `scripts/ai/` to parallel existing `scripts/build/`, `scripts/git/`
- **TT-DD-003**: Store AI docs in `Docs/AI/` to keep separate from Guidelines
- **TT-DD-004**: Use SHA-256 truncated to 8 chars for error fingerprints (collision-resistant, readable)
- **TT-DD-005**: Evidence bundles go in `Docs/Devlog/Evidence/` to integrate with existing devlog system
- **TT-DD-006**: Anomaly thresholds are configurable via constants at top of detector script

## 6) Edge cases

- **No previous session logs:** Baseline computation starts fresh; no time_over_baseline alerts until sufficient data
- **Empty telemetry log:** Anomaly detector exits cleanly with "no events" message
- **Malformed JSONL line:** Skip line, log warning, continue processing
- **Very long-running command:** Telemetry captures actual duration; baseline updates accordingly
- **Same file legitimately edited many times:** Churn threshold is configurable; can increase for known-chatty files
- **Planned files not specified:** If no `plan_created` event exists, scope_drift check is skipped
- **Known-exception files for scope_drift:** Detector config allows listing files (e.g., `package-lock.json`) that never trigger scope_drift

## 7) Data & privacy

- **What is stored?** Command names, file paths, exit codes, error messages, durations, timestamps
- **Where?** Local files in `scripts/ai/logs/` and `Docs/Devlog/Evidence/`
- **Retention?** Manual cleanup; old logs can be deleted or archived
- **Export/delete?** Plain text files, easy to delete or exclude from version control
- **Sensitive data?** No API keys or user data in telemetry; only dev process metadata

## 8) Framework Evolution Guardrails

This section defines mechanisms to ensure the Autonomy Stack framework can evolve without degrading.

### 8.1) Framework Versioning (Task A)

**Canonical Location:** `Docs/AI/VERSION.md`

**Version Format:** `FRAMEWORK_VERSION: 0.x.y`

**Versioning Rules:**

| Change Type | Bump | Example |
|-------------|------|---------|
| Breaking change to spec/schema/protocol | MAJOR (0.x → 1.0) | Telemetry schema incompatible |
| New feature or significant enhancement | MINOR (0.0.x → 0.1.0) | Add new box type, new anomaly detector |
| Bug fix, doc clarification, minor tweak | PATCH (0.0.0 → 0.0.1) | Fix typo in checklist, adjust threshold |

**Tagging Rules:**

- **Tag format:** `framework-v0.x.y`
- **When to tag:** After every framework change that passes verification
- **Tag message:** Include summary of changes and link to framework CHANGELOG entry
- **Command:** `git tag -a framework-v0.x.y -m "Framework: <summary>"`

**Requirements:**
- **TT-FR-018**: VERSION.md contains current FRAMEWORK_VERSION
- **TT-FR-019**: Every framework change bumps version according to rules above
- **TT-FR-020**: Git tag is created after each version bump

---

### 8.2) Framework-only CHANGELOG (Task B)

**Canonical Location:** `Docs/AI/CHANGELOG.md`

**Purpose:** Track all changes to the development framework (not app features).

**Entry Format:**

```markdown
## [0.x.y] - YYYY-MM-DD

### Category (Added/Changed/Fixed/Removed)

- **Change summary** — Rationale for change
  - Risk: low | medium | high
  - Evidence required: <what proves this works>
  - Affected files: <list>
```

**Required Fields per Entry:**

| Field | Description |
|-------|-------------|
| Version | Semantic version being released |
| Date | ISO date of change |
| Category | Added, Changed, Fixed, Removed, Deprecated |
| Summary | One-line description |
| Rationale | Why this change was made |
| Risk | low (docs/config), medium (behavior), high (schema/protocol) |
| Evidence | What verification proves correctness |

**Rules:**
- **TT-FR-021**: Every framework change MUST include a CHANGELOG entry
- **TT-FR-022**: CHANGELOG entry MUST be committed in same PR/commit as the change
- **TT-FR-023**: CHANGELOG is append-only at the top (newest first)

---

### 8.3) Golden Task Regression Suite — GTRS (Task C)

**Purpose:** Define reference tasks to measure framework effectiveness over time.

**Canonical Location:** `Docs/AI/GTRS.md` (definition) + `Docs/AI/GTRS-runs/` (results)

#### Golden Tasks (10 defined)

| ID | Name | Box | Description |
|----|------|-----|-------------|
| GT-01 | Simple Bugfix | bugfix | Fix isolated bug with clear repro steps |
| GT-02 | Multi-file Bugfix | bugfix | Fix bug spanning 2-3 files |
| GT-03 | Small Feature | feature | Add single new UI element or endpoint |
| GT-04 | Feature with Tests | feature | New feature including unit + E2E tests |
| GT-05 | Rename Refactor | refactor | Rename variable/function across codebase |
| GT-06 | Extract Module | refactor | Extract logic into new module |
| GT-07 | Add npm Script | infra-build | Add new script to package.json |
| GT-08 | Update Dependency | infra-build | Bump dependency version |
| GT-09 | Style/Layout Fix | ui-ux | CSS/styling change with visual verification |
| GT-10 | Research Decision | research-decision | Investigate options, document decision |

#### Per-Task Definition

Each golden task specifies:

```markdown
### GT-XX: <Name>

**Box:** <box-type>
**Difficulty:** easy | medium | hard
**Expected Duration:** <minutes>

**Acceptance Criteria Template:**
- AC-1: <criterion>
- AC-2: <criterion>

**Minimum Verification Commands:**
- `npm run verify`
- <additional commands>

**Evidence Bundle Requirements:**
- [ ] Box type declared
- [ ] All AC checked
- [ ] Changed files listed
- [ ] Verification output included

**Success Metrics:**
- Anomalies triggered: 0 (ideal)
- Retries needed: 0 (ideal)
- Time vs expected: ≤1.2x (ideal)
- Manual interventions: 0 (ideal)
```

#### GTRS Run Cadence

| Trigger | Action |
|---------|--------|
| Before framework version tag | Run all 10 golden tasks, record results |
| Weekly (optional) | Run subset (GT-01, GT-03, GT-05, GT-09) |
| After major framework change | Run full suite |

#### Results Recording

**Location:** `Docs/AI/GTRS-runs/YYYY-MM-DD.md`

**Format:**

```markdown
# GTRS Run: YYYY-MM-DD

**Framework Version:** 0.x.y
**Trigger:** <pre-tag | weekly | post-change>
**Operator:** Cascade | Human

## Results

| Task | Status | Anomalies | Retries | Time | Interventions | Notes |
|------|--------|-----------|---------|------|---------------|-------|
| GT-01 | PASS | 0 | 0 | 5m | 0 | — |
| GT-02 | PASS | 1 | 1 | 12m | 0 | churn on utils.ts |
| ... |

## Summary

- Pass rate: X/10
- Avg anomalies: X
- Avg time vs expected: X
- Regressions from last run: <list or "none">
```

**Requirements:**
- **TT-FR-024**: GTRS.md defines all 10 golden tasks with full specification
- **TT-FR-025**: GTRS run is required before each framework version tag
- **TT-FR-026**: Results are stored in timestamped markdown files
- **TT-FR-027**: Regression (worse metrics than previous run) blocks version tag until investigated

---

## 9) Acceptance checks (testable)

### Box Router
- [ ] AC-001: `Docs/AI/boxes/` contains 6 box definition files
- [ ] AC-002: Each box file has: acceptance criteria format, verification commands, evidence requirements, risk class

### Telemetry
- [ ] AC-003: Running `npm run ai:log-event -- --type=test --message="hello"` creates/appends to session log
- [ ] AC-004: Session log file is valid JSONL (each line parses as JSON)
- [ ] AC-005: `npm run ai:fingerprint-error` produces consistent hash for same input

### Anomaly Detection
- [ ] AC-006: Running detector on log with 3+ identical error_fingerprints outputs `repetition` anomaly
- [ ] AC-007: Running detector on log with file modified 6+ times outputs `churn` anomaly
- [ ] AC-008: Anomaly output includes reference to ZOOM_OUT.md

### Evidence Bundle
- [ ] AC-009: Running `npm run ai:evidence` generates Markdown file in `Docs/Devlog/Evidence/`
- [ ] AC-010: Generated file contains all required sections (box, criteria, files, commands, gaps, links)

### Learning Extraction
- [ ] AC-011: Running `npm run ai:extract-learnings` appends to LEARNINGS-INBOX.md
- [ ] AC-012: Proposed principles include evidence links

### Integration
- [ ] AC-013: `npm run verify` still passes after all changes
- [ ] AC-014: Existing watcher functionality unchanged

### Framework Evolution Guardrails
- [ ] AC-015: `Docs/AI/VERSION.md` exists with FRAMEWORK_VERSION in format `0.x.y`
- [ ] AC-016: `Docs/AI/CHANGELOG.md` exists with required entry format documented
- [ ] AC-017: `Docs/AI/GTRS.md` exists with all 10 golden tasks defined
- [ ] AC-018: `Docs/AI/GTRS-runs/` directory exists for storing run results
- [ ] AC-019: Each golden task in GTRS.md has: box, difficulty, duration, AC template, verification commands, evidence requirements, success metrics

## 10) Change log

**[2025-12-27 21:28]**

- Added: Section 8 "Framework Evolution Guardrails" with Tasks A/B/C
- Added: TT-FR-018 through TT-FR-027 for versioning, changelog, GTRS
- Added: AC-015 through AC-019 for guardrails verification
- Added: 10 golden tasks definition for GTRS

**[2025-12-27 21:15]**

- Added: Initial spec created based on user requirements
- Added: Phase 0 discovery findings integrated

---

## 11) Spec Completeness Checklist

Before proceeding to Phase 2 (Plan), verify all required sections are complete:

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (TT-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (TT-IG-xxx)
- [x] Design Decisions (DD) — all numbered (TT-DD-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Framework Evolution Guardrails defined (versioning, changelog, GTRS)
- [x] Acceptance checks — all numbered (AC-xxx) and mapped to FR/IG
- [x] No ambiguous terms without measurable definitions
