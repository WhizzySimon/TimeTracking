<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { dev, browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto, pushState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import '$lib/styles/theme.css';
	import TabNavigation from '$lib/components/TabNavigation.svelte';
	import EmployerSelector from '$lib/components/EmployerSelector.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import ForwardButton from '$lib/components/ForwardButton.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { syncNow, checkSyncStatus } from '$lib/sync/engine';
	import {
		isOnline,
		syncInProgress,
		runningEntry,
		currentDate,
		employers,
		selectedEmployerId,
		timeEntries,
		categories
	} from '$lib/stores';
	import { saveTimeEntry } from '$lib/storage/operations';
	import { formatTime } from '$lib/utils/date';
	import { getAll } from '$lib/storage/db';
	import type { TimeEntry } from '$lib/types';
	import TaskItem from '$lib/components/TaskItem.svelte';
	import WarningBanner from '$lib/components/WarningBanner.svelte';
	import { loadSession, isAuthenticated, clearSession, authSession } from '$lib/stores/auth';
	import {
		setUserProfile,
		clearUserProfile,
		isPro,
		loadPersistedPlanOverride,
		loadNeverAddedAnEntry,
		loadPersistedUserName
	} from '$lib/stores/user';
	import Paywall from '$lib/components/Paywall.svelte';
	import { loadUserProfile, clearCachedPlan } from '$lib/api/profile';
	import { getCurrentUserId } from '$lib/api/auth';
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
	let showProPaywall = $state(false);

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
		clearUserProfile();
		clearCachedPlan();
		showLogoutConfirm = false;
		goto(resolve('/login'));
	}

	function handleRunningTaskClick() {
		const entry = $runningEntry;
		if (!entry) return;
		currentDate.set(new Date(entry.date + 'T00:00:00'));
		pushState(resolve('/day'), { editEntryId: entry.id });
	}

	// Get category and employer for running task display
	let runningTaskCategory = $derived(
		$runningEntry ? $categories.find((c) => c.id === $runningEntry.categoryId) : undefined
	);

	let runningTaskEmployer = $derived(() => {
		if (!$runningEntry?.employerId) return undefined;
		return $employers.find((e) => e.id === $runningEntry.employerId);
	});

	/**
	 * End the running task immediately from the header.
	 * Navigates to Day tab if not already there so user can see the ended task.
	 */
	async function handleEndRunningTask() {
		const entry = $runningEntry;
		if (!entry) return;

		const now = new Date();
		const currentTimeStr = formatTime(now);

		const endedEntry = {
			...entry,
			endTime: currentTimeStr,
			updatedAt: Date.now()
		};
		await saveTimeEntry(endedEntry);

		// Reload entries to update the store and trigger banner reactivity
		const allEntries = await getAll<TimeEntry>('timeEntries');
		timeEntries.set(allEntries);

		// Navigate to Day tab if not already there, set date to task's date
		const currentPath = $page.url.pathname;
		if (!currentPath.endsWith('/day')) {
			currentDate.set(new Date(entry.date + 'T00:00:00'));
			goto(resolve('/day'));
		}
	}

	async function handleSyncClick() {
		// Cloud backup requires Pro plan
		if (!$isPro) {
			showProPaywall = true;
			return;
		}
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
			} else if (result.action === 'merge' && result.success) {
				// Merge completed - reload to show merged data
				console.log('[Layout] Merge completed - reloading');
				window.location.reload();
				return;
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

	/**
	 * Silent auto-sync triggered by visibility changes.
	 * Does not show dialogs - conflicts are deferred to next manual sync.
	 */
	async function autoSync() {
		// Skip if offline, not authenticated, already syncing, or not Pro
		if (!$isOnline || !$isAuthenticated || $syncInProgress || !$isPro) {
			return;
		}

		syncInProgress.set(true);

		try {
			const result: SyncResult = await syncWithCloud();

			if (result.needsConflictResolution) {
				// Don't show dialog for auto-sync - user will see it on next manual sync
				console.log('[Layout] Auto-sync detected conflict - deferred to manual sync');
				syncNeeded = true;
			} else if ((result.action === 'restore' || result.action === 'merge') && result.success) {
				// Reload app to reflect restored/merged cloud data
				console.log('[Layout] Auto-sync restored/merged from cloud - reloading');
				window.location.reload();
				return;
			} else if (result.success || result.action === 'noop') {
				syncNeeded = false;
			}
			// Silently ignore errors for auto-sync
		} catch (e) {
			console.error('[Layout] Auto-sync failed:', e);
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
			} else if (choice === 'cloud') {
				// Reload app to reflect restored cloud data
				window.location.reload();
				return;
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

			// Load user profile if authenticated
			const userId = await getCurrentUserId();
			if (userId) {
				const profile = await loadUserProfile(userId);
				setUserProfile(profile);
				loadPersistedPlanOverride();
				loadPersistedUserName();
			}

			// Load neverAddedAnEntry flag (with migration logic)
			await loadNeverAddedAnEntry();

			// Check if sync is needed on startup
			syncNeeded = await needsSync();
		}

		// Check sync status on startup
		checkSyncStatus();

		// Trigger outbox sync on startup (after a short delay to let app initialize)
		setTimeout(() => {
			syncNow().catch((err) => console.error('[Layout] Startup outbox sync failed:', err));
		}, 1000);

		// Trigger cloud sync on startup (after auth is checked)
		setTimeout(() => {
			autoSync();
		}, 1500);

		// Trigger cloud sync when user enters or leaves the app
		if (browser) {
			visibilityHandler = () => {
				// Sync on both visible (entering) and hidden (leaving)
				// - visible: pull any cloud changes
				// - hidden: push any local changes before user leaves
				autoSync();
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
				<BackButton />
				<ForwardButton />
				<EmployerSelector
					employers={$employers}
					value={$selectedEmployerId}
					onchange={(id) => selectedEmployerId.set(id)}
					compact
				/>
			</div>
			<div class="header-right">
				<button
					class="sync-indicator"
					class:synced={!syncNeeded && !$syncInProgress}
					class:syncing={$syncInProgress}
					onclick={handleSyncClick}
					title={!syncNeeded && !$syncInProgress
						? 'Synchronisiert'
						: syncNeeded
							? 'Synchronisierung ausstehend'
							: 'Synchronisiere...'}
					aria-label="Synchronisierung"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="23 4 23 10 17 10"></polyline>
						<polyline points="1 20 1 14 7 14"></polyline>
						<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
					</svg>
				</button>
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
		<!-- Banner priority: Sync error > Update > Install -->
		{#if syncError}
			<div class="sync-error-banner">
				<WarningBanner
					message="Synchronisierung fehlgeschlagen: {syncError}"
					onclick={handleSyncClick}
					actionLabel="Erneut versuchen"
					onaction={handleSyncClick}
				/>
			</div>
		{:else if hasUpdate}
			<div class="update-banner">
				<button class="update-btn" onclick={applyUpdate}> Update verfügbar – neu laden </button>
			</div>
		{:else if canInstall}
			<div class="install-banner">
				<button class="install-btn" onclick={triggerInstall}> App installieren </button>
			</div>
		{/if}
		{#if $runningEntry}
			<div class="running-task-header">
				<TaskItem
					entry={$runningEntry}
					category={runningTaskCategory}
					employer={runningTaskEmployer()}
					onclick={handleRunningTaskClick}
					onend={handleEndRunningTask}
				/>
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

<!-- Pro Paywall for Cloud Backup -->
{#if showProPaywall}
	<Paywall feature="backup" onclose={() => (showProPaywall = false)} />
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
		border-radius: 0 0 var(--r-card) var(--r-card);
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

	.sync-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px;
		margin-right: 8px;
		background: transparent;
		border: none;
		color: #ffa726;
		opacity: 0.9;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.sync-indicator:hover {
		opacity: 1;
	}

	.sync-indicator.synced {
		color: #4caf50;
		opacity: 1;
	}

	.sync-indicator.syncing {
		color: var(--header-text);
		opacity: 0.8;
		animation: rotate 1.5s linear infinite;
		cursor: default;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
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

	.main-content {
		flex: 1;
		padding-bottom: 70px;
	}

	.sync-error-banner {
		padding: 0.5rem 1rem;
	}

	.install-banner {
		background: var(--header-bg);
		padding: 8px 12px;
		display: flex;
		justify-content: center;
		align-items: center;
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

	.running-task-header {
		padding: 0 1rem;
		margin-top: 0.5rem;
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
