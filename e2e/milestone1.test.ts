/**
 * Milestone 1 E2E Smoke Test
 * Verifies:
 * 1) System categories exist and are protected (countsAsWorkTime=false)
 * 2) Default categories seeded on first run
 * 3) Persistence across reload + no duplicate seeding
 */

import { expect, test } from '@playwright/test';

const SYSTEM_CATEGORIES = ['Pause', 'Urlaub', 'Krank', 'Feiertag'];
const KNOWN_DEFAULT_CATEGORY = 'Allg. Orga, Mails';

test.describe('Milestone 1: Persistence + Categories', () => {
	test.beforeEach(async ({ page }) => {
		// Clear IndexedDB before each test for isolation
		await page.goto('/');
		await page.evaluate(async () => {
			const dbs = await indexedDB.databases();
			for (const db of dbs) {
				if (db.name) indexedDB.deleteDatabase(db.name);
			}
		});
	});

	test('system categories exist, are protected, and have countsAsWorkTime=false', async ({
		page
	}) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		for (const sysName of SYSTEM_CATEGORIES) {
			const item = page.locator(`[data-testid="category-item"]`, {
				has: page.locator(`[data-testid="category-name"]:has-text("${sysName}")`)
			});

			await expect(item).toBeVisible();

			// Verify it's marked as system
			await expect(item).toHaveAttribute('data-category-type', 'system');

			// Verify countsAsWorkTime is false
			await expect(item).toHaveAttribute('data-counts-as-work', 'false');

			// Verify no delete button for system categories
			const deleteBtn = item.locator('[data-testid="delete-category-btn"]');
			await expect(deleteBtn).toHaveCount(0);
		}
	});

	test('default categories are seeded on first run', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		// Check that at least one known default category exists
		const defaultItem = page.locator(`[data-testid="category-item"]`, {
			has: page.locator(`[data-testid="category-name"]:has-text("${KNOWN_DEFAULT_CATEGORY}")`)
		});

		await expect(defaultItem).toBeVisible();
		await expect(defaultItem).toHaveAttribute('data-category-type', 'user');
		await expect(defaultItem).toHaveAttribute('data-counts-as-work', 'true');
	});

	test('user category persists across reload and defaults are not duplicated', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		// Count total categories before adding
		const initialCount = await page.locator('[data-testid="category-item"]').count();

		// Open add category modal
		await page.getByRole('button', { name: '+ Kategorie' }).click();
		await page.waitForSelector('[data-testid="new-category-name"]');

		// Add a new user category
		const testCategoryName = `Test-${Date.now()}`;
		await page.fill('[data-testid="new-category-name"]', testCategoryName);
		await page.click('[data-testid="add-category-btn"]');

		// Wait for new category to appear
		await expect(
			page.locator(`[data-testid="category-item"]`, {
				has: page.locator(`[data-testid="category-name"]:has-text("${testCategoryName}")`)
			})
		).toBeVisible();

		const countAfterAdd = await page.locator('[data-testid="category-item"]').count();
		expect(countAfterAdd).toBe(initialCount + 1);

		// Reload page
		await page.reload();
		await page.waitForSelector('[data-testid="category-list"]');

		// Verify the new category still exists
		await expect(
			page.locator(`[data-testid="category-item"]`, {
				has: page.locator(`[data-testid="category-name"]:has-text("${testCategoryName}")`)
			})
		).toBeVisible();

		// Verify count is the same (no duplicate seeding)
		const countAfterReload = await page.locator('[data-testid="category-item"]').count();
		expect(countAfterReload).toBe(countAfterAdd);
	});

	test('cannot delete system categories (protection check)', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		// Verify system categories have no delete button
		for (const sysName of SYSTEM_CATEGORIES) {
			const item = page.locator(`[data-testid="category-item"]`, {
				has: page.locator(`[data-testid="category-name"]:has-text("${sysName}")`)
			});
			const deleteBtn = item.locator('[data-testid="delete-category-btn"]');
			await expect(deleteBtn).toHaveCount(0);
		}

		// Verify user categories DO have delete button
		const defaultItem = page.locator(`[data-testid="category-item"]`, {
			has: page.locator(`[data-testid="category-name"]:has-text("${KNOWN_DEFAULT_CATEGORY}")`)
		});
		const userDeleteBtn = defaultItem.locator('[data-testid="delete-category-btn"]');
		await expect(userDeleteBtn).toBeVisible();
	});
});
