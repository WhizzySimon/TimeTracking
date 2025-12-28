# Plan: Code Quality Enforcement

**Created:** 2025-12-24  
**Spec:** `Docs/Specs/P08-code-quality.md`  
**Status:** Draft

---

## Architecture

No new modules required. Changes are configuration-only:

1. **ESLint config** — Add complexity rule
2. **TypeScript config** — Add stricter settings
3. **E2E tests** — Replace brittle selectors (incremental)

---

## Files to Modify

| File               | Change                                     |
| ------------------ | ------------------------------------------ |
| `eslint.config.js` | Add `complexity` rule with threshold 20    |
| `tsconfig.json`    | Add `noUnusedLocals`, `noUnusedParameters` |
| `e2e/*.test.ts`    | Replace `getByText` with `getByTestId`     |
| `src/**/*.svelte`  | Add `data-testid` where needed             |

---

## Data Model Changes

None.

---

## UI State Model

None.

---

## Error Handling Strategy

- If new rules cause existing code to fail, add inline disable comments with TODO.
- Track grandfathered violations in a separate issue/doc.

---

## Testing Strategy

- **Unit tests**: Not applicable (config changes only)
- **Integration**: Run `npm run verify` to confirm all checks pass
- **E2E**: Run `npm run test:e2e` to confirm tests still pass

---

## Risks & Constraints

| Risk                                 | Mitigation                       |
| ------------------------------------ | -------------------------------- |
| New rules break existing code        | Grandfather with inline disables |
| Developer friction from new rules    | Start with warnings, then errors |
| E2E test churn from selector changes | Batch changes, test thoroughly   |

---

## Phased Rollout

1. **Phase A**: Add ESLint complexity rule (warning first)
2. **Phase B**: Add TypeScript stricter settings
3. **Phase C**: Replace brittle E2E selectors (batched)
4. **Phase D**: Promote complexity rule to error

---

## Change Log

**[2025-12-24 19:55]**

- Created: Initial plan for code quality enforcement
