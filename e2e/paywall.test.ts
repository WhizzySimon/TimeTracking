/**
 * Paywall E2E Tests
 * Verifies Free/Pro feature gating works correctly:
 * 1) Free-User sees Paywall on /month
 * 2) Free-User sees Paywall on /analysis
 * 3) "Weiter mit Free" navigates to /day
 * 4) Settings shows Konto section
 * 5) Plan selector modal opens
 */

import { expect, test } from '@playwright/test';

test.describe('Paywall Features', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to static origin page first (no app code, no redirects)
		await page.goto('/e2e-origin.html', { waitUntil: 'domcontentloaded' });

		// Clear localStorage and seed IndexedDB with FREE user
		await page.evaluate(async () => {
			localStorage.clear();
			// Set cached plan to 'free'
			localStorage.setItem('timetracker_user_plan', 'free');

			const DB_NAME = 'timetracker';
			const DB_VERSION = 6;

			// Delete existing database
			await new Promise<void>((resolve) => {
				const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
				deleteRequest.onsuccess = () => resolve();
				deleteRequest.onerror = () => resolve();
				deleteRequest.onblocked = () => resolve();
			});

			// Create fresh database with test data
			return new Promise<void>((resolve, reject) => {
				const request = indexedDB.open(DB_NAME, DB_VERSION);
				request.onerror = () => reject(request.error);
				request.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;
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

					// Insert mock auth session (Free user)
					const authStore = tx.objectStore('authSession');
					authStore.put({
						key: 'current',
						userId: 'test-free-user-id',
						email: 'free@example.com',
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
	});

	test('Free user sees Paywall on /month', async ({ page }) => {
		await page.goto('/month', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/month/);

		// Paywall should be visible
		await expect(page.getByTestId('paywall')).toBeVisible({ timeout: 10000 });

		// Should show Pro features text
		await expect(page.getByText('Pro-Funktionen')).toBeVisible();

		// Should have upgrade button
		await expect(page.getByTestId('paywall-upgrade-btn')).toBeVisible();

		// Should have "Weiter mit Free" button
		await expect(page.getByTestId('paywall-continue-btn')).toBeVisible();
	});

	test('Free user sees Paywall on /analysis', async ({ page }) => {
		await page.goto('/analysis', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/analysis/);

		// Paywall should be visible
		await expect(page.getByTestId('paywall')).toBeVisible({ timeout: 10000 });

		// Should show Pro features text
		await expect(page.getByText('Pro-Funktionen')).toBeVisible();
	});

	test('"Weiter mit Free" navigates to /day', async ({ page }) => {
		await page.goto('/month', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/month/);

		// Wait for paywall
		await expect(page.getByTestId('paywall')).toBeVisible({ timeout: 10000 });

		// Click "Weiter mit Free" button
		await page.getByTestId('paywall-continue-btn').click();

		// Should navigate to /day
		await expect(page).toHaveURL(/\/day/);
	});

	test('Settings shows Konto section', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		// Konto section should be visible
		await expect(page.getByTestId('account-section')).toBeVisible({ timeout: 10000 });

		// Email should be displayed
		await expect(page.getByTestId('account-email')).toBeVisible();

		// Plan should be displayed
		await expect(page.getByTestId('account-plan')).toBeVisible();

		// Plan ändern button should be visible
		await expect(page.getByTestId('change-plan-btn')).toBeVisible();

		// Logout button should be visible
		await expect(page.getByTestId('logout-btn')).toBeVisible();
	});

	test('Plan selector modal opens', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		// Wait for account section
		await expect(page.getByTestId('account-section')).toBeVisible({ timeout: 10000 });

		// Click "Plan ändern" button
		await page.getByTestId('change-plan-btn').click();

		// Modal should open
		await expect(page.getByTestId('plan-selector-modal')).toBeVisible();

		// Free plan card should be visible
		await expect(page.getByTestId('plan-free')).toBeVisible();

		// Pro plan card should be visible
		await expect(page.getByTestId('plan-pro')).toBeVisible();

		// Upgrade button should be visible
		await expect(page.getByTestId('upgrade-btn')).toBeVisible();
	});
});
