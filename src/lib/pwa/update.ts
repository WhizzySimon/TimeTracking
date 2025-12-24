/**
 * PWA Update Detection Helper
 *
 * Detects when a new Service Worker is waiting and provides
 * a way to activate it and reload the page.
 *
 * P09 SPEC COMPLIANCE:
 * - Section 1.1: Update notifications MUST distinguish browser vs installed PWA
 * - Section 1.2: Update UI MUST NOT be shown in browser mode
 * - Section 1.3: Reload MUST NOT invalidate authentication state
 *   (Auth is stored in IndexedDB which survives SW updates and page reloads)
 */

import { writable, derived } from 'svelte/store';
import { checkIsInstalled } from './install';

/**
 * Raw update available state (internal).
 * This is set when a new SW is waiting, regardless of browser/PWA mode.
 */
const updateAvailableRaw = writable<boolean>(false);

/**
 * Whether the app is running as installed PWA.
 * Update UI should only be shown when this is true.
 * P09 Section 1.2: Update notifications MUST NOT be shown in browser mode.
 */
export const isInstalledPWA = writable<boolean>(false);

/**
 * Public update available state.
 * Only true when:
 * 1. A new SW version is waiting, AND
 * 2. App is running as installed PWA (not browser tab)
 *
 * P09 Section 1.2: Service Worker updates MUST NOT trigger user-facing
 * "Update available" UI in browser mode.
 */
export const updateAvailable = derived(
	[updateAvailableRaw, isInstalledPWA],
	([$raw, $installed]) => $raw && $installed
);

let registration: ServiceWorkerRegistration | null = null;
let hasReloaded = false;

/**
 * Setup Service Worker update detection. Call this in onMount.
 *
 * P09 Section 1.1: Detection distinguishes browser vs installed PWA.
 * P09 Section 1.2: Update UI only shown in installed PWA mode.
 */
export function setupUpdateDetection(): void {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		return;
	}

	// P09 Section 1.1: Detect if running as installed PWA
	const installed = checkIsInstalled();
	isInstalledPWA.set(installed);
	console.log('[PWA Update] Running as installed PWA:', installed);

	navigator.serviceWorker.ready.then((reg) => {
		registration = reg;
		console.log('[PWA Update] Service worker ready');

		// Check if there's already a waiting worker
		if (reg.waiting) {
			console.log('[PWA Update] Found waiting worker');
			updateAvailableRaw.set(true);
		}

		// Listen for new updates
		reg.addEventListener('updatefound', () => {
			console.log('[PWA Update] Update found');
			const newWorker = reg.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				console.log('[PWA Update] New worker state:', newWorker.state);
				// New worker is installed and there's an active controller
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					console.log('[PWA Update] New version available');
					updateAvailableRaw.set(true);
				}
			});
		});

		// Periodically check for updates (every 60 seconds)
		setInterval(() => {
			reg.update().catch((err) => console.error('[PWA Update] Check failed:', err));
		}, 60000);
	});

	// Listen for controller change to reload
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		console.log('[PWA Update] Controller changed');
		if (!hasReloaded) {
			hasReloaded = true;
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

	if (registration?.waiting) {
		console.log('[PWA Update] Sending SKIP_WAITING to waiting worker');
		registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		return;
	}

	// Fallback: if no waiting worker, just reload
	console.log('[PWA Update] No waiting worker, reloading page');
	window.location.reload();
}
