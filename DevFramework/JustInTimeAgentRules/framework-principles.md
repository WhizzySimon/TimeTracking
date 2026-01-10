# Framework Principles

**Trigger:** Read when making decisions about framework structure, automation, or AI behavior

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] framework-principles loaded

---

# Critical (Always Apply)

## The Ultimate Goal

**See `mindset.md` → "The Ultimate Goal"** (single source of truth)

Summary: Improve quality AND save human time. Everything derives from this.

---

## AI Strengths vs Human Strengths

### AI Strengths (leverage these)

- **Speed** — Can analyze code, search, and implement quickly
- **Logic** — Can follow complex rule chains without forgetting
- **Consistency** — Same input → same output (when well-instructed)
- **Persistence** — Doesn't get tired or frustrated

### Human Strengths (teach these to AI)

- **Self-learning** — Notice patterns, generalize, improve
- **Zoom-out** — See beyond the immediate task to systemic issues
- **Quality judgment** — Know when something "feels off"
- **Meta-observation** — Observe your own behavior and improve it

### The Framework's Purpose

**Give AI the human strengths it lacks naturally.**

- Self-learning system → Captures and promotes learnings
- Zoom-out pattern → Instructs AI to think at multiple levels
- Irritation as signal → Teaches AI to recognize "something's off"
- JIT rules → Provides context-appropriate guidance

---

## Translating Human Intelligence to AI

**The framework's core challenge: Give AI capabilities that humans have naturally.**

### Human → AI Translation Table

| Human capability            | How humans do it              | AI-applicable equivalent         |
| --------------------------- | ----------------------------- | -------------------------------- |
| Intuition / "gut feel"      | Subconscious pattern matching | Explicit detection checklists    |
| Irritation at inconsistency | Emotional signal              | Logical inconsistency detection  |
| "Zoom out" to see patterns  | Mental abstraction            | Structured multi-level analysis  |
| Learning from mistakes      | Memory + reflection           | LEARNINGS system + documentation |
| Quality judgment            | Experience + taste            | Rules + verification checklists  |

### The Translation Process

When developing framework rules from human behavior:

1. **Observe** what the human does naturally
2. **Identify** the underlying function (not the feeling)
3. **Design** a concrete, executable equivalent for AI
4. **Test** if AI can actually perform it
5. **Iterate** based on results

### Why This Matters for Framework Development

Every time user describes how THEY think/work, the question is:

- "What function does this serve?"
- "How can AI achieve the same outcome?"

Don't copy human concepts — translate them to AI-executable form.

---

## Recursive Self-Improvement

### The Pattern

1. **Observe** — Notice something during work
2. **Document** — Capture the learning
3. **Generalize** — Find the principle behind it
4. **Integrate** — Add to rules/framework
5. **Trigger** — Ensure it fires at the right time
6. **Observe again** — Watch for the pattern recurring

### The Meta-Level

Not just "zoom out" but **observe that you're zooming out**.

When you notice yourself improving the system:

- Document THAT observation too
- Ask: "What triggered this improvement? Can we automate the trigger?"
- The goal: Each improvement happens automatically next time

---

## Single Source of Truth

**The system IS the documentation. Never maintain docs ABOUT the system.**

### Why

- Documentation about systems goes stale
- AI can analyze the system directly
- Maintaining docs is overhead with no benefit
- If the system isn't self-explanatory, fix the system

### Application

| Instead of...                   | Do this...                      |
| ------------------------------- | ------------------------------- |
| Doc explaining folder structure | Name folders self-explanatorily |
| User manual for UI              | Make UI self-documenting        |
| Guide for how rules work        | Rules explain themselves        |
| Separate API docs               | Code + types are the docs       |

---

## Framework Evolution

This framework should evolve through use:

1. **Learnings** captured via `/capture-learnings` workflow at chat-close
2. **Analysis** with goal-tracing (trace to quality + speed + human time)
3. **Approval** by user before adding to JIT rules
4. **Integration** directly into JIT rule files as examples

The framework teaches itself — which is the ultimate form of self-documentation.

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** The Ultimate Goal (see mindset.md), Single Source of Truth
- **Important:** AI Strengths vs Human Strengths, Translating Human Intelligence to AI, Recursive Self-Improvement
- **Standard:** Framework Evolution
