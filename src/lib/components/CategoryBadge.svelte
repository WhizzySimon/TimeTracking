<script lang="ts">
	interface Props {
		countsAsWorkTime: boolean;
	}

	let { countsAsWorkTime }: Props = $props();
</script>

{#if !countsAsWorkTime}
	<span class="tt-badge tt-badge--no-work">Keine Arbeitszeit</span>
{/if}

<style>
	/* Component uses .tt-badge classes from tt-design-system.css */
</style>
