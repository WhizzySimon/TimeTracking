# Implementation Specification Rules (TimeTracker)

This document defines how we write specs so an AI can implement reliably and consistently.

## Why this exists
We separate requirements into:
- FR: user-facing behavior
- IG: non-negotiable outcomes/constraints
- DD: deliberate choices we want stable

This avoids "telling the model how" and instead forces "what must be true".

## FR — Functional Requirements
Write FR as observable behavior.

Format:
- **TT-FR-001**: <statement>
- **TT-FR-002**: ...

## IG — Implementation Guarantees
Write IG as constraints/outcomes that must hold even if the internal implementation changes.

Format:
- **TT-IG-001**: <statement>
- **TT-IG-002**: ...

Typical TimeTracker IG examples:
- offline-first behavior
- persistence guarantees
- "no data loss" constraints
- performance constraints (cold start, navigation)
- accessibility constraints

## DD — Design Decisions
Write DD only for choices you want to lock in.

Format:
- **TT-DD-001**: <statement>
- **TT-DD-002**: ...

Typical TimeTracker DD examples:
- terminology ("Tätigkeit", "Kategorie", etc.)
- UI conventions (primary action placement, labels)
- file naming conventions
- module boundaries

## Self-documenting rule (mandatory)
Every new module/component must contain enough local documentation that someone (and the AI) can understand it without opening a separate manual.

Minimum:
- A short module header comment: purpose + links to spec IDs (TT-FR/IG/DD)
- JSDoc for exported functions/types
- For Svelte components: top comment describing responsibility + props/events + relevant spec IDs

## Verification loop (mandatory)
Every implementation must end with:
- A checklist mapping each referenced TT-FR/IG/DD item → PASS/FAIL and where it is implemented.
- If anything is unclear or ambiguous, the spec must be tightened before changing code.

## Avoiding "spec drift"
If code behavior changes, but the spec didn't:
- Update the spec in the same change.
- Add a change log entry with date and summary.
