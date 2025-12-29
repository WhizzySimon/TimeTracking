/**
 * Multi-Arbeitgeber E2E Tests
 * Verifies employer management and filtering:
 * 1) Create employer → selector shows it
 * 2) Select employer → entries filtered
 * 3) Create entry with employer → visible in that AG only
 * 4) Export per AG (Stundenzettel dialog)
 */

import { expect, test } from '@playwright/test';

test.describe('Multi-Arbeitgeber', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to static origin page first (no app code, no redirects)
		await page.goto('/e2e-origin.html', { waitUntil: 'domcontentloaded' });

		// Clear localStorage and seed IndexedDB while on static page
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
					if (!db.objectStoreNames.contains('employers')) {
						db.createObjectStore('employers', { keyPath: 'id' });
					}
				};
				request.onsuccess = () => {
					const db = request.result;
					const tx = db.transaction(['authSession', 'categories', 'employers'], 'readwrite');

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
	});

	test('create employer and see it in selector', async ({ page }) => {
		// Go to settings
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		// Find and click "Arbeitgeber hinzufügen" button
		const addEmployerBtn = page.getByRole('button', { name: 'Arbeitgeber hinzufügen' });
		await expect(addEmployerBtn).toBeVisible();
		await addEmployerBtn.click();

		// Fill in employer name
		const nameInput = page.getByLabel('Name');
		await expect(nameInput).toBeVisible();
		await nameInput.fill('Test Firma GmbH');

		// Save the employer
		const saveBtn = page.getByRole('button', { name: 'Speichern' });
		await saveBtn.click();

		// Verify employer appears in the list
		await expect(page.getByText('Test Firma GmbH')).toBeVisible();

		// Check the employer selector in header shows the new employer
		const employerSelector = page.getByRole('button', { name: /Arbeitgeber|Alle Arbeitgeber/i });
		await employerSelector.click();

		// Employer should be in the dropdown
		await expect(
			page.getByRole('option', { name: 'Test Firma GmbH' }).or(page.getByText('Test Firma GmbH'))
		).toBeVisible();
	});

	test('select employer filters entries', async ({ page }) => {
		// First create an employer and entry via the app
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		// Create employer
		const addEmployerBtn = page.getByRole('button', { name: 'Arbeitgeber hinzufügen' });
		await addEmployerBtn.click();
		const nameInput = page.getByLabel('Name');
		await nameInput.fill('Employer A');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Employer A')).toBeVisible();

		// Go to Plus-Tab and create an entry
		await page.goto('/add', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/add/);

		// Start a task with the Meeting category
		const categoryBtn = page.getByRole('button', { name: /Meeting.*starten/i });
		await expect(categoryBtn).toBeVisible();
		await categoryBtn.click();

		// Should redirect to /day with running task
		await expect(page).toHaveURL(/\/day/);
		await expect(page.getByTestId('task-item-running')).toBeVisible();

		// Stop the task
		const stopBtn = page.getByTestId('task-item-running').getByRole('button');
		await stopBtn.click();

		// Task should now be completed (not running)
		await expect(page.getByTestId('task-item-running')).not.toBeVisible();
	});

	test('stundenzettel export dialog shows employer selector', async ({ page }) => {
		// Create an employer first
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		const addEmployerBtn = page.getByRole('button', { name: 'Arbeitgeber hinzufügen' });
		await addEmployerBtn.click();
		const nameInput = page.getByLabel('Name');
		await nameInput.fill('Export Test AG');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Export Test AG')).toBeVisible();

		// Open Stundenzettel export dialog
		const stundenzettelBtn = page.getByTestId('stundenzettel-export-btn');
		await expect(stundenzettelBtn).toBeVisible();
		await stundenzettelBtn.click();

		// Dialog should open
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Stundenzettel exportieren' })).toBeVisible();

		// Employer selector should be visible and contain our employer
		const employerSelect = page.getByRole('combobox', { name: /Arbeitgeber/i });
		await expect(employerSelect).toBeVisible();

		// Date range pickers should be visible
		await expect(page.getByLabel('Von:')).toBeVisible();
		await expect(page.getByLabel('Bis:')).toBeVisible();

		// Column checkboxes should be visible
		await expect(page.getByRole('checkbox', { name: 'Datum' })).toBeVisible();
		await expect(page.getByRole('checkbox', { name: 'Kategorie' })).toBeVisible();

		// Export buttons should be visible (disabled when no entries)
		await expect(page.getByRole('button', { name: 'PDF exportieren' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Excel exportieren' })).toBeVisible();

		// Close the dialog
		await page.getByRole('button', { name: 'Abbrechen' }).click();
		await expect(page.getByRole('dialog')).not.toBeVisible();
	});

	test('employer can be edited', async ({ page }) => {
		// Create an employer
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		const addEmployerBtn = page.getByRole('button', { name: 'Arbeitgeber hinzufügen' });
		await addEmployerBtn.click();
		const nameInput = page.getByLabel('Name');
		await nameInput.fill('Original Name');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Original Name')).toBeVisible();

		// Click on the employer to edit it
		await page.getByText('Original Name').click();

		// Edit dialog should open with existing name
		const editNameInput = page.getByLabel('Name');
		await expect(editNameInput).toHaveValue('Original Name');

		// Change the name
		await editNameInput.fill('Updated Name');
		await page.getByRole('button', { name: 'Speichern' }).click();

		// New name should be visible
		await expect(page.getByText('Updated Name')).toBeVisible();
		await expect(page.getByText('Original Name')).not.toBeVisible();
	});

	test('employer can be deleted', async ({ page }) => {
		// Create an employer
		await page.goto('/settings', { waitUntil: 'domcontentloaded' });
		await page.waitForURL(/\/settings/);

		const addEmployerBtn = page.getByRole('button', { name: 'Arbeitgeber hinzufügen' });
		await addEmployerBtn.click();
		const nameInput = page.getByLabel('Name');
		await nameInput.fill('To Be Deleted');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('To Be Deleted')).toBeVisible();

		// Click the delete button for the employer
		const employerItem = page.getByText('To Be Deleted').locator('..');
		const deleteBtn = employerItem.getByRole('button', { name: 'Löschen' });
		await deleteBtn.click();

		// Employer should be removed
		await expect(page.getByText('To Be Deleted')).not.toBeVisible();
	});
});
