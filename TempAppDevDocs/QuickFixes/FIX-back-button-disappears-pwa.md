# Fix: Back Button Disappears in PWA

**Date:** 2026-01-08
**Type:** [x] Bug Fix

## Bug Description

In PWA on phones, the back button sometimes disappears from the title bar. The forward button appears in its place (shifts left). Requires app reinstall to fix.

## Root Cause

`BackButton.svelte` line 38: `{#if canGoBack}`

The component **conditionally renders** based on `canGoBack` state. When this state becomes false (incorrectly), the button **disappears from DOM** entirely.

**Why the state becomes incorrect:**

- `window.history.length > 1` is unreliable in PWAs
- PWAs maintain history across sessions
- State can become stale after refresh/reinstall
- No reliable way to detect back history in browsers

## Why This is Wrong

**Inconsistency:**

- BackButton: Conditionally renders (`{#if canGoBack}`)
- ForwardButton: Always renders, just disabled

**Layout shift:**

- When BackButton disappears, ForwardButton shifts left
- User sees `[Forward] [Employer]` instead of `[Back] [Forward]`

## Solution

**Always render BackButton**, just disable it when can't go back (same pattern as ForwardButton).

Remove the `{#if canGoBack}` wrapper, keep the `disabled={!canGoBack}` attribute.

## Changes Made

- File: `src/lib/components/BackButton.svelte`
- Remove: `{#if canGoBack}` wrapper (line 38)
- Remove: `{/if}` closing tag (line 57)
- Keep: `disabled={!canGoBack}` attribute (already present on line 42)

## QA Checklist

- [x] `npm run check` passes (0 errors, 13 warnings in styleguide only)
- [ ] Back button always visible in header (even when disabled)
- [ ] Back button disabled when no history
- [ ] Back button enabled when history available
- [ ] No layout shift when button state changes

## Status: DONE
