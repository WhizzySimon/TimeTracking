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
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { categories, workTimeModels, isOnline } from '$lib/stores';
	import { clearSession } from '$lib/stores/auth';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { deleteUserCategoryWithSync, deleteWorkTimeModel } from '$lib/storage/operations';
	import { downloadCategoriesFile } from '$lib/utils/categoryIO';
	import { saveToCloud, getBackupMeta } from '$lib/backup/cloud';
	import type { Category, WorkTimeModel } from '$lib/types';
	import AddCategoryModal from '$lib/components/AddCategoryModal.svelte';
	import AddWorkTimeModelModal from '$lib/components/AddWorkTimeModelModal.svelte';
	import ImportCategoriesModal from '$lib/components/ImportCategoriesModal.svelte';
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
		const days = [
			model.monday,
			model.tuesday,
			model.wednesday,
			model.thursday,
			model.friday,
			model.saturday,
			model.sunday
		];
		return days.filter((h) => h !== null && h > 0).length;
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
	let updateAvailable = $state(false);
	let newVersion = $state('');
	let showAddCategory = $state(false);
	let showAddWorkTimeModel = $state(false);
	let showImportCategories = $state(false);
	let showDeleteConfirm = $state(false);
	let showDeleteModelConfirm = $state(false);
	let showLogoutConfirm = $state(false);
	let showOfflineDialog = $state(false);
	let categoryToDelete: Category | null = $state(null);
	let modelToDelete: WorkTimeModel | null = $state(null);
	let modelToEdit: WorkTimeModel | null = $state(null);
	let backupInProgress = $state(false);
	let lastBackupAt = $state<string | null>(null);
	let backupError = $state<string | null>(null);

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

	let swMessageHandler: ((event: MessageEvent) => void) | null = null;

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

			const backupMeta = await getBackupMeta();
			if (backupMeta?.lastBackupAt) {
				lastBackupAt = backupMeta.lastBackupAt;
			}

			if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
				swMessageHandler = (event: MessageEvent) => {
					if (event.data?.type === 'UPDATE_AVAILABLE') {
						updateAvailable = true;
						newVersion = event.data.version;
					}
				};
				navigator.serviceWorker.addEventListener('message', swMessageHandler);
				navigator.serviceWorker.controller.postMessage('CHECK_UPDATE');
			}
		}
	});

	onDestroy(() => {
		if (browser && swMessageHandler) {
			navigator.serviceWorker.removeEventListener('message', swMessageHandler);
		}
	});

	function reloadApp() {
		window.location.reload();
	}

	async function handleLogout() {
		await clearSession();
		goto(resolve('/login'));
	}

	async function handleCloudBackup() {
		backupError = null;

		if (!$isOnline) {
			showOfflineDialog = true;
			return;
		}

		backupInProgress = true;

		try {
			const result = await saveToCloud();
			if (result.success && result.timestamp) {
				lastBackupAt = result.timestamp;
			} else if (!result.success) {
				backupError = result.error ?? 'Backup fehlgeschlagen';
			}
		} catch (e) {
			console.error('[Settings] Backup failed:', e);
			backupError = e instanceof Error ? e.message : 'Backup fehlgeschlagen';
		} finally {
			backupInProgress = false;
		}
	}

	function formatBackupTime(isoString: string): string {
		try {
			return new Date(isoString).toLocaleString('de-DE', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		} catch {
			return isoString;
		}
	}
</script>

<div class="settings-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Arbeitszeitmodelle Section (first - shorter list) -->
		<section class="section">
			<div class="section-header">
				<h2>Arbeitszeitmodelle</h2>
				<button class="add-btn" onclick={() => (showAddWorkTimeModel = true)}> + Modell </button>
			</div>
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
		</section>

		<!-- Abwesenheitskategorien Section -->
		<section class="section">
			<div class="section-header">
				<h2>Abwesenheitskategorien</h2>
			</div>
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
						</div>
					{/each}
				{/if}
			</div>
		</section>

		<!-- Arbeitskategorien Section -->
		<section class="section">
			<div class="section-header">
				<h2>Arbeitskategorien</h2>
				<div class="header-buttons">
					<button class="secondary-btn" onclick={() => downloadCategoriesFile($categories)}>
						Exportieren
					</button>
					<button class="secondary-btn" onclick={() => (showImportCategories = true)}>
						Importieren
					</button>
					<button class="add-btn" onclick={() => (showAddCategory = true)}> + Kategorie </button>
				</div>
			</div>
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
		</section>

		<!-- Cloud Backup Section -->
		<section class="section backup-section">
			<div class="section-header">
				<h2>Cloud-Backup</h2>
			</div>
			<div class="backup-content">
				<button class="backup-btn" onclick={handleCloudBackup} disabled={backupInProgress}>
					{backupInProgress ? 'Speichern...' : 'In Cloud speichern'}
				</button>
				{#if lastBackupAt}
					<span class="backup-time">Letztes Backup: {formatBackupTime(lastBackupAt)}</span>
				{:else}
					<span class="backup-time backup-never">Noch kein Backup erstellt</span>
				{/if}
				{#if backupError}
					<span class="backup-error">{backupError}</span>
				{/if}
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
			{#if updateAvailable}
				<div class="update-banner">
					<span>Neue Version {newVersion} verfügbar!</span>
					<button class="update-btn" onclick={reloadApp}>Aktualisieren</button>
				</div>
			{/if}
		</section>

		<!-- Logout Section -->
		<section class="section logout-section">
			<button class="logout-btn" onclick={() => (showLogoutConfirm = true)}> Abmelden </button>
		</section>
	{/if}
</div>

<!-- Add Category Modal -->
{#if showAddCategory}
	<AddCategoryModal
		onsave={() => (showAddCategory = false)}
		onclose={() => (showAddCategory = false)}
	/>
{/if}

<!-- Import Categories Modal -->
{#if showImportCategories}
	<ImportCategoriesModal
		onsave={() => (showImportCategories = false)}
		onclose={() => (showImportCategories = false)}
	/>
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
		confirmStyle="danger"
		onconfirm={handleLogout}
		oncancel={() => (showLogoutConfirm = false)}
	/>
{/if}

<!-- Offline Dialog -->
{#if showOfflineDialog}
	<ConfirmDialog
		type="alert"
		title="Offline"
		message="Backup nicht möglich — Sie sind offline. Ihre Änderungen sind lokal gespeichert. Versuchen Sie es erneut, wenn Sie online sind."
		confirmLabel="OK"
		onconfirm={() => (showOfflineDialog = false)}
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
	}

	.section-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.header-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.add-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #3b82f6;
		border-radius: 8px;
		background: white;
		color: #3b82f6;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.add-btn:hover {
		background: #eff6ff;
	}

	.secondary-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #9ca3af;
		border-radius: 8px;
		background: white;
		color: #6b7280;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.secondary-btn:hover {
		background: #f3f4f6;
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

	.backup-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.backup-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.backup-btn {
		padding: 0.75rem 1rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.backup-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.backup-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.backup-time {
		font-size: 0.85rem;
		color: #666;
	}

	.backup-never {
		color: #999;
		font-style: italic;
	}

	.backup-error {
		font-size: 0.85rem;
		color: #dc2626;
		padding: 0.5rem;
		background: #fef2f2;
		border-radius: 4px;
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

	.update-banner {
		margin-top: 0.75rem;
		padding: 0.75rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.update-banner span {
		color: #92400e;
		font-weight: 500;
	}

	.update-btn {
		padding: 0.5rem 1rem;
		background: #f59e0b;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.update-btn:hover {
		background: #d97706;
	}

	.logout-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.logout-btn {
		width: 100%;
		padding: 0.875rem;
		background: white;
		color: #dc2626;
		border: 1px solid #dc2626;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
	}

	.logout-btn:hover {
		background: #fef2f2;
	}
</style>
