import { chromium } from 'playwright';

(async () => {
	const userDataDir = '.pw-chrome-profile';
	const url = 'http://localhost:5173';

	console.log(`📁 Using persistent profile: ${userDataDir}`);
	console.log(`🌐 Opening: ${url}`);

	const context = await chromium.launchPersistentContext(userDataDir, {
		headless: false,
		channel: 'chrome', // Ensures MCP + Chrome extensions work
		args: ['--start-maximized'],
		viewport: null
	});

	const page = await context.newPage();

	// Forward browser logs to terminal
	page.on('console', (msg) => {
		console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
	});

	// Helpful debugging streams
	page.on('pageerror', (err) => console.error('[PAGEERROR]', err));
	page.on('requestfailed', (req) => console.warn('[REQUESTFAILED]', req.url()));

	// Navigate to app
	try {
		console.log('🔄 Loading page...');
		await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
		console.log('✅ Page loaded successfully');
		console.log('\n🎯 Browser is open. Cascade can now use MCP tools to interact with it.');
		console.log('   Press Ctrl+C to close when done.\n');
	} catch (error) {
		console.error('❌ Failed to load page:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
})();
