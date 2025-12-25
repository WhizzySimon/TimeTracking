# P14: Cloud Sync Improvements

**Created:** 2025-12-25
**Status:** Draft
**Priority:** High (user-reported bug)

## Problem Statement

When a user logs in on a new device, the cloud sync does not work automatically. Instead:

1. Sync button shows as active (pending)
2. Clicking sync triggers conflict detection
3. Conflict dialog asks "Cloud or Local?" without context
4. No indication of what data differs or recommended action

This creates confusion and risk of data loss.

## Scenario

**What happened:**

1. User made changes on Device A -> synced to cloud (worked correctly)
2. User logged in on new Device B
3. Expected: Cloud data auto-downloads to Device B
4. Actual: Conflict dialog appeared, user had to guess which to keep

**What we don't want:**

- User confusion about which data is "correct"
- Risk of losing data by picking wrong option
- Manual intervention required for normal new-device setup

## Scope

### In Scope

1. Auto-download cloud data on fresh login (no local data)
2. Better conflict detection (compare timestamps, not just "different")
3. Improved conflict dialog with context (last modified dates, entry counts)
4. Recommended action in conflict dialog

### Out of Scope

- Full merge/diff of individual entries (complex, future feature)
- Offline conflict resolution queue
- Real-time sync (WebSocket)

## Functional Requirements

**P14-FR-01: Auto-Download on Fresh Login**
If user logs in and local storage is empty (or only has defaults), automatically download and apply cloud backup without showing conflict dialog.

**P14-FR-02: Conflict Detection with Context**
When conflict is detected, gather: cloud last modified, local last modified, cloud entry count, local entry count.

**P14-FR-03: Improved Conflict Dialog**
Conflict dialog shows:

- "Cloud backup from [date], [N] entries"
- "Local data from [date], [N] entries"
- Recommended action based on recency
- Clear labels: "Use Cloud Data" / "Keep Local Data"

**P14-FR-04: Recommended Action**
Dialog highlights the recommended option (most recent data) with visual emphasis.

**P14-FR-05: Sync Status Indicator Update**
After successful cloud restore, sync indicator shows "Synced" (not "Pending").

## Implementation Guarantees

**P14-IG-01:** Existing cloud backups remain compatible.
**P14-IG-02:** No data is deleted without explicit user confirmation.
**P14-IG-03:** Fresh device login with cloud data is seamless (no dialogs).

## Design Decisions

**P14-DD-01:** "Fresh install" = no timeEntries in IndexedDB (ignore default categories).
**P14-DD-02:** Conflict dialog uses ConfirmDialog component with custom content.
**P14-DD-03:** Recommendation logic: prefer data with more entries if timestamps are close; prefer newer if counts are similar.

## Acceptance Checks

- [ ] AC-01: Fresh login on new device auto-downloads cloud data
- [ ] AC-02: No conflict dialog on fresh device with cloud backup
- [ ] AC-03: Conflict dialog shows cloud/local timestamps
- [ ] AC-04: Conflict dialog shows entry counts
- [ ] AC-05: Recommended option is visually highlighted
- [ ] AC-06: Sync indicator shows "Synced" after restore

## Change Log

**[2025-12-25 13:58]**

- Added: Initial spec from user bug report
