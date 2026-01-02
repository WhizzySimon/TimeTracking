# Playwright Browser Console Access for Cascade

**Goal:** Allow Cascade to read the Chrome browser console when debugging TimeTracker issues

---

## 🎯 Solution: Use Playwright MCP Server

**⚠️ PREREQUISITES:**

1. **Install dependencies** (one-time setup):

   ```bash
   npm install
   npx playwright install
   ```

   This installs `playwright`, `@playwright/test`, `tsx`, and browser binaries.

2. **Restart Windsurf** if MCP browser tools are not available:
   - Close Windsurf completely
   - Reopen Windsurf
   - MCP tools will now be available

The MCP Playwright server is loaded when Windsurf starts.

Cascade has access to the `mcp-playwright` MCP server, which can:

- ✅ Take screenshots
- ✅ Read page snapshots
- ✅ **Read console messages**
- ✅ Read network requests

---

## 📋 Available Tools

### **1. `mcp0_browser_console_messages`**

**Purpose:** Returns all console messages from the browser

**Usage:**

```typescript
// Get all console messages
mcp0_browser_console_messages();

// Get only errors
mcp0_browser_console_messages({ onlyErrors: true });
```

**Returns:**

```json
[
	{
		"type": "log",
		"text": "🔍 [Viewer] Action: sp.getList",
		"location": "GptContentBlock.tsx:76"
	},
	{
		"type": "error",
		"text": "❌ [Hook] Validation failed: Missing required parameter: list",
		"location": "useContentBlockLogic.ts:368"
	}
]
```

---

### **2. `mcp0_browser_snapshot`**

**Purpose:** Capture accessibility snapshot of the current page (better than screenshot for debugging)

**Usage:**

```typescript
mcp0_browser_snapshot();
```

**Returns:** Text representation of the page structure

---

### **3. `mcp0_browser_network_requests`**

**Purpose:** Returns all network requests since loading the page

**Usage:**

```typescript
mcp0_browser_network_requests();
```

**Returns:**

```json
[
	{
		"url": "https://graph.microsoft.com/v1.0/...",
		"method": "GET",
		"status": 200,
		"statusText": "OK"
	}
]
```

---

## 🔧 How to Use in Cascade

### **Method 1: Direct Tool Call (Recommended)**

When debugging, simply ask Cascade:

```
"Read the browser console and tell me what errors are showing"
```

Cascade will call:

```typescript
mcp0_browser_console_messages({ onlyErrors: true });
```

---

### **Method 2: Automatic on Error**

We can modify `scripts/dev/devBrowser.ts` to automatically capture console on errors:

```typescript
// scripts/dev/devBrowser.ts
page.on('console', (msg) => {
	const text = msg.text();
	console.log(`[BROWSER ${msg.type()}] ${text}`);

	// If error, capture full console state
	if (msg.type() === 'error') {
		captureConsoleSnapshot();
	}
});

async function captureConsoleSnapshot() {
	// Save console messages to a file that Cascade can read
	const messages = await page.evaluate(() => {
		// Get all console messages from window.__console_history
		return window.__console_history || [];
	});

	fs.writeFileSync(
		path.join(process.cwd(), 'console-snapshot.json'),
		JSON.stringify(messages, null, 2)
	);

	console.log('📸 Console snapshot saved to console-snapshot.json');
}
```

---

### **Method 3: Enhanced devBrowser with Console History**

Modify the browser to track console history:

```typescript
// scripts/dev/devBrowser.ts - Add after page creation
await page.addInitScript(() => {
	// Intercept console methods to build history
	window.__console_history = [];

	const originalLog = console.log;
	const originalError = console.error;
	const originalWarn = console.warn;

	console.log = (...args) => {
		window.__console_history.push({
			type: 'log',
			text: args.join(' '),
			timestamp: new Date().toISOString()
		});
		originalLog.apply(console, args);
	};

	console.error = (...args) => {
		window.__console_history.push({
			type: 'error',
			text: args.join(' '),
			timestamp: new Date().toISOString()
		});
		originalError.apply(console, args);
	};

	console.warn = (...args) => {
		window.__console_history.push({
			type: 'warn',
			text: args.join(' '),
			timestamp: new Date().toISOString()
		});
		originalWarn.apply(console, args);
	};
});

// Add command to dump console history
page.exposeFunction('dumpConsole', async () => {
	const history = await page.evaluate(() => window.__console_history);
	fs.writeFileSync(
		path.join(process.cwd(), 'console-history.json'),
		JSON.stringify(history, null, 2)
	);
	console.log('📋 Console history dumped to console-history.json');
});
```

---

## 🎯 Recommended Approach

### **Option A: Use MCP Tools (Simplest)**

Just ask Cascade to read the console:

```
"Read the browser console messages and show me any errors"
```

Cascade will use `mcp0_browser_console_messages()` automatically.

---

