# Audit Report: <YYYY-MM-DD> — <TASK-ID>

## Policy (non-conflicting with preconditions)

- Evidence Bundle is staged and part of the audited snapshot.
- Audit Report is generated AFTER the verdict and is not required to be staged during preconditions.
- The report may be committed later (optional) and MUST reference `BASE_HEAD` + `STAGED_DIFF_HASH`.

---

## Snapshot (must match Evidence Bundle)

- **Evidence Bundle:** `DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/Evidence/<TASK-ID>.md`
- **BASE_HEAD:** <paste from Evidence Bundle>
- **STAGED_DIFF_HASH:** <paste from Evidence Bundle>
- **Audit Input:** staged-only (`git diff --staged`) — frozen snapshot required

---

## Result

- **PASS/FAIL:** <PASS|FAIL>

---

## Evidence Used (no chat-history dependency)

- Evidence Bundle sections:
  - `## Acceptance Criteria`
  - `## Planned Scope`
  - `## Preconditions (clean working tree; staged snapshot)`
  - `## Frozen Snapshot (staged-only)`
  - `## Verification Evidence`
  - `## Risks / Flags`
- Box checklist: `DevFramework/ToolSetup
Framework/TaskQualityAssurance/boxes/<box>.md`
- Verification artifact: `scripts/verify-code-output.txt`
- Decisions (if any): `DevFramework/ToolSetup
Framework/FrameworkSelfImprovementLogs
/DECISIONS.md`

---

## Checklist Compliance (box-mapped)

- [ ] Acceptance criteria present and correctly formatted
- [ ] Preconditions satisfied (no unstaged, no untracked, staged diff non-empty, Evidence Bundle staged)
- [ ] Frozen staged snapshot captured (`BASE_HEAD`, `STAGED_DIFF_HASH`, staged diff)
- [ ] Verification commands satisfied (per box)
- [ ] Evidence bundle complete (ACP fields embedded)
- [ ] Scope drift handled (justification present if drifted)

---

## Findings (evidence-tied)

- Finding 1: <cite Evidence Bundle heading + staged diff excerpt>
- Finding 2: <cite Evidence Bundle heading + staged diff excerpt>

---

## Required Fixes (builder-actionable patch instructions)

### Fix 1

- **Target:** `path/to/file.ext`
- **Anchor:** `<unique header or search string>`
- **Operation:** INSERT | REPLACE | DELETE
- **Paste-ready content:**

```text
<PASTE FINAL CONTENT HERE>
```

- **Notes:** <tests / constraints / follow-up evidence updates>

---

## Required Commands to Run Next

- `npm run verify`
- (others as required by box)

---

## Evidence Updates Required Before Re-audit

- Update Evidence Bundle sections as needed.
- If staging changes, record a new `STAGED_DIFF_HASH` and treat as a new audit cycle.

---

## Escalation (deterministic; always present)

- **Escalate to X-High?** YES/NO
- **Reasons (evidence-tied):**
  - <risk surface, missing tests/evidence, ambiguity, diff size/complexity, repeated failures>
- **X-High is expected to resolve:**
  - <1–2 bullets>
- **Rerun rule (strict):**
  - X-High rerun MUST use the exact same staged diff (`STAGED_DIFF_HASH`) and the same staged Evidence Bundle.
  - If staging changes: start a new audit cycle and update snapshot identifiers.
