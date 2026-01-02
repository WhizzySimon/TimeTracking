# Self-Learning System — Worked Example (2025-12-29)

This document shows a concrete example of the Self-Learning System in action during Task A2.14 (StundenzettelExport component).

---

## Session Context

- **Task:** A2.14 — Create StundenzettelExport component
- **Duration:** ~10 minutes
- **Outcome:** PASS, committed and pushed

---

## Logs Captured

### 1. Self-Learning Log Entry

**File:** `DevFramework/FrameworkSelfImprovementLogs/SELF-LEARNING-LOG.md`

```markdown
## 2025-12-29 15:15 — Task A2.14

| Step                 | Result | Notes                                        |
| -------------------- | ------ | -------------------------------------------- |
| A1: Capture feedback | none   | No corrective feedback in session            |
| B1: Repeated errors  | none   | No repeated errors                           |
| B2: File churn       | none   | New component created, minor lint fixes only |
| B3: Scope drift      | none   | Files match Task A2.14 scope                 |
| B4: Session duration | ~10m   | normal                                       |
| C1: Promotions       | none   | No items meet promotion criteria             |
| C2: Read LEARNINGS   | ✓ read | 5 items                                      |
| C3: Hard Rule → JIT  | none   | No new Hard Rules proposed                   |
```

**Purpose:** Tracks that the workflow was executed and records any detected patterns.

---

### 2. Changelog Entry

**File:** `DevFramework/FrameworkSelfImprovementLogs/CHANGELOG.md`

```markdown
| 2025-12-29 | feat | A2.14: StundenzettelExport component — employer selector, date range, column checkboxes, preview | — |
```

**Purpose:** One-line history of all changes for quick reference.

---

### 3. Evidence Bundle

**File:** `DevFramework/FrameworkSelfImprovementLogs/Evidence/AUD-2025-12-29-13.md`

```markdown
# Evidence Bundle: A2.14

## Audit Context

- **Task ID:** A2.14 — StundenzettelExport component
- **Box Type:** feature

---

## Acceptance Criteria (REQUIRED)

- [x] Export dialog with employer selector
- [x] Date range picker (Von/Bis)
- [x] Column selection checkboxes (6 columns)
- [x] Preview table showing filtered entries
- [x] Export per employer only (not combined)

---

## Planned Scope (recommended)

- **Planned files/areas:**
  - `src/lib/components/StundenzettelExport.svelte` (new)
  - `src/routes/settings/+page.svelte` (integration for testing)
- **Out-of-scope:** Excel/PDF export (A2.15, A2.16)

---

## Commands Run + Results

| Command          | Exit Code | Notes                                          |
| ---------------- | --------- | ---------------------------------------------- |
| `npm run verify` | 1         | 0 errors in new code; 24 pre-existing warnings |
| `npm run check`  | 0         | 0 errors, 0 warnings                           |
| MCP Playwright   | PASS      | Visual test confirmed all UI elements          |

---

## Auditor Section (filled by /audit)

### Snapshot Identifiers

- **BASE_HEAD:** 7a08c5dae34d404c98477ab0481e97bd51ac2b22
- **STAGED_DIFF_HASH:** bcb023067ebc116076e7a2817a8bab741926e968

### Audit Verdict

- **Date:** 2025-12-29
- **Verdict:** PASS
- **Risk:** low
- **Notes:** New component implements all acceptance criteria. Naming follows conventions.
```

**Purpose:** Audit trail proving the work was verified before commit.

---

### 4. Implementation Progress Update

**File:** `TempAppDevDocs/Features/IMPLEMENTATION_PROGRESS.md`

```markdown
# Before

- [ ] **Task A2.14** — StundenzettelExport component

# After

- [x] **Task A2.14** — StundenzettelExport component
```

**Purpose:** Tracks overall phase progress (14/18 tasks complete).

---

## Workflow Execution Order

```
1. Implementation
   └── Created StundenzettelExport.svelte
   └── Integrated into settings page
   └── Fixed lint errors

2. Verification
   └── npm run verify (0 errors in new code)
   └── npm run check (PASS)
   └── MCP Playwright visual test (PASS)

3. Pre-Commit Workflow (self-learning-system.md)
   └── Part A: Scanned chat for feedback → none found
   └── Part B1: Checked for repeated errors → none
   └── Part B2: Checked for file churn → none
   └── Part B3: Checked for scope drift → none
   └── Part B4: Noted session duration → ~10m (normal)
   └── Part C1: Checked INBOX for promotions → none eligible
   └── Part C2: Read LEARNINGS.md → 5 items
   └── Part C3: No Hard Rules to propose

4. Documentation Updates
   └── CHANGELOG.md → added entry
   └── IMPLEMENTATION_PROGRESS.md → marked A2.14 complete
   └── DECISIONS.md → N/A (no decisions)

5. Evidence Bundle
   └── Created AUD-2025-12-29-13.md from template
   └── Filled acceptance criteria
   └── Staged with git add -A

6. Audit (/audit workflow)
   └── Preconditions checked (all PASS)
   └── Computed snapshot identifiers
   └── Evaluated diff against criteria
   └── Verdict: PASS

7. Commit & Push
   └── git commit -m "feat: A2.14 ..."
   └── git push
   └── Post-push verification (working tree clean)
```

---

## What Would Trigger Logging

| Scenario                 | What Gets Logged          | Where              |
| ------------------------ | ------------------------- | ------------------ |
| User says "don't do X"   | Corrective feedback       | LEARNINGS-INBOX.md |
| Same error 3+ times      | Repeated error pattern    | LEARNINGS-INBOX.md |
| File edited 5+ times     | File churn warning        | LEARNINGS-INBOX.md |
| Changed unplanned files  | Scope drift warning       | LEARNINGS-INBOX.md |
| Session > 2 hours        | Long session warning      | LEARNINGS-INBOX.md |
| INBOX item seen 2+ times | Promotion to LEARNINGS.md | LEARNINGS.md       |
| Hard Rule approved       | JIT rule file             | Relevant .md file  |

---

## Files in the System

```
DevFramework/
├── FrameworkSelfImprovementLogs/
│   ├── CHANGELOG.md           # One-line change history
│   ├── DECISIONS.md           # Architecture decisions
│   ├── LEARNINGS.md           # Proven preferences (max 30)
│   ├── LEARNINGS-INBOX.md     # Raw feedback capture
│   ├── SELF-LEARNING-LOG.md   # Workflow execution log
│   └── Evidence/
│       ├── _template.md       # Evidence bundle template
│       └── AUD-*.md           # Per-audit evidence files
└── JustInTimeAgentRules/
    └── self-learning-system.md # The workflow definition
```

---

## Summary

This session was "clean" — no feedback, no patterns detected, straightforward implementation. The logs still capture:

1. **Proof of execution** — SELF-LEARNING-LOG.md shows the workflow ran
2. **Change history** — CHANGELOG.md has the one-liner
3. **Audit trail** — Evidence bundle proves verification
4. **Progress tracking** — IMPLEMENTATION_PROGRESS.md updated

In a session with problems, additional entries would appear in LEARNINGS-INBOX.md for later review and potential promotion.
