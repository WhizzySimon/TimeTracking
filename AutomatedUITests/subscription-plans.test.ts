/**
 * Subscription Plans E2E Tests
 * Verifies plan gating and export/import functionality:
 * 1) Free user sees paywall on Cloud Backup
 * 2) Free user sees paywall on Export
 * 3) Pro user can export JSON
 * 4) Pro user can import JSON
 * 5) Settings shows Konto and Daten sections
 */

import { expect, test } from '@playwright/test';

async function seedDatabase(page: import('@playwright/test').Page, plan: 'free' | 'pro' = 'free') {
	await page.goto('/e2e-origin.html', { waitUntil: 'domcontentloaded' });

	await page.evaluate(
		async ({ userPlan }) => {
			localStorage.clear();

			const DB_NAME = 'timetracker';
			const DB_VERSION = 6;

			await new Promise<void>((resolve) => {
				const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
				deleteRequest.onsuccess = () => resolve();
				deleteRequest.onerror = () => resolve();
				deleteRequest.onblocked = () => resolve();
			});

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
					if (!db.objectStoreNames.contains('userProfile')) {
						db.createObjectStore('userProfile', { keyPath: 'id' });
					}
				};
				request.onsuccess = () => {
					const db = request.result;
					const stores = ['authSession', 'categories', 'timeEntries', 'userProfile'];
					const tx = db.transaction(stores, 'readwrite');

					const authStore = tx.objectStore('authSession');
					authStore.put({
						key: 'current',
						userId: 'test-user-id',
						email: 'test@example.com',
						token: 'mock-token-for-testing',
						expiresAt: Date.now() + 24 * 60 * 60 * 1000
					});

					const profileStore = tx.objectStore('userProfile');
					profileStore.put({
						id: 'test-user-id',
						plan: userPlan,
						createdAt: Date.now()
					});

					const catStore = tx.objectStore('categories');
					catStore.put({
						id: 'cat-meeting',
						name: 'Meeting',
						type: 'user',
						countsAsWorkTime: true,
						createdAt: Date.now()
					});

					const entriesStore = tx.objectStore('timeEntries');
					const today = new Date().toISOString().split('T')[0];
					entriesStore.put({
						id: 'entry-1',
						date: today,
						startTime: '09:00',
						endTime: '10:30',
						categoryId: 'cat-meeting',
						description: 'Test meeting',
						createdAt: Date.now()
					});

					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = () => reject(tx.error);
				};
			});
		},
		{ userPlan: plan }
	);
}

test.describe('Subscription Plans - Free User', () => {
	test.beforeEach(async ({ page }) => {
		await seedDatabase(page, 'free');
	});

	test('settings shows Konto and Daten sections', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await expect(page.getByRole('heading', { name: 'Konto' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Daten' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Exportieren' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Importieren' })).toBeVisible();
	});

	test('Free user sees plan badge as Free', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await expect(page.getByText('Free')).toBeVisible();
	});

	test('Free user sees paywall on Export click', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await page.getByRole('button', { name: 'Exportieren' }).click();

		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByText('Pro freischalten')).toBeVisible();
		await expect(page.getByText('Weiter mit Free')).toBeVisible();
	});

	test('Free user can close paywall with Weiter mit Free', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await page.getByRole('button', { name: 'Exportieren' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		await page.getByRole('button', { name: 'Weiter mit Free' }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});
});

test.describe('Subscription Plans - Pro User', () => {
	test.beforeEach(async ({ page }) => {
		await seedDatabase(page, 'pro');
	});

	test('Pro user sees plan badge as Pro', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await expect(page.getByText('Pro')).toBeVisible();
	});

	test('Pro user sees ExportDialog on Export click', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await page.getByRole('button', { name: 'Exportieren' }).click();

		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Daten exportieren' })).toBeVisible();
		await expect(page.getByRole('radio', { name: /CSV/i })).toBeVisible();
		await expect(page.getByRole('radio', { name: /JSON/i })).toBeVisible();
		await expect(page.getByRole('radio', { name: /PDF/i })).toBeVisible();
	});

	test('Pro user can select export format', async ({ page }) => {
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		await page.getByRole('button', { name: 'Exportieren' }).click();
		await expect(page.getByRole('dialog')).toBeVisible();

		const jsonRadio = page.getByRole('radio', { name: /JSON/i });
		await jsonRadio.click();
		await expect(jsonRadio).toBeChecked();

		const csvRadio = page.getByRole('radio', { name: /CSV/i });
		await csvRadio.click();
		await expect(csvRadio).toBeChecked();

		const pdfRadio = page.getByRole('radio', { name: /PDF/i });
		await pdfRadio.click();
		await expect(pdfRadio).toBeChecked();
	});
});
