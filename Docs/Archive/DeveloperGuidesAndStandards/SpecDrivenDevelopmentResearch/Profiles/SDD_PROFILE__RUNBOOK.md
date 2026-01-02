# Runbook — How to generate an SDD profile (Cascade-friendly)

**Last updated:** 2025-12-24

## Inputs

- Target name + type (repo/vendor docs/etc.)
- Evidence sources (files to read, or URLs for vendor docs)
- Output location (recommended: `Docs/SDD/Profiles/`)

## Procedure

1. **Inventory evidence**
   - For a repo: list the exact files inspected.
   - For vendor docs: list the exact pages inspected.
2. **Extract signals per axis**
   - For each axis, capture 1–3 concrete “signals” from evidence (quotes are optional; keep short).
3. **Score + confidence**
   - Use the scoring policy in the template (repo maturity vs vendor guidance coverage).
   - Confidence = High only if directly evidenced.
4. **Write the profile**
   - Fill the template.
   - Keep “Key practices” and “Failure modes” tight (max 10 each).
5. **Emit adoptable improvements**
   - Must be actionable and map to specific TimeTracker docs/rules/workflows.
6. **No implementation**
   - Profile generation is analysis only.

## Output naming convention

- `SDD-PROFILE__<TARGET>.md` (use dashes for spaces)

## Definition of DONE

- Profile file created.
- Axis table fully filled.
- Evidence inventory present.
- Improvements list contains concrete file targets.
