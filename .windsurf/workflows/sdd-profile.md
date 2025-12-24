# /sdd-profile
Create a comparable SDD profile document for ONE target (repo root) using the standard template.

1) Ask me for:
   - TARGET (exact workspace root folder name): TimeTracker OR KarstenRepo (or whatever it shows in the sidebar)
   - OUTPUT_NAME (short slug, e.g. timetracker, karsten)
   - TYPE: repo-maturity (default)

2) Read:
   - Docs/SDD/Profiles/SDD_PROFILE_RUNBOOK.md
   - Docs/SDD/Profiles/SDD_PROFILE_TEMPLATE.md
   - (Within TARGET root) any AGENTS.md, Docs/Guidelines/*SDD*, Docs/Specs/_template.md, Docs/Tasks/_template.md, .windsurf/workflows/*, scripts/*verify*, package.json, test config, devlog files if present.

3) Evidence rule (mandatory):
   - Every claim must include an evidence pointer: file path + brief snippet reference.
   - If not evidenced: write UNKNOWN and set Confidence=Low.

4) Fill the template:
   - Score all 10 axes (0–5) + Confidence (High/Med/Low).
   - Add Key practices (max 10) and Failure modes (max 10).
   - Add “Adoptable improvements for TimeTracker” (max 10) with exact target file paths (docs/rules/workflows only; no implementation).

5) Write output:
   - Docs/SDD/Profiles/SDD-PROFILE__<OUTPUT_NAME>.md

6) Final response (ONLY):
   - Created: <path>
   - Top Findings: 3 bullets
   - Top Improvements for TimeTracker: 3 bullets
