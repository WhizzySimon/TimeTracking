# Backend Patterns

**Trigger:** Working on API, auth, sync, or external service integration

---

## Rule-Loaded Marker

**When you read this file, output exactly:**

> [RULE-LOADED] backend-patterns loaded

---

## Purpose

This file contains patterns for backend/API work. Rules are **app-independent** with **app-specific examples**.

---

## API Design Patterns

### Pattern: Consistent Error Handling

**Principle:** All async operations must have try/catch with user-facing feedback. Never let errors fail silently.

**Example (TimeTracker):** Supabase calls wrapped in try/catch, errors shown via toast notifications.

---

### Pattern: Graceful Degradation

**Principle:** When external services fail, provide fallback behavior rather than blocking the user.

**Example (TimeTracker):** Offline mode continues with local IndexedDB when Supabase is unreachable.

---

## Auth Flow Patterns

### Pattern: Token Lifecycle Management

**Principle:** Handle all token states: valid, expired, refreshing, invalid. Never assume token validity.

**Example (TimeTracker):** Supabase session refresh on app focus, redirect to login on auth errors.

---

### Pattern: Secure Email Change Flow

**Principle:** Email change confirmation may require verification from BOTH old and new email addresses (depends on service configuration).

**Example (TimeTracker):** Supabase "Secure Email Change" requires confirmation from both emails before change takes effect.

---

## Data Sync Patterns

### Pattern: Last-Write-Wins (LWW) Merge

**Principle:** For conflict resolution, compare `updatedAt` timestamps at the entry level. Most recent write wins.

**Example (TimeTracker):** `mergeWithLWW()` compares local and cloud entries by `updatedAt`, keeps newer version.

---

### Pattern: Optimistic Updates with Rollback

**Principle:** Update UI immediately, sync in background, rollback on failure.

**Example (TimeTracker):** Time entries save to IndexedDB first, then sync to Supabase. Rollback if sync fails.

---

## External Service Integration

### Pattern: Service Abstraction Layer

**Principle:** Wrap external services in an abstraction layer. Never call external APIs directly from components.

**Example (TimeTracker):** `src/lib/supabase/` contains all Supabase interactions, components import from there.

---

### Pattern: Environment-Aware Configuration

**Principle:** Use environment variables for all service URLs, keys, and configuration. Never hardcode.

**Example (TimeTracker):** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` files.

---

## Common Failure Patterns

| Pattern                       | Prevention                                       |
| ----------------------------- | ------------------------------------------------ |
| Assuming network availability | Always handle offline case                       |
| Hardcoding service URLs       | Use environment variables                        |
| Silent auth failures          | Always redirect or notify user                   |
| Race conditions in sync       | Use proper async/await, avoid parallel mutations |
| Token expiry mid-operation    | Check token validity before critical operations  |

---

## Add New Patterns Here

When a backend pattern is learned and approved, add it following the format:

```markdown
### Pattern: [Name]

**Principle:** [App-independent rule]

**Example (TimeTracker):** [Specific implementation]
```
