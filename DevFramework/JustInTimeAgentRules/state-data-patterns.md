# State & Data Patterns

**Trigger:** Working on state management, caching, persistence, or offline-first features

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] state-data-patterns loaded

---

# Critical (Always Apply)

## Purpose

This file contains patterns for state management and data persistence. Rules are **app-independent** with **app-specific examples**.

---

## State Management Patterns

### Pattern: Derived Stores for Filtered Data

**Principle:** Use derived stores for filtered/computed views. Never duplicate state.

**Example (TimeTracker):** `filteredEntries` derived from `entries` + `selectedEmployerId`, not stored separately.

---

### Pattern: Single Source of Truth

**Principle:** Each piece of data has exactly one authoritative source. Other views derive from it.

**Example (TimeTracker):** `entries` store is the source, `filteredEntries`, `entriesByDay`, etc. derive from it.

---

### Pattern: Store Initialization Order

**Principle:** Initialize stores in dependency order. Dependent stores must wait for their sources.

**Example (TimeTracker):** `employers` loads before `categories` (which reference `employerId`).

---

## Caching Patterns

### Pattern: Cache with Invalidation Strategy

**Principle:** Every cache must have a clear invalidation strategy. Stale data is worse than no cache.

**Example (TimeTracker):** Version check on app focus invalidates cached version.json.

---

### Pattern: Session vs Persistent Cache

**Principle:** Use sessionStorage for session-scoped data, localStorage for persistent preferences.

**Example (TimeTracker):** Update banner dismissal uses sessionStorage (reset on new session), theme preference uses localStorage.

---

## Persistence Patterns

### Pattern: IndexedDB for Structured Data

**Principle:** Use IndexedDB for structured data that needs querying. localStorage for simple key-value.

**Example (TimeTracker):** Time entries, categories, employers in IndexedDB. UI preferences in localStorage.

---

### Pattern: Critical State Server-Side

**Principle:** Critical user state (subscription, plan tier) must be stored server-side. Client storage is for caching only.

**Example (TimeTracker):** User plan stored in Supabase `profiles` table, localStorage caches for offline access.

---

### Pattern: Migration Strategy

**Principle:** Data schema changes require migration functions. Never assume old data format.

**Example (TimeTracker):** `migrateStrictEmployerModel()` adds `employerId` to existing entries.

---

## Offline-First Patterns

### Pattern: Offline Detection

**Principle:** Detect offline state and adjust UI/behavior accordingly. Don't let operations fail silently.

**Example (TimeTracker):** `navigator.onLine` check before sync, offline modal when cloud save attempted.

---

### Pattern: Queue for Offline Operations

**Principle:** Queue operations that require network. Process queue when connection restored.

**Example (TimeTracker):** Changes saved to IndexedDB immediately, synced to Supabase when online.

---

### Pattern: Conflict Resolution Strategy

**Principle:** Define how conflicts are resolved before they occur. Document the strategy.

**Example (TimeTracker):** LWW (Last-Write-Wins) at entry level using `updatedAt` timestamp.

---

## Common Failure Patterns

| Pattern                            | Prevention                                          |
| ---------------------------------- | --------------------------------------------------- |
| Storing critical state client-only | Always persist to server for critical data          |
| No migration for schema changes    | Write migration function for every schema change    |
| Stale cache without invalidation   | Define invalidation trigger for every cache         |
| Race conditions in store updates   | Use proper async patterns, avoid parallel mutations |
| Assuming localStorage availability | Handle quota exceeded and private browsing          |

---

## Add New Patterns Here

When a state/data pattern is learned and approved, add it following the format:

```markdown
### Pattern: [Name]

**Principle:** [App-independent rule]

**Example (TimeTracker):** [Specific implementation]
```

---

## Priority Guide

- **Critical:** Check at EVERY decision point. Never skip.
- **Important:** Check when context matches.
- **Standard:** Good practices. Can be deprioritized under time pressure.

**This file's priority breakdown:**
- **Critical:** State Architecture, Persistence Pattern
- **Important:** Caching Pattern, Migration Pattern
- **Standard:** Common Anti-Patterns, Add New Patterns template
