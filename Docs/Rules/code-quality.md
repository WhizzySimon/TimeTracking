# Code Quality Rules

**Trigger:** Always (referenced by `.windsurf/rules/code-quality-rules.md`)

---

## Warnings Policy

**Fix warnings properly, do not suppress them.**

When encountering framework or language warnings:

1. **Do NOT use ignore comments** to suppress warnings (e.g., `svelte-ignore`, `@ts-ignore`, `eslint-disable`)
2. **Fix the root cause** instead
3. **Verify with linter/checker** that warnings are resolved (0 errors, 0 warnings)

## Code Generation Principles (required)

- **Do not rename existing symbols** unless explicitly asked
- **Analyze existing codebase first** — re-use existing patterns, naming conventions, formatting, design philosophy, logging style
- **Check for existing helpers** before implementing new ones
- **Principle of Least Surprise** — prefer simple, idiomatic code over clever or magical solutions
- **Clear, fully written names** — avoid ambiguous abbreviations; follow existing naming patterns
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

## BAD/GOOD Pattern

BAD:

- Huge functions, nested conditionals, unclear names, suppressed warnings

GOOD:

- Small functions, early returns, explicit names, minimal abstraction, fixed warnings
