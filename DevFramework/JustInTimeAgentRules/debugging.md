# Debugging Rules

**Trigger:** When debugging a bug, investigating unexpected behavior, or troubleshooting failures

---

## Canary

**When you read this file, output exactly:**

> [CANARY] debugging rules loaded

---

## Core Principle: Map Before You Act

**Don't stop at the first plausible cause.**

When you find an explanation that seems logical, resist the urge to immediately implement a fix. The real system may have:
- More parameters than you've considered
- Multiple contributing causes
- A different root cause than the first plausible one

See also: `mindset.md` → "Don't Stop at First Plausible Cause"

---

## Investigation Checklist

Before implementing any fix:

- [ ] **List all parameters** — What variables, settings, configurations could influence this behavior?
- [ ] **Map the data flow** — What's the full path from input to output? (e.g., request → service → redirect → app)
- [ ] **Check external dependencies** — Are there service settings, API configurations, or third-party behaviors involved?
- [ ] **Identify unknowns** — What don't you know yet? What assumptions are you making?
- [ ] **Gather evidence** — Use logs, Playwright, network inspection to observe actual behavior (don't assume)

---

## When to Stop Investigating

You've investigated enough when:

1. You can explain the full chain of cause and effect
2. You've identified all relevant parameters
3. You understand WHY the current behavior occurs (not just WHAT)
4. Your proposed fix addresses the root cause, not a symptom

---

## Anti-Pattern: Trial-and-Error Loops

**Symptoms:**
- Multiple "fix" attempts that don't work
- Each attempt requires user action (clicking links, checking emails, etc.)
- Hypothesis changes after each failed attempt

**Cost:**
- Each cycle: implementation → testing → verification → user action
- User frustration when their time is wasted
- Token waste on repeated attempts

**Solution:** Invest more time upfront in investigation. 30 minutes of research beats 5 rounds of trial-and-error.

---

## Debugging External Services

When the bug involves external services (Supabase, Stripe, APIs):

1. **Read the documentation** — Don't assume you know how it works
2. **Check service settings** — Dashboard configurations often affect behavior
3. **Understand the full flow** — Request → Service processing → Redirect → App handling
4. **Test with real observation** — Use Playwright/browser to see actual URLs, tokens, redirects
5. **Consider multi-step processes** — Some flows require multiple confirmations or steps

---

## Example: Email Change Bug

**Bad approach (5 cycles):**
1. Assume `detectSessionInUrl` handles it → doesn't work
2. Assume token is in query params → it's in hash fragment
3. Add `verifyOtp` with `token_hash` → wrong token format after redirect
4. Assume redirect URL not in allowlist → it was there
5. Finally discover: Supabase requires confirmation from BOTH emails

**Good approach (1 cycle):**
1. Read Supabase email change documentation
2. Check Supabase Auth settings (Secure Email Change on/off)
3. Map the full flow: request → email → click → Supabase → redirect → app
4. Identify all URL formats at each stage
5. Understand two-email confirmation requirement
6. Implement correct solution

---

## Tools for Investigation

- **Playwright** — Observe actual browser behavior, URLs, redirects
- **Console logs** — Add strategic logging to trace data flow
- **Network tab** — See actual requests and responses
- **Documentation** — Read official docs for external services
- **Dashboard/Settings** — Check service configurations

---
