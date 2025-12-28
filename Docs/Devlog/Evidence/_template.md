# Evidence Bundle: <TASK-ID>

## Audit Context (ACP fields — embedded; single source of truth)

- **Task ID:** <TASK-ID>
- **Box Type:** <box>
- **Risk Class (declared):** low | medium | high
- **Audit Required:** ✅ Yes (default)
- **Audit Status:** not_run | pass | fail
- **Audit Report:** `Docs/Reports/AUDIT-<YYYY-MM-DD>__<TASK-ID>.md` (or "not created yet")

---

## Acceptance Criteria

<!-- Must be copied from the task definition -->
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## Planned Scope (required for determinism; or explicitly missing)

- **Planned files/areas:** (list)
- **Out-of-scope:** (list)
- **If missing:** write "NOT PROVIDED" and mark in `## Risks / Flags`

---

## Preconditions (clean working tree; staged snapshot) — REQUIRED

**Policy:**
- No unstaged changes
- No untracked files
- Non-empty staged diff
- Evidence Bundle is staged and part of the audited snapshot

A) No unstaged changes:
```text
$ git diff --name-only
<PASTE HERE — MUST BE EMPTY>
```

B) No untracked files:
```text
$ git ls-files --others --exclude-standard
<PASTE HERE — MUST BE EMPTY>
```

C) Must have staged changes to audit:
```text
$ git diff --staged --name-only
<PASTE HERE — MUST BE NON-EMPTY>
```

D) Evidence Bundle is staged:
Confirm `Docs/Devlog/Evidence/<TASK-ID>.md` appears in the staged file list above.

---

## Frozen Snapshot (staged-only) — REQUIRED

### Snapshot identifiers

```text
BASE_HEAD (git rev-parse HEAD):
<PASTE HERE>
```

```text
STAGED_DIFF_HASH (git diff --staged | git hash-object --stdin):
<PASTE HERE>
```

### Staged stats (optional but recommended)

```text
$ git diff --staged --stat
<PASTE HERE>
```

### Staged diff (authoritative audit input)

```diff
$ git diff --staged
<PASTE HERE>
```

---

## Verification Evidence

### Commands run (box-driven)

| Command | Exit Code | Notes |
| --- | --- | --- |
| `npm run verify` | <0/1> | Required by default unless box says otherwise |
| `npm run test:unit` | <optional> | If required by box |
| `npm run test:e2e` | <optional> | If required by box |

### Deterministic output artifacts

- `scripts/verify-code-output.txt`:
  - **Relevant excerpt:** (paste minimal summary lines)
  - **Path reference:** keep as the canonical artifact

---

## Decisions / References

- Decisions: `Docs/Devlog/DECISIONS.md`
  - Relevant entries: (reference specific headings/quotes) OR write "none"
- Specs/Plans/Tasks: (repo-relative paths or plain text references)
- Related issues/PRs: (links if applicable)

---

## Risks / Flags (evidence-tied)

- Planned scope missing? YES/NO
- Missing tests vs risk surface? YES/NO
- Large diff / complexity? YES/NO
- Ambiguity / unclear intent? YES/NO
- Repeated failures / anomaly detector fired? YES/NO

---

## Notes for Auditor

- Anything the auditor must pay attention to (edge cases, invariants, constraints)
