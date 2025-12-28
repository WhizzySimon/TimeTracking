# P09: Code Style Refactor

**Goal**: Audit and refactor existing codebase to comply with `.windsurf/rules/code-quality-rules.md`

**Status**: Not Started

**Priority**: Low (housekeeping task, do incrementally)

## Reference

All rules defined in: `.windsurf/rules/code-quality-rules.md`

## Tasks

### Phase 1: Audit (read-only)

- [ ] **Task 1.1**: Scan all `.ts` and `.svelte` files for import organization violations
  - Files touched: `src/**/*.ts`, `src/**/*.svelte`
  - Done when: List of files with ungrouped imports documented below

- [ ] **Task 1.2**: Scan for redundant comments (comments that restate obvious code)
  - Files touched: all code files
  - Done when: List of files with redundant comments documented below

- [ ] **Task 1.3**: Scan for typographic quotes in strings/messages
  - Files touched: all code files
  - Done when: List of occurrences documented below

- [ ] **Task 1.4**: Scan for singular/plural violations ("item(s)" patterns)
  - Files touched: all code files
  - Done when: List of occurrences documented below

- [ ] **Task 1.5**: Scan for console.log statements not following structured logging format
  - Files touched: all code files
  - Done when: List of files with non-compliant logging documented below

### Phase 2: Refactor Imports

- [ ] **Task 2.1**: Organize imports in `src/lib/**/*.ts`
  - Group order: svelte/kit imports -> third-party -> internal (`$lib/...`)
  - Done when: All imports follow grouping convention

- [ ] **Task 2.2**: Organize imports in `src/routes/**/*.svelte`
  - Same grouping rules
  - Done when: All imports follow grouping convention

### Phase 3: Refactor Documentation

- [ ] **Task 3.1**: Remove redundant comments
  - Keep only: intent, edge cases, non-obvious behavior
  - Done when: No comments that restate obvious code

- [ ] **Task 3.2**: Replace typographic quotes with ASCII quotes
  - Done when: No curly quotes in code or user-facing strings

### Phase 4: Refactor Logging

- [ ] **Task 4.1**: Update console.log statements to structured format
  - Use status keywords: OK, WARNING, ERROR, FAIL
  - Use progress markers: [ x / n ] for iterations
  - Done when: All logging follows structured format

### Phase 5: Refactor Messages

- [ ] **Task 5.1**: Fix singular/plural grammar
  - Replace "item(s)" patterns with proper conditional grammar
  - Done when: No "(s)" patterns remain

### Phase 6: Function Style (opportunistic)

- [ ] **Task 6.1**: Add function grouping markers where beneficial
  - Only in files with 5+ related functions
  - Done when: Large files have clear section markers

## Audit Results

### Import Violations

(To be filled during Phase 1)

### Redundant Comments

(To be filled during Phase 1)

### Typographic Quotes

(To be filled during Phase 1)

### Singular/Plural Violations

(To be filled during Phase 1)

### Non-Compliant Logging

(To be filled during Phase 1)

## Notes

- This is a low-priority housekeeping task
- Do incrementally when touching files for other reasons
- Do NOT refactor files that are working fine just for style
- Prioritize files that are frequently modified
