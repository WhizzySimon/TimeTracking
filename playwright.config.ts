import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e',
	// CI-specific settings for stability
	retries: process.env.CI ? 2 : 0,
	timeout: 30000,
	expect: {
		timeout: 10000
	},
	// Run tests sequentially in CI to catch state bugs, parallel locally for speed
	workers: process.env.CI ? 1 : undefined,
	fullyParallel: !process.env.CI,
	// Reporter configuration - always produce JSON for analysis
	reporter: process.env.CI
		? [['html', { open: 'never' }], ['github'], ['json', { outputFile: 'playwright-results.json' }]]
		: [['html', { open: 'on-failure' }]],
	use: {
		locale: 'de-DE',
		timezoneId: 'Europe/Berlin',
		// Capture traces and screenshots on failure for debugging
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 13'] }
		}
	]
});
