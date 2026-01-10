# Code Quality Rules

**Trigger:** When writing/editing code

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] code-quality rules loaded

---

## Core Principles

- **Respect lint rules** — never suppress them, fix the root cause
- **Fix errors and warnings** — don't leave them for later
- **No file clutter** — don't create summaries.md or other files unless explicitly requested

---

## Warnings Policy

**Fix warnings properly, do not suppress them.**

When encountering framework or language warnings:

1. **Do NOT use ignore comments** to suppress warnings (e.g., `svelte-ignore`, `@ts-ignore`, `eslint-disable`)
2. **Fix the root cause** instead
3. **Verify with linter/checker** that warnings are resolved (0 errors, 0 warnings)

## Lint Error Resolution (required)

**When a lint fix attempt fails, STOP and analyze before trying again.**

If a lint rule rejects your first fix attempt:

1. **Do NOT iterate on syntax** - multiple quick-fix attempts waste time
2. **Research the rule** - read the official documentation to understand WHY it exists
3. **Question the pattern** - is the implementation approach correct, or is there a better pattern?
4. **Check for known issues** - search GitHub issues for the rule; it may be a known limitation
5. **Consider alternatives** - the linter may be telling you the design is wrong, not just the syntax

**Example failure mode (avoid this):**

```
Attempt 1: goto(url.pathname + url.search) → rejected
Attempt 2: goto(resolve('/path') + '?query') → rejected
Attempt 3: goto(resolve(`/path?query`)) → TypeScript error
Attempt 4: goto(`${resolve('/path')}?query`) → rejected
```

**Correct approach:**

```
Attempt 1 fails → STOP
Research: Why does svelte/no-navigation-without-resolve exist?
Insight: Rule requires resolve() to wrap entire argument
Question: Is query param the right pattern here?
Solution: Use pushState() for temporary navigation state
```

**Key insight:** Lint rules often reveal design problems, not just syntax issues.

## Code Naming (required)

Names must be **self-explanatory** — no comment needed to understand purpose.

1. **Functions** — name explains what it does: `calculateTotalHours()` not `calc()`
2. **Variables** — name explains what it contains: `activeTimeEntries` not `entries`
3. **Booleans** — prefix with is/has/can/should: `isRunning`, `hasUnsavedChanges`
4. **Max 4-5 words** — `getUserActiveTimeEntries` ✓, `getTheCurrentlyActiveUserTimeEntryRecords` ✗
5. **No abbreviations** — `category` not `cat`, `configuration` not `cfg`
6. **No single-letter names** — except `i`, `j`, `k` for loop indices
   - **Includes arrow function parameters:** `.filter((e) => ...)` ✗ → `.filter((emp) => ...)` ✓

### Examples

| ❌ Unclear | ✓ Self-Explanatory   |
| ---------- | -------------------- |
| `proc()`   | `processTimeEntry()` |
| `data`     | `userSettings`       |
| `temp`     | `unsavedDraft`       |
| `flag`     | `isTimerRunning`     |

---

## Code Generation Principles (required)

- **Do not rename existing symbols** unless explicitly asked
- **Analyze existing codebase first** — re-use existing patterns, naming conventions, formatting, design philosophy, logging style
- **Check for existing helpers** before implementing new ones
- **Principle of Least Surprise** — prefer simple, idiomatic code over clever or magical solutions
- **Optimize for readability and maintainability**, not micro-optimizations
- **Prefer standard library** over third-party packages; add dependencies only if a helper would be unreasonably complex
- **No emojis in code or logging** — UI exceptions: checkmark/X/warning icons for status

## Imports (required)

- All imports at top of file
- No local imports inside functions
- Group imports: standard library -> third-party -> internal modules
- Prefer importing all needed names from a module in a single line

## Documentation Principles (required)

- **Avoid comments that restate obvious code** — comment intent, edge cases, non-obvious behavior
- **No docstrings/JSDoc for small single-purpose functions** with self-explanatory names and arguments
- Use a single comment above such functions if intent or types need clarification
- Use docstrings/JSDoc only for complex functions (>5 args, multiple responsibilities, complex return types)
- Use ASCII quotes ("..." or '...'), not typographic quotes

## Structured Logging (required)

- Indent sub-actions with 2 spaces
- Log action description **before** executing it
- Use status keywords on separate indented line: OK, WARNING, ERROR, FAIL
- Surround file paths, names, IDs with single quotes
- Iterations: [ x / n ] prefix at line start
- Retries: ( x / n ) inline

Examples:

- [ 1 / 4 ] Parsing devlog index...
- OK.
- [ 2 / 4 ] Validating workflow field...
- WARNING: Missing workflow field, defaulting to NONE
- [ 3 / 4 ] Running npm verify...
- ERROR: TypeScript check failed
- [ 4 / 4 ] Retrying ( 1 / 3 )...
- OK.

## Function Style (required)

- Small functions, early returns, explicit names, minimal abstraction
- If a statement is short and single-intention, keep it on one line (including simple conditionals)
- One empty line between functions
- Full function signature on one line; body starts on next line

## Function Grouping Markers (optional)

Use markers to group related functions:

- // --------- START: Topic ---------
- // --------- END: Topic ---------

## Singular/Plural Rule (required)

Always use correct grammar:

- 0 items, 1 item, 2 items

Avoid: "1 item(s)"

## No Hardcoded Values (required)

LLMs often generate hardcoded values that should be configurable. Enforce these rules:

### URLs

- **No hardcoded service URLs** — use environment variables (`PUBLIC_API_URL`, `VITE_API_URL`, etc.)
- **Exception:** Standard API endpoints that never change (e.g., `https://api.openai.com/v1/`) are acceptable
- **Exception:** Protocol-relative paths within the app (e.g., `/api/import`) are acceptable

### File System Paths

- **No absolute paths** — never hardcode `/Users/...`, `C:\...`, `/home/...`
- **Use relative paths** or path utilities (`path.join`, `import.meta.url`)
- **Exception:** Well-known system paths in comments/docs are acceptable

### Configuration Values

- **No hardcoded secrets** — API keys, tokens, passwords must come from env vars
- **No hardcoded ports** — use env vars or config files
- **Magic numbers** — extract to named constants with clear meaning

### Examples

| ❌ Hardcoded                                 | ✓ Configurable                                                |
| -------------------------------------------- | ------------------------------------------------------------- |
| `fetch('https://api.myservice.com/v1/data')` | `fetch(\`${PUBLIC_API_URL}/data\`)`                           |
| `const DB_PATH = '/home/user/data.db'`       | `const DB_PATH = env.DATABASE_PATH`                           |
| `if (port === 3000)`                         | `if (port === config.defaultPort)`                            |
| `const API_KEY = 'sk-abc123'`                | `const API_KEY = import.meta.env.VITE_API_KEY`                |
| `setTimeout(fn, 5000)`                       | `setTimeout(fn, DEBOUNCE_MS)` with `const DEBOUNCE_MS = 5000` |

---

## BAD/GOOD Pattern

BAD:

- Huge functions, nested conditionals, unclear names, suppressed warnings, hardcoded URLs/paths

GOOD:

- Small functions, early returns, explicit names, minimal abstraction, fixed warnings, externalized config

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** Warnings Policy, Lint Error Resolution, No Hardcoded Values
- **Important:** Code Naming, Code Generation Principles, Imports
- **Standard:** Documentation Principles, Structured Logging, Function Style, Singular/Plural
