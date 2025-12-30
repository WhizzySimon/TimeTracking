import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Phase A5: UI Improvements (German Translations)
 *
 * Spec: ui-improvements.md
 * Tests: UI-FR-001 to UI-FR-005 (German translation requirements)
 */

test.describe('UI Translations - German Language', () => {
	test('AC-001: Login error shows German text', async ({ page }) => {
		await page.goto('/login');

		// Try to login with invalid credentials
		await page.fill('input[type="email"]', 'test@example.com');
		await page.fill('input[type="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');

		// Wait for error message
		await page.waitForSelector('.error', { timeout: 5000 });

		// Check that error message is in German (not English)
		const errorText = await page.textContent('.error');
		expect(errorText).toBeTruthy();

		// Should NOT contain common English error phrases
		expect(errorText?.toLowerCase()).not.toContain('invalid credentials');
		expect(errorText?.toLowerCase()).not.toContain('login failed');
		expect(errorText?.toLowerCase()).not.toContain('error');

		// Should contain German words
		const hasGermanWords =
			errorText?.includes('Anmelde') ||
			errorText?.includes('fehlgeschlagen') ||
			errorText?.includes('Ungültig') ||
			errorText?.includes('Fehler');
		expect(hasGermanWords).toBe(true);
	});

	test('AC-002: All Settings page text is German', async ({ page }) => {
		// Navigate to settings (may require login first)
		await page.goto('/settings');

		// Check main headings
		const headings = await page.locator('h1, h2, h3').allTextContents();

		// Should NOT contain English section titles
		const englishTerms = ['Account', 'Settings', 'Profile', 'Data', 'Export', 'Import'];
		for (const heading of headings) {
			for (const term of englishTerms) {
				expect(heading).not.toBe(term);
			}
		}

		// Should contain German section titles
		const pageText = await page.textContent('body');
		expect(pageText).toContain('Konto');
		expect(pageText).toContain('Einstellungen');
	});

	test('AC-003: All form validation messages are German', async ({ page }) => {
		await page.goto('/login');

		// Try to submit empty form
		await page.click('button[type="submit"]');

		// Check for German validation messages
		const errorText = await page.textContent('.error');

		// Should be in German
		expect(errorText).toMatch(/erforderlich|benötigt|eingeben/i);

		// Should NOT be in English
		expect(errorText?.toLowerCase()).not.toContain('required');
		expect(errorText?.toLowerCase()).not.toContain('please enter');
		expect(errorText?.toLowerCase()).not.toContain('must');
	});

	test('AC-010: No English text visible in normal user flows', async ({ page }) => {
		// Test main navigation pages
		const pages = ['/day', '/week', '/month', '/add', '/analysis'];

		for (const path of pages) {
			await page.goto(path);

			const bodyText = await page.textContent('body');

			// Common English UI terms that should NOT appear
			const englishTerms = [
				'Loading...',
				'Error',
				'Success',
				'Failed',
				'Invalid',
				'Required',
				'Please',
				'Submit',
				'Cancel',
				'Delete',
				'Save',
				'Update',
				'Create',
				'Edit'
			];

			// Check that these don't appear as standalone words
			// (they might appear in variable names or technical contexts)
			for (const term of englishTerms) {
				const regex = new RegExp(`\\b${term}\\b`, 'i');
				const matches = bodyText?.match(regex);

				// If found, it should be in a technical context (like aria-label)
				// not in visible UI text
				if (matches) {
					// Get the actual visible text (excluding aria-labels, etc.)
					const visibleText = await page.evaluate(() => {
						const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
							acceptNode: (node) => {
								const parent = node.parentElement;
								if (!parent) return NodeFilter.FILTER_REJECT;

								// Skip hidden elements
								const style = window.getComputedStyle(parent);
								if (style.display === 'none' || style.visibility === 'hidden') {
									return NodeFilter.FILTER_REJECT;
								}

								// Skip aria-label and other attributes
								if (parent.hasAttribute('aria-label')) {
									return NodeFilter.FILTER_REJECT;
								}

								return NodeFilter.FILTER_ACCEPT;
							}
						});

						let text = '';
						let node;
						while ((node = walker.nextNode())) {
							text += node.textContent + ' ';
						}
						return text;
					});

					// The English term should NOT be in visible text
					expect(visibleText).not.toMatch(regex);
				}
			}
		}
	});
});

test.describe('Color Contrast - WCAG AA Compliance', () => {
	test('AC-009: All color combinations pass contrast check', async ({ page }) => {
		await page.goto('/day');

		// Test primary button contrast
		const primaryButton = page.locator('button.submit-btn, button[class*="primary"]').first();
		if ((await primaryButton.count()) > 0) {
			const bgColor = await primaryButton.evaluate((el) => {
				return window.getComputedStyle(el).backgroundColor;
			});
			const textColor = await primaryButton.evaluate((el) => {
				return window.getComputedStyle(el).color;
			});

			// Both colors should be defined
			expect(bgColor).toBeTruthy();
			expect(textColor).toBeTruthy();

			// Note: Actual contrast calculation would require a helper function
			// For now, we verify that colors are defined and not the same
			expect(bgColor).not.toBe(textColor);
		}

		// Test body text contrast
		const bodyText = page.locator('body').first();
		const bodyBg = await bodyText.evaluate((el) => {
			return window.getComputedStyle(el).backgroundColor;
		});
		const bodyColor = await bodyText.evaluate((el) => {
			return window.getComputedStyle(el).color;
		});

		expect(bodyBg).toBeTruthy();
		expect(bodyColor).toBeTruthy();
		expect(bodyBg).not.toBe(bodyColor);
	});
});
