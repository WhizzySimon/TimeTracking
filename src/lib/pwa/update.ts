/**
 * PWA Update Detection Helper
 *
 * Detects when a new Service Worker is waiting and provides
 * a way to activate it and reload the page.
 *
 * Key behaviors:
 * - Never shows banner when offline
 * - Compares build IDs to detect real updates
 * - Uses sessionStorage to prevent banner spam across reloads
 * - Handles multi-tab scenarios safely
 */

import { writable } from 'svelte/store';

export const updateAvailable = writable<boolean>(false);

const STORAGE_KEY_PROMPTED_VERSION = 'tt:lastPromptedAvailableVersion';
const STORAGE_KEY_UPDATE_IN_PROGRESS = 'tt:updateInProgress';
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let registration: ServiceWorkerRegistration | null = null;
let controllerChangeHandled = false;

function getCurrentBuildId(): string {
	return typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'unknown';
}

function isOnline(): boolean {
	return typeof navigator !== 'undefined' && navigator.onLine;
}

async function fetchAvailableBuildId(): Promise<string | null> {
	if (!isOnline()) {
		console.log('[PWA Update] Offline - skipping version check');
		return null;
	}

	try {
		const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' });
		if (!response.ok) {
			console.log('[PWA Update] Version fetch failed:', response.status);
			return null;
		}
		const versionInfo = await response.json();
		if (!versionInfo.version || !versionInfo.buildTime) {
			console.log('[PWA Update] Invalid version.json format');
			return null;
		}
		return `${versionInfo.version}-${versionInfo.buildTime}`;
	} catch (error) {
		console.log('[PWA Update] Version fetch error:', error);
		return null;
	}
}

function shouldShowBanner(availableBuildId: string): boolean {
	const currentBuildId = getCurrentBuildId();

	// Must be online
	if (!isOnline()) {
		return false;
	}

	// Must have a real version difference
	if (availableBuildId === currentBuildId) {
		console.log('[PWA Update] Already on latest version');
		return false;
	}

	// Check if update is already in progress
	if (sessionStorage.getItem(STORAGE_KEY_UPDATE_IN_PROGRESS) === '1') {
		console.log('[PWA Update] Update already in progress');
		return false;
	}

	// Check if we already prompted for this version in this session
	const lastPrompted = sessionStorage.getItem(STORAGE_KEY_PROMPTED_VERSION);
	if (lastPrompted === availableBuildId) {
		console.log('[PWA Update] Already prompted for this version');
		return false;
	}

	return true;
}

function showBannerForVersion(availableBuildId: string): void {
	sessionStorage.setItem(STORAGE_KEY_PROMPTED_VERSION, availableBuildId);
	console.log('[PWA Update] Showing banner for version:', availableBuildId);
	updateAvailable.set(true);
}

async function checkForUpdate(): Promise<void> {
	if (!isOnline()) {
		console.log('[PWA Update] Offline - skipping update check');
		return;
	}

	const availableBuildId = await fetchAvailableBuildId();
	if (!availableBuildId) {
		return;
	}

	if (shouldShowBanner(availableBuildId)) {
		// Also trigger SW update check to ensure waiting worker is ready
		if (registration) {
			try {
				await registration.update();
			} catch (error) {
				console.log('[PWA Update] SW update check failed:', error);
			}
		}
		showBannerForVersion(availableBuildId);
	}
}

/**
 * Setup Service Worker update detection. Call this in onMount.
 */
export function setupUpdateDetection(): void {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		return;
	}

	// Clear update-in-progress flag on fresh page load (not from controllerchange)
	if (sessionStorage.getItem(STORAGE_KEY_UPDATE_IN_PROGRESS) === '1') {
		console.log('[PWA Update] Clearing stale update-in-progress flag');
		sessionStorage.removeItem(STORAGE_KEY_UPDATE_IN_PROGRESS);
	}

	navigator.serviceWorker.ready.then((reg) => {
		registration = reg;
		console.log('[PWA Update] Service worker ready, current build:', getCurrentBuildId());

		// Initial check (only if online)
		if (isOnline()) {
			checkForUpdate();
		}

		// Listen for new SW installations
		reg.addEventListener('updatefound', () => {
			console.log('[PWA Update] Update found');
			const newWorker = reg.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				console.log('[PWA Update] New worker state:', newWorker.state);
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					// New SW installed - check if we should show banner
					checkForUpdate();
				}
			});
		});

		// Periodic check (every 5 minutes, only when visible and online)
		setInterval(() => {
			if (document.visibilityState === 'visible' && isOnline()) {
				checkForUpdate();
			}
		}, UPDATE_CHECK_INTERVAL_MS);
	});

	// Re-check when coming back online
	window.addEventListener('online', () => {
		console.log('[PWA Update] Back online - checking for updates');
		checkForUpdate();
	});

	// Listen for controller change to reload (once per page load)
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log('[PWA Update] Controller changed');
		if (!controllerChangeHandled) {
			controllerChangeHandled = true;
			window.location.reload();
		}
	});
}

/**
 * Apply the waiting update by sending SKIP_WAITING to the waiting SW.
 * The page will reload automatically when the new SW takes control.
 */
export function applyUpdate(): void {
	console.log('[PWA Update] Applying update...');

	// Mark update in progress to prevent banner showing again during reload
	sessionStorage.setItem(STORAGE_KEY_UPDATE_IN_PROGRESS, '1');

	// Clear the banner immediately
	updateAvailable.set(false);

	if (registration?.waiting) {
		console.log('[PWA Update] Sending SKIP_WAITING to waiting worker');
		registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		// The controllerchange event will trigger a reload
		return;
	}

	// No waiting worker - try to trigger SW update and reload
	if (registration) {
		console.log('[PWA Update] No waiting worker, triggering update check');
		registration
			.update()
			.then(() => {
				// Give the SW a moment to install, then reload
				setTimeout(() => {
					window.location.reload();
				}, 500);
			})
			.catch(() => {
				window.location.reload();
			});
		return;
	}

	// Fallback: just reload
	console.log('[PWA Update] No registration, reloading');
	window.location.reload();
}

/**
 * Dismiss the update banner for this session without applying.
 * User can still update by refreshing the page.
 */
export function dismissUpdate(): void {
	console.log('[PWA Update] Banner dismissed');
	updateAvailable.set(false);
}
