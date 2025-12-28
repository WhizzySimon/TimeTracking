---
description: Deterministic audit on a frozen staged snapshot (git diff --staged only; Evidence Bundle must be staged)
---

# /audit — Deterministic Staged Audit (Frozen Snapshot)

**NON-INTERACTIVE:** This workflow asks no questions. If preconditions fail, output FAIL + remediation and STOP.

## Config

- **Flag location:** `Docs/Rules/ai-config.json`
- **Key:** `switch_model_before_audit` (boolean)
  - `true`: Builder stages changes and STOPs; user switches to GPT-5.2 Medium Reasoning and runs `/audit`
  - `false`: Builder stages changes and runs `/audit` itself (same chat, same model)

## Policy

- Audit input is a **frozen staged snapshot** (`git diff --staged` only).
- Auditor uses ONLY the staged diff and the staged Evidence Bundle.
- Preconditions must all pass; any failure => output FAIL + remediation and STOP.

## Default Evidence Bundle Path

If not specified by user, use today's date:
```
Docs/Devlog/Evidence/AUD-YYYY-MM-DD-01.md
```
(Replace YYYY-MM-DD with current date. Increment -01 if file exists.)

---

## Step 1 — Preconditions (FAIL fast; no questions)

Run these commands. If ANY check fails, output FAIL with the command output and remediation, then STOP.

**A) No unstaged changes**
```bash
git diff --name-only
```
- PASS if empty
- FAIL if non-empty → Remediation: `git add -A` or `git checkout -- <file>`

**B) No untracked files**
```bash
git ls-files --others --exclude-standard
```
- PASS if empty
- FAIL if non-empty → Remediation: `git add <file>` or add to `.gitignore`

**C) Staged diff must be non-empty**
```bash
git diff --staged --name-only
```
- PASS if non-empty
- FAIL if empty → Remediation: Stage changes with `git add -A`

**D) Evidence Bundle must be staged**
- Check if Evidence Bundle path appears in `git diff --staged --name-only`
- PASS if present
- FAIL if missing → Remediation: Create from `Docs/Devlog/Evidence/_template.md` and stage it

---

## Step 2 — Compute Deterministic Identifiers

```bash
git rev-parse HEAD
```
Record as `BASE_HEAD`.

```bash
git diff --staged | git hash-object --stdin
```
Record as `STAGED_DIFF_HASH`.

These identifiers uniquely identify the audit input. Any X-High escalation rerun MUST use the same values.

---

## Step 3 — Read Evidence Bundle

Read the staged Evidence Bundle. It MUST contain:
- **Box type** (default: `research-decision` if unspecified)
- **Acceptance criteria** (REQUIRED; if empty => FAIL)
- **Planned scope** (optional but recommended; if missing, flag as risk)
- **Commands run + results** (manual paste section)
- **Decision links** (repo-relative paths, optional)

If acceptance criteria are empty: FAIL with remediation "Fill in acceptance criteria in Evidence Bundle and re-stage."

---

## Step 4 — Audit (evidence-first)

Audit inputs are ONLY:
- `git diff --staged` output
- Staged Evidence Bundle content

Evaluate:
- Does the staged diff satisfy the acceptance criteria?
- Is there scope drift (files changed outside planned scope)?
- Are there missing tests or documentation for the changes?
- Risk classification: low / medium / high

---

## Step 5 — Verdict + Output

Output format (always include all sections):

### Snapshot
- Evidence Bundle: `<path>`
- BASE_HEAD: `<hash>`
- STAGED_DIFF_HASH: `<hash>`

### Verdict
**PASS** or **FAIL**

### Missing Evidence (if any)
- List what's missing and why it matters

### Required Fixes (if FAIL)
For each fix:
1. **Target:** exact file path + anchor/search string
2. **Operation:** INSERT / REPLACE / DELETE
3. **Paste-ready content:**
```
<content>
```
4. **Alternatives:** (if any; mark one as default)

### Commands to Run Next
- List only commands that exist in the repo (e.g., `npm run verify`)
- If unknown, write: "No standard verify command found"

### Escalation (always present)
- **Escalate to X-High Reasoning?** YES / NO
- **Reasons (evidence-tied):**
  - Risk surface (high-risk areas touched)
  - Missing tests/evidence
  - Ambiguity in requirements or implementation
  - Diff complexity (large diff, many files)
  - Repeated failures
- **If YES:** "Switch to GPT-5.2 X-High Reasoning (8x) and rerun /audit using the SAME staged snapshot (BASE_HEAD + STAGED_DIFF_HASH must match)."

---

## After Audit

- If PASS: Builder may commit.
- If FAIL: Builder must fix issues, re-stage, and re-run /audit (new audit cycle with new STAGED_DIFF_HASH).
