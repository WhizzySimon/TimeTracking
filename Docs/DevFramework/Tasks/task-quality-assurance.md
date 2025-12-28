# TaskQualityAssurance - Tasks

**Phase:** D5  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-28  
**Based on Spec:** `Docs/DevFramework/Specs/task-quality-assurance.md`  
**Based on Plan:** `Docs/DevFramework/Plans/task-quality-assurance.md`

---

# PHASE 0: Framework Evolution Guardrails (Prerequisites)

These tasks MUST be completed before any code implementation tasks.

---

## Task D5.0a - Create Framework VERSION.md

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/VERSION.md` (new)
- **Done when:**
  - File contains `FRAMEWORK_VERSION: 0.1.0`
  - Includes versioning rules (major/minor/patch)
  - Includes tagging workflow
  - Includes version history table
- **Verify:**
  - File exists with correct format
- **Guardrails:**
  - Version starts at 0.1.0 (not 1.0.0)
- **Estimated:** 0.25h

---

## Task D5.0b - Create Framework CHANGELOG.md

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/CHANGELOG.md` (new)
- **Done when:**
  - File contains changelog entry format documentation
  - Includes initial 0.1.0 entry template
  - Required fields documented: version, date, category, summary, rationale, risk, evidence
- **Verify:**
  - File exists with entry format
- **Guardrails:**
  - This is framework-only changelog, NOT app changelog
  - Append-only at top (newest first)
- **Estimated:** 0.25h

---

## Task D5.0c - Create GTRS.md (Golden Task Regression Suite)

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/GTRS.md` (new)
  - `Docs/DevFramework/TaskQualityAssurance/GTRS-runs/.gitkeep` (new)
- **Done when:**
  - File defines all 10 golden tasks (GT-01 through GT-10)
  - Each task has: box, difficulty, expected duration, AC template, verification commands, evidence requirements, success metrics
  - Run cadence documented
  - Results format documented
- **Verify:**
  - File exists with all 10 golden tasks
  - GTRS-runs directory exists
- **Guardrails:**
  - Golden tasks represent REAL work patterns in this repo
  - Metrics must be measurable
- **Estimated:** 1h

---

# PHASE 1: Documentation & Box Router

---

## Task D5.1 - Create folder structure and INDEX

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/INDEX.md` (new)
  - `Docs/DevFramework/TaskQualityAssurance/boxes/` (new directory)
  - `scripts/ai/` (new directory)
  - `scripts/ai/logs/.gitkeep` (new)
  - `Docs/Devlog/Evidence/.gitkeep` (new)
- **Done when:**
  - All directories exist
  - INDEX.md explains the Autonomy Stack purpose and links to components
- **Verify:**
  - Directories exist
- **Guardrails:**
  - Must not modify existing files
- **Estimated:** 0.5h

---

## Task D5.2 - Create box template and 6 box checklists

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/boxes/_template.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/feature.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/bugfix.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/refactor.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/infra-build.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/research-decision.md`
  - `Docs/DevFramework/TaskQualityAssurance/boxes/ui-ux.md`
- **Done when:**
  - Each box file has: acceptance criteria format, verification commands, evidence requirements, risk class
  - All boxes reference existing npm commands
- **Verify:**
  - Files exist and contain required sections
- **Guardrails:**
  - Use only existing `npm run` commands
- **Estimated:** 1h

---

## Task D5.3 - Create ZOOM_OUT protocol

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/ZOOM_OUT.md`
- **Done when:**
  - Protocol defines 5 steps: restate goal, propose alternatives, pick one, run experiment, log decision
  - Clear instructions for Cascade to follow
- **Verify:**
  - File exists with all 5 steps
- **Guardrails:**
  - Protocol must be deterministic (no ambiguous instructions)
- **Estimated:** 0.5h

---

# PHASE 2: Telemetry & Scripts

---

## Task D5.4 - Create telemetry.js CLI tool

- **Files:**
  - `scripts/ai/telemetry.js`
- **Done when:**
  - CLI supports: `log-event`, `start-command`, `end-command`, `fingerprint-error`
  - Writes JSONL to `scripts/ai/logs/session-<timestamp>.jsonl`
  - Uses only Node.js built-ins (fs, path, crypto)
  - Session file is created on first event if not exists
- **Verify:**
  - `node scripts/ai/telemetry.js log-event --type=test --message="hello"` creates log entry
  - `node scripts/ai/telemetry.js fingerprint-error "Error at line 5"` outputs hash
  - Running same fingerprint command twice produces identical hash
- **Guardrails:**
  - No external dependencies
  - Append-only to log files
- **Estimated:** 1.5h

---

## Task D5.5 - Create anomaly-detector.js

- **Files:**
  - `scripts/ai/anomaly-detector.js`
- **Done when:**
  - Reads current session log
  - Detects 4 anomaly types: repetition, time_over_baseline, churn, scope_drift
  - Outputs structured anomaly JSON with reference to ZOOM_OUT.md
  - Gracefully handles missing baselines
- **Verify:**
  - Create test log with 3 identical error fingerprints → outputs repetition anomaly
  - Create test log with file edited 6 times → outputs churn anomaly
  - Running on empty/missing log outputs "no events" message
