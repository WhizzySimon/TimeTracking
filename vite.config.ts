import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync, existsSync } from 'fs';

function getBuildId(): string {
	const versionPath = 'static/version.json';
	if (existsSync(versionPath)) {
		try {
			const versionInfo = JSON.parse(readFileSync(versionPath, 'utf-8'));
			return `${versionInfo.version}-${versionInfo.buildTime}`;
		} catch {
			// Fall through to default
		}
	}
	return 'dev-' + Date.now();
}

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__APP_BUILD_ID__: JSON.stringify(getBuildId())
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	},
	server: {
		port: 5173,
		strictPort: true
	}
});
