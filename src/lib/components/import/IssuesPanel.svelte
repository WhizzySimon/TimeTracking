<!--
  IssuesPanel.svelte
  
  Aggregated issues panel for import review:
  - Issue counts by type
  - Click to filter affected candidates
  
  Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 6 (Screen C)
-->
<script lang="ts">
	import type { ImportIssue, IssueType } from '$lib/import/types';

	interface Props {
		issues: ImportIssue[];
		activeFilter?: IssueType | null;
		onfilter?: (type: IssueType | null) => void;
	}

	let { issues, activeFilter = null, onfilter }: Props = $props();

	function handleClick(type: IssueType) {
		if (activeFilter === type) {
			onfilter?.(null);
		} else {
			onfilter?.(type);
		}
	}

	function getIssueIcon(type: IssueType): string {
		switch (type) {
			case 'missing_date':
				return '📅';
			case 'missing_duration':
				return '⏱️';
			case 'unknown_category':
				return '❓';
			case 'overlap':
				return '⚠️';
			case 'duplicate':
				return '🔄';
			case 'extreme_duration':
				return '⏰';
			case 'invalid_format':
				return '❌';
			case 'parse_error':
				return '💥';
			default:
				return '!';
		}
	}
</script>

{#if issues.length > 0}
	<div class="issues-panel">
		<h3>Probleme ({issues.length})</h3>
		<ul class="issues-list">
			{#each issues as issue (issue.id)}
				<li
					class="issue-item"
					class:error={issue.severity === 'error'}
					class:active={activeFilter === issue.type}
				>
					<button class="issue-btn" onclick={() => handleClick(issue.type)}>
						<span class="issue-icon">{getIssueIcon(issue.type)}</span>
						<span class="issue-message">{issue.message}</span>
						<span class="issue-count">{issue.candidateIds.length}</span>
					</button>
				</li>
			{/each}
		</ul>
		{#if activeFilter}
			<button class="clear-filter" onclick={() => onfilter?.(null)}> Filter zurücksetzen </button>
		{/if}
	</div>
{/if}

<style>
	.issues-panel {
		background: var(--tt-background-card-hover);
		border: 1px solid var(--tt-border-default);
		border-radius: 8px;
		padding: 1rem;
	}

	.issues-panel h3 {
		font-size: 0.875rem;
		margin: 0 0 0.75rem;
		color: var(--tt-text-secondary);
	}

	.issues-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.issue-item {
		border-radius: 6px;
		overflow: hidden;
	}

	.issue-btn {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--tt-background-card);
		border: 1px solid var(--tt-border-default);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		color: var(--tt-text-secondary);
		text-align: left;
		transition: all 0.15s;
	}

	.issue-btn:hover {
		background: var(--tt-background-card-pressed);
	}

	.issue-item.active .issue-btn {
		border-color: var(--tt-brand-primary-500);
		background: var(--tt-brand-primary-500-light, rgba(59, 130, 246, 0.1));
	}

	.issue-item.error .issue-btn {
		border-left: 3px solid var(--tt-status-danger-500);
	}

	.issue-icon {
		font-size: 1rem;
	}

	.issue-message {
		flex: 1;
	}

	.issue-count {
		background: var(--tt-background-card-pressed);
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.issue-item.error .issue-count {
		background: var(--tt-status-danger-500);
		color: white;
	}

	.clear-filter {
		margin-top: 0.75rem;
		padding: 0.375rem 0.75rem;
		background: transparent;
		border: 1px solid var(--tt-border-default);
		border-radius: 4px;
		font-size: 0.75rem;
		color: var(--tt-text-muted);
		cursor: pointer;
	}

	.clear-filter:hover {
		background: var(--tt-background-card-pressed);
	}
</style>