- **Guardrails:**
  - No external dependencies
  - Does not modify log files
- **Estimated:** 1.5h

---

## Task D5.6 - Create evidence-generator.js

- **Files:**
  - `scripts/ai/evidence-generator.js`
- **Done when:**
  - Reads session log and task metadata
  - Generates Markdown file in `Docs/Devlog/Evidence/`
  - Includes: box type, acceptance criteria, changed files, commands run, gaps, links
- **Verify:**
  - Running generator creates `Docs/Devlog/Evidence/<task-id>.md`
  - Generated file contains all required sections
- **Guardrails:**
  - Does not overwrite existing evidence files (appends timestamp if conflict)
- **Estimated:** 1h

---

## Task D5.7 - Create learning-extractor.js

- **Files:**
  - `scripts/ai/learning-extractor.js`
- **Done when:**
  - Reads recent evidence bundles and anomaly history
  - Proposes candidate principles with evidence links, counter-pattern, generalization
  - Appends to `Docs/Devlog/LEARNINGS-INBOX.md`
- **Verify:**
  - Running extractor adds new row to LEARNINGS-INBOX.md
  - Proposed principle includes evidence link
- **Guardrails:**
  - Append-only to LEARNINGS-INBOX.md
  - Does not modify LEARNINGS.md (that's manual promotion)
- **Estimated:** 1h

---

## Task D5.8 - Add npm scripts to package.json

- **Files:**
  - `package.json`
- **Done when:**
  - Added scripts: `ai:log-event`, `ai:start-command`, `ai:end-command`, `ai:fingerprint-error`, `ai:detect-anomalies`, `ai:evidence`, `ai:extract-learnings`
- **Verify:**
  - `npm run ai:log-event -- --help` works
  - `npm run ai:detect-anomalies` works
- **Guardrails:**
  - Do not modify existing scripts
  - All new scripts start with `ai:` prefix
- **Estimated:** 0.5h

---

# PHASE 3: Integration & Verification

---

## Task D5.9 - Update Docs/INDEX.md

- **Files:**
  - `Docs/INDEX.md`
- **Done when:**
  - Added section for Autonomy Stack / AI tooling
  - Links to `Docs/DevFramework/TaskQualityAssurance/INDEX.md`
- **Verify:**
  - Section appears in INDEX.md
- **Guardrails:**
  - Append only, do not remove existing content
- **Estimated:** 0.5h

---

## Task D5.10 - Verify and create usage examples

- **Files:**
  - `Docs/DevFramework/TaskQualityAssurance/INDEX.md` (update)
- **Done when:**
  - INDEX.md includes example flows for Bugfix and Feature tasks
  - `npm run verify` passes
  - All AI scripts work correctly
- **Verify:**
  - `npm run verify` → ALL PASSED
  - Example commands in INDEX.md work when run manually
  - All `ai:*` commands run without error: `npm run ai:log-event -- --help`, etc.
- **Guardrails:**
  - Do not break existing functionality
- **Estimated:** 1h

---

## Summary

### Phase 0: Framework Evolution Guardrails (Prerequisites)

| Task  | Description            | Est.  | Status |
| ----- | ---------------------- | ----- | ------ |
| D5.0a | Framework VERSION.md   | 0.25h | DONE   |
| D5.0b | Framework CHANGELOG.md | 0.25h | DONE   |
| D5.0c | GTRS.md (Golden Tasks) | 1h    | DONE   |

### Phase 1: Documentation & Box Router

| Task | Description              | Est. | Status |
| ---- | ------------------------ | ---- | ------ |
| D5.1 | Folder structure + INDEX | 0.5h | DONE   |
| D5.2 | Box checklists (6 files) | 1h   | DONE   |
| D5.3 | ZOOM_OUT protocol        | 0.5h | DONE   |

### Phase 2: Telemetry & Scripts

| Task | Description           | Est. | Status |
| ---- | --------------------- | ---- | ------ |
| D5.4 | telemetry.js CLI      | 1.5h | DONE   |
| D5.5 | anomaly-detector.js   | 1.5h | DONE   |
| D5.6 | evidence-generator.js | 1h   | DONE   |
| D5.7 | learning-extractor.js | 1h   | DONE   |
| D5.8 | npm scripts           | 0.5h | DONE   |

### Phase 3: Integration & Verification

| Task  | Description          | Est. | Status |
| ----- | -------------------- | ---- | ------ |
| D5.9  | Update Docs/INDEX.md | 0.5h | DONE   |
| D5.10 | Verify + examples    | 1h   | DONE   |

**Total:** ~10.5h (was 9h, added 1.5h for guardrails)

---

## Execution Order

1. **D5.0a, D5.0b, D5.0c** — Guardrails first (blocking)
2. **D5.1-D5.3** — Docs & box router
3. **D5.4-D5.8** — Scripts & npm
4. **D5.9-D5.10** — Integration & verification

---

## Checkpoint

- [x] All tasks have clear "Done when" criteria
- [x] All tasks have Verify steps
- [x] Tasks are in logical order (dependencies flow downward)
- [x] No task depends on "figure it out while coding"
- [x] Framework Evolution Guardrails are prerequisites (Phase 0)
