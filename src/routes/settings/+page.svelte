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
	import { categories, workTimeModels, employers as employersStore } from '$lib/stores';
	import { getAllEmployers, deleteEmployer } from '$lib/storage/employers';
	import { userProfile, userPlan, userFullName } from '$lib/stores/user';
	import { logout } from '$lib/api/auth';
	import {
		theme,
		shape,
		setTheme,
		setShape,
		THEME_OPTIONS,
		type ThemeValue,
		type ShapeValue
	} from '$lib/stores/theme';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import {
		deleteUserCategoryWithSync,
		deleteWorkTimeModel,
		deleteAllUserCategories,
		deleteAllTimeEntries
	} from '$lib/storage/operations';
	import { timeEntries } from '$lib/stores';
	import { downloadCategoriesFile } from '$lib/utils/categoryIO';
	import { deleteAccount } from '$lib/api/auth';
	import { clearSession } from '$lib/stores/auth';
	import type { Category, WorkTimeModel, Employer } from '$lib/types';
	import CategoryDialog from '$lib/components/CategoryDialog.svelte';
	import AddWorkTimeModelModal from '$lib/components/AddWorkTimeModelModal.svelte';
	import ImportCategoriesModal from '$lib/components/ImportCategoriesModal.svelte';
	import ImportExcelModal from '$lib/components/ImportExcelModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import PlanComparison from '$lib/components/PlanComparison.svelte';
	import EmployerDialog from '$lib/components/EmployerDialog.svelte';
	import StundenzettelExport from '$lib/components/StundenzettelExport.svelte';
	import NameEditDialog from '$lib/components/NameEditDialog.svelte';
	import EmailEditDialog from '$lib/components/EmailEditDialog.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';

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
	let abwesenheit = $derived(() => {
		return $categories
			.filter((c) => !c.countsAsWorkTime)
			.sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	let taetigkeiten = $derived(() => {
		return $categories
			.filter((c) => c.countsAsWorkTime)
			.sort((a, b) => a.name.localeCompare(b.name, 'de'));
	});

	// Get employer name by ID for display
	function getEmployerName(employerId: string | null | undefined): string {
		if (!employerId) return 'Alle';
		const employer = employers.find((emp) => emp.id === employerId);
		return employer?.name ?? 'Unbekannt';
	}

	let loading = $state(true);
	let appVersion = $state('');
	let buildTime = $state('');
	let showAddCategory = $state(false);
	let showAddAbsenceCategory = $state(false);
	let showAddWorkTimeModel = $state(false);
	let showImportCategories = $state(false);
	let showImportExcel = $state(false);
	let showExportDialog = $state(false);
	let showStundenzettelExport = $state(false);
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
	let showCategoryDialog = $state(false);
	let categoryToEdit: Category | null = $state(null);
	let showNameEditDialog = $state(false);
	let showEmailEditDialog = $state(false);
	let showDeleteAllCategoriesConfirm = $state(false);
	let showDeleteAllTimeEntriesConfirm = $state(false);
	let deleteAllInProgress = $state(false);
	let expandedSections = $state({
		employers: false,
		workTimeModels: false,
		abwesenheit: false,
		arbeit: false
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

	function handleEditCategory(category: Category) {
		categoryToEdit = category;
		showCategoryDialog = true;
	}

	function closeCategoryDialog() {
		showCategoryDialog = false;
		categoryToEdit = null;
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
		employersStore.set(employers);
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
		showLogoutConfirm = false;
		try {
			await logout();
			await clearSession();
			goto(resolve('/login') + '?logout=1');
		} catch (e) {
			console.error('[Settings] Logout failed:', e);
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
			employersStore.set(employers);
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
		// Also update global store so EmployerSelector in header updates
		employersStore.set(employers);
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

	async function handleDeleteAllCategories() {
		deleteAllInProgress = true;
		showDeleteAllCategoriesConfirm = false;
		try {
			const result = await deleteAllUserCategories($categories);
			// Reload categories from IndexedDB
			const allCategories = await getAll<Category>('categories');
			categories.set(allCategories);
			console.log(`[Settings] Deleted ${result.deleted} categories`);
		} catch (e) {
			console.error('[Settings] Delete all categories failed:', e);
		} finally {
			deleteAllInProgress = false;
		}
	}

	async function handleDeleteAllTimeEntries() {
		deleteAllInProgress = true;
		showDeleteAllTimeEntriesConfirm = false;
		try {
			const result = await deleteAllTimeEntries($timeEntries);
			// Clear time entries store
			timeEntries.set([]);
			console.log(`[Settings] Deleted ${result.deleted} time entries`);
		} catch (e) {
			console.error('[Settings] Delete all time entries failed:', e);
		} finally {
			deleteAllInProgress = false;
		}
	}
</script>

<svelte:window onclick={closeCategoryMenu} />

<div class="settings-page">
	<!-- Page Header -->
	<div class="page-header">
		<h1>Einstellungen</h1>
	</div>

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
					<span class="account-label">Name</span>
					<div class="account-value-with-edit">
						<span class="account-value" data-testid="account-name">
							{$userFullName || 'Nicht festgelegt'}
						</span>
						<button
							class="edit-btn"
							aria-label="Name bearbeiten"
							onclick={() => (showNameEditDialog = true)}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
					</div>
				</div>
				<div class="account-row">
					<span class="account-label">E-Mail</span>
					<div class="account-value-with-edit">
						<span class="account-value" data-testid="account-email">
							{$userProfile?.email ?? 'Nicht angemeldet'}
						</span>
						<button
							class="edit-btn"
							aria-label="E-Mail bearbeiten"
							onclick={() => (showEmailEditDialog = true)}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
					</div>
				</div>
				<div class="account-row">
					<span class="account-label">Plan</span>
					<div class="account-value-with-edit">
						<span
							class="account-value plan-text"
							class:pro={$userPlan === 'pro'}
							data-testid="account-plan"
						>
							{$userPlan === 'pro' ? 'Pro' : 'Free'}
						</span>
						<button
							class="edit-btn"
							aria-label="Plan ändern"
							onclick={handlePlanChange}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Appearance Section -->
		<section class="section">
			<div class="section-header">
				<h2>Erscheinungsbild</h2>
			</div>
			<div class="theme-selector">
				<span class="theme-label">Farben</span>
				<select
					class="theme-dropdown"
					value={currentTheme}
					onchange={(e) => handleThemeChange(e.currentTarget.value as ThemeValue)}
				>
					{#each THEME_OPTIONS as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
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
									}}
									><svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg></button
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
									}}
									><svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg></button
								>
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Abwesenheit Section -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.abwesenheit = !expandedSections.abwesenheit)}
					aria-expanded={expandedSections.abwesenheit}
				>
					<span class="toggle-icon" class:expanded={expandedSections.abwesenheit}>▶</span>
					<h2>Abwesenheit</h2>
				</button>
				<button
					class="icon-btn"
					aria-label="Abwesenheitskategorie hinzufügen"
					onclick={() => (showAddAbsenceCategory = true)}>+</button
				>
			</div>
			{#if expandedSections.abwesenheit}
				<div class="list">
					{#if abwesenheit().length === 0}
						<p class="empty">Keine Abwesenheit vorhanden</p>
					{:else}
						{#each abwesenheit() as category (category.id)}
							<div
								class="list-item clickable"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="false"
								role="button"
								tabindex="0"
								onclick={() => handleEditCategory(category)}
								onkeydown={(event) => event.key === 'Enter' && handleEditCategory(category)}
							>
								<div class="item-info">
									<span class="item-name" data-testid="category-name">
										{category.name}
										<CategoryBadge countsAsWorkTime={category.countsAsWorkTime} />
									</span>
								</div>
								{#if category.type !== 'system'}
									<button
										class="delete-btn"
										aria-label="Löschen"
										data-testid="delete-category-btn"
										onclick={(event) => {
											event.stopPropagation();
											handleDeleteCategory(category);
										}}
										><svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="3 6 5 6 21 6"></polyline>
											<path
												d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
											></path>
										</svg></button
									>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			{/if}
		</section>

		<!-- Tätigkeiten Section -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.arbeit = !expandedSections.arbeit)}
					aria-expanded={expandedSections.arbeit}
				>
					<span class="toggle-icon" class:expanded={expandedSections.arbeit}>▶</span>
					<h2>Tätigkeiten</h2>
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
								<button
									class="dropdown-item dropdown-item-danger"
									onclick={() => {
										showDeleteAllCategoriesConfirm = true;
										showCategoryMenu = false;
									}}
								>
									<span class="dropdown-icon">🗑</span>
									<span>Löschen</span>
								</button>
							</div>
						{/if}
					</div>
				</div>
			</div>
			{#if expandedSections.arbeit}
				<div class="list" data-testid="category-list">
					{#if taetigkeiten().length === 0}
						<p class="empty">Keine Tätigkeiten vorhanden</p>
					{:else}
						{#each taetigkeiten() as category (category.id)}
							<div
								class="list-item clickable"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="true"
								role="button"
								tabindex="0"
								onclick={() => handleEditCategory(category)}
								onkeydown={(event) => event.key === 'Enter' && handleEditCategory(category)}
							>
								<div class="item-info">
									<span class="item-name" data-testid="category-name">{category.name}</span>
									{#if category.employerId}
										<span class="item-employer">{getEmployerName(category.employerId)}</span>
									{/if}
								</div>
								{#if category.type !== 'system'}
									<button
										class="delete-btn"
										aria-label="Löschen"
										data-testid="delete-category-btn"
										onclick={(event) => {
											event.stopPropagation();
											handleDeleteCategory(category);
										}}
										><svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<polyline points="3 6 5 6 21 6"></polyline>
											<path
												d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
											></path>
										</svg></button
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
				<h2>Zeitdaten</h2>
			</div>
			<div class="data-actions">
				<button class="data-btn" onclick={() => (showExportDialog = true)} data-testid="export-btn">
					Exportieren
				</button>
				<button
					class="data-btn"
					onclick={() => (showStundenzettelExport = true)}
					data-testid="stundenzettel-export-btn"
				>
					Stundenzettel
				</button>
				<button class="data-btn" onclick={() => goto(resolve('/import'))} data-testid="import-btn">
					Importieren
				</button>
				<button class="data-btn secondary" onclick={() => (showImportExcel = true)}>
					Excel-Datei importieren
				</button>
				<button
					class="data-btn danger"
					onclick={() => (showDeleteAllTimeEntriesConfirm = true)}
					disabled={deleteAllInProgress}
				>
					{deleteAllInProgress ? 'Wird gelöscht...' : 'Zeitdaten löschen'}
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
	<CategoryDialog
		mode="create"
		categoryType="user"
		onsave={() => (showAddCategory = false)}
		onclose={() => (showAddCategory = false)}
	/>
{/if}

<!-- Add Absence Category Modal -->
{#if showAddAbsenceCategory}
	<CategoryDialog
		mode="create"
		categoryType="user"
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

<!-- Stundenzettel Export Dialog -->
{#if showStundenzettelExport}
	<StundenzettelExport
		onclose={() => (showStundenzettelExport = false)}
		onexport={(data) => {
			console.log('[Settings] Stundenzettel export data:', data);
			showStundenzettelExport = false;
		}}
	/>
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

<!-- Category Dialog (Edit) -->
{#if showCategoryDialog && categoryToEdit}
	<CategoryDialog
		category={categoryToEdit}
		onsave={closeCategoryDialog}
		onclose={closeCategoryDialog}
	/>
{/if}

<!-- Name Edit Dialog -->
{#if showNameEditDialog}
	<NameEditDialog onclose={() => (showNameEditDialog = false)} />
{/if}

<!-- Email Edit Dialog -->
{#if showEmailEditDialog}
	<EmailEditDialog onclose={() => (showEmailEditDialog = false)} />
{/if}

<!-- Delete All Categories Confirmation -->
{#if showDeleteAllCategoriesConfirm}
	<ConfirmDialog
		title="Alle Tätigkeiten löschen"
		message="Möchten Sie wirklich alle Tätigkeiten löschen? Diese Aktion kann nicht rückgängig gemacht werden."
		confirmLabel="Alle löschen"
		confirmStyle="danger"
		onconfirm={handleDeleteAllCategories}
		oncancel={() => (showDeleteAllCategoriesConfirm = false)}
	/>
{/if}

<!-- Delete All Time Entries Confirmation -->
{#if showDeleteAllTimeEntriesConfirm}
	<ConfirmDialog
		title="Alle Zeitdaten löschen"
		message="Möchten Sie wirklich alle Zeitdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden."
		confirmLabel="Alle löschen"
		confirmStyle="danger"
		onconfirm={handleDeleteAllTimeEntries}
		oncancel={() => (showDeleteAllTimeEntriesConfirm = false)}
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

	.page-header {
		padding: 0.75rem 1rem;
		background-color: var(--summary-bg);
		border-radius: var(--r-card);
		border: 1px solid var(--border);
		text-align: center;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text);
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

	.theme-dropdown {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: var(--r-input);
		background: var(--input-bg);
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		min-width: 100px;
	}

	.theme-dropdown:hover {
		border-color: var(--input-border-hover, var(--border));
	}

	.theme-dropdown:focus {
		outline: none;
		border-color: var(--input-focus-border);
		box-shadow: var(--focus-ring);
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

	.item-employer {
		font-size: 0.8rem;
		color: var(--accent);
		font-weight: 400;
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

	.data-btn.danger {
		background: var(--btn-danger-bg);
		color: var(--btn-danger-text);
	}

	.data-btn.danger:hover:not(:disabled) {
		background: var(--btn-danger-hover);
	}

	.data-btn.danger:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.dropdown-item-danger {
		color: var(--neg);
	}

	.dropdown-item-danger:hover {
		background: var(--neg-light);
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

	.account-value-with-edit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.edit-btn {
		padding: 0.25rem;
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--r-btn);
	}

	.edit-btn:hover {
		color: var(--accent);
		background: var(--surface-hover);
	}

	.plan-text {
		font-weight: 600;
		color: var(--accent);
	}

	.plan-text.pro {
		color: var(--accent);
	}
</style>
