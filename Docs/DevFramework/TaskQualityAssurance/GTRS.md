# Golden Task Regression Suite (GTRS)

The GTRS is a fixed set of 10 representative tasks used to measure framework effectiveness over time.

**Purpose:** Detect framework regressions — if Cascade struggles with tasks it previously handled well, the framework may have degraded.

---

## Run Cadence

| Trigger                       | Action                         |
| ----------------------------- | ------------------------------ |
| After framework version bump  | Run full GTRS                  |
| After major doc restructure   | Run full GTRS                  |
| Monthly (manual)              | Run full GTRS                  |
| After anomaly pattern emerges | Run related golden task subset |

---

## Results Format

Store results in `Docs/DevFramework/DevFramework/TaskQualityAssurance/GTRS-runs/<YYYY-MM-DD>-<version>.md`

Each run file includes:

```markdown
# GTRS Run: YYYY-MM-DD

**Framework Version:** X.Y.Z
**Cascade Session:** <session-id or link>

## Results

| Task  | Status | Duration | Notes           |
| ----- | ------ | -------- | --------------- |
| GT-01 | PASS   | 12min    |                 |
| GT-02 | FAIL   | 25min    | Stuck on step 3 |

...

## Summary

- Pass rate: X/10
- Avg duration: Xmin
- Regressions detected: [list]
- Improvements noted: [list]
```

---

## Golden Tasks

### GT-01: Create Documentation File

**Box:** `infra-build`  
**Difficulty:** Easy  
**Expected Duration:** 15min

**Task:** Create a new markdown file in Docs/ with proper structure.

**Acceptance Criteria:**

- [ ] File created in correct location
- [ ] Follows existing doc conventions
- [ ] Added to relevant INDEX if applicable

**Verification Commands:**

```bash
# File exists
test -f Docs/<path>.md

# Has required sections (manual check)
```

**Evidence Requirements:**

- File path
- Section headers present

**Success Metrics:**

- Completed in <15min
- No rework needed

---

### GT-02: Fix Typo/Doc Bug

**Box:** `bugfix`  
**Difficulty:** Easy  
**Expected Duration:** 10min

**Task:** Fix a typo or incorrect information in documentation.

**Acceptance Criteria:**

- [ ] Typo/error identified
- [ ] Fix applied
- [ ] No unrelated changes

**Verification Commands:**

```bash
# Diff shows only targeted change
git diff --stat
```

**Evidence Requirements:**

- Before/after text
- Commit hash

**Success Metrics:**

- Single targeted edit
- <10min total

---

### GT-03: Add npm Script

**Box:** `infra-build`  
**Difficulty:** Easy  
**Expected Duration:** 15min

**Task:** Add a new npm script to package.json.

**Acceptance Criteria:**

- [ ] Script added to package.json
- [ ] Script runs without error
- [ ] Follows existing naming conventions

**Verification Commands:**

```bash
npm run <script-name> -- --help
# or
npm run <script-name>
```

**Evidence Requirements:**

- Script name and command
- Output of test run

**Success Metrics:**

- Script works first try
- <15min total

---

### GT-04: Create Svelte Component

**Box:** `feature`  
**Difficulty:** Medium  
**Expected Duration:** 30min

**Task:** Create a new Svelte component with props and basic styling.

**Acceptance Criteria:**

- [ ] Component file created
- [ ] Props typed correctly
- [ ] Basic styling applied
- [ ] No TypeScript errors

**Verification Commands:**

```bash
npm run check
npm run lint
```

**Evidence Requirements:**

- Component file path
- Props interface
- Screenshot or browser test

**Success Metrics:**

- Passes check/lint
- Renders correctly
- <30min total

---

### GT-05: Fix UI Bug

**Box:** `bugfix`  
**Difficulty:** Medium  
**Expected Duration:** 30min

**Task:** Fix a visual or interaction bug in the UI.

**Acceptance Criteria:**

- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix applied
- [ ] Bug no longer occurs

**Verification Commands:**

```bash
npm run check
npm run lint
# Manual browser verification or e2e test
```

**Evidence Requirements:**

- Bug description
- Root cause
- Fix applied
- Before/after (screenshot or test)

**Success Metrics:**

- Root cause fix (not workaround)
- No regressions
- <30min total