### **Option B: Enhanced devBrowser (Most Powerful)**

Update `scripts/dev/devBrowser.ts` to capture console history:

```typescript
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
	const userDataDir = '.pw-chrome-profile';
	const serveConfigPath = path.join(process.cwd(), 'config', 'serve.json');
	const serveConfig = JSON.parse(fs.readFileSync(serveConfigPath, 'utf-8'));
	const url = serveConfig.initialPage;

	console.log(`📁 Using persistent profile: ${path.resolve(userDataDir)}`);
	console.log(`🌐 Opening: ${url}`);

	const context = await chromium.launchPersistentContext(userDataDir, {
		headless: false,
		channel: 'chrome',
		args: ['--start-maximized'],
		viewport: null
	});

	const page = await context.newPage();

	// ✅ Capture console messages to file
	const consoleMessages: any[] = [];

	page.on('console', (msg) => {
		const message = {
			type: msg.type(),
			text: msg.text(),
			location: msg.location(),
			timestamp: new Date().toISOString()
		};

		consoleMessages.push(message);
		console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);

		// Auto-save on errors
		if (msg.type() === 'error') {
			saveConsoleSnapshot();
		}
	});

	function saveConsoleSnapshot() {
		const snapshotPath = path.join(process.cwd(), 'console-snapshot.json');
		fs.writeFileSync(snapshotPath, JSON.stringify(consoleMessages, null, 2));
		console.log(`📸 Console snapshot saved: ${snapshotPath}`);
	}

	// 🔥 Helpful debugging streams
	page.on('pageerror', (err) => {
		console.error('[PAGEERROR]', err);
		consoleMessages.push({
			type: 'pageerror',
			text: err.message,
			stack: err.stack,
			timestamp: new Date().toISOString()
		});
		saveConsoleSnapshot();
	});

	page.on('requestfailed', (req) => {
		console.warn('[REQUESTFAILED]', req.url());
		consoleMessages.push({
			type: 'requestfailed',
			text: req.url(),
			timestamp: new Date().toISOString()
		});
	});

	// 🔁 Retry navigation logic
	const maxRetries = 3;
	let lastError: Error | undefined;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			console.log(`🔄 Attempt ${attempt}/${maxRetries} to load page...`);
			await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
			console.log('✅ Page loaded successfully');

			// Save initial console state
			saveConsoleSnapshot();

			return;
		} catch (error) {
			lastError = error as Error;
			console.error(
				`❌ Attempt ${attempt} failed:`,
				error instanceof Error ? error.message : error
			);

			if (attempt < maxRetries) {
				const delay = Math.pow(2, attempt) * 1000;
				console.log(`⏳ Waiting ${delay / 1000}s before retry...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	console.error(`\n❌ Failed after ${maxRetries} attempts. Last error:`, lastError);
	saveConsoleSnapshot();
	process.exit(1);
})();
```

---

## 📝 Usage Examples

### **Example 1: Debug Category Error**

**User:** "I tried to add a category and got an error"

**Cascade:**

```typescript
// Read console
const messages = await mcp0_browser_console_messages({ onlyErrors: true });

// Analyze errors
const errors = messages.filter((m) => m.type === 'error');
console.log('Found errors:', errors);
```

---

### **Example 2: Check IndexedDB Operations**

**User:** "Is the data being saved to IndexedDB?"

**Cascade:**

```typescript
const messages = await mcp0_browser_console_messages();
const dbMessages = messages.filter((m) => m.text.includes('IndexedDB'));
console.log('IndexedDB operations:', dbMessages);
```

---

### **Example 3: Take Screenshot**

**User:** "What does the page look like?"

**Cascade:**

```typescript
await mcp0_browser_take_screenshot({
	filename: 'contentblock-error.png'
});
```

---

## 🎯 Recommended Implementation

### **Step 1: Start Dev Server**

```bash
npm run dev
```

### **Step 2: Use MCP Tools**

Ask Cascade to:

```
"Open the browser and show me the TimeTracker page"
"Check the console for any errors"
"Take a screenshot of the current state"
```

### **Step 3: Debug Issues**

When debugging, simply ask:

```
"Read the browser console and tell me what went wrong"
```

---

## ✅ Benefits

1. **Automatic Capture** - Console saved on every error
2. **Full History** - All messages, not just current
3. **Timestamps** - Know when errors occurred
4. **File-Based** - Cascade can read without MCP tools
5. **Network Tracking** - See all API calls
6. **Screenshots** - Visual debugging

---

## 🚀 Quick Start

**Simplest approach (no code changes):**

Just ask Cascade:

```
"Use mcp0_browser_console_messages to read the browser console"
```

**Enhanced approach (5 min setup):**

Replace `scripts/dev/devBrowser.ts` with the enhanced version above, then:

```
"Read console-snapshot.json and analyze the errors"
```

---

**Last Updated:** December 21, 2025
