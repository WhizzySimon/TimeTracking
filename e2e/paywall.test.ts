/**
 * Paywall E2E Tests
 * Verifies paywall behavior for Free users:
 * 1) Free user sees paywall on /month
 * 2) Free user sees paywall on /analysis
 * 3) "Weiter mit Free" navigates to /day
 * 4) Settings shows Konto section
 * 5) Plan selector modal opens
 */

import { expect, test } from '@playwright/test';

test.describe('Paywall - Free User', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to static origin page first (no app code, no redirects)
		await page.goto('/e2e-origin.html', { waitUntil: 'domcontentloaded' });

		// Clear localStorage and seed IndexedDB with Free user
		await page.evaluate(async () => {
			localStorage.clear();

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

					// Insert mock auth session (Free user - plan determined by profile API returning null)
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

	test('free user sees paywall on /month', async ({ page }) => {
		await page.goto('/month', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/month/);

		// Paywall should be visible
		await expect(page.getByText('Pro-Funktionen')).toBeVisible({ timeout: 10000 });
		await expect(
			page.getByText('Monatsübersicht und Auswertungen sind in Pro enthalten.')
		).toBeVisible();

		// Feature list should be visible
		await expect(page.getByText('Monat: Überblick über Wochen und Summen')).toBeVisible();
	});

	test('free user sees paywall on /analysis', async ({ page }) => {
		await page.goto('/analysis', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/analysis/);

		// Paywall should be visible
		await expect(page.getByText('Pro-Funktionen')).toBeVisible({ timeout: 10000 });
		await expect(
			page.getByText('Monatsübersicht und Auswertungen sind in Pro enthalten.')
		).toBeVisible();
	});

	test('"Weiter mit Free" navigates to /day', async ({ page }) => {
		await page.goto('/month', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/month/);

		// Wait for paywall
		await expect(page.getByText('Pro-Funktionen')).toBeVisible({ timeout: 10000 });

		// Click "Weiter mit Free" button
		await page.getByRole('button', { name: 'Weiter mit Free' }).click();

		// Should navigate to /day
		await expect(page).toHaveURL(/\/day/);
	});

	test('settings shows Konto section', async ({ page }) => {
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
	});

	test('plan selector modal opens from settings', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		// Wait for Konto section to load
		await expect(page.getByTestId('account-section')).toBeVisible({ timeout: 10000 });

		// Click "Plan ändern" button
		await page.getByTestId('change-plan-btn').click();

		// Modal should open with plan comparison
		await expect(page.getByRole('heading', { name: 'Plan auswählen' })).toBeVisible();

		// Free plan card should be visible
		await expect(page.getByText('Kostenlos')).toBeVisible();

		// Pro plan card should be visible
		await expect(page.getByText('10 € / Monat')).toBeVisible();

		// Upgrade button should be visible (for free user)
		await expect(page.getByTestId('upgrade-to-pro-btn')).toBeVisible();
	});
});
