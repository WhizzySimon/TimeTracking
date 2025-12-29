import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },

		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Code quality: cyclomatic complexity threshold (Phase A enforcement)
			complexity: ['error', 20],
			// Naming: minimum identifier length (except common patterns)
			'id-length': [
				'warn',
				{
					min: 3,
					exceptions: [
						'i',
						'j',
						'k',
						'x',
						'y', // loop indices
						'a',
						'b', // sort comparisons
						'e', // event handlers
						'c',
						'd',
						'f',
						'l',
						'm',
						'n',
						't',
						'v', // callback params
						'h',
						's', // hours, seconds
						'_',
						'__', // unused params
						'id',
						'db',
						'fs',
						'os',
						'io',
						'rl',
						'tx',
						'tz',
						'js',
						'ts' // common abbreviations
					]
				}
			]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],

		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['**/*.cjs'],
		rules: {
			'@typescript-eslint/no-require-imports': 'off'
		}
	}
);
