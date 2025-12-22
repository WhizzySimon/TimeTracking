/**
 * PWA Install Prompt Helper
 *
 * Captures the beforeinstallprompt event and provides a way to trigger
 * the native install prompt from an in-app button.
 */

import { writable } from 'svelte/store';

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallState {
	canInstall: boolean;
	isInstalled: boolean;
}

const initialState: InstallState = {
	canInstall: false,
	isInstalled: false
};

export const installState = writable<InstallState>(initialState);

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * Check if the app is running in standalone mode (installed)
 */
function checkIsInstalled(): boolean {
	if (typeof window === 'undefined') return false;

	// Check display-mode: standalone (works on most browsers)
	if (window.matchMedia('(display-mode: standalone)').matches) {
		return true;
	}

	// Check iOS Safari standalone mode
	if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) {
		return true;
	}

	return false;
}

/**
 * Setup install prompt listeners. Call this in onMount.
 */
export function setupInstallPrompt(): void {
	if (typeof window === 'undefined') return;

	// Check if already installed
	const isInstalled = checkIsInstalled();
	if (isInstalled) {
		installState.set({ canInstall: false, isInstalled: true });
		return;
	}

	// Listen for beforeinstallprompt
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e as BeforeInstallPromptEvent;
		installState.set({ canInstall: true, isInstalled: false });
	});

	// Listen for appinstalled
	window.addEventListener('appinstalled', () => {
		deferredPrompt = null;
		installState.set({ canInstall: false, isInstalled: true });
	});

	// Also listen for display-mode changes (in case user installs via browser menu)
	const mediaQuery = window.matchMedia('(display-mode: standalone)');
	mediaQuery.addEventListener('change', (e) => {
		if (e.matches) {
			deferredPrompt = null;
			installState.set({ canInstall: false, isInstalled: true });
		}
	});
}

/**
 * Trigger the install prompt. Returns true if user accepted, false otherwise.
 */
export async function triggerInstall(): Promise<boolean> {
	if (!deferredPrompt) {
		return false;
	}

	try {
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		// Clear the deferred prompt regardless of outcome
		deferredPrompt = null;
		installState.set({ canInstall: false, isInstalled: outcome === 'accepted' });

		return outcome === 'accepted';
	} catch {
		// Clear on error as well
		deferredPrompt = null;
		installState.set({ canInstall: false, isInstalled: false });
		return false;
	}
}
