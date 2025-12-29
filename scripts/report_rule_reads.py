#!/usr/bin/env python3
"""
Rule Read Report Generator

Analyzes rule_reads.ndjson to produce facts about rule consultation patterns.

Usage:
    python scripts/report_rule_reads.py

Output:
    - Total rule_read count per file (evidence-based, from post_read_code hook)
    - Total rule_consulted count per file (from markers)
    - Total rule_reference count per file (heuristic)
    - Re-reads per file (same file consulted again within thresholds)
    - Top 10 most re-consulted files
"""

import json
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
REPO_ROOT = Path(__file__).resolve().parent.parent
LOG_FILE = REPO_ROOT / "scripts" / "CascadeAgentTools" / "logs" / "rule_reads.ndjson"

# Re-read detection thresholds
REREAD_TIME_MINUTES = 30  # Re-read if same file consulted within this time
REREAD_CHARS_THRESHOLD = 20000  # Re-read if same file consulted within this many chars


def load_log():
    """Load all entries from NDJSON log file."""
    entries = []
    if not LOG_FILE.exists():
        return entries
    
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue  # Skip malformed lines
    
    return entries


def analyze_entries(entries):
    """Analyze log entries and return statistics."""
    # Counters
    rule_read_count = defaultdict(int)  # Evidence-based from post_read_code
    consulted_count = defaultdict(int)
    reference_count = defaultdict(int)
    
    # Re-read tracking: per file, list of (timestamp, cumulative_chars)
    consult_history = defaultdict(list)
    rereads_time = defaultdict(int)
    rereads_chars = defaultdict(int)
    
    for entry in entries:
        event = entry.get("event", "")
        files = entry.get("files", [])
        ts_str = entry.get("ts_iso", "")
        cumulative = entry.get("cumulative_chars_total", 0)
        since_last = entry.get("since_last_consult_chars", {})
        
        try:
            ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        except Exception:
            ts = None
        
        if event == "rule_read":
            # Evidence-based event from post_read_code hook
            file_path = entry.get("file_path", "")
            if file_path:
                rule_read_count[file_path] += 1
        
        elif event == "rule_consulted":
            for f in files:
                consulted_count[f] += 1
                
                # Check for re-read
                if consult_history[f]:
                    last_ts, last_cumulative = consult_history[f][-1]
                    
                    # Time-based re-read
                    if ts and last_ts:
                        time_diff = (ts - last_ts).total_seconds() / 60
                        if time_diff <= REREAD_TIME_MINUTES:
                            rereads_time[f] += 1
                    
                    # Chars-based re-read
                    if since_last and f in since_last and since_last[f] is not None:
                        if since_last[f] <= REREAD_CHARS_THRESHOLD:
                            rereads_chars[f] += 1
                
                consult_history[f].append((ts, cumulative))
        
        elif event == "rule_reference":
            for f in files:
                reference_count[f] += 1
    
    return {
        "rule_read": dict(rule_read_count),
        "consulted": dict(consulted_count),
        "reference": dict(reference_count),
        "rereads_time": dict(rereads_time),
        "rereads_chars": dict(rereads_chars),
    }


def print_report(stats):
    """Print formatted report."""
    print("=" * 60)
    print("RULE READ ANALYSIS REPORT")
    print("=" * 60)
    print()
    
    # Evidence-based rule reads
    print("## Rule Reads (evidence-based, from post_read_code hook)")
    print()
    if stats["rule_read"]:
        sorted_reads = sorted(stats["rule_read"].items(), key=lambda x: -x[1])
        for f, count in sorted_reads:
            print(f"  {count:4d}  {f}")
    else:
        print("  (no data)")
    print()
    
    # Marker-based consultations
    print("## Rule Consultations (high-confidence, from markers)")
    print()
    if stats["consulted"]:
        sorted_consulted = sorted(stats["consulted"].items(), key=lambda x: -x[1])
        for f, count in sorted_consulted:
            print(f"  {count:4d}  {f}")
    else:
        print("  (no data)")
    print()
    
    print("## Rule References (heuristic, from path mentions)")
    print()
    if stats["reference"]:
        sorted_ref = sorted(stats["reference"].items(), key=lambda x: -x[1])
        for f, count in sorted_ref:
            print(f"  {count:4d}  {f}")
    else:
        print("  (no data)")
    print()
    
    # Re-reads
    print(f"## Re-reads within {REREAD_TIME_MINUTES} minutes")
    print()
    if stats["rereads_time"]:
        sorted_rereads = sorted(stats["rereads_time"].items(), key=lambda x: -x[1])
        for f, count in sorted_rereads:
            print(f"  {count:4d}  {f}")
    else:
        print("  (no re-reads detected)")
    print()
    
    print(f"## Re-reads within {REREAD_CHARS_THRESHOLD:,} chars")
    print()
    if stats["rereads_chars"]:
        sorted_rereads = sorted(stats["rereads_chars"].items(), key=lambda x: -x[1])
        for f, count in sorted_rereads:
            print(f"  {count:4d}  {f}")
    else:
        print("  (no re-reads detected)")
    print()
    
    # Top 10 most re-consulted
    print("## Top 10 Most Re-Consulted Files")
    print()
    combined_rereads = defaultdict(int)
    for f, count in stats["rereads_time"].items():
        combined_rereads[f] += count
    for f, count in stats["rereads_chars"].items():
        combined_rereads[f] = max(combined_rereads[f], count)  # Use max to avoid double-counting
    
    if combined_rereads:
        sorted_combined = sorted(combined_rereads.items(), key=lambda x: -x[1])[:10]
        for i, (f, count) in enumerate(sorted_combined, 1):
            print(f"  {i:2d}. {count:4d} re-reads  {f}")
    else:
        print("  (no re-reads detected)")
    print()
    
    # Summary
    print("=" * 60)
    total_reads = sum(stats["rule_read"].values())
    total_consults = sum(stats["consulted"].values())
    total_refs = sum(stats["reference"].values())
    total_rereads = sum(combined_rereads.values())
    print(f"SUMMARY: {total_reads} reads, {total_consults} consultations, {total_refs} references, {total_rereads} re-reads")
    print("=" * 60)


def main():
    """Main entry point."""
    if not LOG_FILE.exists():
        print(f"No log file found at: {LOG_FILE}")
        print("Start a session with rule reads to generate data.")
        return
    
    entries = load_log()
    if not entries:
        print("Log file exists but contains no valid entries.")
        return
    
    print(f"Loaded {len(entries)} log entries from {LOG_FILE}")
    print()
    
    stats = analyze_entries(entries)
    print_report(stats)


if __name__ == "__main__":
    main()
