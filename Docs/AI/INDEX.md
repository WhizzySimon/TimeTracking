# Autonomy Stack v2 — AI Tooling

This folder contains documentation and tools for evidence-based Cascade development.

## Overview

The Autonomy Stack provides:

1. **Task Boxes** — Per-task-type checklists with verification requirements
2. **Telemetry** — Machine-readable event logging (JSONL)
3. **Anomaly Detection** — Automatic detection of repetition, churn, scope drift
4. **Evidence Bundles** — Per-task completion artifacts
5. **Learning Extraction** — Pipeline to propose principles from evidence

## Quick Start

### 1. Choose a Task Box

Before starting work, identify your task type:

| Box                 | When to use                                |
| ------------------- | ------------------------------------------ |
| `feature`           | New user-facing functionality              |
| `bugfix`            | Fixing broken behavior                     |
| `refactor`          | Code restructuring without behavior change |
| `infra-build`       | Build, CI, tooling, dependencies           |
| `research-decision` | Investigation, ADR, spike                  |
| `ui-ux`             | Visual/interaction changes                 |

Read the box checklist: `Docs/AI/boxes/<box-type>.md`

### 2. Log Events

During development, log significant events:

```bash
# Log a custom event
npm run ai:log-event -- --type=custom --message="Started task D5.1"

# Log command execution
npm run ai:start-command -- --command="npm run verify"
# ... command runs ...
npm run ai:end-command -- --command="npm run verify" --exit-code=0 --duration=5000

# Fingerprint an error for tracking
npm run ai:fingerprint-error -- "TypeError: Cannot read property 'x' of undefined"
```

### 3. Check for Anomalies

After repeated failures or long tasks:

```bash
npm run ai:detect-anomalies
```

If anomalies are detected, follow: `Docs/AI/ZOOM_OUT.md`

### 4. Generate Evidence Bundle

After completing a task:

```bash
npm run ai:evidence -- --task=D5.1 --box=infra-build
```

### 5. Extract Learnings (Periodic)

After completing a phase or on session end:

```bash
npm run ai:extract-learnings
```

## File Structure

```
Docs/AI/
├── INDEX.md              # This file
├── ZOOM_OUT.md           # Anomaly recovery protocol
└── boxes/
    ├── _template.md      # Box checklist template
    ├── feature.md
    ├── bugfix.md
    ├── refactor.md
    ├── infra-build.md
    ├── research-decision.md
    └── ui-ux.md

scripts/ai/
├── telemetry.js          # Event logging CLI
├── anomaly-detector.js   # Anomaly detection
├── evidence-generator.js # Evidence bundle creation
├── learning-extractor.js # Learning extraction
└── logs/
    ├── session-*.jsonl   # Per-session telemetry
    └── baselines.json    # Command duration baselines

Docs/Devlog/Evidence/
└── <task-id>.md          # Per-task evidence bundles
```

## npm Scripts

| Command                        | Purpose                          |
| ------------------------------ | -------------------------------- |
| `npm run ai:log-event`         | Log a telemetry event            |
| `npm run ai:start-command`     | Log command start                |
| `npm run ai:end-command`       | Log command end with result      |
| `npm run ai:fingerprint-error` | Get stable hash for error        |
| `npm run ai:detect-anomalies`  | Check session for anomalies      |
| `npm run ai:evidence`          | Generate evidence bundle         |
| `npm run ai:extract-learnings` | Propose principles from evidence |

## Related Documentation

- **Spec:** `Docs/Specs/autonomy-stack-v2.md`
- **Plan:** `Docs/Plans/autonomy-stack-v2.md`
- **Tasks:** `Docs/Tasks/autonomy-stack-v2.md`
- **Devlog:** `Docs/Devlog/` (CHANGELOG, DECISIONS, LEARNINGS)

---

## Example Flows

### Bugfix Flow

```
1. Read box checklist: Docs/AI/boxes/bugfix.md
2. Log start: npm run ai:log-event -- --type=task_start --box=bugfix --message="Fix sync error"
3. Implement fix
4. Run verification: npm run verify
5. If repeated failures: npm run ai:detect-anomalies
6. On success: npm run ai:evidence -- --task=A6.1 --box=bugfix
7. Commit with changelog update
```

### Feature Flow

```
1. Read box checklist: Docs/AI/boxes/feature.md
2. Log plan: npm run ai:log-event -- --type=plan_created --box=feature --message="Multi-employer support" --planned-files="src/lib/stores/employers.ts,src/routes/settings/+page.svelte"
3. Implement tasks
4. Run verification + unit tests + E2E
5. If scope drift detected: follow ZOOM_OUT.md
6. Generate evidence: npm run ai:evidence -- --task=A2.1 --box=feature
7. Extract learnings: npm run ai:extract-learnings
```
