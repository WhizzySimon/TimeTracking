/**
 * Milestone 1 E2E Smoke Test
 * Verifies:
 * 1) System categories exist and are protected (countsAsWorkTime=false)
 * 2) User categories can be added and persist
 * 3) Persistence across reload + no duplicate seeding
 *
 * Note: Per Phase 5, default user categories are no longer seeded from JSON.
 * Only system categories (Pause, Urlaub, Krank, Feiertag) exist on first run.
 */

import { expect, test } from '@playwright/test';

const SYSTEM_CATEGORIES = ['Pause', 'Urlaub', 'Krank', 'Feiertag'];

test.describe('Milestone 1: Persistence + Categories', () => {
	test.beforeEach(async ({ page }) => {
		// First navigate to establish origin, then clear and seed
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		// Clear all storage and seed test data in one atomic operation
		// Note: indexedDB.databases() is NOT supported in WebKit/Safari
		await page.evaluate(async () => {
			const DB_NAME = 'timetracker';
			const DB_VERSION = 6;

			// Step 1: Delete existing database (works in all browsers)
			await new Promise<void>((resolve) => {
				const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
				deleteRequest.onsuccess = () => resolve();
				deleteRequest.onerror = () => resolve(); // Ignore errors, proceed anyway
				deleteRequest.onblocked = () => resolve(); // Proceed even if blocked
			});

			// Step 2: Create fresh database with test data
			return new Promise<void>((resolve, reject) => {
				const request = indexedDB.open(DB_NAME, DB_VERSION);
				request.onerror = () => reject(request.error);
				request.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;
					// Create all required stores
					if (!db.objectStoreNames.contains('categories')) {
						db.createObjectStore('categories', { keyPath: 'id' });
					}
					if (!db.objectStoreNames.contains('timeEntries')) {
						const store = db.createObjectStore('timeEntries', { keyPath: 'id' });
						store.createIndex('date', 'date', { unique: false });
						store.createIndex('categoryId', 'categoryId', { unique: false });
					}
					if (!db.objectStoreNames.contains('dayTypes')) {
						db.createObjectStore('dayTypes', { keyPath: 'date' });
					}
					if (!db.objectStoreNames.contains('workTimeModels')) {
						const store = db.createObjectStore('workTimeModels', { keyPath: 'id' });
						store.createIndex('validFrom', 'validFrom', { unique: false });
					}
					if (!db.objectStoreNames.contains('meta')) {
						db.createObjectStore('meta', { keyPath: 'key' });
					}
					if (!db.objectStoreNames.contains('outbox')) {
						const store = db.createObjectStore('outbox', { keyPath: 'id' });
						store.createIndex('status', 'status', { unique: false });
						store.createIndex('createdAt', 'createdAt', { unique: false });
					}
					if (!db.objectStoreNames.contains('authSession')) {
						db.createObjectStore('authSession', { keyPath: 'key' });
					}
				};
				request.onsuccess = () => {
					const db = request.result;
					// Insert mock auth session
					const tx = db.transaction('authSession', 'readwrite');
					const store = tx.objectStore('authSession');
					const mockSession = {
						key: 'current',
						userId: 'test-user-id',
						email: 'test@example.com',
						token: 'mock-token-for-testing',
						expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
					};
					store.put(mockSession);
					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = () => reject(tx.error);
				};
			});
		});
		// Reload to pick up auth session
		await page.reload();
		await page.waitForLoadState('networkidle');
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

	test('only system categories exist on first run (no default user categories)', async ({
		page
	}) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		// Per Phase 5: only system categories should exist on first run
		// No default user categories are seeded from JSON anymore
		const allItems = page.locator('[data-testid="category-item"]');
		const count = await allItems.count();

		// Should have exactly 4 system categories
		expect(count).toBe(4);

		// All should be system type
		for (let i = 0; i < count; i++) {
			const item = allItems.nth(i);
			await expect(item).toHaveAttribute('data-category-type', 'system');
		}
	});

	test('user category persists across reload and defaults are not duplicated', async ({ page }) => {
		await page.goto('/settings');
		await page.waitForSelector('[data-testid="category-list"]');

		// Count total categories before adding
		const initialCount = await page.locator('[data-testid="category-item"]').count();

		// Open add category modal via menu
		await page.getByTestId('category-menu-btn').click();
		await page.getByTestId('add-category-menu-item').click();
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

	test('cannot delete system categories but can delete user categories', async ({ page }) => {
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

		// Add a user category to verify it gets a delete button
		await page.getByTestId('category-menu-btn').click();
		await page.getByTestId('add-category-menu-item').click();
		await page.waitForSelector('[data-testid="new-category-name"]');
		const testCategoryName = `DeleteTest-${Date.now()}`;
		await page.fill('[data-testid="new-category-name"]', testCategoryName);
		await page.click('[data-testid="add-category-btn"]');

		// Verify user category has delete button
		const userItem = page.locator(`[data-testid="category-item"]`, {
			has: page.locator(`[data-testid="category-name"]:has-text("${testCategoryName}")`)
		});
		await expect(userItem).toBeVisible();
		const userDeleteBtn = userItem.locator('[data-testid="delete-category-btn"]');
		await expect(userDeleteBtn).toBeVisible();
	});
});
