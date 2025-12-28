# Cascade Tooling Bootstrap

**Single entry point for all Cascade tooling documentation.**

This file provides quick reference and links to detailed docs. Read this file to understand the tooling setup.

---

## Quick Start

### 1. Start Dev Server

```powershell
npm run dev
```

### 2. Start Cascade Watcher

**For Chat A:**

```powershell
powershell -File scripts/watcher.ps1 -Instance A
```

**For Chat B (parallel session):**

```powershell
powershell -File scripts/watcher.ps1 -Instance B
```

---

## Command Execution

**Primary method:** Use `run_command` tool (integrated PowerShell terminal).

**Fallback:** Cascade Watcher (file-based) - see [CASCADE_WATCHER.md](CASCADE_WATCHER.md)

### How Cascade Executes Commands

1. **Primary:** Use `run_command` tool with PowerShell syntax
2. **Fallback (if terminal fails):** Write to watcher files (see CASCADE_WATCHER.md)

### Status Values

| Status         | Meaning                                   |
| -------------- | ----------------------------------------- |
| `IDLE`         | Watcher is waiting for commands           |
| `RUNNING`      | Command is currently executing            |
| `DONE:SUCCESS` | Command completed with exit code 0        |
| `DONE:FAILED`  | Command completed with non-zero exit code |

---

## Git Workflow

**Full documentation:** [GIT_WORKFLOW.md](GIT_WORKFLOW.md)

### Simple dev/main Model

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

### Quick Reference

| Action | Command                                         |
| ------ | ----------------------------------------------- |
| Commit | `git add -A; git commit -m "feat: description"` |
| Push   | `git push`                                      |

---

## Verification Commands

| Command            | Purpose                                 |
| ------------------ | --------------------------------------- |
| `npm run verify`   | Format + TypeScript + Lint (all-in-one) |
| `npm run test:e2e` | Playwright E2E tests                    |
| `npm run build`    | Production build                        |

---

## Folder Structure

```
scripts/
├── watcher.ps1           # Main watcher script
├── watcher/
│   ├── A/                # Instance A files
│   │   ├── command.txt
│   │   ├── status.txt
│   │   └── output.txt
│   └── B/                # Instance B files
└── build/
    └── verify-code.ps1   # Code verification
```

---

## Troubleshooting

### Watcher not responding

- Check that the watcher terminal is running
- Verify you're writing to the correct instance folder (A or B)

### Edit tool fails on command.txt

The watcher may have already consumed the command. Wait a moment and try again.
