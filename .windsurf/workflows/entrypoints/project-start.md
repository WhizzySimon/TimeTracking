---
description: Project entrypoint (run required workflows and paste outputs)
auto_execution_mode: 1
---

Run these workflows now, in order:

1. /rules-read-all
2. /read-governance
3. /read-core-docs-and-code
4. **Check for orphaned branches** - Use watcher to run `git branch --no-merged main`

If step 4 shows any branches, warn the user: "Found orphaned branches with unmerged work: [list]. Run `/continue-work` to handle them first."

Then paste the one-line output of each, in the same order, in your next message.

Return only a single line:
"Run: /rules-read-all → /read-governance → /read-core-docs-and-code. Paste their one-line outputs next."
