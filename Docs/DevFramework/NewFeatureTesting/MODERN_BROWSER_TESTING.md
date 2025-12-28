# Modern Browser Testing with Cascade

**Approach:** Direct browser control via Playwright MCP Server  
**No Files Needed:** Everything happens in real-time through MCP tools

---

## ⚠️ Prerequisites

### **Step 1: Install Dependencies**

**Required npm packages (already in package.json):**

- `playwright` (^1.57.0) - Core Playwright library
- `@playwright/test` (^1.57.0) - Playwright test runner
- `tsx` (^4.20.6) - TypeScript execution for scripts/dev/devBrowser.ts

**Install command:**

```bash
npm install
```

**Install Playwright browsers:**

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers needed for testing.

---

### **Step 2: Windsurf Must Be Restarted**

**If MCP browser tools are not working, restart Windsurf to load the MCP Playwright server.**

**Symptoms that Windsurf needs restart:**

- `mcp0_browser_snapshot()` and other `mcp0_browser_*` tools are not available
- Error: "tool not found" or similar
- Cascade cannot interact with the browser

**Solution:**

1. Close Windsurf completely
2. Reopen Windsurf
3. MCP Playwright server will load automatically
4. MCP browser tools will now be available

**This is required because:**

- MCP servers are loaded when Windsurf starts
- Adding new projects or changing workspaces may require a restart
- The MCP Playwright server configuration is global to Windsurf, not project-specific

---

### **Step 3: Dev Server Must Be Running**

Before using any Playwright browser tools, ensure the dev server is started:

```bash
npm run dev
```

**Why this matters:**

- Browser navigation will fail with `ERR_CONNECTION_RESET` if server isn't running
- The app needs `http://localhost:5173` to be accessible
- Wait 2 seconds after navigation for the app to initialize IndexedDB and load categories

**Complete Workflow:**

1. **Install dependencies:** `npm install` (one-time setup)
2. **Install Playwright browsers:** `npx playwright install` (one-time setup)
3. **Restart Windsurf** (if MCP tools not available)
4. User starts `npm run dev` manually
5. Cascade navigates to `http://localhost:5173` using `mcp0_browser_navigate()`
6. Cascade waits 2 seconds for app initialization
7. Cascade can now interact with the TimeTracker app using MCP browser tools

---

## 📝 How to Interact with TimeTracker

After opening the app at `http://localhost:5173`, you can manage categories:

### **View Categories**

```javascript
// 1. Take snapshot to see the category list
mcp0_browser_snapshot();

// 2. Categories are displayed in a list with data-testid="category-list"
```

### **Add a New Category**

```javascript
// 1. Type category name in the input field
mcp0_browser_type({
	element: 'Category name input',
	ref: '[data-testid="new-category-name"]',
	text: 'My New Category'
});

// 2. Click the add button
mcp0_browser_click({
	element: 'Add category button',
	ref: '[data-testid="add-category-btn"]'
});

// 3. Wait for category to appear
mcp0_browser_wait_for({ time: 1 });
```

### **Delete a User Category**

```javascript
// 1. Find the delete button for a specific category
mcp0_browser_click({
	element: 'Delete button',
	ref: '[data-testid="delete-category-btn"]'
});
```

**Note:** System categories (Pause, Urlaub, Krank, Feiertag) cannot be deleted.

---

## 🎯 What Cascade Can Do

### **1. 👀 See the UI**

**Take Screenshot:**

```
"Take a screenshot of the current page"
```

I'll use: `mcp0_browser_take_screenshot({ filename: 'page.png' })`

**Get Page Snapshot (Better):**

```
"Show me the page structure"
```

I'll use: `mcp0_browser_snapshot()`

Returns text-based representation of the page - perfect for understanding UI without images.

---

### **2. 🖱️ Click Buttons**

**Click Any Element:**

```
"Click the 'Hinzufügen' button"
```

I'll use: `mcp0_browser_click({ element: "Add category button", ref: "[data-testid='add-category-btn']" })`

