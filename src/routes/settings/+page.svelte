<!--
  Settings Tab - Categories and work time models
  
  Spec refs:
  - ui-logic-spec-v1.md Section 7 (Kategorien)
  - ui-logic-spec-v1.md Section 8-9 (Arbeitszeitmodelle)
  
  Order (per spec):
  1. Kategorien section with list and add button
  2. Arbeitszeitmodelle section with list and add button
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { categories, workTimeModels } from '$lib/stores';
	import { getAllEmployers, deleteEmployer } from '$lib/storage/employers';
	import { userProfile, userPlan } from '$lib/stores/user';
	import { logout } from '$lib/api/auth';
	import {
		theme,
		shape,
		setTheme,
		setShape,
		type ThemeValue,
		type ShapeValue
	} from '$lib/stores/theme';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { deleteUserCategoryWithSync, deleteWorkTimeModel } from '$lib/storage/operations';
	import { downloadCategoriesFile } from '$lib/utils/categoryIO';
	import { deleteAccount } from '$lib/api/auth';
	import { clearSession } from '$lib/stores/auth';
	import type { Category, WorkTimeModel, Employer } from '$lib/types';
	import AddCategoryModal from '$lib/components/AddCategoryModal.svelte';
	import AddWorkTimeModelModal from '$lib/components/AddWorkTimeModelModal.svelte';
	import ImportCategoriesModal from '$lib/components/ImportCategoriesModal.svelte';
	import ImportExcelModal from '$lib/components/ImportExcelModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import PlanComparison from '$lib/components/PlanComparison.svelte';
	import EmployerDialog from '$lib/components/EmployerDialog.svelte';

	function calculateModelTotalHours(model: WorkTimeModel): number {
		const days = [
			model.monday,
			model.tuesday,
			model.wednesday,
			model.thursday,
			model.friday,
			model.saturday,
			model.sunday
		];
		return days.reduce((sum: number, h) => sum + (h ?? 0), 0);
	}

	function countModelWorkdays(model: WorkTimeModel): number {
		const workdays = [
			model.mondayIsWorkday ?? (model.monday !== null && model.monday > 0),
			model.tuesdayIsWorkday ?? (model.tuesday !== null && model.tuesday > 0),
			model.wednesdayIsWorkday ?? (model.wednesday !== null && model.wednesday > 0),
			model.thursdayIsWorkday ?? (model.thursday !== null && model.thursday > 0),
			model.fridayIsWorkday ?? (model.friday !== null && model.friday > 0),
			model.saturdayIsWorkday ?? (model.saturday !== null && model.saturday > 0),
			model.sundayIsWorkday ?? (model.sunday !== null && model.sunday > 0)
		];
		return workdays.filter(Boolean).length;
	}

	// Split categories: absence (system + non-work) vs work categories
	let abwesenheitskategorien = $derived(() => {
		return $categories
			.filter((c) => !c.countsAsWorkTime)
			.sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	let arbeitskategorien = $derived(() => {
		return $categories
			.filter((c) => c.countsAsWorkTime)
			.sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	let loading = $state(true);
	let appVersion = $state('');
	let buildTime = $state('');
	let showAddCategory = $state(false);
	let showAddAbsenceCategory = $state(false);
	let showAddWorkTimeModel = $state(false);
	let showImportCategories = $state(false);
	let showImportExcel = $state(false);
	let showExportDialog = $state(false);
	let showPlanComparison = $state(false);
	let showDeleteConfirm = $state(false);
	let showDeleteModelConfirm = $state(false);
	let categoryToDelete: Category | null = $state(null);
	let modelToDelete: WorkTimeModel | null = $state(null);
	let modelToEdit: WorkTimeModel | null = $state(null);
	let showCategoryMenu = $state(false);
	let showDeleteAccountConfirm = $state(false);
	let showLogoutConfirm = $state(false);
	let showEmployerDialog = $state(false);
	let employerToEdit: Employer | undefined = $state(undefined);
	let showDeleteEmployerConfirm = $state(false);
	let employerToDelete: Employer | null = $state(null);
	let employers = $state<Employer[]>([]);
	let logoutInProgress = $state(false);
	let expandedSections = $state({
		employers: true,
		workTimeModels: true,
		abwesenheit: true,
		arbeit: true
	});
	let currentTheme = $state<ThemeValue>('cool');
	let currentShape = $state<ShapeValue>('soft');

	// Subscribe to theme and shape stores
	$effect(() => {
		const unsubTheme = theme.subscribe((value) => {
			currentTheme = value;
		});
		const unsubShape = shape.subscribe((value) => {
			currentShape = value;
		});
		return () => {
			unsubTheme();
			unsubShape();
		};
	});

	function handleThemeChange(newTheme: ThemeValue) {
		setTheme(newTheme);
	}

	function handleShapeChange(newShape: ShapeValue) {
		setShape(newShape);
	}

	let deleteAccountInProgress = $state(false);
	let deleteAccountError = $state<string | null>(null);

	function closeCategoryMenu(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.menu-container')) {
			showCategoryMenu = false;
		}
	}

	function handleEditModel(model: WorkTimeModel) {
		modelToEdit = model;
		showAddWorkTimeModel = true;
	}

	function closeModelModal() {
		showAddWorkTimeModel = false;
		modelToEdit = null;
	}

	function handleDeleteCategory(category: Category) {
		if (category.type === 'system') return;
		categoryToDelete = category;
		showDeleteConfirm = true;
	}

	async function confirmDeleteCategory(retryCount = 0) {
		if (!categoryToDelete) return;
		const maxRetries = 3;
		const catId = categoryToDelete.id;

		try {
			await deleteUserCategoryWithSync(catId);
			categories.update((cats) => cats.filter((c) => c.id !== catId));
			showDeleteConfirm = false;
			categoryToDelete = null;
		} catch (e) {
			console.error(`Failed to delete category (attempt ${retryCount + 1}/${maxRetries}):`, e);
			if (retryCount < maxRetries - 1) {
				await new Promise((r) => setTimeout(r, 500));
				return confirmDeleteCategory(retryCount + 1);
			}
			console.error('Delete failed after all retries - user can try again manually');
			showDeleteConfirm = false;
			categoryToDelete = null;
		}
	}

	function cancelDeleteCategory() {
		showDeleteConfirm = false;
		categoryToDelete = null;
	}

	function handleDeleteModel(model: WorkTimeModel) {
		modelToDelete = model;
		showDeleteModelConfirm = true;
	}

	async function confirmDeleteModel() {
		if (!modelToDelete) return;
		const modelId = modelToDelete.id;

		try {
			await deleteWorkTimeModel(modelId);
			workTimeModels.update((models) => models.filter((m) => m.id !== modelId));
			showDeleteModelConfirm = false;
			modelToDelete = null;
		} catch (e) {
			console.error('Failed to delete work time model:', e);
			showDeleteModelConfirm = false;
			modelToDelete = null;
		}
	}

	function cancelDeleteModel() {
		showDeleteModelConfirm = false;
		modelToDelete = null;
	}

	onMount(async () => {
		await initializeCategories();
		const allCategories = await getAll<Category>('categories');
		categories.set(allCategories);
		const allModels = await getAll<WorkTimeModel>('workTimeModels');
		workTimeModels.set(allModels);
		employers = await getAllEmployers();
		loading = false;

		if (browser) {
			try {
				const response = await fetch('/version.json');
				const versionInfo = await response.json();
				appVersion = versionInfo.version;
				buildTime = new Date(versionInfo.buildTime).toLocaleString('de-DE');
			} catch {
				appVersion = 'unbekannt';
			}
		}
	});

	async function handleLogout() {
		logoutInProgress = true;
		try {
			await logout();
			await clearSession();
			goto(resolve('/login'));
		} catch (e) {
			console.error('[Settings] Logout failed:', e);
			logoutInProgress = false;
		}
	}

	function handlePlanChange() {
		showPlanComparison = true;
	}

	function handleAddEmployer() {
		employerToEdit = undefined;
		showEmployerDialog = true;
	}

	function handleEditEmployer(employer: Employer) {
		employerToEdit = employer;
		showEmployerDialog = true;
	}

	function handleDeleteEmployer(employer: Employer) {
		employerToDelete = employer;
		showDeleteEmployerConfirm = true;
	}

	async function confirmDeleteEmployer() {
		if (!employerToDelete) return;
		const employerId = employerToDelete.id;

		try {
			await deleteEmployer(employerId);
			employers = employers.map((emp) =>
				emp.id === employerId ? { ...emp, isActive: false } : emp
			);
			showDeleteEmployerConfirm = false;
			employerToDelete = null;
		} catch (err) {
			console.error('[Settings] Delete employer failed:', err);
			showDeleteEmployerConfirm = false;
			employerToDelete = null;
		}
	}

	function cancelDeleteEmployer() {
		showDeleteEmployerConfirm = false;
		employerToDelete = null;
	}

	async function handleEmployerSaved(savedEmployer: Employer) {
		const existingIndex = employers.findIndex((emp) => emp.id === savedEmployer.id);
		if (existingIndex >= 0) {
			employers = employers.map((emp) => (emp.id === savedEmployer.id ? savedEmployer : emp));
		} else {
			employers = [...employers, savedEmployer];
		}
		showEmployerDialog = false;
		employerToEdit = undefined;
	}

	function closeEmployerDialog() {
		showEmployerDialog = false;
		employerToEdit = undefined;
	}

	async function handleDeleteAccount() {
		deleteAccountError = null;
		deleteAccountInProgress = true;

		try {
			await deleteAccount();
			await clearSession();
			goto(resolve('/login'));
		} catch (e) {
			console.error('[Settings] Delete account failed:', e);
			deleteAccountError = e instanceof Error ? e.message : 'Konto konnte nicht gelöscht werden';
			deleteAccountInProgress = false;
		}
	}
</script>

<svelte:window onclick={closeCategoryMenu} />

<div class="settings-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Konto Section -->
		<section class="section" data-testid="account-section">
			<div class="section-header">
				<h2>Konto</h2>
			</div>
			<div class="account-info">
				<div class="account-row">
					<span class="account-label">E-Mail</span>
					<span class="account-value" data-testid="account-email"
						>{$userProfile?.email ?? 'Nicht angemeldet'}</span
					>
				</div>
				<div class="account-row">
					<span class="account-label">Plan</span>
					<span
						class="account-value plan-badge"
						class:pro={$userPlan === 'pro'}
						data-testid="account-plan"
					>
						{$userPlan === 'pro' ? 'Pro' : 'Free'}
					</span>
				</div>
			</div>
			<div class="account-actions">
				<button class="secondary-btn" onclick={handlePlanChange} data-testid="change-plan-btn">
					Plan ändern
				</button>
				<button
					class="secondary-btn logout-btn"
					onclick={() => (showLogoutConfirm = true)}
					disabled={logoutInProgress}
					data-testid="logout-btn"
				>
					{logoutInProgress ? 'Abmelden...' : 'Abmelden'}
				</button>
			</div>
		</section>

		<!-- Appearance Section -->
		<section class="section">
			<div class="section-header">
				<h2>Erscheinungsbild</h2>
			</div>
			<div class="theme-selector">
				<span class="theme-label">Farben</span>
				<div class="theme-toggle">
					<button
						class="theme-option"
						class:active={currentTheme === 'cool'}
						onclick={() => handleThemeChange('cool')}
					>
						Cool
					</button>
					<button
						class="theme-option"
						class:active={currentTheme === 'warm'}
						onclick={() => handleThemeChange('warm')}
					>
						Warm
					</button>
				</div>
			</div>
			<div class="theme-selector">
				<span class="theme-label">Ecken</span>
				<div class="theme-toggle">
					<button
						class="theme-option"
						class:active={currentShape === 'sharp'}
						onclick={() => handleShapeChange('sharp')}
					>
						Eckig
					</button>
					<button
						class="theme-option"
						class:active={currentShape === 'soft'}
						onclick={() => handleShapeChange('soft')}
					>
						Rund
					</button>
				</div>
			</div>
		</section>

		<!-- Arbeitgeber Section -->
		<section class="section" data-testid="employer-section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.employers = !expandedSections.employers)}
					aria-expanded={expandedSections.employers}
				>
					<span class="toggle-icon" class:expanded={expandedSections.employers}>▶</span>
					<h2>Arbeitgeber</h2>
				</button>
				<button
					class="icon-btn"
					onclick={handleAddEmployer}
					aria-label="Arbeitgeber hinzufügen"
					data-testid="add-employer-btn">+</button
				>
			</div>
			{#if expandedSections.employers}
				<div class="list" data-testid="employer-list">
					{#if employers.filter((emp) => emp.isActive).length === 0}
						<p class="empty">Keine Arbeitgeber vorhanden</p>
					{:else}
						{#each employers.filter((emp) => emp.isActive) as employer (employer.id)}
							<div
								class="list-item clickable"
								role="button"
								tabindex="0"
								data-testid="employer-item"
								onclick={() => handleEditEmployer(employer)}
								onkeydown={(event) => event.key === 'Enter' && handleEditEmployer(employer)}
							>
								<div class="item-info">
									<span class="item-name" data-testid="employer-name">{employer.name}</span>
								</div>
								<button
									class="delete-btn"
									aria-label="Löschen"
									data-testid="delete-employer-btn"
									onclick={(event) => {
										event.stopPropagation();
										handleDeleteEmployer(employer);
									}}>×</button
								>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Arbeitszeitmodelle Section (first - shorter list) -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.workTimeModels = !expandedSections.workTimeModels)}
					aria-expanded={expandedSections.workTimeModels}
				>
					<span class="toggle-icon" class:expanded={expandedSections.workTimeModels}>▶</span>
					<h2>Arbeitszeitmodelle</h2>
				</button>
				<button
					class="icon-btn"
					onclick={() => (showAddWorkTimeModel = true)}
					aria-label="Modell hinzufügen">+</button
				>
			</div>
			{#if expandedSections.workTimeModels}
				<div class="list">
					{#if $workTimeModels.length === 0}
						<p class="empty">Keine Arbeitszeitmodelle vorhanden</p>
					{:else}
						{#each $workTimeModels as model (model.id)}
							<div
								class="list-item clickable"
								role="button"
								tabindex="0"
								onclick={() => handleEditModel(model)}
								onkeydown={(e) => e.key === 'Enter' && handleEditModel(model)}
							>
								<div class="item-info">
									<span class="item-name">{model.name}</span>
									<span class="item-detail">
										{calculateModelTotalHours(model)}h/Woche • {countModelWorkdays(model)} Tage • ab {model.validFrom}
									</span>
								</div>
								<button
									class="delete-btn"
									aria-label="Löschen"
									onclick={(e) => {
										e.stopPropagation();
										handleDeleteModel(model);
									}}>×</button
								>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Abwesenheitskategorien Section -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.abwesenheit = !expandedSections.abwesenheit)}
					aria-expanded={expandedSections.abwesenheit}
				>
					<span class="toggle-icon" class:expanded={expandedSections.abwesenheit}>▶</span>
					<h2>Abwesenheitskategorien</h2>
				</button>
				<button
					class="icon-btn"
					aria-label="Abwesenheitskategorie hinzufügen"
					onclick={() => (showAddAbsenceCategory = true)}>+</button
				>
			</div>
			{#if expandedSections.abwesenheit}
				<div class="list">
					{#if abwesenheitskategorien().length === 0}
						<p class="empty">Keine Abwesenheitskategorien vorhanden</p>
					{:else}
						{#each abwesenheitskategorien() as category (category.id)}
							<div
								class="list-item"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="false"
							>
								<div class="item-info">
									<span class="item-name" data-testid="category-name">{category.name}</span>
								</div>
								{#if category.type !== 'system'}
									<button
										class="delete-btn"
										aria-label="Löschen"
										data-testid="delete-category-btn"
										onclick={() => handleDeleteCategory(category)}>×</button
									>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Arbeitskategorien Section -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.arbeit = !expandedSections.arbeit)}
					aria-expanded={expandedSections.arbeit}
				>
					<span class="toggle-icon" class:expanded={expandedSections.arbeit}>▶</span>
					<h2>Arbeitskategorien</h2>
				</button>
				<div class="header-buttons">
					<div class="menu-container">
						<button
							class="menu-btn"
							data-testid="category-menu-btn"
							onclick={() => (showCategoryMenu = !showCategoryMenu)}
							aria-label="Menü"
						>
							⋮
						</button>
						{#if showCategoryMenu}
							<div class="dropdown-menu">
								<button
									class="dropdown-item"
									data-testid="add-category-menu-item"
									onclick={() => {
										showAddCategory = true;
										showCategoryMenu = false;
									}}
								>
									<span class="dropdown-icon">+</span>
									<span>Hinzufügen</span>
								</button>
								<button
									class="dropdown-item"
									onclick={() => {
										showImportCategories = true;
										showCategoryMenu = false;
									}}
								>
									<span class="dropdown-icon">←</span>
									<span>Importieren</span>
								</button>
								<button
									class="dropdown-item"
									onclick={() => {
										downloadCategoriesFile($categories);
										showCategoryMenu = false;
									}}
								>
									<span class="dropdown-icon">→</span>
									<span>Exportieren</span>
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
			{#if expandedSections.arbeit}
				<div class="list" data-testid="category-list">
					{#if arbeitskategorien().length === 0}
						<p class="empty">Keine Arbeitskategorien vorhanden</p>
					{:else}
						{#each arbeitskategorien() as category (category.id)}
							<div
								class="list-item"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="true"
							>
								<div class="item-info">
									<span class="item-name" data-testid="category-name">{category.name}</span>
								</div>
								{#if category.type !== 'system'}
									<button
										class="delete-btn"
										aria-label="Löschen"
										data-testid="delete-category-btn"
										onclick={() => handleDeleteCategory(category)}>×</button
									>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Daten Section (Export/Import) -->
		<section class="section" data-testid="data-section">
			<div class="section-header">
				<h2>Daten</h2>
			</div>
			<div class="data-actions">
				<button class="data-btn" onclick={() => (showExportDialog = true)} data-testid="export-btn">
					Exportieren
				</button>
				<button class="data-btn" onclick={() => goto(resolve('/import'))} data-testid="import-btn">
					Importieren
				</button>
				<button class="data-btn secondary" onclick={() => (showImportExcel = true)}>
					Excel-Datei importieren
				</button>
			</div>
		</section>

		<!-- Version Section -->
		<section class="section version-section">
			<div class="version-info">
				<span class="version-label">Version {appVersion}</span>
				{#if buildTime}
					<span class="build-time">Build: {buildTime}</span>
				{/if}
			</div>
		</section>

		<!-- Delete Account Section -->
		<section class="section delete-account-section">
			<button
				class="delete-account-btn"
				onclick={() => (showDeleteAccountConfirm = true)}
				disabled={deleteAccountInProgress}
			>
				{deleteAccountInProgress ? 'Wird gelöscht...' : 'Konto löschen'}
			</button>
			{#if deleteAccountError}
				<span class="delete-account-error">{deleteAccountError}</span>
			{/if}
		</section>
	{/if}
</div>

<!-- Add Work Category Modal -->
{#if showAddCategory}
	<AddCategoryModal
		title="Neue Arbeitskategorie"
		countsAsWorkTime={true}
		onsave={() => (showAddCategory = false)}
		onclose={() => (showAddCategory = false)}
	/>
{/if}

<!-- Add Absence Category Modal -->
{#if showAddAbsenceCategory}
	<AddCategoryModal
		title="Neue Abwesenheitskategorie"
		countsAsWorkTime={false}
		onsave={() => (showAddAbsenceCategory = false)}
		onclose={() => (showAddAbsenceCategory = false)}
	/>
{/if}

<!-- Import Categories Modal -->
{#if showImportCategories}
	<ImportCategoriesModal
		onsave={() => (showImportCategories = false)}
		onclose={() => (showImportCategories = false)}
	/>
{/if}

<!-- Import Excel Modal -->
{#if showImportExcel}
	<ImportExcelModal onclose={() => (showImportExcel = false)} />
{/if}

<!-- Add/Edit Work Time Model Modal -->
{#if showAddWorkTimeModel}
	<AddWorkTimeModelModal model={modelToEdit} onsave={closeModelModal} onclose={closeModelModal} />
{/if}

<!-- Delete Category Confirmation -->
{#if showDeleteConfirm && categoryToDelete}
	<ConfirmDialog
		title="Kategorie löschen"
		message={`Kategorie "${categoryToDelete.name}" wirklich löschen?`}
		confirmLabel="Löschen"
		confirmStyle="danger"
		onconfirm={confirmDeleteCategory}
		oncancel={cancelDeleteCategory}
	/>
{/if}

<!-- Delete Work Time Model Confirmation -->
{#if showDeleteModelConfirm && modelToDelete}
	<ConfirmDialog
		title="Arbeitszeitmodell löschen"
		message={`Arbeitszeitmodell "${modelToDelete.name}" wirklich löschen?`}
		confirmLabel="Löschen"
		confirmStyle="danger"
		onconfirm={confirmDeleteModel}
		oncancel={cancelDeleteModel}
	/>
{/if}

<!-- Logout Confirmation -->
{#if showLogoutConfirm}
	<ConfirmDialog
		title="Abmelden"
		message="Möchten Sie sich wirklich abmelden? Ihre lokalen Daten bleiben erhalten."
		confirmLabel="Abmelden"
		onconfirm={handleLogout}
		oncancel={() => (showLogoutConfirm = false)}
	/>
{/if}

<!-- Delete Account Confirmation -->
{#if showDeleteAccountConfirm}
	<ConfirmDialog
		title="Konto löschen"
		message="Möchten Sie Ihr Konto wirklich unwiderruflich löschen? Alle Ihre Daten werden gelöscht und können nicht wiederhergestellt werden."
		confirmLabel="Konto löschen"
		confirmStyle="danger"
		onconfirm={handleDeleteAccount}
		oncancel={() => (showDeleteAccountConfirm = false)}
	/>
{/if}

<!-- Export Dialog -->
{#if showExportDialog}
	<ExportDialog onclose={() => (showExportDialog = false)} />
{/if}

<!-- Plan Comparison Modal -->
{#if showPlanComparison}
	<PlanComparison onclose={() => (showPlanComparison = false)} />
{/if}

<!-- Employer Dialog (Add/Edit) -->
{#if showEmployerDialog}
	<EmployerDialog
		employer={employerToEdit}
		onsave={handleEmployerSaved}
		onclose={closeEmployerDialog}
	/>
{/if}

<!-- Delete Employer Confirmation -->
{#if showDeleteEmployerConfirm && employerToDelete}
	<ConfirmDialog
		title="Arbeitgeber löschen"
		message={`Arbeitgeber "${employerToDelete.name}" wirklich löschen?`}
		confirmLabel="Löschen"
		confirmStyle="danger"
		onconfirm={confirmDeleteEmployer}
		oncancel={cancelDeleteEmployer}
	/>
{/if}

<style>
	.settings-page {
		padding: 1rem;
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: 2rem;
		color: var(--muted);
	}

	.theme-selector {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--r-card);
	}

	.theme-label {
		font-weight: 500;
		color: var(--text);
	}

	.theme-toggle {
		display: flex;
		gap: 0;
		border-radius: var(--r-pill);
		overflow: hidden;
		border: 1px solid var(--border);
	}

	.theme-option {
		padding: 0.5rem 1rem;
		border: none;
		background: var(--surface);
		color: var(--muted);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.theme-option:first-child {
		border-right: 1px solid var(--border);
	}

	.theme-option:hover:not(.active) {
		background: var(--surface-hover);
	}

	.theme-option.active {
		background: var(--accent);
		color: white;
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 1rem;
	}

	.section-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text);
	}

	.section-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
	}

	.section-toggle:hover h2 {
		color: var(--accent);
	}

	.toggle-icon {
		font-size: 0.75rem;
		color: var(--muted);
		transition: transform var(--transition-normal);
	}

	.toggle-icon.expanded {
		transform: rotate(90deg);
	}

	.header-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.icon-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--r-btn);
		background: transparent;
		color: var(--accent);
		font-size: 1.5rem;
		font-weight: 300;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-btn:hover {
		background: var(--accent-light);
	}

	.menu-container {
		position: relative;
	}

	.menu-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--r-btn);
		background: transparent;
		color: var(--muted);
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-btn:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--r-card);
		box-shadow: var(--elev-2);
		z-index: 100;
		min-width: 140px;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.75rem 1rem;
		border: none;
		background: var(--surface);
		color: var(--text);
		font-size: 0.9rem;
		text-align: left;
		cursor: pointer;
	}

	.dropdown-icon {
		width: 1rem;
		text-align: center;
		flex-shrink: 0;
	}

	.dropdown-item:hover {
		background: var(--surface-hover);
	}

	.dropdown-item:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty {
		text-align: center;
		color: var(--muted);
		padding: 1rem;
		margin: 0;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--r-card);
	}

	.list-item.clickable {
		cursor: pointer;
	}

	.list-item.clickable:hover {
		background: var(--surface-hover);
		border-color: var(--card-hover-border);
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.item-name {
		font-weight: 500;
		color: var(--text);
	}

	.item-detail {
		font-size: 0.85rem;
		color: var(--muted);
	}

	.delete-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--r-btn);
		background: transparent;
		color: var(--neg);
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		background: var(--neg-light);
	}

	.version-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.version-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: var(--muted);
		font-size: 0.85rem;
	}

	.version-label {
		font-weight: 500;
	}

	.build-time {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.delete-account-section {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.delete-account-btn {
		width: 100%;
		padding: 0.875rem;
		background: var(--btn-danger-bg);
		color: var(--btn-danger-text);
		border: none;
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.delete-account-btn:hover:not(:disabled) {
		background: var(--btn-danger-hover);
	}

	.delete-account-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.delete-account-error {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--neg);
		text-align: center;
	}

	.data-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.data-btn {
		width: 100%;
		padding: 0.875rem;
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		border: none;
		border-radius: var(--r-btn);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.data-btn:hover {
		background: var(--btn-primary-hover);
	}

	.data-btn.secondary {
		background: var(--card-bg);
		color: var(--fg);
		border: 1px solid var(--card-border);
	}

	.data-btn.secondary:hover {
		background: var(--card-bg-hover);
	}

	.account-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--r-card);
	}

	.account-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.account-label {
		font-weight: 500;
		color: var(--muted);
	}

	.account-value {
		color: var(--text);
	}

	.plan-badge {
		padding: 0.25rem 0.75rem;
		border-radius: var(--r-pill);
		background: var(--surface);
		font-weight: 500;
		font-size: 0.85rem;
	}

	.plan-badge.pro {
		background: var(--accent);
		color: white;
	}

	.account-actions {
		display: flex;
		gap: 0.75rem;
	}

	.secondary-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: var(--r-btn);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.secondary-btn:hover:not(:disabled) {
		background: var(--surface-hover);
		border-color: var(--card-hover-border);
	}

	.secondary-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.secondary-btn.logout-btn {
		color: var(--neg);
		border-color: var(--neg);
	}

	.secondary-btn.logout-btn:hover:not(:disabled) {
		background: var(--neg-light);
	}
</style>
