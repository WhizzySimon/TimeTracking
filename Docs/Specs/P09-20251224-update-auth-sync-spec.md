IMPLEMENTATION SPEC

App Update Handling, Session Persistence, and Sync Conflict Resolution

Scope

This specification defines mandatory behavior for:

Update handling in browser vs installed PWA

Authentication persistence across updates

Automatic sync conflict detection, resolution, and user communication

No functionality outside this scope shall be modified.

1. Update Handling (Browser vs PWA)
   1.1 Detection Rules

The app MUST distinguish between:

Browser tab usage

Installed PWA usage

Update notifications MUST NOT be shown in browser mode unless technically unavoidable due to Service Worker lifecycle.

1.2 Service Worker Behavior

Service Worker updates MUST NOT trigger a user-facing “Update available” UI in browser mode.

In installed PWA mode:

Update notifications ARE allowed

Restart behavior is acceptable

1.3 Reload Behavior

Applying an update MAY reload the app

Reload MUST NOT invalidate authentication state

2. Authentication Persistence Across Updates
   2.1 Session Requirements

If a valid authentication session exists prior to update:

User MUST remain logged in after update

Forced logout after update is NOT permitted unless:

Auth token is expired

Backend explicitly rejects the session

2.2 Storage Constraints

Auth tokens MUST survive:

Page reload

Service Worker update

Clearing caches MUST NOT clear authentication storage

2.3 Fallback

If auto-login is technically impossible:

Code MUST document the exact technical reason

Silent failure is not allowed

3. Sync Conflict Detection
   3.1 Definition of Conflict

A sync conflict MUST be explicitly defined in code

Conflicts MUST NOT be triggered by:

Timestamp-only differences

Reordered but semantically identical data

Locally cached values identical to cloud state

3.2 Conflict Detection Timing

Conflicts MUST be detected during automatic sync

Manual sync interaction MUST NOT be required to detect conflicts

4. Automatic Conflict Resolution
   4.1 Priority Rule

Automatic resolution MUST be attempted first

User interaction MUST be the last resort

4.2 Resolution Strategy

The sync logic MUST:

Merge data if no information is lost

Prefer union/merge over replacement

Preserve all user data, even if duplication is required

4.3 Safe Ignoring

Differences that do not affect semantic correctness MUST be ignored

Timestamp discrepancies MUST NOT trigger user-facing conflicts

5. User Interaction (Only When Required)
   5.1 Trigger Condition

A user dialog MUST appear immediately when:

A conflict requires user intent

The dialog MUST NOT wait for the user to press the Sync button

5.2 Dialog Content Requirements

The conflict dialog MUST:

Explain what happened

Explain why automatic resolution failed

Describe each option and its consequences

Avoid technical language

5.3 Choice Limitation

“Local vs Cloud” raw choices MUST NOT be shown without explanation

The user MUST understand what data will be kept or discarded

6. UX Rules
   6.1 Sync Button State

Sync button MUST NOT silently wait during unresolved conflicts

If a conflict exists:

The app MUST actively inform the user

6.2 Feedback Consistency

No hidden states

No ambiguous waiting indicators

All blocking sync states MUST be visible and explained

7. Code Documentation Requirements

Code MUST include inline comments explaining:

What constitutes a conflict

Why conflicts can occur

When user interaction is unavoidable

All non-obvious decisions MUST be documented

Acceptance Criteria

Browser users never see meaningless update prompts

Updates do not log users out

Sync conflicts are rare, explainable, and mostly auto-resolved

Users are only asked to decide when absolutely necessary

No user data is lost under any circumstance
