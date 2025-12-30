/**
 * PWA Update Detection Helper
 *
 * Detects when a new Service Worker is waiting and provides
 * a way to activate it and reload the page.
 */

import { writable } from 'svelte/store';

export const updateAvailable = writable<boolean>(false);

let registration: ServiceWorkerRegistration | null = null;
let hasReloaded = false;

/**
 * Setup Service Worker update detection. Call this in onMount.
 */
export function setupUpdateDetection(): void {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
		return;
	}

	navigator.serviceWorker.ready.then((reg) => {
		registration = reg;
		console.log('[PWA Update] Service worker ready');

		// Check if there's already a waiting worker AND an active controller
		// (meaning old version is still active and new version is waiting)
		if (reg.waiting && navigator.serviceWorker.controller) {
			console.log('[PWA Update] Found waiting worker with active controller');
			updateAvailable.set(true);
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
					updateAvailable.set(true);
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

	// Clear the banner immediately to prevent it showing again after reload
	updateAvailable.set(false);

	if (registration?.waiting) {
		console.log('[PWA Update] Sending SKIP_WAITING to waiting worker');
		registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		// The controllerchange event will trigger a reload
		return;
	}

	// No waiting worker means we're already on the latest version
	// Just clear the banner, no reload needed
	console.log('[PWA Update] No waiting worker, already on latest version');
}
