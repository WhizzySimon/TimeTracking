/**
 * E2E Tests for Phase A3: Kleine Änderungen
 *
 * Tests:
 * - Create category from Add tab
 * - Password visibility toggle on login
 */

import { test, expect } from '@playwright/test';

test.describe('Phase A3: Kleine Änderungen', () => {
	test.beforeEach(async ({ page }) => {
		// Clear IndexedDB before each test
		await page.goto('http://localhost:5173');
		await page.evaluate(async () => {
			const databases = await indexedDB.databases();
			for (const db of databases) {
				if (db.name) {
					indexedDB.deleteDatabase(db.name);
				}
			}
		});
	});

	test.describe('Category Creation from Add Tab', () => {
		test('should show create category button on Add tab', async ({ page }) => {
			await page.goto('http://localhost:5173/add');

			// Wait for the page to load
			await page.waitForSelector('.add-page');

			// Check for create category button
			const createBtn = page.locator('.create-category-btn');
			await expect(createBtn).toBeVisible();
			await expect(createBtn).toContainText('Kategorie erstellen');
		});

		test('should open create category dialog when button clicked', async ({ page }) => {
			await page.goto('http://localhost:5173/add');
			await page.waitForSelector('.add-page');

			// Click create category button
			await page.click('.create-category-btn');

			// Dialog should appear with create mode title
			await expect(page.locator('text=Kategorie erstellen')).toBeVisible();

			// Should have empty name input
			const nameInput = page.locator('[data-testid="category-name-input"]');
			await expect(nameInput).toBeVisible();
			await expect(nameInput).toHaveValue('');
		});

		test('should create new category successfully', async ({ page }) => {
			await page.goto('http://localhost:5173/add');
			await page.waitForSelector('.add-page');

			// Click create category button
			await page.click('.create-category-btn');

			// Fill in category name
			const nameInput = page.locator('[data-testid="category-name-input"]');
			await nameInput.fill('Neue Testkategorie');

			// Click save button
			await page.click('[data-testid="save-category-btn"]');

			// Dialog should close
			await expect(page.locator('[data-testid="category-name-input"]')).not.toBeVisible();

			// New category should appear in the list
			await expect(page.locator('text=Neue Testkategorie')).toBeVisible();
		});

		test('should show validation error for empty name', async ({ page }) => {
			await page.goto('http://localhost:5173/add');
			await page.waitForSelector('.add-page');

			// Click create category button
			await page.click('.create-category-btn');

			// Try to save without entering name
			await page.click('[data-testid="save-category-btn"]');

			// Should show error message
			await expect(page.locator('text=Name ist erforderlich')).toBeVisible();
		});

		test('should close dialog on cancel', async ({ page }) => {
			await page.goto('http://localhost:5173/add');
			await page.waitForSelector('.add-page');

			// Click create category button
			await page.click('.create-category-btn');

			// Wait for dialog
			await expect(page.locator('[data-testid="category-name-input"]')).toBeVisible();

			// Click cancel/close button
			await page.click('button:has-text("Abbrechen")');

			// Dialog should close
			await expect(page.locator('[data-testid="category-name-input"]')).not.toBeVisible();
		});
	});

	test.describe('Password Input Toggle', () => {
		test('should show password toggle button on login page', async ({ page }) => {
			await page.goto('http://localhost:5173/login');

			// Check for password field
			const passwordInput = page.locator('#password');
			await expect(passwordInput).toBeVisible();
			await expect(passwordInput).toHaveAttribute('type', 'password');

			// Check for toggle button
			const toggleBtn = page.locator('button[aria-label="Passwort anzeigen"]');
			await expect(toggleBtn).toBeVisible();
		});

		test('should toggle password visibility when button clicked', async ({ page }) => {
			await page.goto('http://localhost:5173/login');

			const passwordInput = page.locator('#password');
			const toggleBtn = page.locator('.toggle-btn');

			// Initially should be password type
			await expect(passwordInput).toHaveAttribute('type', 'password');

			// Click toggle button
			await toggleBtn.click();

			// Should now be text type
			await expect(passwordInput).toHaveAttribute('type', 'text');

			// Toggle button aria-label should change
			await expect(page.locator('button[aria-label="Passwort verbergen"]')).toBeVisible();

			// Click again to hide
			await toggleBtn.click();

			// Should be back to password type
			await expect(passwordInput).toHaveAttribute('type', 'password');
		});

		test('should show password text when toggled', async ({ page }) => {
			await page.goto('http://localhost:5173/login');

			const passwordInput = page.locator('#password');
			const toggleBtn = page.locator('.toggle-btn');

			// Enter a password
			await passwordInput.fill('testpassword123');

			// Initially password is hidden (type=password)
			await expect(passwordInput).toHaveAttribute('type', 'password');

			// Toggle to show
			await toggleBtn.click();

			// Password should be visible (type=text)
			await expect(passwordInput).toHaveAttribute('type', 'text');
			await expect(passwordInput).toHaveValue('testpassword123');
		});
	});
});