**What I can click:**

- Buttons
- Links
- Form fields
- Any interactive element

---

### **3. 📝 Fill Forms**

**Fill Category Form:**

```
"Add a new category called 'Meeting' that counts as work time"
```

I'll use:

```typescript
// Type the category name
mcp0_browser_type({
	element: 'Category name input',
	ref: '[data-testid="new-category-name"]',
	text: 'Meeting'
});

// Click add button
mcp0_browser_click({
	element: 'Add button',
	ref: '[data-testid="add-category-btn"]'
});
```

---

### **4. 📋 Read Console**

**Get All Messages:**

```
"What's in the browser console?"
```

I'll use: `mcp0_browser_console_messages()`

**Get Only Errors:**

```
"Show me console errors"
```

I'll use: `mcp0_browser_console_messages({ onlyErrors: true })`

---

### **5. 🌐 Check Network**

**See API Calls:**

```
"What network requests were made?"
```

I'll use: `mcp0_browser_network_requests()`

Shows:

- All HTTP requests
- Status codes
- Request/response data

---

### **6. ⌨️ Type Text**

**Type in Fields:**

```
"Type 'Projektarbeit' in the category name field"
```

I'll use:

```typescript
mcp0_browser_type({
	element: 'Category name input',
	ref: '[data-testid="new-category-name"]',
	text: 'Projektarbeit',
	submit: false
});
```

---

### **7. ⏳ Wait for Changes**

**Wait for Content:**

```
"Wait for the categories to load"
```

I'll use:

```typescript
mcp0_browser_wait_for({
	text: 'Kategorien'
});
```

---

## 🧪 Complete Testing Workflow

### **Example: Test Adding a Category**

**You say:**

```
"Test adding a new category called 'Test Category'"
```

**I do:**

```typescript
// 1. See what's on the page
const snapshot = await mcp0_browser_snapshot();

// 2. Type the category name
await mcp0_browser_type({
	element: 'Category name input',
	ref: '[data-testid="new-category-name"]',
	text: 'Test Category'
});

// 3. Click add button
await mcp0_browser_click({
	element: 'Add button',
	ref: '[data-testid="add-category-btn"]'
});

// 4. Wait for results
await mcp0_browser_wait_for({ time: 1 });

// 5. Check console for errors
const errors = await mcp0_browser_console_messages({ onlyErrors: true });

// 6. Take screenshot of results
await mcp0_browser_take_screenshot({ filename: 'category-added.png' });

// 7. Report results
console.log('Test Results:', {
	errorsFound: errors.length,
	screenshot: 'category-added.png'
});
```

---

## 🎯 Real-World Examples

### **Example 1: Verify System Categories**

**You:**

```
"Check that all system categories exist and cannot be deleted"
```

**I do:**

```typescript
// 1. Take snapshot to see categories
const snapshot = await mcp0_browser_snapshot();

// 2. Verify system categories are visible
// Look for: Pause, Urlaub, Krank, Feiertag
// They should have data-category-type="system"

// 3. Verify no delete button on system categories
// System categories should NOT have delete-category-btn

// 4. Take screenshot
await mcp0_browser_take_screenshot({ filename: 'system-categories.png' });

// 5. Report
console.log('System categories verified');
```

---

### **Example 2: Test Category Persistence**

**You:**

```
"Add a category, reload the page, and verify it persists"
```

**I do:**

```typescript
// 1. Add category
await mcp0_browser_type({
	element: 'Category input',
	ref: '[data-testid="new-category-name"]',
	text: 'Persistence Test'
});
await mcp0_browser_click({
	element: 'Add button',
	ref: '[data-testid="add-category-btn"]'
});
await mcp0_browser_wait_for({ time: 1 });

// 2. Take screenshot before reload
await mcp0_browser_take_screenshot({ filename: 'before-reload.png' });

// 3. Reload page
await mcp0_browser_navigate({ url: 'http://localhost:5173' });
await mcp0_browser_wait_for({ time: 2 });

// 4. Take screenshot after reload
await mcp0_browser_take_screenshot({ filename: 'after-reload.png' });

// 5. Verify category still exists
const snapshot = await mcp0_browser_snapshot();
console.log('Category persisted:', snapshot.includes('Persistence Test'));
```

