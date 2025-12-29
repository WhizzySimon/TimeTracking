# /sdd-transcript-insights

Extract high-signal SDD practices from a transcript (not raw text).

1. Ask me for:
   - TRANSCRIPT_PATH (inside repo)
   - OUTPUT_NAME (slug, e.g. karsten-meeting-2025-12-18)
   - OPTIONAL: COMPARISON_DOC_TO_UPDATE (path) or NONE

2. Read TRANSCRIPT_PATH.

3. Create:
   - Docs/DevFramework/ToolSetup
     Framework/FrameworkSelfImprovementLogs
     /TRANSCRIPT-INSIGHTS\_\_<OUTPUT_NAME>.md

Rules:

- Ignore filler.
- Max 15 practices + max 10 failure modes.
- Each item: short quote (<=2 lines) OR precise paraphrase + why it matters + 1 axis (use the 10 axes).
- If something is “claimed in transcript but not in repo”, label it CLAIM and do not treat as enforced.

4. If COMPARISON_DOC_TO_UPDATE != NONE:

- Append an “Transcript-derived insights” appendix.
- If transcript conflicts with repo evidence: mark CONFLICT.

5. Final response (ONLY):

- Created/Updated: <paths>
- Top Practices: 3 bullets
- Top Adoptable Rules: 3 bullets
