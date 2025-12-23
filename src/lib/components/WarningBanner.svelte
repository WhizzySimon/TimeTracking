<!--
  WarningBanner component - displays warning for running tasks
  
  Spec refs:
  - ui-logic-spec-v1.md Section 3.1 (Hinweisbanner)
  
  Shows: "⚠ Aufgabe läuft noch (keine Endzeit)"
  - Persistent (not dismissible)
  - Disappears immediately when running task gets end time
-->
<script lang="ts">
	interface Props {
		message: string;
	}

	let { message }: Props = $props();
</script>

<div class="warning-banner" role="alert">
	<span class="warning-icon">⚠</span>
	<span class="warning-message">{message}</span>
</div>

<style>
	.warning-banner {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: var(--warning-light);
		border: 1px solid var(--warning);
		border-radius: var(--r-banner);
		color: var(--warning);
	}

	.warning-icon {
		font-size: 1.1rem;
	}

	.warning-message {
		font-size: 0.9rem;
		font-weight: 500;
	}
</style>
