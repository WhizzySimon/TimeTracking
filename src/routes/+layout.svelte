<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dev, browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import '$lib/styles/theme.css';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { syncNow, checkSyncStatus } from '$lib/sync/engine';
	import { isOnline, syncInProgress } from '$lib/stores';
	import { loadSession, isAuthenticated, clearSession, authSession } from '$lib/stores/auth';
	import { syncWithCloud, resolveConflict, needsSync, type SyncResult } from '$lib/backup/cloud';
	import type { DatabaseSnapshot } from '$lib/backup/snapshot';
	import { setupInstallPrompt, installState, triggerInstall } from '$lib/pwa/install';
	import { setupUpdateDetection, updateAvailable, applyUpdate } from '$lib/pwa/update';
	import { initTheme } from '$lib/stores/theme';

	let { children } = $props();

	let visibilityHandler: (() => void) | null = null;
	let onlineHandler: (() => void) | null = null;
	let offlineHandler: (() => void) | null = null;
	let authChecked = $state(false);

	let showLogoutConfirm = $state(false);
	let showOfflineDialog = $state(false);
	let showConflictDialog = $state(false);
	let showSyncInfoDialog = $state(false);
	let showProfileMenu = $state(false);
	let syncError = $state<string | null>(null);
	let canInstall = $state(false);
	let hasUpdate = $state(false);
	let syncNeeded = $state(true);

	// Conflict resolution state
	let pendingCloudSnapshot = $state<DatabaseSnapshot | null>(null);
	let pendingCloudUpdatedAt = $state<string | null>(null);

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

	async function handleSyncClick() {
		// If already synced, show info dialog
		if (!syncNeeded && !$syncInProgress) {
			showSyncInfoDialog = true;
			return;
		}
		await handleSync();
	}

	async function handleSync() {
		syncError = null;

		if (!$isOnline) {
			showOfflineDialog = true;
			return;
		}

		syncInProgress.set(true);

		try {
			const result: SyncResult = await syncWithCloud();

			if (result.needsConflictResolution) {
				// Store conflict data and show dialog
				pendingCloudSnapshot = result.cloudSnapshot ?? null;
				pendingCloudUpdatedAt = result.cloudUpdatedAt ?? null;
				showConflictDialog = true;
			} else if (!result.success) {
				syncError = result.error ?? 'Synchronisierung fehlgeschlagen';
			}
			// On success (upload/restore/noop): nothing to show, it just worked
		// Update sync needed state after successful sync
			if (result.success || result.action === 'noop') {
				syncNeeded = false;
			}
		} catch (e) {
			console.error('[Layout] Sync failed:', e);
			syncError = e instanceof Error ? e.message : 'Synchronisierung fehlgeschlagen';
		} finally {
			syncInProgress.set(false);
		}
	}

	async function handleConflictChoice(choice: 'local' | 'cloud') {
		showConflictDialog = false;
		syncInProgress.set(true);

		try {
			const result = await resolveConflict(choice, pendingCloudSnapshot, pendingCloudUpdatedAt);
			if (!result.success) {
				syncError = result.error ?? 'Konfliktlösung fehlgeschlagen';
			}
		} catch (e) {
			console.error('[Layout] Conflict resolution failed:', e);
			syncError = e instanceof Error ? e.message : 'Konfliktlösung fehlgeschlagen';
		} finally {
			syncInProgress.set(false);
			pendingCloudSnapshot = null;
			pendingCloudUpdatedAt = null;
		}
	}

	onMount(async () => {
		// Initialize theme from localStorage
		initTheme();

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

			// Check if sync is needed on startup
			syncNeeded = await needsSync();
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
					class="header-btn sync-btn"
					class:synced={!syncNeeded && !$syncInProgress}
					onclick={handleSyncClick}
					disabled={$syncInProgress}
				>
					{#if $syncInProgress}
						...
					{:else}
						Sync
					{/if}
				</button>
				{#if syncError}
					<span class="sync-error-indicator" title={syncError}>!</span>
				{/if}
			</div>
			<div class="header-right">
				<div class="profile-menu-container">
					<button
						class="header-btn profile-btn"
						onclick={() => (showProfileMenu = !showProfileMenu)}
						aria-label="Profil"
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
		message="Synchronisierung nicht möglich — Sie sind offline. Ihre Änderungen sind lokal gespeichert."
		confirmLabel="OK"
		onconfirm={() => (showOfflineDialog = false)}
	/>
{/if}

<!-- Conflict Dialog -->
{#if showConflictDialog}
	<ConfirmDialog
		title="Datenkonflikt"
		message="Lokale und Cloud-Daten unterscheiden sich. Welche Version möchten Sie behalten?"
		confirmLabel="Cloud behalten"
		cancelLabel="Lokal behalten"
		onconfirm={() => handleConflictChoice('cloud')}
		oncancel={() => handleConflictChoice('local')}
	/>
{/if}

<!-- Sync Info Dialog -->
{#if showSyncInfoDialog}
	<ConfirmDialog
		type="alert"
		title="Daten synchronisiert"
		message="Ihre Daten sind bereits mit der Cloud synchronisiert. Alle Änderungen werden automatisch lokal gespeichert — nichts geht verloren."
		confirmLabel="OK"
		onconfirm={() => (showSyncInfoDialog = false)}
	/>
{/if}

<style>
	.loading-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		color: var(--muted);
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
		font-family: var(--font-family);
		background-color: var(--bg);
		color: var(--text);
	}

	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		max-width: 600px;
		margin: 0 auto;
		background-color: var(--bg);
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 1rem;
		background: var(--header-bg);
		border-bottom: 1px solid var(--header-border);
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
		border-radius: var(--r-btn);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}

	.sync-btn {
		background: rgba(255, 255, 255, 0.2);
		color: var(--header-text);
	}

	.sync-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.3);
	}

	.sync-btn:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.sync-btn.synced {
		opacity: 0.6;
		cursor: pointer;
	}

	.sync-btn.synced:hover {
		opacity: 0.7;
		background: rgba(255, 255, 255, 0.25);
	}

	.profile-menu-container {
		position: relative;
	}

	.profile-btn {
		background: transparent;
		color: var(--header-text-muted);
		border: 1px solid var(--header-border);
		border-radius: 50%;
		width: 36px;
		height: 36px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.profile-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		color: var(--header-text);
	}

	.profile-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 8px;
		background: var(--surface);
		border-radius: var(--r-card);
		box-shadow: var(--elev-2);
		min-width: 200px;
		z-index: 100;
		overflow: hidden;
	}

	.profile-email {
		padding: 12px 16px;
		font-size: 0.85rem;
		color: var(--muted);
		background: var(--surface-hover);
		border-bottom: 1px solid var(--border);
		word-break: break-all;
	}

	.menu-divider {
		height: 1px;
		background: var(--border);
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		font-size: 0.9rem;
		color: var(--text);
		text-decoration: none;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
	}

	.menu-item:hover {
		background: var(--surface-hover);
	}

	.menu-item.logout {
		color: var(--neg);
	}

	.menu-item.logout:hover {
		background: var(--neg-light);
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

	.sync-error-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: var(--neg);
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
		background: var(--header-bg);
		padding: 8px 12px;
		display: flex;
		justify-content: center;
		border-radius: var(--r-banner);
	}

	.install-btn {
		background: var(--pos);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		padding: 8px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		max-width: 300px;
	}

	.install-btn:hover {
		opacity: 0.9;
	}

	.update-banner {
		background: var(--header-bg);
		padding: 8px 12px;
		display: flex;
		justify-content: center;
		border-radius: var(--r-banner);
	}

	.update-btn {
		background: var(--warning);
		color: white;
		border: none;
		border-radius: var(--r-btn);
		padding: 8px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		width: 100%;
		max-width: 300px;
	}

	.update-btn:hover {
		opacity: 0.9;
	}
</style>
