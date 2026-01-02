# Fix: /fixOrChange workflow doesn't wait for model selection

**Date:** 2025-12-31
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior

The /fixOrChange workflow analyzes the task and recommends a model, but continues immediately without giving the user a chance to confirm or change the model selection.

## Desired Behavior

After outputting the model recommendation, the workflow should stop and wait for user confirmation before proceeding to create the ticket and start work.

## Analysis

The workflow file `.windsurf/workflows/fixOrChange.md` has the instruction to wait, but the agent is not following it properly. Need to make the wait instruction more explicit.

## Changes Made

- File(s): `.windsurf/workflows/fixOrChange.md`
- Change: Removed `// turbo` annotation and made wait instruction more explicit ("STOP HERE")

## QA Checklist

- [x] Workflow file updated
- [x] Tested that workflow now waits for confirmation

## Status: VERIFIED
