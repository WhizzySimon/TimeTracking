---
description: Deterministic audit on a frozen staged snapshot (git diff --staged only; Evidence Bundle must be staged)
---

# /audit — Deterministic Staged Audit (Frozen Snapshot)

## Policy (single source of truth)

- Audit input is a **frozen staged snapshot**.
- Auditor uses **ONLY** `git diff --staged` (never working tree).
- Preconditions enforce:
  - No unstaged changes
  - No untracked files
  - Non-empty staged diff
  - Evidence Bundle is staged and part of the audited snapshot
- Audit Report is generated **after the verdict** and is **not required** to be staged during preconditions. It may be committed later (optional).

Any rerun (including X-High escalation rerun) MUST use the **exact same staged diff** (`STAGED_DIFF_HASH`) and the same staged Evidence Bundle. If staging changes, it is a new audit cycle.

## Inputs (must be stated at start of the audit)

- Task ID: `<TASK-ID>`
- Box type: `<BOX>` (e.g. `bugfix`, `feature`, `refactor`, `infra-build`, `research-decision`, `ui-ux`)
- Evidence Bundle: `Docs/Devlog/Evidence/<TASK-ID>.md`
- Audit Report (write after verdict): `Docs/Reports/AUDIT-<YYYY-MM-DD>__<TASK-ID>.md`

## Step 1 — Preconditions (FAIL fast; staged snapshot)

Run these commands and paste outputs into the Evidence Bundle under `## Preconditions (clean working tree; staged snapshot)`.

A) Must have **no unstaged changes**
```bash
git diff --name-only
```
FAIL if output is non-empty.

B) Must have **no untracked files**
```bash
git ls-files --others --exclude-standard
```
FAIL if output is non-empty.

C) Must have **staged changes to audit**
```bash
git diff --staged --name-only
```
FAIL if output is empty.

D) Evidence Bundle must be **staged**
Using the output of `git diff --staged --name-only`, FAIL if it does not include:
- `Docs/Devlog/Evidence/<TASK-ID>.md`

## Step 2 — Record immutable snapshot identifiers (required)

Paste into the Evidence Bundle under `## Frozen Snapshot (staged-only)`:

```bash
git rev-parse HEAD
git diff --staged | git hash-object --stdin
git diff --staged --stat
git diff --staged
```

Record:
- `BASE_HEAD` = output of `git rev-parse HEAD`
- `STAGED_DIFF_HASH` = output of `git diff --staged | git hash-object --stdin`

## Step 3 — Evidence Bundle completeness gate (FAIL if missing)

The Evidence Bundle is the single source of truth (ACP fields embedded). It MUST include:
- Box type
- Acceptance criteria
- Planned scope (or explicitly "NOT PROVIDED" + risk flag)
- Preconditions outputs (A/B/C/D)
- Frozen Snapshot section containing:
  - `BASE_HEAD`
  - `STAGED_DIFF_HASH`
  - staged file list
  - staged diff (`git diff --staged`)
- Verification evidence (minimum: `npm run verify`) and reference to `scripts/verify-code-output.txt`
- Decisions: reference `Docs/Devlog/DECISIONS.md` if relevant (or explicitly "none")

If anything is missing: FAIL and output exactly what to add and where.

## Step 4 — Required verification (box-driven)

Re-read: `Docs/AI/boxes/<box>.md`

Run the required commands from the box. Minimum expectation:
```bash
npm run verify
```

Evidence requirement:
- `scripts/verify-code-output.txt` is the canonical output artifact; reference it in the Evidence Bundle.
- If you paste excerpts, paste only minimal summary lines.

## Step 5 — Audit checks (evidence-first; deterministic)

Use ONLY:
- Evidence Bundle: `Docs/Devlog/Evidence/<TASK-ID>.md`
- Staged diff: `git diff --staged`
- Verification outputs (including `scripts/verify-code-output.txt`)
- Box checklist: `Docs/AI/boxes/<box>.md`
- Decisions (if any): `Docs/Devlog/DECISIONS.md`

Perform:
- Box checklist compliance
- Scope drift detection (planned scope vs staged diff)
- Missing evidence detection (no-evidence-not-done)
- Risk classification (low/medium/high) based on touched areas + diff size/complexity + tests/evidence

## Step 6 — Verdict then write Audit Report (report is post-verdict)

Write: `Docs/Reports/AUDIT-<YYYY-MM-DD>__<TASK-ID>.md`

The report MUST include:
- Snapshot: Evidence Bundle path + `BASE_HEAD` + `STAGED_DIFF_HASH`
- PASS/FAIL
- Findings (evidence-tied)
- Builder-actionable patch instructions
- Required commands to run next
- Evidence updates required before re-audit
- Escalation section (always present; deterministic)

## Step 7 — Escalation (always present; deterministic)

In every audit output, include:

- **Escalate to X-High?** YES/NO
- **Reasons (evidence-tied):**
  - Risk surface
  - Missing tests/evidence
  - Ambiguity
  - Diff size/complexity
  - Repeated failures
- **X-High is expected to resolve:**
  - (1–2 bullets)
- **Rerun rule (strict):**
  - X-High rerun MUST use the exact same staged diff (`STAGED_DIFF_HASH`) and the same Evidence Bundle.
  - If staging changes, this is a new audit cycle.
