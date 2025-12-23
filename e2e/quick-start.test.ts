/**
 * Quick-Start UX E2E Tests (Phase 8: Plus-Tab)
 * Verifies Quick-Start UX features work correctly:
 * 1) Plus-Tab shows categories with smart suggestions
 * 2) One-click start creates a running task and redirects to /day
 * 3) Beenden button ends a running task
 * 4) Resume button creates a new task with same category
 * 5) Auto-end running task when starting new one
 * 6) Default-Tab-Logik: "/" redirects based on running task state
 *
 * Spec refs: TT-FR-001 to TT-FR-018, Phase 8
 */

import { expect, test } from '@playwright/test';

test.describe('Quick-Start UX', () => {
	test.beforeEach(async ({ page }) => {
		// Clear IndexedDB before each test for isolation
		await page.goto('/');
		await page.evaluate(async () => {
			const dbs = await indexedDB.databases();
			for (const db of dbs) {
				if (db.name) indexedDB.deleteDatabase(db.name);
			}
		});
		// Create mock auth session and seed test data
		await page.evaluate(async () => {
			const DB_NAME = 'timetracker';
			const DB_VERSION = 6;
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
					const tx = db.transaction(['authSession', 'categories', 'timeEntries'], 'readwrite');

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
							id: 'cat-coding',
							name: 'Coding',
							type: 'user',
							countsAsWorkTime: true,
							createdAt: Date.now()
						},
						{
							id: 'cat-review',
							name: 'Code Review',
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

					// Insert test time entries to establish frequency
					const entryStore = tx.objectStore('timeEntries');
					const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

					// Meeting: 3 entries (most frequent)
					for (let i = 0; i < 3; i++) {
						entryStore.put({
							id: `entry-meeting-${i}`,
							date: yesterday,
							categoryId: 'cat-meeting',
							startTime: `0${9 + i}:00`,
							endTime: `${10 + i}:00`,
							description: null,
							createdAt: Date.now() - i * 1000,
							updatedAt: Date.now() - i * 1000
						});
					}

					// Coding: 2 entries
					for (let i = 0; i < 2; i++) {
						entryStore.put({
							id: `entry-coding-${i}`,
							date: yesterday,
							categoryId: 'cat-coding',
							startTime: `1${3 + i}:00`,
							endTime: `1${4 + i}:00`,
							description: null,
							createdAt: Date.now() - i * 1000,
							updatedAt: Date.now() - i * 1000
						});
					}

					tx.oncomplete = () => {
						db.close();
						resolve();
					};
					tx.onerror = () => reject(tx.error);
				};
			});
		});
		// Reload to start fresh with seeded data
		await page.reload();
		await page.waitForLoadState('networkidle');
	});

	test('Plus-Tab shows categories with smart suggestions', async ({ page }) => {
		await page.goto('/add');

		// Wait for page to load
		await expect(page.getByRole('heading', { name: 'Aufgabe starten' })).toBeVisible();

		// Smart suggestions section should appear
		await expect(page.getByRole('heading', { name: 'Vorschläge' })).toBeVisible();

		// All categories section should appear
		await expect(page.getByRole('heading', { name: 'Alle Kategorien' })).toBeVisible();

		// Category buttons should be visible (Meeting is most frequent)
		await expect(page.getByRole('button', { name: /Meeting.*starten/i })).toBeVisible();
	});

	test('One-click start creates a running task and redirects to /day', async ({ page }) => {
		await page.goto('/add');

		// Wait for category button
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();

		// Click category to start task
		await categoryBtn.click();

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Warning banner should appear (task is running)
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();

		// Task should appear in list with "laufend"
		await expect(page.getByText(/laufend/)).toBeVisible();

		// Beenden button should be visible
		await expect(page.getByRole('button', { name: 'Beenden', exact: true })).toBeVisible();
	});

	test('Beenden button ends a running task', async ({ page }) => {
		// Create a running task via Plus-Tab
		await page.goto('/add');
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Verify task is running
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();

		// Click Beenden
		await page.getByRole('button', { name: 'Beenden', exact: true }).click();

		// Warning banner should disappear
		await expect(page.getByText('Aufgabe läuft noch')).not.toBeVisible();

		// Task should no longer show "laufend"
		await expect(page.getByText(/laufend/)).not.toBeVisible();

		// Resume button should now be visible
		await expect(page.getByRole('button', { name: 'Fortsetzen', exact: true })).toBeVisible();
	});

	test('Resume button creates a new task with same category', async ({ page }) => {
		// Create and end a task via Plus-Tab
		await page.goto('/add');
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();
		await expect(page).toHaveURL(/\/day/);
		await page.getByRole('button', { name: 'Beenden', exact: true }).click();

		// Verify task is ended
		await expect(page.getByText('Aufgabe läuft noch')).not.toBeVisible();

		// Click Resume
		await page.getByRole('button', { name: 'Fortsetzen', exact: true }).click();

		// Warning banner should reappear (new task is running)
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();

		// Should now have 2 task items in the list
		// Use a more specific selector for task items
		const taskItems = page.locator('.task-item');
		await expect(taskItems).toHaveCount(2);
	});

	test('Auto-end running task when starting new one via Plus-Tab', async ({ page }) => {
		// Start first task (Meeting) via Plus-Tab
		await page.goto('/add');
		const meetingBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(meetingBtn).toBeVisible();
		await meetingBtn.click();

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Verify first task is running
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Beenden', exact: true })).toHaveCount(1);

		// Go back to Plus-Tab and start second task (Coding) - should auto-end Meeting
		await page.goto('/add');
		const codingBtn = page.getByRole('button', { name: /Coding.*starten/i });
		await expect(codingBtn).toBeVisible();
		await codingBtn.click();

		// Should redirect to /day
		await expect(page).toHaveURL(/\/day/);

		// Still only one running task (warning banner still visible)
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();

		// Only one Beenden button (the new running task)
		await expect(page.getByRole('button', { name: 'Beenden', exact: true })).toHaveCount(1);

		// First task should now have Resume button
		await expect(page.getByRole('button', { name: 'Fortsetzen', exact: true })).toHaveCount(1);
	});

	test('Default-Tab-Logik: "/" redirects to /add when no running task', async ({ page }) => {
		// Navigate to root with no running task
		await page.goto('/');

		// Should redirect to /add (Plus-Tab)
		await expect(page).toHaveURL(/\/add/);

		// Plus-Tab content should be visible
		await expect(page.getByRole('heading', { name: 'Aufgabe starten' })).toBeVisible();
	});

	test('Default-Tab-Logik: "/" redirects to /day when running task exists', async ({ page }) => {
		// First create a running task
		await page.goto('/add');
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();

		// Should be on /day now
		await expect(page).toHaveURL(/\/day/);
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();

		// Navigate to root - should redirect to /day (running task exists)
		await page.goto('/');
		await expect(page).toHaveURL(/\/day/);

		// Warning banner should still be visible
		await expect(page.getByText('Aufgabe läuft noch')).toBeVisible();
	});
});
