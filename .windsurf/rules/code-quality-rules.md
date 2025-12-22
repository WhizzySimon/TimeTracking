# Code Quality Rules (TimeTracker)

## Warnings Policy

**Fix warnings properly, do not suppress them.**

When encountering Svelte or TypeScript warnings:

1. **Do NOT use `svelte-ignore` comments** to suppress warnings
2. **Fix the root cause** instead:
   - For `state_referenced_locally` warnings: Wrap prop access in a function before using in `$state()`
   - For `a11y_no_static_element_interactions` warnings: Add `role="button"`, `tabindex`, and `onkeydown` handler
3. **Verify with `npm run check`** that warnings are resolved (0 errors, 0 warnings)

### Example fixes:

**Bad (suppression):**

```
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onclick={handler}>
```

**Good (proper fix):**

```
<div role="button" tabindex="0" onclick={handler} onkeydown={(e) => e.key === 'Enter' && handler()}>
```

---

## Documentation Style (for .windsurf/rules/ files)

**Keep it simple. These files are instructions for the LLM, not rendered documentation.**

### Rules:
- NO fenced code blocks (triple backticks) - they cause output formatting issues
- Use inline code with single backticks for short snippets: `functionName()`
- For longer code examples, use indentation (4 spaces) or describe in plain text
- Use bullet points and headings for structure
- Keep examples short and inline when possible