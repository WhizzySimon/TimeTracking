#!/usr/bin/env python3
"""
Rule Read Logger for Windsurf Hooks

Logs when Cascade consults rule files, enabling analysis of:
- Which rules are read most often
- How often rules are re-read within a session
- Token distance between rule reads

Events logged:
- rule_read: Evidence-based, from post_read_code hook (file actually read)
- rule_consulted: High-confidence, from <!-- RULE_CONSULTED: paths --> marker
- rule_reference: Heuristic, from path mentions in text

Storage:
- scripts/CascadeAgentTools/logs/rule_reads.ndjson (append-only log)
- scripts/CascadeAgentTools/logs/rule_reads_state.json (per-trajectory state)

Note: Repo root is computed from __file__ location for robustness.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

# Configuration - compute repo root robustly from __file__ location
# __file__ is at .windsurf/hooks/rule_read_logger.py, so parent.parent.parent = repo root
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
LOG_DIR = REPO_ROOT / "scripts" / "ai" / "logs"
LOG_FILE = LOG_DIR / "rule_reads.ndjson"
STATE_FILE = LOG_DIR / "rule_reads_state.json"

# Rule file path prefixes (normalized with forward slashes)
RULE_PATH_PREFIXES = (
    "DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/",
    ".windsurf/rules/",
)

# Known rule file patterns for heuristic extraction from text
RULE_PATTERNS = [
    r"DevFramework/ToolSetup
Framework/JustInTimeAgentRules
/[\w\-_]+\.md",
    r"\.windsurf/rules/[\w\-_]+\.md",
]

# High-confidence marker pattern
MARKER_PATTERN = r"<!--\s*RULE_CONSULTED:\s*([^>]+)\s*-->"


def get_git_info():
    """Get current git branch and commit (best-effort)."""
    try:
        import subprocess
        branch = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=REPO_ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()
        commit = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=REPO_ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()
        return {"git_branch": branch, "git_commit": commit}
    except Exception:
        return {}


def load_state():
    """Load state file or return empty state."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_state(state):
    """Save state file."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def append_log(entry):
    """Append NDJSON entry to log file."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def extract_marker_files(text):
    """Extract files from <!-- RULE_CONSULTED: ... --> markers."""
    files = []
    for match in re.finditer(MARKER_PATTERN, text, re.IGNORECASE):
        paths = match.group(1).split(",")
        files.extend([p.strip() for p in paths if p.strip()])
    return files


def extract_heuristic_files(text):
    """Extract rule file paths via regex heuristics."""
    files = set()
    for pattern in RULE_PATTERNS:
        for match in re.finditer(pattern, text):
            files.add(match.group(0))
    return list(files)


def normalize_path(file_path: str) -> str:
    """Normalize path to repo-relative with forward slashes."""
    # Convert to Path for normalization
    p = Path(file_path)
    
    # Try to make relative to REPO_ROOT
    try:
        rel = p.resolve().relative_to(REPO_ROOT)
        return str(rel).replace("\\", "/")
    except ValueError:
        # Not under repo root, return as-is with forward slashes
        return str(p).replace("\\", "/")


def is_rule_file(file_path: str) -> bool:
    """Check if file_path is a rule file (fast check)."""
    normalized = normalize_path(file_path)
    return any(normalized.startswith(prefix) for prefix in RULE_PATH_PREFIXES)


def process_post_read_code(event_data):
    """Handle post_read_code event - evidence-based rule read logging."""
    tool_info = event_data.get("tool_info", {})
    file_path = tool_info.get("file_path", "")
    
    # Early exit if not a rule file (performance guard)
    if not file_path or not is_rule_file(file_path):
        return
    
    trajectory_id = event_data.get("trajectory_id", "")
    execution_id = event_data.get("execution_id", "")
    
    ts_iso = datetime.now(timezone.utc).isoformat()
    normalized_path = normalize_path(file_path)
    
    entry = {
        "ts": ts_iso,
        "trajectory_id": trajectory_id,
        "execution_id": execution_id,
        "event": "rule_read",
        "file_path": normalized_path,
        "signal": "post_read_code",
    }
    append_log(entry)


def process_event(event_data):
    """Process a hook event and log rule reads if detected."""
    action = event_data.get("agent_action_name", "")
    tool_info = event_data.get("tool_info", {})
    trajectory_id = event_data.get("trajectory_id", "unknown")
    
    # Performance guard: handle post_read_code separately (most common, needs fast path)
    if action == "post_read_code":
        process_post_read_code(event_data)
        return
    
    # Determine direction and extract text
    if action == "pre_user_prompt":
        direction = "in"
        text = tool_info.get("user_prompt", "")
        char_field = "prompt_chars"
    elif action == "post_cascade_response":
        direction = "out"
        text = tool_info.get("response", "")
        char_field = "response_chars"
    else:
        return  # Unknown event type
    
    if not text:
        return
    
    text_chars = len(text)
    
    # Load and update state
    state = load_state()
    traj_state = state.setdefault(trajectory_id, {
        "cumulative_chars_in": 0,
        "cumulative_chars_out": 0,
        "last_seen_ts": None,
        "last_consulted_by_file": {}
    })
    
    # Update cumulative chars
    if direction == "in":
        traj_state["cumulative_chars_in"] += text_chars
    else:
        traj_state["cumulative_chars_out"] += text_chars
    
    cumulative_total = traj_state["cumulative_chars_in"] + traj_state["cumulative_chars_out"]
    traj_state["last_seen_ts"] = datetime.now(timezone.utc).isoformat()
    
    # Check for high-confidence markers (only in responses)
    marker_files = []
    if direction == "out":
        marker_files = extract_marker_files(text)
    
    # Check for heuristic references
    heuristic_files = extract_heuristic_files(text)
    
    # Remove marker files from heuristic to avoid double-logging
    heuristic_only = [f for f in heuristic_files if f not in marker_files]
    
    ts_iso = datetime.now(timezone.utc).isoformat()
    git_info = get_git_info()
    
    # Log marker-based consults
    if marker_files:
        since_last = {}
        for f in marker_files:
            last = traj_state["last_consulted_by_file"].get(f)
            if last:
                since_last[f] = cumulative_total - last.get("cumulative_chars_total", 0)
            else:
                since_last[f] = None
            # Update last consulted
            traj_state["last_consulted_by_file"][f] = {
                "ts": ts_iso,
                "cumulative_chars_total": cumulative_total
            }
        
        entry = {
            "ts_iso": ts_iso,
            "trajectory_id": trajectory_id,
            "event": "rule_consulted",
            "direction": direction,
            "files": marker_files,
            "signal": "marker",
            char_field: text_chars,
            "cumulative_chars_total": cumulative_total,
            "since_last_consult_chars": since_last,
            **git_info
        }
        append_log(entry)
    
    # Log heuristic references (separate entries)
    if heuristic_only:
        entry = {
            "ts_iso": ts_iso,
            "trajectory_id": trajectory_id,
            "event": "rule_reference",
            "direction": direction,
            "files": heuristic_only,
            "signal": "heuristic",
            char_field: text_chars,
            "cumulative_chars_total": cumulative_total,
            "since_last_consult_chars": None,
            **git_info
        }
        append_log(entry)
    
    # Save state
    save_state(state)


def main():
    """Main entry point for Windsurf hook."""
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data.strip():
            return
        
        event_data = json.loads(input_data)
        process_event(event_data)
    except json.JSONDecodeError:
        # Silently ignore malformed input
        pass
    except Exception as e:
        # Log errors to stderr but don't crash
        print(f"rule_read_logger error: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
