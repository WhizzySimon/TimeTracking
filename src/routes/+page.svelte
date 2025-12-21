<script lang="ts">
	import { onMount } from 'svelte';
	import {
		initializeCategories,
		getAllCategories,
		addUserCategory,
		deleteUserCategory,
		isSystemCategory
	} from '$lib/storage/categories';
	import type { Category } from '$lib/types';

	let categories: Category[] = $state([]);
	let newCategoryName = $state('');
	let newCategoryCountsAsWork = $state(true);
	let error = $state('');
	let loading = $state(true);

	onMount(async () => {
		await initializeCategories();
		await loadCategories();
		loading = false;
	});

	async function loadCategories() {
		categories = await getAllCategories();
		// Sort: system first, then by name
		categories.sort((a, b) => {
			if (a.type !== b.type) return a.type === 'system' ? -1 : 1;
			return a.name.localeCompare(b.name, 'de');
		});
	}

	async function handleAddCategory() {
		if (!newCategoryName.trim()) return;
		error = '';
		try {
			await addUserCategory(newCategoryName.trim(), newCategoryCountsAsWork);
			newCategoryName = '';
			await loadCategories();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		}
	}

	async function handleDeleteCategory(id: string) {
		error = '';
		try {
			await deleteUserCategory(id);
			await loadCategories();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		}
	}
</script>

<main>
	<h1>TimeTracker - Kategorien</h1>

	{#if loading}
		<p data-testid="loading">Laden...</p>
	{:else}
		<section>
			<h2>Kategorie hinzufügen</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleAddCategory();
				}}
			>
				<input
					type="text"
					bind:value={newCategoryName}
					placeholder="Name"
					data-testid="new-category-name"
				/>
				<label>
					<input
						type="checkbox"
						bind:checked={newCategoryCountsAsWork}
						data-testid="new-category-counts"
					/>
					Zählt als Arbeitszeit
				</label>
				<button type="submit" data-testid="add-category-btn">Hinzufügen</button>
			</form>
			{#if error}
				<p data-testid="error" style="color: red;">{error}</p>
			{/if}
		</section>

		<section>
			<h2>Kategorien ({categories.length})</h2>
			<ul data-testid="category-list">
				{#each categories as cat (cat.id)}
					<li
						data-testid="category-item"
						data-category-id={cat.id}
						data-category-type={cat.type}
						data-counts-as-work={cat.countsAsWorkTime}
					>
						<span data-testid="category-name">{cat.name}</span>
						<span data-testid="category-type">({cat.type})</span>
						<span data-testid="category-counts"
							>{cat.countsAsWorkTime ? '✓ Arbeitszeit' : '✗ keine Arbeitszeit'}</span
						>
						{#if !isSystemCategory(cat)}
							<button onclick={() => handleDeleteCategory(cat.id)} data-testid="delete-category-btn"
								>🗑️</button
							>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
		font-family: system-ui, sans-serif;
	}
	section {
		margin-bottom: 2rem;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		padding: 0.5rem;
		border-bottom: 1px solid #eee;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	input[type='text'] {
		padding: 0.5rem;
		margin-right: 0.5rem;
	}
	button {
		padding: 0.5rem 1rem;
		cursor: pointer;
	}
</style>
