# Task 0 — Setup Testing Infrastructure

**Priority:** MUST complete before Task 1.1  
**Estimated Time:** 15-30 minutes

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/Rules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Purpose

Install and configure Vitest for unit testing business logic. This enables self-verification of calculations, date utilities, and validation logic against specs.

---

## Task 0.1 — Install Vitest

### Files to Modify:

- `package.json`

### Steps:

1. Install Vitest and UI:

```bash
npm install -D vitest @vitest/ui
```

2. Add test scripts to `package.json`:

```json
{
	"scripts": {
		"test:unit": "vitest",
		"test:unit:ui": "vitest --ui",
		"test:unit:run": "vitest run",
		"test": "npm run test:unit:run && npm run test:e2e"
	}
}
```

### Done When:

- Vitest installed in `devDependencies`
- Test scripts added to `package.json`
- `npm run test:unit` command exists (will show "no tests found" - that's OK)

### Verify:

```bash
npm run test:unit -- --version
# Should show Vitest version
```

---

## Task 0.2 — Create Vitest Configuration

### Files to Create:

- `vitest.config.ts`

### Content:

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	}
});
```

### Done When:

- `vitest.config.ts` exists at project root
- Configuration includes SvelteKit plugin
- Test pattern matches `*.test.ts` files

### Verify:

```bash
npm run check
# Should pass with no errors
```

---

## Task 0.3 — Create Example Test

### Files to Create:

- `src/lib/utils/example.test.ts`

### Content:

```typescript
import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
	it('should pass basic assertion', () => {
		expect(1 + 1).toBe(2);
	});

	it('should handle strings', () => {
		expect('hello').toBe('hello');
	});
});
```

### Done When:

- Example test file exists
- Tests are simple and guaranteed to pass

### Verify:

```bash
npm run test:unit:run
# Should show: 2 tests passed
```

---

## Task 0.4 — Update IMPLEMENTATION_PROGRESS.md

### Files to Modify:

- `Docs/IMPLEMENTATION_PROGRESS.md`

### Steps:

Add Task 0 section at the top:

```markdown
## Phase 0: Testing Setup (PREREQUISITE)

**Target:** 1 task, ~15-30 minutes  
**Status:** Completed

- [x] **Task 0** — Setup testing infrastructure
  - Files: `package.json`, `vitest.config.ts`, `src/lib/utils/example.test.ts`
  - Verified: npm run test:unit:run ✅ (2 tests passed)
  - Deviations: None
  - Notes: Vitest configured and working
```

### Done When:

- Progress file updated with Task 0 completion
- Timestamp updated
- Tasks completed counter updated

---

## Task 0.5 — Clean Up Example Test

### Files to Delete:

- `src/lib/utils/example.test.ts`

### Steps:

1. Delete the example test file
2. Verify test command still works (will show "no tests found")

### Done When:

- Example test removed
- `npm run test:unit` shows "no tests found" (expected)

### Verify:

```bash
npm run test:unit:run
# Should complete successfully with "no tests found"
```

---

## Final Verification

Run all checks:

```bash
npm run check        # ✅ TypeScript
npm run lint         # ✅ Code style
npm run test:unit    # ✅ No tests found (expected)
npm run build        # ✅ Build succeeds
```

All must pass before proceeding to Task 1.1.

---

## Guardrails

- Do NOT skip this task - testing infrastructure is required
- Do NOT modify existing test:e2e script (Playwright already configured)
- Do NOT install additional testing libraries (Vitest is sufficient)
- Verify example test passes before deleting it

---

**After completing Task 0, proceed to Task 1.1 (Configure SvelteKit for SPA mode).**
