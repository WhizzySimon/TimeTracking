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

		// Check if there's already a waiting worker
		if (reg.waiting) {
			updateAvailable.set(true);
		}

		// Listen for new updates
		reg.addEventListener('updatefound', () => {
			const newWorker = reg.installing;
			if (!newWorker) return;

			newWorker.addEventListener('statechange', () => {
				// New worker is installed and there's an active controller
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					updateAvailable.set(true);
				}
			});
		});
	});

	// Listen for controller change to reload
	navigator.serviceWorker.addEventListener('controllerchange', () => {
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
	if (!registration?.waiting) {
		return;
	}

	registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}
