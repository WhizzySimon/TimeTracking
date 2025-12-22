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
		// Clear IndexedDB before each test for isolation
		await page.goto('/');
		await page.evaluate(async () => {
			const dbs = await indexedDB.databases();
			for (const db of dbs) {
				if (db.name) indexedDB.deleteDatabase(db.name);
			}
		});
		// Create mock auth session so tests don't get redirected to login
		await page.evaluate(async () => {
			const DB_NAME = 'timetracker';
			const DB_VERSION = 6;
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
		// Reload to start fresh with auth session
		await page.reload();
		await page.waitForLoadState('networkidle');
	});

	test('app loads and shows Day tab', async ({ page }) => {
		await page.goto('/');

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Day navigation should be visible
		await expect(page.getByRole('button', { name: 'Heute' })).toBeVisible();

		// Add task button should be visible
		await expect(page.getByRole('button', { name: '+ Aufgabe hinzufügen' })).toBeVisible();
	});

	test('navigation between tabs works', async ({ page }) => {
		await page.goto('/');

		// Click Week tab
		await page.getByRole('link', { name: 'Woche' }).click();
		await expect(page).toHaveURL(/\/week/);
		await expect(page.getByText(/KW \d+/)).toBeVisible();

		// Click Analysis tab
		await page.getByRole('link', { name: 'Auswertung' }).click();
		await expect(page).toHaveURL(/\/analysis/);
		// Wait for loading to complete, then check for Zeitraum label
		await expect(page.getByText('Zeitraum:')).toBeVisible({ timeout: 10000 });

		// Click Settings tab
		await page.getByRole('link', { name: 'Einstellungen' }).click();
		await expect(page).toHaveURL(/\/settings/);
		// Use more specific selector - look for the section heading
		await expect(page.getByRole('heading', { name: 'Abwesenheitskategorien' })).toBeVisible();

		// Click Day tab to go back
		await page.getByRole('link', { name: 'Tag' }).click();
		await expect(page).toHaveURL(/\/day/);
	});

	test('can add and see a task', async ({ page }) => {
		await page.goto('/day');

		// Click add task button
		await page.getByRole('button', { name: '+ Aufgabe hinzufügen' }).click();

		// Modal should appear
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Aufgabe hinzufügen' })).toBeVisible();

		// Fill in the form - category should already be selected
		// Just click save with defaults
		await page.getByRole('button', { name: 'Speichern' }).click();

		// Modal should close
		await expect(page.getByRole('dialog')).not.toBeVisible();

		// Task should appear in the list (no longer shows "Keine Aufgaben")
		await expect(page.getByText('Keine Aufgaben für diesen Tag')).not.toBeVisible();
	});

	test('task persists after reload', async ({ page }) => {
		await page.goto('/day');

		// Add a task
		await page.getByRole('button', { name: '+ Aufgabe hinzufügen' }).click();
		await page.getByRole('button', { name: 'Speichern' }).click();

		// Wait for modal to close
		await expect(page.getByRole('dialog')).not.toBeVisible();

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Task should still be there
		await expect(page.getByText('Keine Aufgaben für diesen Tag')).not.toBeVisible();
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
