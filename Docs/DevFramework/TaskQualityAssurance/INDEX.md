# TaskQualityAssurance

This folder contains documentation and tools for evidence-based Cascade development.

## Overview

TaskQualityAssurance provides:

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

Read the box checklist: `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/boxes/<box-type>.md`

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

If anomalies are detected, follow: `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/ZOOM_OUT.md`

### 4. Generate Evidence Bundle

After completing a task:

```bash
npm run ai:evidence -- --task=D5.1 --box=infra-build
```

### 5. Audit Gate (`/audit`)

Before marking a task complete, run `/audit` on a frozen staged snapshot.

**Config flag:** `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/ai-config.json` → `switch_model_before_audit`

- `true` (default): Builder stages changes and STOPs; user switches to GPT-5.2 Medium Reasoning and runs `/audit`
- `false`: Builder stages changes and runs `/audit` itself (same chat)

**Preconditions (all must pass):**

- `git diff --name-only` → empty (no unstaged changes)
- `git ls-files --others --exclude-standard` → empty (no untracked files)
- `git diff --staged --name-only` → non-empty (has staged changes)
- Evidence Bundle must be staged

**Deterministic identifiers:**

- `BASE_HEAD`: `git rev-parse HEAD`
- `STAGED_DIFF_HASH`: `git diff --staged | git hash-object --stdin`

See: `.windsurf/workflows/entrypoints/audit.md`

### 6. Extract Learnings (Periodic)

After completing a phase or on session end:

```bash
npm run ai:extract-learnings
```

## File Structure

```
Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/
├── ZOOM_OUT.md           # Anomaly recovery protocol
└── boxes/
    ├── _template.md      # Box checklist template
    ├── feature.md
    ├── bugfix.md
    ├── refactor.md
    ├── infra-build.md
    ├── research-decision.md
    └── ui-ux.md

scripts/CascadeAgentTools/
├── telemetry.cjs          # Event logging CLI
├── anomaly-detector.cjs   # Anomaly detection
├── evidence-generator.cjs # Evidence bundle creation
├── learning-extractor.cjs # Learning extraction
└── logs/
    ├── session-*.jsonl   # Per-session telemetry
    └── baselines.json    # Command duration baselines

Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/Evidence/
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

## Builder Handoff

At the end of an implementation task, Builder (Opus) must:

1. Create/update Evidence Bundle at `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/Evidence/<task-id>.md`
2. Stage everything: `git add -A`
3. Read `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules/ai-config.json`:
   - If `switch_model_before_audit=true`:
     ```
     STOP: Switch model to GPT-5.2 Medium Reasoning and run /audit now.
     Do not modify files before /audit.
     ```
   - If `switch_model_before_audit=false`:
     Run `/audit` immediately (same chat) and present results.

---

## Related Documentation

- **Spec:** `Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureSpecs
/task-quality-assurance.md`
- **Plan:** `Docs/DevFramework/ToolSetup
Framework/FrameworkFeaturePlans
/task-quality-assurance.md`
- **Tasks:** `Docs/DevFramework/ToolSetup
Framework/FrameworkFeatureTasks
/task-quality-assurance.md`
- **Devlog:** `Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/` (CHANGELOG, DECISIONS, LEARNINGS)

---

## Example Flows

### Bugfix Flow

```
1. Read box checklist: Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/boxes/bugfix.md
2. Log start: npm run ai:log-event -- --type=task_start --box=bugfix --message="Fix sync error"
3. Implement fix
4. Run verification: npm run verify
5. If repeated failures: npm run ai:detect-anomalies
6. On success: npm run ai:evidence -- --task=A6.1 --box=bugfix
7. Commit with changelog update
```

### Feature Flow

```
1. Read box checklist: Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/boxes/feature.md
2. Log plan: npm run ai:log-event -- --type=plan_created --box=feature --message="Multi-employer support" --planned-files="src/lib/stores/employers.ts,src/routes/settings/+page.svelte"
3. Implement tasks
4. Run verification + unit tests + E2E
5. If scope drift detected: follow ZOOM_OUT.md
6. Generate evidence: npm run ai:evidence -- --task=A2.1 --box=feature
7. Extract learnings: npm run ai:extract-learnings
```
