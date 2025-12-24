/**
 * Basic E2E Flow Test
 * Verifies core user flows work correctly:
 * 1) App loads and shows Day tab
 * 2) Navigation between tabs works
 * 3) Can add a task
 * 4) Task persists after reload
 */

import { expect, test } from '@playwright/test';

test.describe('Basic App Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Use storageState clearing via context for reliable cross-browser isolation
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
					const tx = db.transaction(['authSession', 'categories'], 'readwrite');

					// Insert mock auth session
					const authStore = tx.objectStore('authSession');
					authStore.put({
						key: 'current',
						userId: 'test-user-id',
						email: 'test@example.com',
						token: 'mock-token-for-testing',
						expiresAt: Date.now() + 24 * 60 * 60 * 1000
					});

					// Insert test categories
					const catStore = tx.objectStore('categories');
					const testCategories = [
						{
							id: 'cat-meeting',
							name: 'Meeting',
							type: 'user',
							countsAsWorkTime: true,
							createdAt: Date.now()
						},
						{
							id: 'system-pause',
							name: 'Pause',
							type: 'system',
							countsAsWorkTime: false,
							createdAt: Date.now()
						}
					];
					for (const cat of testCategories) {
						catStore.put(cat);
					}

					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = () => reject(tx.error);
				};
			});
		});
		// Navigate fresh to apply seeded data
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await page.waitForLoadState('networkidle');
	});

	test('app loads and shows Plus-Tab (no running task)', async ({ page }) => {
		await page.goto('/');

		// Should redirect to /add (Plus-Tab) when no running task
		await expect(page).toHaveURL(/\/add/);

		// Plus-Tab heading should be visible
		await expect(page.getByRole('heading', { name: 'Aufgabe starten' })).toBeVisible();

		// Category sections should be visible (use data-testid for stability)
		await expect(page.getByTestId('all-categories-section')).toBeVisible();
	});

	test('navigation between tabs works', async ({ page }) => {
		await page.goto('/day');

		// Click Week tab
		await page.getByRole('link', { name: 'Woche' }).click();
		await expect(page).toHaveURL(/\/week/);
		await expect(page.getByText(/KW \d+/)).toBeVisible();

		// Click Analysis tab
		await page.getByRole('link', { name: 'Auswertung' }).click();
		await expect(page).toHaveURL(/\/analysis/);
		// Wait for loading to complete, then check for Zeitraum label
		await expect(page.getByText('Zeitraum:')).toBeVisible({ timeout: 10000 });

		// Click Plus-Tab
		await page.getByRole('link', { name: 'Aufgabe hinzufügen' }).click();
		await expect(page).toHaveURL(/\/add/);
		await expect(page.getByRole('heading', { name: 'Aufgabe starten' })).toBeVisible();

		// Click Day tab to go back
		await page.getByRole('link', { name: 'Tag' }).click();
		await expect(page).toHaveURL(/\/day/);
	});

	test('can add and see a task via Plus-Tab', async ({ page }) => {
		await page.goto('/add');

		// Click a category button to start a task (Meeting is a user category)
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Task should appear in the list with "laufend"
		await expect(page.getByText(/laufend/)).toBeVisible();

		// Warning banner should appear
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();
	});

	test('task persists after reload', async ({ page }) => {
		// Create a task via Plus-Tab
		await page.goto('/add');
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();

		// Should be on /day with running task
		await expect(page).toHaveURL(/\/day/);
		await expect(page.getByText(/laufend/)).toBeVisible();

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Task should still be there (running)
		await expect(page.getByText(/laufend/)).toBeVisible();
	});

	test('day type selector works', async ({ page }) => {
		await page.goto('/day');

		// Find and change day type
		const dayTypeSelect = page.getByRole('combobox', { name: 'Tagesart:' });
		await expect(dayTypeSelect).toBeVisible();

		// Change to Urlaub
		await dayTypeSelect.selectOption('urlaub');

		// Verify selection changed
		await expect(dayTypeSelect).toHaveValue('urlaub');
	});
});
