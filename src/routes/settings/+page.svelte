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
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { deleteUserCategoryWithSync, deleteWorkTimeModel } from '$lib/storage/operations';
	import { downloadCategoriesFile } from '$lib/utils/categoryIO';
	import { deleteAccount } from '$lib/api/auth';
	import { clearSession } from '$lib/stores/auth';
	import type { Category, WorkTimeModel } from '$lib/types';
	import AddCategoryModal from '$lib/components/AddCategoryModal.svelte';
	import AddWorkTimeModelModal from '$lib/components/AddWorkTimeModelModal.svelte';
	import ImportCategoriesModal from '$lib/components/ImportCategoriesModal.svelte';
	import ImportExcelModal from '$lib/components/ImportExcelModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

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
	let showDeleteConfirm = $state(false);
	let showDeleteModelConfirm = $state(false);
	let categoryToDelete: Category | null = $state(null);
	let modelToDelete: WorkTimeModel | null = $state(null);
	let modelToEdit: WorkTimeModel | null = $state(null);
	let showCategoryMenu = $state(false);
	let showDeleteAccountConfirm = $state(false);
	let expandedSections = $state({
		workTimeModels: true,
		abwesenheit: true,
		arbeit: true
	});
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

		<!-- Excel Import Section -->
		<section class="section">
			<div class="section-header">
				<h2>Daten-Import</h2>
			</div>
			<div class="import-actions">
				<button class="import-btn" onclick={() => (showImportExcel = true)}>
					Excel-Datei importieren (.xlsx, .xlsm)
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
		color: #666;
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
		color: #3b82f6;
	}

	.toggle-icon {
		font-size: 0.75rem;
		color: #6b7280;
		transition: transform 0.2s ease;
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
		border-radius: 4px;
		background: transparent;
		color: #3b82f6;
		font-size: 1.5rem;
		font-weight: 300;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-btn:hover {
		background: #eff6ff;
	}

	.menu-container {
		position: relative;
	}

	.menu-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #6b7280;
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-btn:hover {
		background: #f3f4f6;
		color: #333;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
		background: white;
		color: #333;
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
		background: #f3f4f6;
	}

	.dropdown-item:not(:last-child) {
		border-bottom: 1px solid #eee;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty {
		text-align: center;
		color: #888;
		padding: 1rem;
		margin: 0;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #eee;
		border-radius: 8px;
	}

	.list-item.clickable {
		cursor: pointer;
	}

	.list-item.clickable:hover {
		background: #f9fafb;
		border-color: #ddd;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.item-name {
		font-weight: 500;
		color: #333;
	}

	.item-detail {
		font-size: 0.85rem;
		color: #666;
	}

	.delete-btn {
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #dc2626;
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		background: #fef2f2;
	}

	.version-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.version-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		color: #666;
		font-size: 0.85rem;
	}

	.version-label {
		font-weight: 500;
	}

	.build-time {
		font-size: 0.75rem;
		color: #999;
	}

	.delete-account-section {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.delete-account-btn {
		width: 100%;
		padding: 0.875rem;
		background: #dc2626;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.delete-account-btn:hover:not(:disabled) {
		background: #b91c1c;
	}

	.delete-account-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.delete-account-error {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: #dc2626;
		text-align: center;
	}

	.import-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.import-btn {
		width: 100%;
		padding: 0.875rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.import-btn:hover {
		background: #2563eb;
	}
</style>
