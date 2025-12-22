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
	import { categories, workTimeModels } from '$lib/stores';
	import { initializeCategories } from '$lib/storage/categories';
	import { getAll } from '$lib/storage/db';
	import { deleteUserCategoryWithSync } from '$lib/storage/operations';
	import type { Category, WorkTimeModel } from '$lib/types';
	import AddCategoryModal from '$lib/components/AddCategoryModal.svelte';
	import AddWorkTimeModelModal from '$lib/components/AddWorkTimeModelModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	let loading = $state(true);
	let appVersion = $state('');
	let buildTime = $state('');
	let updateAvailable = $state(false);
	let newVersion = $state('');
	let showAddCategory = $state(false);
	let showAddWorkTimeModel = $state(false);
	let showDeleteConfirm = $state(false);
	let categoryToDelete: Category | null = $state(null);

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
</script>

<div class="settings-page">
	{#if loading}
		<div class="loading">
			<p>Laden...</p>
		</div>
	{:else}
		<!-- Kategorien Section -->
		<section class="section">
			<div class="section-header">
				<h2>Kategorien</h2>
				<button class="add-btn" onclick={() => (showAddCategory = true)}> + Kategorie </button>
			</div>
			<div class="list" data-testid="category-list">
				{#if $categories.length === 0}
					<p class="empty">Keine Kategorien vorhanden</p>
				{:else}
					{#each $categories as category (category.id)}
						<div
							class="list-item"
							data-testid="category-item"
							data-category-type={category.type}
							data-counts-as-work={String(category.countsAsWorkTime)}
						>
							<div class="item-info">
								<span class="item-name" data-testid="category-name">{category.name}</span>
							</div>
							{#if !category.countsAsWorkTime}
								<span class="badge no-work">Keine Arbeitszeit</span>
							{/if}
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

		<!-- Arbeitszeitmodelle Section -->
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
						<div class="list-item">
							<div class="item-info">
								<span class="item-name">{model.name}</span>
								<span class="item-detail">Gültig ab {model.validFrom}</span>
							</div>
						</div>
					{/each}
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
	{/if}
</div>

<!-- Add Category Modal -->
{#if showAddCategory}
	<AddCategoryModal
		onsave={() => (showAddCategory = false)}
		onclose={() => (showAddCategory = false)}
	/>
{/if}

<!-- Add Work Time Model Modal -->
{#if showAddWorkTimeModel}
	<AddWorkTimeModelModal
		onsave={() => (showAddWorkTimeModel = false)}
		onclose={() => (showAddWorkTimeModel = false)}
	/>
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

	.badge {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		width: fit-content;
	}

	.badge.no-work {
		background: #f3f4f6;
		color: #6b7280;
		margin-right: 0.5rem;
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
</style>
