/**
 * AI Import Client
 *
 * Client-side wrapper for AI import functionality.
 * All AI calls go through server endpoints to protect API keys.
 *
 * Spec ref: Docs/Specs/ai-import.md Section 8 (AI Integration)
 */

import type { TimeEntryCandidate, ImportSource } from './types';

export interface ParseRequest {
	sources: ImportSource[];
	userCategories: string[];
}

export interface ParseResponse {
	candidates: TimeEntryCandidate[];
	errors: string[];
}

export interface ColumnMappingRequest {
	headers: string[];
	sampleRows: string[][];
}

export interface ColumnMappingResponse {
	mapping: Record<string, string>;
	confidence: number;
}

export interface CategoryGuessRequest {
	texts: string[];
	userCategories: string[];
}

export interface CategoryGuessResponse {
	guesses: Array<{
		text: string;
		category: string | null;
		confidence: number;
	}>;
}

const RATE_LIMIT_KEY = 'import_ai_rate_limit';
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(): boolean {
	const stored = localStorage.getItem(RATE_LIMIT_KEY);
	if (!stored) return true;

	try {
		const { count, timestamp } = JSON.parse(stored);
		const now = Date.now();
		if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
			return true;
		}
		return count < RATE_LIMIT_MAX;
	} catch {
		return true;
	}
}

function incrementRateLimit(): void {
	const stored = localStorage.getItem(RATE_LIMIT_KEY);
	const now = Date.now();

	let count = 1;
	let timestamp = now;

	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			if (now - parsed.timestamp < RATE_LIMIT_WINDOW_MS) {
				count = parsed.count + 1;
				timestamp = parsed.timestamp;
			}
		} catch {
			// Reset on parse error
		}
	}

	localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count, timestamp }));
}

export async function parseImportSources(request: ParseRequest): Promise<ParseResponse> {
	if (!checkRateLimit()) {
		throw new Error('Rate limit exceeded. Please wait before trying again.');
	}

	const response = await fetch('/api/import/parse', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error('Premium subscription required for AI Import.');
		}
		if (response.status === 429) {
			throw new Error('Rate limit exceeded. Please wait before trying again.');
		}
		throw new Error(`Parse request failed: ${response.statusText}`);
	}

	incrementRateLimit();
	return response.json();
}

export async function suggestColumnMapping(
	request: ColumnMappingRequest
): Promise<ColumnMappingResponse> {
	if (!checkRateLimit()) {
		throw new Error('Rate limit exceeded. Please wait before trying again.');
	}

	const response = await fetch('/api/import/columns', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error('Premium subscription required.');
		}
		throw new Error(`Column mapping request failed: ${response.statusText}`);
	}

	incrementRateLimit();
	return response.json();
}

export async function guessCategories(
	request: CategoryGuessRequest
): Promise<CategoryGuessResponse> {
	if (!checkRateLimit()) {
		throw new Error('Rate limit exceeded. Please wait before trying again.');
	}

	const response = await fetch('/api/import/categories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	if (!response.ok) {
		if (response.status === 403) {
			throw new Error('Premium subscription required.');
		}
		throw new Error(`Category guess request failed: ${response.statusText}`);
	}

	incrementRateLimit();
	return response.json();
}

export function getRateLimitStatus(): { remaining: number; resetAt: number | null } {
	const stored = localStorage.getItem(RATE_LIMIT_KEY);
	if (!stored) {
		return { remaining: RATE_LIMIT_MAX, resetAt: null };
	}

	try {
		const { count, timestamp } = JSON.parse(stored);
		const now = Date.now();
		if (now - timestamp > RATE_LIMIT_WINDOW_MS) {
			return { remaining: RATE_LIMIT_MAX, resetAt: null };
		}
		return {
			remaining: Math.max(0, RATE_LIMIT_MAX - count),
			resetAt: timestamp + RATE_LIMIT_WINDOW_MS
		};
	} catch {
		return { remaining: RATE_LIMIT_MAX, resetAt: null };
	}
}
