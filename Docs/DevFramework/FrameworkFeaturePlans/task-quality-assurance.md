# autonomy-stack-v2 - Plan

**Phase:** D5  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/autonomy-stack-v2.md`

---

## Architecture / modules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Autonomy Stack v2                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/                          scripts/ai/                              │
│  ├── INDEX.md (entry point)        ├── telemetry.js (CLI tool)              │
│  ├── ZOOM_OUT.md (protocol)        ├── anomaly-detector.js                  │
│  └── boxes/                        ├── evidence-generator.js                │
│      ├── _template.md              ├── learning-extractor.js                │
│      ├── feature.md                └── logs/ (JSONL session logs)           │
│      ├── bugfix.md                                                          │
│      ├── refactor.md               Docs/DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/                             │
│      ├── infra-build.md            └── Evidence/ (per-task bundles)         │
│      ├── research-decision.md                                               │
│      └── ui-ux.md                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

| Module                 | File                                                 | Responsibility                                     |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| **Telemetry CLI**      | `scripts/ai/telemetry.js`                            | Log events, start/end commands, fingerprint errors |
| **Anomaly Detector**   | `scripts/ai/anomaly-detector.js`                     | Read session log, detect patterns, output alerts   |
| **Evidence Generator** | `scripts/ai/evidence-generator.js`                   | Compile task completion artifacts                  |
| **Learning Extractor** | `scripts/ai/learning-extractor.js`                   | Propose principles from evidence/anomalies         |
| **Box Definitions**    | `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/boxes/*.md`  | Per-task-type checklists (human-readable)          |
| **Zoom-Out Protocol**  | `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/ZOOM_OUT.md` | Recovery procedure when anomalies fire             |

### Dependencies

- All scripts use Node.js built-ins only (`fs`, `path`, `crypto`)
- No external npm packages required
- Scripts read/write plain files (JSONL, Markdown)

---

## Data model

### Telemetry Event Schema (JSONL)

```typescript
interface TelemetryEvent {
	ts: string; // ISO 8601 timestamp
	event_type: string; // "command_start" | "command_end" | "edit" | "error" | "plan_created" | "custom"
	box?: string; // "feature" | "bugfix" | "refactor" | "infra-build" | "research-decision" | "ui-ux"
	message: string; // Human-readable description
	file?: string; // File path (for edits/errors)
	command?: string; // Command string (for command events)
	exit_code?: number; // Exit code (for command_end)
	duration_ms?: number; // Duration in milliseconds (for command_end)
	error_fingerprint?: string; // SHA-256 truncated hash (for errors)
	planned_files?: string[]; // List of planned files (for plan_created)
}
```

### Session Log File

- **Location:** `scripts/ai/logs/session-<timestamp>.jsonl`
- **Format:** One JSON object per line
- **Naming:** `session-20251227-211500.jsonl` (timestamp at session start)

### Anomaly Output Schema

```typescript
interface Anomaly {
	type: 'repetition' | 'time_over_baseline' | 'churn' | 'scope_drift';
	severity: 'warning' | 'critical';
	details: {
		fingerprint?: string; // For repetition
		count?: number; // For repetition/churn
		file?: string; // For churn
		expected_ms?: number; // For time_over_baseline
		actual_ms?: number; // For time_over_baseline
		unplanned_files?: string[]; // For scope_drift
	};
	recommendation: string; // Action to take
	zoom_out_ref: string; // Path to ZOOM_OUT.md
}
```

### Baseline Storage

- **Location:** `scripts/ai/logs/baselines.json`
- **Content:** Rolling median durations per box per command pattern
- **Updated:** After each session ends

---

## UI state model

N/A — This feature is CLI-only with no UI components.

---

## Error handling

| Scenario                           | Handling                                   |
| ---------------------------------- | ------------------------------------------ |
| **Log file doesn't exist**         | Create new session log                     |
| **Malformed JSONL line**           | Skip line, log warning to stderr, continue |
| **Missing baseline file**          | Start fresh, no time_over_baseline alerts  |
| **Command fails mid-telemetry**    | Log error event with fingerprint, continue |
| **No plan_created event**          | Skip scope_drift check                     |
| **Permission denied on log write** | Fatal error, exit with code 1              |

### Error Fingerprinting

```javascript
function fingerprintError(errorText) {
	// Normalize: trim, lowercase, remove line numbers, collapse whitespace
	const normalized = errorText
		.trim()
		.toLowerCase()
		.replace(/:\d+:\d+/g, ':X:X') // Remove line:col
		.replace(/line \d+/gi, 'line X') // Remove "line N"
		.replace(/\s+/g, ' '); // Collapse whitespace

	// SHA-256, truncate to 8 chars
	return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 8);
}
```

---

## Testing strategy

### Unit Tests (optional, low priority)

- Fingerprint function produces deterministic output
- JSONL parsing handles malformed lines
- Anomaly thresholds trigger correctly

### Integration Tests

- Full telemetry flow: log-event → read log → detect anomaly
- Evidence generator reads real session log

### Manual Verification (primary)

| Check              | Command                                                 | Expected                    |
| ------------------ | ------------------------------------------------------- | --------------------------- |
| Telemetry writes   | `npm run ai:log-event -- --type=test --message="hello"` | New line in session log     |
| Fingerprint stable | `npm run ai:fingerprint-error -- "Error at line 5"` × 2 | Same hash both times        |
| Anomaly detection  | Create log with 3 same fingerprints, run detector       | `repetition` anomaly output |
| Evidence bundle    | Run generator after task                                | Markdown file created       |
| Verify still works | `npm run verify`                                        | ALL PASSED                  |

### E2E Tests

Not required — this is dev tooling, not user-facing.

---

## Risks / constraints

| Risk                              | Mitigation                                                           |
| --------------------------------- | -------------------------------------------------------------------- |
| **Log files grow large**          | Document cleanup procedure; old logs can be deleted                  |
| **Fingerprint collisions**        | 8-char SHA-256 has ~4 billion possibilities; sufficient for dev logs |
| **Baseline drift over time**      | Use rolling median (last 20 samples) to adapt                        |
| **Cascade forgets to log events** | Integrate logging into workflows via instructions, not enforcement   |
| **Overhead slows development**    | All operations are fast (<100ms); logging is append-only             |

---

## File Structure (final)

```
scripts/
└── ai/
    ├── telemetry.js           # CLI: log-event, start-command, end-command, fingerprint-error
    ├── anomaly-detector.js    # CLI: analyze session log for anomalies
    ├── evidence-generator.js  # CLI: generate evidence bundle
    ├── learning-extractor.js  # CLI: propose principles
    └── logs/
        ├── session-*.jsonl    # Per-session telemetry
        └── baselines.json     # Rolling command duration baselines

Docs/
├── AI/
│   ├── INDEX.md               # Entry point for AI tooling docs
│   ├── VERSION.md             # Framework version (0.x.y)
│   ├── CHANGELOG.md           # Framework-only changelog
│   ├── ZOOM_OUT.md            # Anomaly recovery protocol
│   ├── GTRS.md                # Golden Task Regression Suite definition
│   ├── GTRS-runs/             # GTRS run results
│   │   └── YYYY-MM-DD.md      # Per-run results
│   └── boxes/
│       ├── _template.md       # Box checklist template
│       ├── feature.md
│       ├── bugfix.md
│       ├── refactor.md
│       ├── infra-build.md
│       ├── research-decision.md
│       └── ui-ux.md
└── Devlog/
    └── Evidence/
        └── <task-id>.md       # Per-task evidence bundles
```

---

## Framework Evolution Guardrails

### A) Framework Versioning

**File:** `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/VERSION.md`

**Content:**

```markdown
# Autonomy Stack Framework Version

FRAMEWORK_VERSION: 0.1.0

## Version History

| Version | Date       | Tag              | Summary         |
| ------- | ---------- | ---------------- | --------------- |
| 0.1.0   | 2025-12-27 | framework-v0.1.0 | Initial release |
```

**Workflow:**

1. Make framework change
2. Bump version in VERSION.md according to semver rules
3. Add entry to Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/CHANGELOG.md
4. Commit changes
5. Create git tag: `git tag -a framework-v0.x.y -m "Framework: <summary>"`
6. Push with tags: `git push && git push --tags`

### B) Framework-only CHANGELOG

**File:** `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/CHANGELOG.md`

**Template:**

```markdown
# Autonomy Stack Framework Changelog

All changes to the development framework. Not for app features.

## [0.1.0] - 2025-12-27

### Added

- **Initial Autonomy Stack release** — Box router, telemetry, anomaly detection, evidence bundles
  - Risk: low
  - Evidence: `npm run verify` passes, all AC checks met
  - Affected files: Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/_, scripts/ai/_
```

### C) Golden Task Regression Suite (GTRS)

**Definition File:** `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/GTRS.md`
**Results Directory:** `Docs/DevFramework/ToolSetup
Framework/TaskQualityAssurance/GTRS-runs/`

**Run Triggers:**

- Before each framework version tag (required)
- Weekly maintenance (optional)
- After major framework changes (recommended)

**Pass Criteria:**

- All 10 golden tasks complete without critical anomalies
- No regression from previous run (same or better metrics)
- `npm run verify` passes throughout

---

## npm Scripts to Add

```json
{
	"ai:log-event": "node scripts/ai/telemetry.js log-event",
	"ai:start-command": "node scripts/ai/telemetry.js start-command",
	"ai:end-command": "node scripts/ai/telemetry.js end-command",
	"ai:fingerprint-error": "node scripts/ai/telemetry.js fingerprint-error",
	"ai:detect-anomalies": "node scripts/ai/anomaly-detector.js",
	"ai:evidence": "node scripts/ai/evidence-generator.js",
	"ai:extract-learnings": "node scripts/ai/learning-extractor.js"
}
```

---

## Checkpoint

- [x] Plan can be executed as tasks without requiring new decisions
- [x] Architecture is minimal and uses existing patterns
- [x] All data formats are defined
- [x] Error handling documented
- [x] Testing approach defined
- [x] Framework Evolution Guardrails defined (versioning, changelog, GTRS)
