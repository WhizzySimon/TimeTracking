# TaskQualityAssurance

This folder contains documentation and tools for evidence-based Cascade development.

## Overview

TaskQualityAssurance provides:

1. **Task Boxes** — Per-task-type checklists with verification requirements
2. **Evidence Bundles** — Per-task completion artifacts
3. **Anomaly Detection** — At pre-commit via chat analysis (see self-learning-system.md)
4. **Telemetry (Optional)** — Machine-readable event logging for advanced analysis

**Primary workflow:** At pre-commit, Cascade analyzes the chat session for patterns (repeated errors, file churn, scope drift) via `self-learning-system.md`. No during-work telemetry required.

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

Read the box checklist: `Docs/DevFramework/TaskQualityAssurance/boxes/<box-type>.md`

### 2. Work Normally

No special telemetry commands needed during work. Cascade will analyze the chat at pre-commit.

### 3. Pre-Commit Analysis

At commit time, follow `pre-commit.md` → `self-learning-system.md` which includes:
- **Part A:** Capture user feedback (self-learning)
- **Part B:** Detect patterns — repeated errors, file churn, scope drift, long sessions (self-improvement)
- **Part C:** Promote learnings and enforce hard rules

### 4. Optional: Manual Telemetry

For advanced analysis, you can optionally log events during work:

```bash
npm run ai:log-event -- --type=custom --message="Started task D5.1"
npm run ai:detect-anomalies  # Analyze logged events
```

### 5. Generate Evidence Bundle

After completing a task:

```bash
npm run ai:evidence -- --task=D5.1 --box=infra-build
```

### 6. Audit Gate (`/audit`)

Before marking a task complete, run `/audit` on a frozen staged snapshot.

**Config flag:** `Docs/DevFramework/JustInTimeAgentRules/ai-config.json` → `switch_model_before_audit`

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
Docs/DevFramework/TaskQualityAssurance/
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

Docs/DevFramework/FrameworkSelfImprovementLogs
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

1. Create/update Evidence Bundle at `Docs/DevFramework/FrameworkSelfImprovementLogs
/Evidence/<task-id>.md`
2. Stage everything: `git add -A`
3. Read `Docs/DevFramework/JustInTimeAgentRules/ai-config.json`:
   - If `switch_model_before_audit=true`:
     ```
     STOP: Switch model to GPT-5.2 Medium Reasoning and run /audit now.
     Do not modify files before /audit.
     ```
   - If `switch_model_before_audit=false`:
     Run `/audit` immediately (same chat) and present results.

---

## Related Documentation

- **Spec:** `Docs/DevFramework/FrameworkFeatureSpecs
/task-quality-assurance.md`
- **Plan:** `Docs/DevFramework/FrameworkFeaturePlans
/task-quality-assurance.md`
- **Tasks:** `Docs/DevFramework/FrameworkFeatureTasks
/task-quality-assurance.md`
- **Devlog:** `Docs/DevFramework/FrameworkSelfImprovementLogs
/` (CHANGELOG, DECISIONS, LEARNINGS)

---

## Example Flows

### Bugfix Flow

```
1. Read box checklist: Docs/DevFramework/TaskQualityAssurance/boxes/bugfix.md
2. Log start: npm run ai:log-event -- --type=task_start --box=bugfix --message="Fix sync error"
3. Implement fix
4. Run verification: npm run verify
5. If repeated failures: npm run ai:detect-anomalies
6. On success: npm run ai:evidence -- --task=A6.1 --box=bugfix
7. Commit with changelog update
```

### Feature Flow

```
1. Read box checklist: Docs/DevFramework/TaskQualityAssurance/boxes/feature.md
2. Log plan: npm run ai:log-event -- --type=plan_created --box=feature --message="Multi-employer support" --planned-files="src/lib/stores/employers.ts,src/routes/settings/+page.svelte"
3. Implement tasks
4. Run verification + unit tests + E2E
5. If scope drift detected: follow ZOOM_OUT.md
6. Generate evidence: npm run ai:evidence -- --task=A2.1 --box=feature
7. Extract learnings: npm run ai:extract-learnings
```