---

### **Example 3: End-to-End Category Test**

**You:**

```
"Test the complete category workflow: view, add, verify, delete"
```

**I do:**

```typescript
// 1. View initial categories
const initial = await mcp0_browser_snapshot();
await mcp0_browser_take_screenshot({ filename: 'initial.png' });

// 2. Add new category
await mcp0_browser_type({
	element: 'Category input',
	ref: '[data-testid="new-category-name"]',
	text: 'E2E Test Category'
});
await mcp0_browser_click({
	element: 'Add button',
	ref: '[data-testid="add-category-btn"]'
});
await mcp0_browser_wait_for({ time: 1 });

// 3. Verify it was added
const afterAdd = await mcp0_browser_snapshot();
await mcp0_browser_take_screenshot({ filename: 'after-add.png' });

// 4. Delete the category
await mcp0_browser_click({
	element: 'Delete button for E2E Test Category',
	ref: '[data-testid="delete-category-btn"]'
});
await mcp0_browser_wait_for({ time: 1 });

// 5. Check results
const errors = await mcp0_browser_console_messages({ onlyErrors: true });
await mcp0_browser_take_screenshot({ filename: 'after-delete.png' });

console.log('E2E Test Complete:', {
	categoryAdded: afterAdd.includes('E2E Test Category'),
	errorsFound: errors.length
});
```

---

## 🎯 How to Use

### **Simple Commands:**

1. **"Show me the page"** → I take screenshot
2. **"Click the 'Hinzufügen' button"** → I click it
3. **"What errors are in console?"** → I read console
4. **"Add a category called..."** → I fill and submit
5. **"Test the category workflow"** → I run full test

---

## 💡 Best Practices

### **1. Be Specific**

❌ "Click the button"  
✅ "Click the 'Load All Tasks' button"

### **2. Wait for Changes**

Always wait after actions:

```
"Click Load Tasks, wait 2 seconds, then check console"
```

### **3. Check Multiple Things**

```
"Click Load Tasks, then check:
- Console for errors
- Network for API calls
- Page for task cards"
```

### **4. Take Screenshots**

Visual proof is helpful:

```
"Take a screenshot before and after clicking"
```

---

## 🚀 Advantages Over File-Based

### **File-Based (Old):**

- ❌ Write to file
- ❌ Read from file
- ❌ Stale data
- ❌ Manual cleanup

### **MCP-Based (Modern):**

- ✅ Real-time access
- ✅ No files needed
- ✅ Always current
- ✅ Automatic

---

## 🎯 Current Status

**What Works Now:**

- ✅ I can see the page (snapshot/screenshot)
- ✅ I can click buttons
- ✅ I can fill forms
- ✅ I can read console
- ✅ I can check network
- ✅ I can type text
- ✅ I can wait for changes

**What You Need to Do:**

- ✅ Nothing! Just ask me to test things

---

## 📝 Quick Reference

| Task            | Command                     |
| --------------- | --------------------------- |
| See page        | "Show me the page"          |
| Click button    | "Click the [button name]"   |
| Fill form       | "Fill [field] with [value]" |
| Check console   | "What's in the console?"    |
| Check errors    | "Show console errors"       |
| Check network   | "What API calls were made?" |
| Take screenshot | "Take a screenshot"         |
| Run test        | "Test [feature name]"       |

---

## 🎉 Try It Now!

**Just ask me:**

```
"Click the 'Load All Tasks' button and tell me what happens"
```

I'll:

1. Click the button
2. Wait for response
3. Check console for errors
4. Check network for API calls
5. Take screenshot
6. Report results

**No files, no manual steps, just results!** 🚀

---

**Last Updated:** October 31, 2025, 12:25 PM
