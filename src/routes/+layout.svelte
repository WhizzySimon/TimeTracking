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
	import { isOnline, backupNeeded as backupNeededStore } from '$lib/stores';
	import { loadSession, isAuthenticated, clearSession, authSession } from '$lib/stores/auth';
	import { saveToCloud, needsBackup as checkNeedsBackup } from '$lib/backup/cloud';
	import { setupInstallPrompt, installState, triggerInstall } from '$lib/pwa/install';
	import { setupUpdateDetection, updateAvailable, applyUpdate } from '$lib/pwa/update';

	let { children } = $props();

	let visibilityHandler: (() => void) | null = null;
	let onlineHandler: (() => void) | null = null;
	let offlineHandler: (() => void) | null = null;
	let authChecked = $state(false);

	let showLogoutConfirm = $state(false);
	let showOfflineDialog = $state(false);
	let showProfileMenu = $state(false);
	let backupInProgress = $state(false);
	let backupError = $state<string | null>(null);
	let canInstall = $state(false);
	let hasUpdate = $state(false);

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
			if (result.success) {
				backupNeededStore.set(false);
			} else {
				backupError = result.error ?? 'Backup fehlgeschlagen';
			}
		} catch (e) {
			console.error('[Layout] Backup failed:', e);
			backupError = e instanceof Error ? e.message : 'Backup fehlgeschlagen';
		} finally {
			backupInProgress = false;
		}
	}

	onMount(async () => {
		if (!dev && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js');
		}

		// Setup PWA install prompt
		setupInstallPrompt();
		installState.subscribe((state) => {
			canInstall = state.canInstall && !state.isInstalled;
		});

		// Setup SW update detection
		setupUpdateDetection();
		updateAvailable.subscribe((available) => {
			hasUpdate = available;
		});

		// Check authentication status
		if (browser) {
			await loadSession();
			authChecked = true;

			// Check if backup is needed and update store
			backupNeededStore.set(await checkNeedsBackup());
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
					disabled={backupInProgress || !$backupNeededStore}
					title={$backupNeededStore
						? 'Änderungen in die Cloud sichern'
						: 'Alle Änderungen in der Cloud gesichert'}
				>
					{#if backupInProgress}
						...
					{:else if $backupNeededStore}
						Save to cloud
					{:else}
						Saved to cloud
					{/if}
				</button>
				{#if backupError}
					<span class="backup-error-indicator" title={backupError}>!</span>
				{/if}
			</div>
			<div class="header-right">
				<div class="profile-menu-container">
					<button
						class="header-btn profile-btn"
						onclick={() => (showProfileMenu = !showProfileMenu)}
						title="Profil"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="8" r="4"></circle>
							<path d="M20 21a8 8 0 1 0-16 0"></path>
						</svg>
					</button>
					{#if showProfileMenu}
						<div class="profile-menu" role="menu">
							<div class="profile-email">
								{$authSession?.email ?? 'Nicht angemeldet'}
							</div>
							<div class="menu-divider"></div>
							<a
								href={resolve('/settings')}
								class="menu-item"
								role="menuitem"
								onclick={() => (showProfileMenu = false)}
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
									<circle cx="12" cy="12" r="3"></circle>
									<path
										d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
									></path>
								</svg>
								Einstellungen
							</a>
							<button
								class="menu-item logout"
								role="menuitem"
								onclick={() => {
									showProfileMenu = false;
									showLogoutConfirm = true;
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
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
									<polyline points="16 17 21 12 16 7"></polyline>
									<line x1="21" y1="12" x2="9" y2="12"></line>
								</svg>
								Abmelden
							</button>
						</div>
						<button
							class="profile-menu-backdrop"
							onclick={() => (showProfileMenu = false)}
							aria-label="Menü schließen"
						></button>
					{/if}
				</div>
			</div>
		</header>
		{#if hasUpdate}
			<div class="update-banner">
				<button class="update-btn" onclick={applyUpdate}> Update verfügbar – neu laden </button>
			</div>
		{:else if canInstall}
			<div class="install-banner">
				<button class="install-btn" onclick={triggerInstall}> App installieren </button>
			</div>
		{/if}
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
		background-color: #ffffff;
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 600px;
		margin: 0 auto;
		background-color: #eff6ff;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 1rem;
		background: #1e40af;
		border-bottom: 1px solid #1e3a8a;
		position: sticky;
		top: 0;
		z-index: 50;
		gap: 8px;
		width: 100%;
		box-sizing: border-box;
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
		cursor: default;
	}

	.profile-menu-container {
		position: relative;
	}

	.profile-btn {
		background: transparent;
		color: #bfdbfe;
		border: 1px solid #3b82f6;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.profile-btn:hover {
		background: #2563eb;
		color: #ffffff;
	}

	.profile-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 8px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 200px;
		z-index: 100;
		overflow: hidden;
	}

	.profile-email {
		padding: 12px 16px;
		font-size: 0.85rem;
		color: #666;
		background: #f9fafb;
		border-bottom: 1px solid #eee;
		word-break: break-all;
	}

	.menu-divider {
		height: 1px;
		background: #eee;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		font-size: 0.9rem;
		color: #333;
		text-decoration: none;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
	}

	.menu-item:hover {
		background: #f5f5f5;
	}

	.menu-item.logout {
		color: #dc2626;
	}

	.menu-item.logout:hover {
		background: #fef2f2;
	}

	.profile-menu-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		border: none;
		z-index: 99;
		cursor: default;
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
		padding-bottom: 70px;
	}

	.install-banner {
		background: #1e3a8a;
		padding: 8px 12px;
		display: flex;
		justify-content: center;
	}

	.install-btn {
		background: #22c55e;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		max-width: 300px;
	}

	.install-btn:hover {
		background: #16a34a;
	}

	.update-banner {
		background: #1e3a8a;
		padding: 8px 12px;
		display: flex;
		justify-content: center;
	}

	.update-btn {
		background: #f59e0b;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 8px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		max-width: 300px;
	}

	.update-btn:hover {
		background: #d97706;
	}
</style>
