# Rule Read Logging System

Automated logging of when Cascade consults rule files, enabling analysis of rule re-reads and context freshness.

## Overview

This system tracks:

- **rule_read**: Evidence-based events from `post_read_code` hook (file actually read by Cascade)
- **rule_consulted**: High-confidence events from `<!-- RULE_CONSULTED: ... -->` markers
- **rule_reference**: Heuristic events from path mentions in prompts/responses

## Storage

| File                                    | Purpose                                                     |
| --------------------------------------- | ----------------------------------------------------------- |
| `scripts/CascadeAgentTools/logs/rule_reads.ndjson`     | Append-only event log                                       |
| `scripts/CascadeAgentTools/logs/rule_reads_state.json` | Per-trajectory state (cumulative chars, last consult times) |

## How It Works

1. **Windsurf hooks** (`.windsurf/hooks.json`) trigger on:
   - `post_read_code`: When Cascade reads any file (evidence-based logging)
   - `pre_user_prompt` / `post_cascade_response`: For marker/heuristic detection
2. **Hook script** (`.windsurf/hooks/rule_read_logger.py`):
   - For `post_read_code`: Checks if `file_path` is under `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/` or `.windsurf/rules/`
   - For responses: Parses `<!-- RULE_CONSULTED: ... -->` markers and heuristic path mentions
3. **NDJSON log** captures events with timestamps, trajectory IDs, and file paths
4. **State file** tracks "last consulted" per file to calculate re-read distances

### Performance

The hook script filters early:

- `post_read_code` events exit immediately if file is not a rule file
- Path normalization uses `__file__` to compute repo root (no cwd assumption)

## Marker Format

When Cascade reads a rule file, it should emit at the end of its response:

```html
<!-- RULE_CONSULTED: Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/code-quality.md, Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/pre-commit.md -->
```

This marker is invisible in the chat UI but parsed by the hook.

## Generating Reports

```bash
python scripts/report_rule_reads.py
```

Output includes:

- Total consultations per file
- Total references per file
- Re-reads within 30 minutes
- Re-reads within 20k chars
- Top 10 most re-consulted files

## How to Test

### Quick Smoke Test

A temporary smoke test is included to verify hooks are firing:

1. **Reload Windsurf** (required after `hooks.json` changes)
2. **Run `/new-task`** or any command that reads rule files
3. **Check smoke test file**: `scripts/CascadeAgentTools/logs/hook_smoke_test.txt`
   - If lines appear with timestamps, hooks are working
4. **Check NDJSON log**: `scripts/CascadeAgentTools/logs/rule_reads.ndjson`
   - Should contain `"event": "rule_read"` entries

### Remove Smoke Test After Verification

Once confirmed working:

1. Edit `.windsurf/hooks.json`
2. Remove the smoke test command block:
   ```json
   {
   	"command": "cmd /c echo ...",
   	"show_output": false
   }
   ```
3. Optionally set `show_output: false` on the main logger command
4. Delete `scripts/CascadeAgentTools/logs/hook_smoke_test.txt`

### Full Test

1. **Start a new chat** with Cascade in this workspace
2. **Ask a question** that requires consulting a rule file (e.g., "how should I format code?")
3. **Verify marker** is present (view raw message if possible, or check log file)
4. **Check log file** exists: `scripts/CascadeAgentTools/logs/rule_reads.ndjson`
5. **Run report**: `py -3 scripts/report_rule_reads.py`

## Configuration

Thresholds in `scripts/report_rule_reads.py`:

- `REREAD_TIME_MINUTES = 30` — Re-read if same file consulted within this time
- `REREAD_CHARS_THRESHOLD = 20000` — Re-read if same file consulted within this many chars

## NDJSON Schema

### rule_read (evidence-based)

```json
{
	"ts": "2025-12-28T07:30:00+00:00",
	"trajectory_id": "abc123",
	"execution_id": "xyz789",
	"event": "rule_read",
	"file_path": "Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/code-quality.md",
	"signal": "post_read_code"
}
```

### rule_consulted (marker-based)

```json
{
	"ts_iso": "2025-12-28T07:30:00+00:00",
	"trajectory_id": "abc123",
	"event": "rule_consulted",
	"direction": "out",
	"files": ["Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/code-quality.md"],
	"signal": "marker",
	"response_chars": 1500,
	"cumulative_chars_total": 45000,
	"since_last_consult_chars": { "Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/code-quality.md": 12000 },
	"git_branch": "dev",
	"git_commit": "abc1234"
}
```

## Windows Notes

- Use `python` (not `py -3`) — Windsurf hooks use a shell where `py` isn't recognized
- Use **absolute paths** in hooks.json — relative paths fail even though docs say `working_directory` defaults to workspace root (tested 2025-12-28)
- `${workspaceFolder}` variables are NOT supported
- Forward slashes work in paths: `E:/Private/Dev/.../script.py`
- Path normalization in the script handles both `\` and `/` separators
- Smoke test (if needed): `cmd /c echo ... >> ...` for Windows compatibility

### Path Configuration (Windows)

Experiments on 2025-12-28:

| Attempt | Command                                        | `working_directory`             | Result    |
| ------- | ---------------------------------------------- | ------------------------------- | --------- |
| 1       | `python .windsurf/hooks/...` (relative)        | Not set                         | ❌ FAILED |
| 2       | `.windsurf/hooks/run_logger.bat`               | Not set                         | ❌ FAILED |
| 3       | `python E:/.../rule_read_logger.py` (absolute) | Not set                         | ✅ WORKS  |
| 4       | `python .windsurf/hooks/...` (relative)        | `E:/.../TimeTracker` (absolute) | ✅ WORKS  |

**Conclusion**: On Windows, the default `working_directory` is NOT the workspace root. You must either:

- Use absolute paths in `command`, OR
- Use relative `command` + explicit absolute `working_directory`

**Current config uses option 2** — one absolute path per hook (`working_directory`), relative script path.

## Files Changed

| Path                                     | Change                                                          |
| ---------------------------------------- | --------------------------------------------------------------- |
| `.windsurf/hooks.json`                   | Created — hook configuration (corrected schema 2025-12-28)      |
| `.windsurf/hooks/rule_read_logger.py`    | Created — hook script (added post_read_code handler 2025-12-28) |
| `Docs/DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/_entrypoint-jit-rule-map.md` | Updated — added RULE_CONSULTED marker instruction               |
| `scripts/report_rule_reads.py`           | Created — report generator (added rule_read support 2025-12-28) |
| `Docs/DevFramework/ToolSetup
/rule-read-logging.md`          | Created — this documentation                                    |
