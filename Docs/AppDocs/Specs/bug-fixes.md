# bug-fixes — Spec

**Phase:** A6  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Status:** Draft

**Depends on:**

- Phase 6: Cloud Auth & Backup (existing sync system)

**Does not depend on:**

- Other A-phase improvements

---

## 1) Goal / Problem

Fix two known bugs: (1) Auto-sync fails on fresh login to new device, showing conflict dialog instead of auto-pulling from cloud. (2) Resume (play) buttons on Day tab are not vertically aligned on small iPhone screens.

---

## 2) Scope

### In scope

- Auto-sync on fresh device login (cloud → local)
- Smart conflict resolution for multi-device scenarios
- Resume button vertical alignment fix

### Out of scope

- Real-time sync between devices
- Merge conflict UI redesign
- Offline-first architecture changes

### What we don't want

- User making decisions about sync conflicts without information
- Silent data loss from incorrect auto-resolution
- Complex merge UI — keep it simple or automatic

---

## 3) Functional Requirements (FR)

### Auto-Sync on Fresh Login

- **BF-FR-001**: Fresh login defined as: empty local IndexedDB + valid cloud session
- **BF-FR-002**: On fresh login, automatically pull all data from cloud
- **BF-FR-003**: No conflict dialog on fresh login — cloud is authoritative
- **BF-FR-004**: Show loading indicator during initial sync
- **BF-FR-005**: After sync, navigate to appropriate landing page

### Smart Conflict Resolution

- **BF-FR-010**: Single device scenario: newest timestamp wins (local or cloud)
- **BF-FR-011**: Multi-device scenario: per-entry merge based on timestamps
- **BF-FR-012**: Each entry has `updatedAt` timestamp for conflict detection
- **BF-FR-013**: Conflict = same entry modified on both sides since last sync
- **BF-FR-014**: Auto-resolve: keep entry with later `updatedAt`
- **BF-FR-015**: If truly simultaneous (same second): prefer cloud (stable source)
- **BF-FR-016**: Log resolved conflicts to console for debugging

### Resume Button Alignment

- **BF-FR-020**: Resume (play) buttons in Day tab task list are vertically aligned
- **BF-FR-021**: Task title truncates with ellipsis if too long
- **BF-FR-022**: Button column has fixed width, not pushed by content
- **BF-FR-023**: Layout works on iPhone SE (smallest supported device)

---

## 4) Implementation Guarantees (IG)

- **BF-IG-001**: Fresh login detection is reliable (check all relevant stores)
- **BF-IG-002**: Timestamp comparison uses UTC milliseconds
- **BF-IG-003**: Auto-resolution never deletes data — at worst, keeps newer version
- **BF-IG-004**: Button alignment uses CSS grid/flexbox, not absolute positioning
- **BF-IG-005**: Layout tested on 320px width (iPhone SE)

---

## 5) Design Decisions (DD)

- **BF-DD-001**: Fresh login = no entries in `timeEntries` store
- **BF-DD-002**: `updatedAt` added to all syncable entities if not present
- **BF-DD-003**: Migration adds `updatedAt = createdAt` for existing entries
- **BF-DD-004**: Task list uses CSS grid with fixed-width action column

---

## 6) Edge cases

- Fresh login with empty cloud: Nothing to sync, proceed to landing
- Stale cloud data: Still pull — user can fix locally
- Network failure during fresh sync: Show error, allow retry
- Entry deleted locally, modified on cloud: Deletion wins (intentional)
- Entry deleted on cloud, modified locally: Keep local (user has latest)

---

## 7) Data & privacy

- **Stored:** `updatedAt` timestamps on all syncable entities
- **Where:** IndexedDB + Supabase
- **Retention:** As long as entity exists
- **Export:** Timestamps included in JSON export

---

## 8) Acceptance checks (testable)

- [ ] AC-001: Fresh login on new device auto-syncs from cloud
- [ ] AC-002: No conflict dialog on fresh login
- [ ] AC-003: Single device: newest wins automatically
- [ ] AC-004: Multi-device: per-entry merge resolves correctly
- [ ] AC-005: Resume buttons are vertically aligned on Day tab
- [ ] AC-006: Long task titles truncate with ellipsis
- [ ] AC-007: Layout correct on iPhone SE width (320px)
- [ ] AC-008: Conflict resolution logged to console

---

## 9) Change log

**[2025-12-27 14:00]**

- Added: Initial spec created

---

## 10) Spec Completeness Checklist

- [x] Goal / Problem statement (1-3 sentences)
- [x] Scope: In scope + Out of scope defined
- [x] Functional Requirements (FR) — all numbered (BF-FR-xxx)
- [x] Implementation Guarantees (IG) — all numbered (BF-IG-xxx)
- [x] Edge cases documented
- [x] Data & privacy notes complete
- [x] Acceptance checks — all numbered (AC-xxx)
- [x] No ambiguous terms without measurable definitions
