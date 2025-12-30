import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Phase A4: UX Improvements
 *
 * Tests:
 * - Day navigation with day number labels
 * - Week navigation with week number labels
 * - Month navigation with month abbreviation labels
 * - Back button visibility and functionality
 * - Landing page redirect logic
 */

test.describe('Phase A4: UX Improvements', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to app and handle any initial redirects
		await page.goto('http://localhost:5173/');
		await page.waitForLoadState('networkidle');
	});

	test('Day navigation shows adjacent day numbers', async ({ page }) => {
		// Navigate to day tab
		await page.goto('http://localhost:5173/day');
		await page.waitForLoadState('networkidle');

		// Check that navigation buttons show day numbers
		const prevButton = page.locator('button[aria-label="Vorheriger Tag"]');
		const nextButton = page.locator('button[aria-label="Nächster Tag"]');

		// Verify buttons contain arrows and numbers
		await expect(prevButton).toContainText('←');
		await expect(nextButton).toContainText('→');

		// Verify day numbers are present (should be numeric)
		const prevText = await prevButton.textContent();
		const nextText = await nextButton.textContent();

		expect(prevText).toMatch(/←\s*\d+/);
		expect(nextText).toMatch(/\d+\s*→/);
	});

	test('Week navigation shows week numbers with KW prefix', async ({ page }) => {
		// Navigate to week tab
		await page.goto('http://localhost:5173/week');
		await page.waitForLoadState('networkidle');

		// Check that navigation buttons show week numbers
		const prevButton = page.locator('button[aria-label="Vorherige Woche"]');
		const nextButton = page.locator('button[aria-label="Nächste Woche"]');

		// Verify buttons contain arrows and KW prefix
		await expect(prevButton).toContainText('←');
		await expect(prevButton).toContainText('KW');
		await expect(nextButton).toContainText('→');
		await expect(nextButton).toContainText('KW');

		// Verify week numbers are present
		const prevText = await prevButton.textContent();
		const nextText = await nextButton.textContent();

		expect(prevText).toMatch(/←\s*KW\d+/);
		expect(nextText).toMatch(/KW\d+\s*→/);
	});

	test('Month navigation shows month abbreviations', async ({ page }) => {
		// Navigate to month tab
		await page.goto('http://localhost:5173/month');
		await page.waitForLoadState('networkidle');

		// Check that navigation buttons show month abbreviations
		const prevButton = page.locator('button[aria-label="Vorheriger Monat"]');
		const nextButton = page.locator('button[aria-label="Nächster Monat"]');

		// Verify buttons contain arrows and month abbreviations
		await expect(prevButton).toContainText('←');
		await expect(nextButton).toContainText('→');

		// Verify month abbreviations are present (3 letters)
		const prevText = await prevButton.textContent();
		const nextText = await nextButton.textContent();

		// German month abbreviations: Jan, Feb, Mär, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Dez
		const monthPattern = /(Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez)/;
		expect(prevText).toMatch(monthPattern);
		expect(nextText).toMatch(monthPattern);
	});

	test('Back button appears after navigation', async ({ page }) => {
		// Start at add page
		await page.goto('http://localhost:5173/add');
		await page.waitForLoadState('networkidle');

		// Initially, back button might not be visible (depends on history)
		// Navigate to another page
		await page.goto('http://localhost:5173/day');
		await page.waitForLoadState('networkidle');

		// Back button should now be visible
		const backButton = page.locator('button[aria-label="Zurück"]');
		await expect(backButton).toBeVisible();

		// Click back button
		await backButton.click();
		await page.waitForLoadState('networkidle');

		// Should be back at add page
		expect(page.url()).toContain('/add');
	});

	test('Landing page redirects to /add when no running task', async ({ page }) => {
		// Clear any running tasks first by going to day and ensuring no tasks are running
		await page.goto('http://localhost:5173/day');
		await page.waitForLoadState('networkidle');

		// Check if there's a running task banner and end it if present
		const runningBanner = page.locator('.running-task-banner');
		if (await runningBanner.isVisible()) {
			const endButton = page.locator('button:has-text("Beenden")');
			if (await endButton.isVisible()) {
				await endButton.click();
				await page.waitForTimeout(500);
			}
		}

		// Now navigate to root
		await page.goto('http://localhost:5173/');
		await page.waitForLoadState('networkidle');

		// Should redirect to /add
		expect(page.url()).toContain('/add');
	});

	test('Navigation labels update when date changes', async ({ page }) => {
		// Navigate to day tab
		await page.goto('http://localhost:5173/day');
		await page.waitForLoadState('networkidle');

		// Get initial next day number
		const nextButton = page.locator('button[aria-label="Nächster Tag"]');
		const initialNextText = await nextButton.textContent();
		const initialNextDay = initialNextText?.match(/\d+/)?.[0];

		// Click next day
		await nextButton.click();
		await page.waitForTimeout(300);

		// Get new previous day number (should be the old next day)
		const prevButton = page.locator('button[aria-label="Vorheriger Tag"]');
		const newPrevText = await prevButton.textContent();
		const newPrevDay = newPrevText?.match(/\d+/)?.[0];

		// Verify the labels updated
		expect(newPrevDay).toBe(initialNextDay);
	});

	test('Week navigation labels update when week changes', async ({ page }) => {
		// Navigate to week tab
		await page.goto('http://localhost:5173/week');
		await page.waitForLoadState('networkidle');

		// Get initial next week number
		const nextButton = page.locator('button[aria-label="Nächste Woche"]');
		const initialNextText = await nextButton.textContent();
		const initialNextWeek = initialNextText?.match(/KW(\d+)/)?.[1];

		// Click next week
		await nextButton.click();
		await page.waitForTimeout(300);

		// Get new previous week number (should be the old next week)
		const prevButton = page.locator('button[aria-label="Vorherige Woche"]');
		const newPrevText = await prevButton.textContent();
		const newPrevWeek = newPrevText?.match(/KW(\d+)/)?.[1];

		// Verify the labels updated
		expect(newPrevWeek).toBe(initialNextWeek);
	});

	test('Month navigation labels update when month changes', async ({ page }) => {
		// Navigate to month tab
		await page.goto('http://localhost:5173/month');
		await page.waitForLoadState('networkidle');

		// Get initial next month abbreviation
		const nextButton = page.locator('button[aria-label="Nächster Monat"]');
		const initialNextText = await nextButton.textContent();
		const monthPattern = /(Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez)/;
		const initialNextMonth = initialNextText?.match(monthPattern)?.[0];

		// Click next month
		await nextButton.click();
		await page.waitForTimeout(300);

		// Get new previous month abbreviation (should be the old next month)
		const prevButton = page.locator('button[aria-label="Vorheriger Monat"]');
		const newPrevText = await prevButton.textContent();
		const newPrevMonth = newPrevText?.match(monthPattern)?.[0];

		// Verify the labels updated
		expect(newPrevMonth).toBe(initialNextMonth);
	});
});
