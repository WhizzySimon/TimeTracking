<script lang="ts">
	interface Props {
		countsAsWorkTime: boolean;
	}

	let { countsAsWorkTime }: Props = $props();
</script>

{#if !countsAsWorkTime}
	<span class="badge">Keine Arbeitszeit</span>
{/if}

<style>
	.badge {
		display: inline-block;
		padding: 2px 8px;
		font-size: 0.75rem;
		font-weight: 500;
		background-color: var(--color-gray-200);
		color: var(--color-gray-700);
		border-radius: 4px;
		margin-left: 8px;
	}
</style>
