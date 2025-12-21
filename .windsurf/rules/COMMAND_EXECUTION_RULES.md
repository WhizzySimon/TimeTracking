# Command Execution Limitations for Cascade

**Last Updated:** December 21, 2025

---

## ❌ What Cascade CANNOT Do

### **1. Execute Commands and See Output**
- `run_command` tool executes commands but **does not capture output**
- Exit code is returned (0 = success, non-zero = failure)
- Stdout/stderr are **not accessible**
- Commands appear to succeed but may not actually execute

**Examples that DON'T work:**
```bash
npm install          # Executes but no output visible
node --version       # Executes but version not shown
npm run build        # Executes but build logs not visible
dir                  # Executes but directory listing not shown
echo "test"          # Executes but "test" not visible
```

### **2. Delete or Remove Files**
- Cannot delete files
- Cannot remove directories
- Can only create and modify files

### **3. Capture Command Output to Files**
- File redirection doesn't work: `node --version > output.txt`
- PowerShell redirection doesn't work: `powershell -Command "... | Out-File"`
- Files created by redirected commands are not accessible

---

## ✅ What Cascade CAN Do

### **1. Create Node.js Scripts That Write Output**
**Pattern:** Create a script → User runs it → Script writes to file → Cascade reads file

**Example:**
```javascript
// test-script.mjs
import { writeFileSync } from 'fs';

const result = {
  nodeVersion: process.version,
  timestamp: new Date().toISOString()
};

writeFileSync('script-output.json', JSON.stringify(result, null, 2));
console.log('Results written to script-output.json');
```

**Workflow:**
1. Cascade creates `test-script.mjs`
2. User runs: `node test-script.mjs`
3. Script writes `script-output.json`
4. Cascade reads `script-output.json`

### **2. Use MCP Browser Tools (After Windsurf Restart)**
**Available tools:**
- `mcp0_browser_navigate()` - Navigate to URL
- `mcp0_browser_snapshot()` - Get page structure and console
- `mcp0_browser_click()` - Click elements
- `mcp0_browser_type()` - Type text
- `mcp0_browser_wait_for()` - Wait for conditions
- `mcp0_browser_console_messages()` - Read console
- `mcp0_browser_take_screenshot()` - Capture screenshot

**Requirements:**
- Windsurf must be restarted to load MCP Playwright server
- Dev server must be running (`npm run dev`)
- Dependencies installed (`npm install`, `npx playwright install`)

### **3. File Operations**
**Can do:**
- ✅ Create new files (`write_to_file`)
- ✅ Read files (`read_file`)
- ✅ Edit existing files (`edit`, `multi_edit`)
- ✅ List directories (`list_dir`)
- ✅ Search files (`grep_search`, `find_by_name`)

**Cannot do:**
- ❌ Delete files
- ❌ Remove directories
- ❌ Rename files directly (workaround: create new, user deletes old)

### **4. Trigger Commands for User Execution**
- Cascade can propose commands via `run_command`
- User sees the command and can approve/run it
- Useful for: `npm install`, `npm run dev`, `git commit`, etc.
- User must manually check if command succeeded

---

## 🎯 Best Practices

### **When You Need Command Output:**
1. **Create a Node.js script** that writes results to a file
2. **Ask user to run** the script
3. **Read the output file** to see results

### **When You Need to Test/Verify:**
1. **Use MCP browser tools** for UI testing (after Windsurf restart)
2. **Create test scripts** that write results to files
3. **Use E2E tests** (Playwright) that can be run by user

### **When You Need to Install Dependencies:**
1. **Propose the command** via `run_command`
2. **User approves and runs** it
3. **Verify by reading** `package.json` or checking for files

### **When You Need to Delete Files:**
1. **Tell the user** which files to delete
2. **User deletes manually**
3. **Verify by checking** if file exists

---

## 📋 Quick Reference

| Task | Can Cascade Do It? | How? |
|------|-------------------|------|
| Run `npm install` | ❌ No output | Propose command, user runs |
| See command output | ❌ Never | Create script → write file → read file |
| Test UI | ✅ Yes | MCP browser tools (after restart) |
| Create file | ✅ Yes | `write_to_file` |
| Edit file | ✅ Yes | `edit`, `multi_edit` |
| Delete file | ❌ No | Ask user to delete |
| Read file | ✅ Yes | `read_file` |
| Check if command worked | ❌ No output | Exit code only (unreliable) |

---

## 🚨 Critical Reminders

1. **Never assume commands executed successfully** - exit code 0 doesn't mean it worked
2. **Always use script + file pattern** when you need command output
3. **MCP browser tools require Windsurf restart** - document this in testing guides
4. **Cannot delete files** - always ask user to delete manually
5. **File operations work reliably** - use them instead of commands when possible

---

## 📝 Integration with Workflows

This file should be read at the start of every session via the `/rules-read-all` workflow to ensure Cascade remembers these limitations.
