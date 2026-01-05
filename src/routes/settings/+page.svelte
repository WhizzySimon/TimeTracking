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
	import {
		categories,
		workTimeModels,
		employers as employersStore,
		selectedEmployerId,
		filteredCategories
	} from '$lib/stores';
	import { getAllEmployers, deleteEmployer } from '$lib/storage/employers';
	import { userProfile, userPlan, userFullName } from '$lib/stores/user';
	import { logout } from '$lib/api/auth';
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
	import CustomDropdown from '$lib/components/CustomDropdown.svelte';
	import { colorScheme, COLOR_SCHEMES, type ColorSchemeName } from '$lib/stores/colorScheme';
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
		// Use filteredCategories when employer is selected, otherwise show all
		const sourceCategories = $selectedEmployerId ? $filteredCategories : $categories;
		return sourceCategories
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
	let profileLoaded = $derived($userProfile !== null);
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
		arbeit: false,
		entwicklung: false
	});
	let deleteAccountInProgress = $state(false);
	let deleteAccountError = $state<string | null>(null);

	// Color scheme options for dropdown
	const colorSchemeOptions = Object.entries(COLOR_SCHEMES).map(([key, scheme]) => ({
		value: key,
		label: scheme.label
	}));

	function handleColorSchemeChange(value: string) {
		colorScheme.set(value as ColorSchemeName);
	}

	function resetColorScheme() {
		if (browser) {
			localStorage.removeItem('tt-color-scheme');
			window.location.reload();
		}
	}

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

	{#if loading || !profileLoaded}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Konto Section -->
		<section class="section" data-testid="account-section">
			<div class="section-header section-header-with-action">
				<h2>Konto</h2>
				<button class="logout-button tt-interactive" onclick={() => (showLogoutConfirm = true)}>
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
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
						<polyline points="16 17 21 12 16 7"></polyline>
						<line x1="21" y1="12" x2="9" y2="12"></line>
					</svg>
					Abmelden
				</button>
			</div>
			<div class="account-info">
				<div class="account-row">
					<span class="account-label">Name</span>
					<div class="account-value-with-edit">
						<span class="account-value" data-testid="account-name">
							{$userFullName || 'Nicht festgelegt'}
						</span>
						<button
							class="tt-symbol-button"
							aria-label="Name bearbeiten"
							onclick={() => (showNameEditDialog = true)}
						>
							<svg
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
							class="tt-symbol-button"
							aria-label="E-Mail bearbeiten"
							onclick={() => (showEmailEditDialog = true)}
						>
							<svg
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
						<button class="tt-symbol-button" aria-label="Plan ändern" onclick={handlePlanChange}>
							<svg
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
					class="tt-symbol-button"
					onclick={handleAddEmployer}
					aria-label="Arbeitgeber hinzufügen"
					data-testid="add-employer-btn"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				</button>
			</div>
			{#if expandedSections.employers}
				<div class="list" data-testid="employer-list">
					{#if employers.filter((emp) => emp.isActive).length === 0}
						<p class="empty">Keine Arbeitgeber vorhanden</p>
					{:else}
						{#each employers.filter((emp) => emp.isActive) as employer (employer.id)}
							<div
								class="tt-list-row-clickable"
								role="button"
								tabindex="0"
								data-testid="employer-item"
								onclick={() => handleEditEmployer(employer)}
								onkeydown={(e) => e.key === 'Enter' && handleEditEmployer(employer)}
							>
								<div class="tt-list-row__content">
									<span class="tt-list-row__title" data-testid="employer-name">{employer.name}</span
									>
								</div>
								<button
									class="tt-btn-delete"
									aria-label="Löschen"
									data-testid="delete-employer-btn"
									onclick={(event) => {
										event.stopPropagation();
										handleDeleteEmployer(employer);
									}}
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
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg>
								</button>
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
					class="tt-symbol-button"
					onclick={() => (showAddWorkTimeModel = true)}
					aria-label="Modell hinzufügen"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				</button>
			</div>
			{#if expandedSections.workTimeModels}
				<div class="list">
					{#if $workTimeModels.length === 0}
						<p class="empty">Keine Arbeitszeitmodelle vorhanden</p>
					{:else}
						{#each $workTimeModels as model (model.id)}
							<div
								class="tt-list-row-clickable"
								role="button"
								tabindex="0"
								onclick={() => handleEditModel(model)}
								onkeydown={(e) => e.key === 'Enter' && handleEditModel(model)}
							>
								<div class="tt-list-row__content">
									<span class="tt-list-row__title">{model.name}</span>
									<span class="tt-list-row__detail">
										{calculateModelTotalHours(model)}h/Woche • {countModelWorkdays(model)} Tage • ab {model.validFrom}
									</span>
								</div>
								<button
									class="tt-btn-delete"
									aria-label="Löschen"
									onclick={(e) => {
										e.stopPropagation();
										handleDeleteModel(model);
									}}
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
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg>
								</button>
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
					class="tt-symbol-button"
					aria-label="Abwesenheitskategorie hinzufügen"
					onclick={() => (showAddAbsenceCategory = true)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="12" y1="5" x2="12" y2="19"></line>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				</button>
			</div>
			{#if expandedSections.abwesenheit}
				<div class="list">
					{#if abwesenheit().length === 0}
						<p class="empty">Keine Abwesenheit vorhanden</p>
					{:else}
						{#each abwesenheit() as category (category.id)}
							<div
								class="tt-list-row-clickable"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="false"
								role="button"
								tabindex="0"
								onclick={() => handleEditCategory(category)}
								onkeydown={(event) => event.key === 'Enter' && handleEditCategory(category)}
							>
								<div class="tt-list-row__content">
									<span class="tt-list-row__title" data-testid="category-name">
										{category.name}
										<CategoryBadge countsAsWorkTime={category.countsAsWorkTime} />
									</span>
								</div>
								<div class="row-right-section">
									{#if category.type !== 'system'}
										<button
											class="tt-btn-delete"
											aria-label="Löschen"
											data-testid="delete-category-btn"
											onclick={(event) => {
												event.stopPropagation();
												handleDeleteCategory(category);
											}}
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
												<polyline points="3 6 5 6 21 6"></polyline>
												<path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												></path>
											</svg>
										</button>
									{/if}
								</div>
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
							class="tt-symbol-button"
							data-testid="category-menu-btn"
							onclick={() => (showCategoryMenu = !showCategoryMenu)}
							aria-label="Menü"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="1"></circle>
								<circle cx="12" cy="5" r="1"></circle>
								<circle cx="12" cy="19" r="1"></circle>
							</svg>
						</button>
						{#if showCategoryMenu}
							<div class="dropdown-menu">
								<button
									class="dropdown-item tt-interactive"
									data-testid="add-category-menu-item"
									onclick={() => {
										showAddCategory = true;
										showCategoryMenu = false;
									}}
								>
									<svg
										class="dropdown-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<line x1="12" y1="5" x2="12" y2="19"></line>
										<line x1="5" y1="12" x2="19" y2="12"></line>
									</svg>
									<span>Hinzufügen</span>
								</button>
								<button
									class="dropdown-item tt-interactive"
									onclick={() => {
										showImportCategories = true;
										showCategoryMenu = false;
									}}
								>
									<svg
										class="dropdown-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
										<polyline points="7 10 12 15 17 10"></polyline>
										<line x1="12" y1="15" x2="12" y2="3"></line>
									</svg>
									<span>Importieren</span>
								</button>
								<button
									class="dropdown-item tt-interactive"
									onclick={() => {
										downloadCategoriesFile($categories);
										showCategoryMenu = false;
									}}
								>
									<svg
										class="dropdown-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
										<polyline points="17 8 12 3 7 8"></polyline>
										<line x1="12" y1="3" x2="12" y2="15"></line>
									</svg>
									<span>Exportieren</span>
								</button>
								<button
									class="dropdown-item dropdown-item-danger tt-interactive-danger"
									onclick={() => {
										showDeleteAllCategoriesConfirm = true;
										showCategoryMenu = false;
									}}
								>
									<svg
										class="dropdown-icon"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<polyline points="3 6 5 6 21 6"></polyline>
										<path
											d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
										></path>
									</svg>
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
								class="tt-list-row-clickable"
								data-testid="category-item"
								data-category-type={category.type}
								data-counts-as-work="true"
								role="button"
								tabindex="0"
								onclick={() => handleEditCategory(category)}
								onkeydown={(event) => event.key === 'Enter' && handleEditCategory(category)}
							>
								<div class="tt-list-row__content">
									<span class="tt-list-row__title" data-testid="category-name">{category.name}</span
									>
								</div>
								<div class="row-right-section">
									{#if category.employerId}
										<span class="tt-inline-label-employer"
											>{getEmployerName(category.employerId)}</span
										>
									{/if}
									{#if category.type !== 'system'}
										<button
											class="tt-btn-delete"
											aria-label="Löschen"
											data-testid="delete-category-btn"
											onclick={(event) => {
												event.stopPropagation();
												handleDeleteCategory(category);
											}}
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
												<polyline points="3 6 5 6 21 6"></polyline>
												<path
													d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
												></path>
											</svg>
										</button>
									{/if}
								</div>
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
				<button
					class="tt-button-primary tt-button-full"
					onclick={() => (showExportDialog = true)}
					data-testid="export-btn"
				>
					Exportieren
				</button>
				<button
					class="tt-button-primary tt-button-full"
					onclick={() => (showStundenzettelExport = true)}
					data-testid="stundenzettel-export-btn"
				>
					Stundenzettel
				</button>
				<button
					class="tt-button-primary tt-button-full"
					onclick={() => goto(resolve('/import'))}
					data-testid="import-btn"
				>
					Importieren
				</button>
				<button class="tt-button-secondary tt-button-full" onclick={() => (showImportExcel = true)}>
					Excel-Datei importieren
				</button>
				<button
					class="tt-button-danger-outline tt-button-full"
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

		<!-- Development Section (Color Scheme Switcher) -->
		<section class="section">
			<div class="section-header">
				<button
					class="section-toggle"
					onclick={() => (expandedSections.entwicklung = !expandedSections.entwicklung)}
					aria-expanded={expandedSections.entwicklung}
				>
					<span class="toggle-icon" class:expanded={expandedSections.entwicklung}>▶</span>
					<h2>Entwicklung</h2>
				</button>
			</div>
			{#if expandedSections.entwicklung}
				<div class="dev-settings">
					<div class="tt-labeled-dropdown">
						<span class="tt-labeled-dropdown__label">Farbschema</span>
						<CustomDropdown
							options={colorSchemeOptions}
							value={$colorScheme}
							onchange={handleColorSchemeChange}
						/>
					</div>
					<div class="color-preview">
						<div class="color-swatch primary" style="background: var(--tt-brand-primary-500);">
							<span>Primary<br />{COLOR_SCHEMES[$colorScheme].primary}</span>
						</div>
						<div class="color-swatch secondary" style="background: var(--tt-brand-accent-300);">
							<span>Secondary<br />{COLOR_SCHEMES[$colorScheme].secondary}</span>
						</div>
					</div>
					<button class="reset-btn tt-interactive" onclick={resetColorScheme}>
						Cache leeren & neu laden
					</button>
				</div>
			{/if}
		</section>

		<!-- Delete Account Section -->
		<section class="section delete-account-section">
			<button
				class="tt-button-danger tt-button-full"
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
		padding: var(--tt-space-16);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-24);
	}

	.page-header {
		padding: 0.75rem 1rem;
		background-color: var(--tt-background-card);
		border-radius: var(--tt-radius-card);
		border: 1px solid var(--tt-border-default);
		text-align: center;
	}

	.page-header h1 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--tt-text-primary);
		font-family: var(--tt-font-family);
	}

	.loading {
		display: flex;
		justify-content: center;
		padding: var(--tt-space-32);
		color: var(--tt-text-muted);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-12);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 1rem;
	}

	.section-header h2 {
		margin: 0;
		font-size: var(--tt-font-size-title);
		font-weight: 600;
		color: var(--tt-text-primary);
		font-family: var(--tt-font-family);
	}

	.section-toggle {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		font-family: var(--tt-font-family);
	}

	.section-toggle:hover h2 {
		color: var(--tt-brand-primary-500);
	}

	.toggle-icon {
		font-size: var(--tt-font-size-tiny);
		color: var(--tt-text-muted);
		transition: transform 0.2s ease;
	}

	.toggle-icon.expanded {
		transform: rotate(90deg);
	}

	.header-buttons {
		display: flex;
		gap: var(--tt-space-8);
	}

	.menu-container {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: var(--tt-space-4);
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 100;
		min-width: 160px;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: var(--tt-space-12);
		width: 100%;
		padding: var(--tt-space-12) var(--tt-space-16);
		border: none;
		background: var(--tt-background-card);
		color: var(--tt-text-primary);
		font-size: var(--tt-font-size-normal);
		text-align: left;
		cursor: pointer;
		transition: background var(--tt-transition-fast);
	}

	.dropdown-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		color: var(--tt-text-secondary);
	}

	.dropdown-item-danger {
		color: var(--tt-status-danger-500);
	}

	.dropdown-item:not(:last-child) {
		border-bottom: 1px solid var(--tt-border-subtle);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.row-right-section {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		margin-left: auto;
	}

	.empty {
		text-align: center;
		color: var(--tt-text-muted);
		padding: var(--tt-space-16);
		margin: 0;
	}

	.version-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
		font-family: var(--tt-font-family);
	}

	.version-info {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-4);
		color: var(--tt-text-muted);
		font-size: var(--tt-font-size-small);
		font-family: var(--tt-font-family);
	}

	.version-label {
		font-weight: 500;
		font-family: var(--tt-font-family);
	}

	.build-time {
		font-size: var(--tt-font-size-tiny);
		color: var(--tt-text-muted);
	}

	.delete-account-section {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--tt-border-default);
	}

	.delete-account-error {
		display: block;
		margin-top: 0.5rem;
		font-size: var(--tt-font-size-small);
		color: var(--tt-status-danger-500);
		text-align: center;
	}

	.data-actions {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
	}

	.dropdown-item-danger {
		color: var(--tt-status-danger-500);
	}

	.dropdown-item-danger:hover {
		background: var(--tt-state-danger-hover);
	}

	.account-info {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-8);
		padding: var(--tt-space-16);
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-card);
	}

	.account-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.account-label {
		font-weight: 500;
		color: var(--tt-text-muted);
	}

	.account-value {
		color: var(--tt-text-primary);
	}

	.account-value-with-edit {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
	}

	.plan-text {
		font-weight: 600;
		color: var(--tt-brand-primary-500);
	}

	.plan-text.pro {
		color: var(--tt-brand-primary-500);
	}

	.section-header-with-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-right: 0;
	}

	.logout-button {
		display: flex;
		align-items: center;
		gap: var(--tt-space-8);
		padding: var(--tt-space-8) var(--tt-space-12);
		background: transparent;
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		color: var(--tt-text-secondary);
		font-size: var(--tt-font-size-small);
		cursor: pointer;
		transition: background var(--tt-transition-fast);
	}

	/* Development section styles */
	.dev-settings {
		display: flex;
		flex-direction: column;
		gap: var(--tt-space-16);
		padding: var(--tt-space-12);
	}

	.color-preview {
		display: flex;
		gap: var(--tt-space-12);
	}

	.color-swatch {
		flex: 1;
		padding: var(--tt-space-16);
		border-radius: var(--tt-radius-card);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.color-swatch span {
		color: white;
		font-weight: var(--tt-font-weight-semibold);
		font-size: var(--tt-font-size-small);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		text-align: center;
	}

	.reset-btn {
		padding: var(--tt-space-8) var(--tt-space-16);
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: var(--tt-radius-button);
		color: var(--tt-text-secondary);
		font-size: var(--tt-font-size-small);
		cursor: pointer;
		transition: background var(--tt-transition-fast);
	}
</style>
