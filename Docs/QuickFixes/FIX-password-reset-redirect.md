# Fix: Password reset link redirect issue

**Date:** 2025-12-31
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior

Password reset link in email doesn't work consistently:

- First 2 attempts: landed on login page (possible fast redirect?)
- 3rd attempt: worked correctly and showed password reset page

## Desired Behavior

Password reset link should reliably navigate to the password reset page on first attempt.

## Analysis

Root cause: Supabase client has `detectSessionInUrl: true` which auto-processes the hash fragment. By the time onMount runs, Supabase may have already processed/removed the `access_token` from URL, causing the validation check to fail intermittently.

## Changes Made

- File(s): `src/routes/reset-password/+page.svelte`
- Change:
  - Instead of checking hash for access_token, now checks if Supabase has established a valid session
  - Added loading state ("Link wird überprüft...") while checking
  - Added small delay if hash is present to allow Supabase to process it

## QA Checklist

- [x] `npm run check` passes
- [x] Logic reviewed and fixed
- [x] Added loading state for better UX

## Status: VERIFIED
