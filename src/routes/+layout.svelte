<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dev, browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { syncNow, checkSyncStatus } from '$lib/sync/engine';
	import { isOnline } from '$lib/stores';
	import { loadSession, isAuthenticated, clearSession } from '$lib/stores/auth';
	import { saveToCloud, getBackupMeta } from '$lib/backup/cloud';

	let { children } = $props();

	let visibilityHandler: (() => void) | null = null;
	let onlineHandler: (() => void) | null = null;
	let offlineHandler: (() => void) | null = null;
	let authChecked = $state(false);

	let showLogoutConfirm = $state(false);
	let showOfflineDialog = $state(false);
	let backupInProgress = $state(false);
	let lastBackupAt = $state<string | null>(null);
	let backupError = $state<string | null>(null);

	// Pages that don't require authentication
	const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

	function isPublicPath(pathname: string): boolean {
		return publicPaths.some((p) => pathname.startsWith(p));
	}

	// Auth guard: redirect to login if not authenticated on protected routes
	$effect(() => {
		if (!browser || !authChecked) return;

		const pathname = $page.url.pathname;
		const authenticated = $isAuthenticated;

		if (!authenticated && !isPublicPath(pathname)) {
			// Not authenticated and trying to access protected route
			goto(resolve('/login'));
		}
	});

	async function handleLogout() {
		await clearSession();
		showLogoutConfirm = false;
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
			console.error('[Layout] Backup failed:', e);
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

	onMount(async () => {
		if (!dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}

		// Check authentication status
		if (browser) {
			await loadSession();
			authChecked = true;

			// Load last backup timestamp
			const backupMeta = await getBackupMeta();
			if (backupMeta?.lastBackupAt) {
				lastBackupAt = backupMeta.lastBackupAt;
			}
		}

		// Check sync status on startup
		checkSyncStatus();

		// Trigger sync on startup (after a short delay to let app initialize)
		setTimeout(() => {
			syncNow().catch((err) => console.error('[Layout] Startup sync failed:', err));
		}, 1000);

		// Trigger sync when user returns to tab
		if (browser) {
			visibilityHandler = () => {
				if (document.visibilityState === 'visible') {
					syncNow().catch((err) => console.error('[Layout] Visibility sync failed:', err));
				}
			};
			document.addEventListener('visibilitychange', visibilityHandler);

			// Initialize online status and listen for changes
			isOnline.set(navigator.onLine);

			onlineHandler = () => {
				isOnline.set(true);
				console.log('[Layout] Online - triggering sync');
				syncNow().catch((err) => console.error('[Layout] Online sync failed:', err));
			};

			offlineHandler = () => {
				isOnline.set(false);
				console.log('[Layout] Offline');
			};

			window.addEventListener('online', onlineHandler);
			window.addEventListener('offline', offlineHandler);
		}
	});

	onDestroy(() => {
		if (browser) {
			if (visibilityHandler) {
				document.removeEventListener('visibilitychange', visibilityHandler);
			}
			if (onlineHandler) {
				window.removeEventListener('online', onlineHandler);
			}
			if (offlineHandler) {
				window.removeEventListener('offline', offlineHandler);
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !authChecked}
	<div class="loading-screen">
		<p>Laden...</p>
	</div>
{:else if isPublicPath($page.url.pathname)}
	<!-- Auth pages: no header/nav -->
	<main class="auth-content">
		{@render children()}
	</main>
{:else}
	<!-- App pages: full chrome -->
	<div class="app-container">
		<header class="app-header">
			<div class="header-left">
				<button
					class="header-btn backup-btn"
					onclick={handleCloudBackup}
					disabled={backupInProgress}
					title={lastBackupAt
						? `Letztes Backup: ${formatBackupTime(lastBackupAt)}`
						: 'Noch kein Backup'}
				>
					{backupInProgress ? '...' : 'Save to cloud'}
				</button>
				{#if lastBackupAt}
					<span class="backup-timestamp">{formatBackupTime(lastBackupAt)}</span>
				{/if}
				{#if backupError}
					<span class="backup-error-indicator" title={backupError}>!</span>
				{/if}
			</div>
			<div class="header-right">
				<a href={resolve('/settings')} class="header-btn settings-btn" title="Einstellungen">⚙️</a>
				<button
					class="header-btn logout-btn"
					onclick={() => (showLogoutConfirm = true)}
					title="Abmelden"
				>
					Log out
				</button>
			</div>
		</header>
		<main class="main-content">
			{@render children()}
		</main>
		<TabNavigation />
	</div>
{/if}

<!-- Logout Confirmation Dialog -->
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
	.loading-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
		color: #666;
	}

	.auth-content {
		min-height: 100vh;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100%;
	}

	:global(body) {
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 50;
		gap: 8px;
	}

	.header-left,
	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.header-btn {
		padding: 6px 12px;
		border: none;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}

	.backup-btn {
		background: #3b82f6;
		color: white;
	}

	.backup-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.backup-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.settings-btn {
		background: transparent;
		color: #666;
		border: none;
		text-decoration: none;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
	}

	.settings-btn:hover {
		color: #333;
	}

	.logout-btn {
		background: transparent;
		color: #666;
		border: 1px solid #ddd;
	}

	.logout-btn:hover {
		background: #f5f5f5;
		color: #333;
	}

	.backup-timestamp {
		font-size: 0.75rem;
		color: #888;
		display: none;
	}

	@media (min-width: 480px) {
		.backup-timestamp {
			display: inline;
		}
	}

	.backup-error-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: #dc2626;
		color: white;
		border-radius: 50%;
		font-size: 0.75rem;
		font-weight: bold;
		cursor: help;
	}

	.main-content {
		flex: 1;
		padding-bottom: 60px;
	}

	@media (prefers-color-scheme: dark) {
		.app-header {
			background: #1f1f1f;
			border-bottom-color: #333333;
		}

		.logout-btn {
			color: #aaa;
			border-color: #444;
		}

		.logout-btn:hover {
			background: #333;
			color: #eee;
		}

		.backup-timestamp {
			color: #888;
		}
	}
</style>