---

### GT-06: Add E2E Test

**Box:** `feature`  
**Difficulty:** Medium  
**Expected Duration:** 30min

**Task:** Add a new Playwright E2E test for existing functionality.

**Acceptance Criteria:**

- [ ] Test file created/updated
- [ ] Test passes locally
- [ ] Tests meaningful user flow

**Verification Commands:**

```bash
npx playwright test <test-file> --project=chromium
```

**Evidence Requirements:**

- Test file path
- Test description
- Pass/fail output

**Success Metrics:**

- Test passes
- Covers real user scenario
- <30min total

---

### GT-07: Refactor Module

**Box:** `refactor`  
**Difficulty:** Medium  
**Expected Duration:** 45min

**Task:** Refactor an existing module for clarity without changing behavior.

**Acceptance Criteria:**

- [ ] Behavior preserved
- [ ] Code clarity improved
- [ ] All tests pass
- [ ] No new dependencies

**Verification Commands:**

```bash
npm run verify
```

**Evidence Requirements:**

- Files changed
- Refactoring rationale
- Test results

**Success Metrics:**

- All tests pass
- Clearer code (subjective)
- <45min total

---

### GT-08: Research Decision

**Box:** `research-decision`  
**Difficulty:** Medium  
**Expected Duration:** 30min

**Task:** Research a technical question and document the decision.

**Acceptance Criteria:**

- [ ] Question clearly stated
- [ ] Options enumerated
- [ ] Decision made with rationale
- [ ] Logged in DECISIONS.md

**Verification Commands:**

```bash
# Check DECISIONS.md updated
git diff Docs/DevFramework/DevFramework/FrameworkSelfImprovementLogs
/DECISIONS.md
```

**Evidence Requirements:**

- Question
- Options considered
- Decision rationale
- DECISIONS.md entry

**Success Metrics:**

- Clear decision documented
- Rationale is sound
- <30min total

---

### GT-09: Multi-File Feature

**Box:** `feature`  
**Difficulty:** Hard  
**Expected Duration:** 60min

**Task:** Implement a feature requiring changes across 3+ files.

**Acceptance Criteria:**

- [ ] All required files modified
- [ ] Feature works end-to-end
- [ ] All checks pass
- [ ] No scope creep

**Verification Commands:**

```bash
npm run verify
# Feature-specific test or manual verification
```

**Evidence Requirements:**

- Files changed list
- Feature description
- Verification output

**Success Metrics:**

- Feature complete
- All checks pass
- <60min total
- No unplanned changes

---

### GT-10: Debug Failing Test

**Box:** `bugfix`  
**Difficulty:** Hard  
**Expected Duration:** 45min

**Task:** Debug and fix a failing automated test.

**Acceptance Criteria:**

- [ ] Failing test identified
- [ ] Root cause found
- [ ] Fix applied (code or test)
- [ ] Test now passes

**Verification Commands:**

```bash
npm run verify
# or specific test command
```

**Evidence Requirements:**

- Test name
- Failure message
- Root cause
- Fix applied

**Success Metrics:**

- Test passes
- Root cause addressed
- <45min total

---

## Summary Table

| Task  | Box               | Difficulty | Expected |
| ----- | ----------------- | ---------- | -------- |
| GT-01 | infra-build       | Easy       | 15min    |
| GT-02 | bugfix            | Easy       | 10min    |
| GT-03 | infra-build       | Easy       | 15min    |
| GT-04 | feature           | Medium     | 30min    |
| GT-05 | bugfix            | Medium     | 30min    |
| GT-06 | feature           | Medium     | 30min    |
| GT-07 | refactor          | Medium     | 45min    |
| GT-08 | research-decision | Medium     | 30min    |
| GT-09 | feature           | Hard       | 60min    |
| GT-10 | bugfix            | Hard       | 45min    |

**Total baseline:** ~5.5 hours for full suite

---

## Scoring

| Metric          | Formula                                |
| --------------- | -------------------------------------- |
| Pass Rate       | (Passed tasks / 10) × 100%             |
| Time Efficiency | (Expected total / Actual total) × 100% |
| Regression      | Tasks that passed before but fail now  |

**Healthy framework:** ≥80% pass rate, ≥70% time efficiency, 0 regressions
