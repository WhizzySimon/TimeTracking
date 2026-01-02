# Code Quality & Style Audit — TimeTracker

**Audit Date:** 2025-12-24  
**Auditor:** Cascade (automated analysis)  
**Scope:** `src/`, `e2e/`, config files

---

## 1. Tooling Inventory

### Prettier (Formatting)

| Setting       | Value                  | Notes                    |
| ------------- | ---------------------- | ------------------------ |
| printWidth    | 100                    | Standard                 |
| tabWidth      | tabs                   | `useTabs: true`          |
| singleQuote   | true                   | Consistent               |
| trailingComma | none                   | Differs from recommended |
| plugins       | prettier-plugin-svelte | Svelte support           |

**Config file:** `.prettierrc`

### ESLint (Linting)

| Config                 | Status     | Notes                          |
| ---------------------- | ---------- | ------------------------------ |
| Flat config            | ✅ Yes     | Modern ESLint 9.x format       |
| @eslint/js recommended | ✅ Yes     | Base JS rules                  |
| typescript-eslint      | ✅ Yes     | TS recommended configs         |
| eslint-plugin-svelte   | ✅ Yes     | Svelte recommended + prettier  |
| eslint-config-prettier | ✅ Yes     | Disables conflicting rules     |
| Complexity rule        | ❌ Not set | Default threshold (20) applies |

**Config file:** `eslint.config.js`

**Custom rules:**

- `no-undef: off` — Recommended for TypeScript projects

### TypeScript (Type Checking)

| Setting            | Value   | Notes                  |
| ------------------ | ------- | ---------------------- |
| strict             | true    | ✅ Best practice       |
| noUnusedLocals     | —       | Not explicitly set     |
| noUnusedParameters | —       | Not explicitly set     |
| checkJs            | true    | Checks JS files too    |
| moduleResolution   | bundler | Modern Vite-compatible |

**Config file:** `tsconfig.json` (extends `.svelte-kit/tsconfig.json`)

### CI Gates (GitHub Actions)

| Check          | Runs on PR? | Blocking? | Notes                 |
| -------------- | ----------- | --------- | --------------------- |
| npm run verify | ✅ Yes      | ✅ Yes    | format + check + lint |
| npm run test   | ✅ Yes      | ✅ Yes    | unit + e2e            |
| Playwright     | ✅ Yes      | ✅ Yes    | With retry (2x)       |

**Config file:** `.github/workflows/ci.yml`

---

## 2. Code Hotspots

### 2.1 Large Files (>300 lines)

| File                               | Lines | Severity | Notes                       |
| ---------------------------------- | ----- | -------- | --------------------------- |
| `src/routes/settings/+page.svelte` | 935   | Medium   | Many sections, could split  |
| `src/routes/analysis/+page.svelte` | 809   | Medium   | Complex calculations inline |
| `src/routes/+layout.svelte`        | 678   | Low      | Root layout, acceptable     |
| `src/routes/day/+page.svelte`      | 344   | Low      | Reasonable for main view    |

**Recommendation:** Consider extracting reusable logic from settings and analysis pages into separate modules or components.

### 2.2 Deep Nesting / Complex Functions

| File                               | Function/Block                 | Issue                       |
| ---------------------------------- | ------------------------------ | --------------------------- |
| `src/routes/analysis/+page.svelte` | `calculatePeriodGroups()`      | ~60 lines, multiple loops   |
| `src/routes/analysis/+page.svelte` | `calculateCategoryBreakdown()` | ~40 lines, nested logic     |
| `src/routes/settings/+page.svelte` | Template (many sections)       | Long template, hard to scan |

**Recommendation:** Extract calculation logic to `src/lib/utils/` modules with unit tests.

### 2.3 Potential God Files

| File                        | Responsibilities               | Verdict       |
| --------------------------- | ------------------------------ | ------------- |
| `src/lib/storage/db.ts`     | DB open, CRUD, queries         | ✅ Acceptable |
| `src/lib/stores/index.ts`   | All global stores              | ✅ Acceptable |
| `src/routes/+layout.svelte` | Auth, sync, PWA, theme, header | ⚠️ Borderline |

**Recommendation:** `+layout.svelte` handles many concerns. Consider extracting sync logic to a dedicated module.

### 2.4 Over-Fragmentation

No significant over-fragmentation detected. Component structure follows SvelteKit conventions appropriately.

---

## 3. Test Stability (Playwright Locators)

### Current State

| Locator Type | Usage                         | Stability |
| ------------ | ----------------------------- | --------- |
| getByTestId  | ✅ Used for dynamic elements  | Stable    |
| getByRole    | ✅ Used for buttons, headings | Stable    |
| getByLabel   | ✅ Used for form fields       | Stable    |
| getByText    | ⚠️ Some German strings remain | Brittle   |

### Files with `getByText` (potential brittleness)

- `e2e/basic-flow.test.ts` — Some German text selectors
- `e2e/milestone1.test.ts` — Some German text selectors
- `e2e/quick-start.test.ts` — Some German text selectors

**Recommendation:** Replace remaining `getByText` with `getByTestId` for UI elements that may change (localization, wording).

---

## 4. Summary & Recommendations

### Immediate (No code changes needed)

- [x] Tooling is well-configured
- [x] CI gates are in place
- [x] TypeScript strict mode enabled

### Short-term (Future tasks)

- [ ] Add ESLint complexity rule with threshold 20
- [ ] Add `noUnusedLocals` and `noUnusedParameters` to tsconfig
- [ ] Replace remaining `getByText` selectors with `getByTestId`

### Medium-term (Refactoring)

- [ ] Extract calculation logic from `analysis/+page.svelte` to utils
- [ ] Consider splitting `settings/+page.svelte` into sub-components
- [ ] Extract sync logic from `+layout.svelte` to dedicated module

---

## 5. Metrics Snapshot

| Metric              | Value |
| ------------------- | ----- |
| Total source files  | 59    |
| Files >300 lines    | 4     |
| Files >500 lines    | 2     |
| Unit test files     | 4     |
| E2E test files      | 3     |
| ESLint custom rules | 1     |
| CI checks           | 3     |

---

**This audit is read-only. No code changes were made.**
