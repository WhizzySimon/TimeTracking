/**
 * OpenAI API wrapper for AI Import
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import type { Category } from '$lib/types';
import type { TimeEntryCandidate } from './types';

export interface ParseRequest {
	content: string;
	categories: Category[];
}

export interface ParseResponse {
	candidates: TimeEntryCandidate[];
	error?: string;
}

/**
 * Parse file content using OpenAI API (client-side wrapper).
 * Calls the server-side API route which handles the actual OpenAI call.
 */
export async function parseWithAI(
	fileContent: string,
	categories: Category[]
): Promise<ParseResponse> {
	try {
		const response = await fetch('/api/import/parse', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: fileContent,
				categories
			} satisfies ParseRequest)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			if (response.status === 403) {
				return { candidates: [], error: 'Premium-Abo erforderlich für AI Import' };
			}
			return { candidates: [], error: errorData.error || `API-Fehler: ${response.status}` };
		}

		const data = await response.json();
		return { candidates: data.candidates || [] };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
		return { candidates: [], error: `Netzwerkfehler: ${message}` };
	}
}

/**
 * Generate a unique ID for a candidate.
 */
export function generateCandidateId(): string {
	return crypto.randomUUID();
}
