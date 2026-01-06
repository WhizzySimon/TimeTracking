/**
 * Server-side API route for AI Import parsing
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 *
 * Premium-only endpoint that calls OpenAI Responses API.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { IMPORT_SYSTEM_PROMPT, OPENAI_MODEL } from '$lib/import/prompts/import-system';
import { env } from '$env/dynamic/private';
import { generateCandidateId } from '$lib/import/openai';
import type { TimeEntryCandidate } from '$lib/import/types';

interface AICandidate {
	date: string | null;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	categoryGuess: string | null;
	note: string | null;
	sourceRef: string;
	confidence: number;
}

interface OpenAIResponseData {
	output?: Array<{ content?: Array<{ text?: string }> }>;
}

function extractResponseText(data: OpenAIResponseData): string | null {
	if (data.output?.length && data.output.length > 1) {
		const text = data.output[1]?.content?.[0]?.text;
		if (text) return text;
	}
	if (data.output?.length && data.output.length > 0) {
		const text = data.output[0]?.content?.[0]?.text;
		if (text) return text;
	}
	return null;
}

function cleanJsonResponse(text: string): string {
	let cleaned = text.trim();
	if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
	else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
	if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
	return cleaned.trim();
}

function transformToCandidate(c: AICandidate): TimeEntryCandidate {
	return {
		id: generateCandidateId(),
		date: c.date || null,
		startTime: c.startTime || null,
		endTime: c.endTime || null,
		durationMinutes: c.durationMinutes || null,
		categoryGuess: c.categoryGuess || null,
		categoryId: null,
		note: c.note || null,
		sourceRef: c.sourceRef || 'unknown',
		confidence: typeof c.confidence === 'number' ? c.confidence : 0.5,
		flags: [],
		selected: true,
		edited: false
	};
}

export const POST: RequestHandler = async ({ request }) => {
	const apiKey = env.OPENAI_API_KEY;
	if (!apiKey) throw error(500, 'OpenAI API key not configured');

	const body = await request.json();
	const { content } = body as { content: string };

	if (!content || typeof content !== 'string') throw error(400, 'Content is required');
	if (content.length > 500000) throw error(400, 'Content too large (max 500KB)');

	try {
		const response = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: OPENAI_MODEL,
				input: [
					{ role: 'system', content: IMPORT_SYSTEM_PROMPT },
					{ role: 'user', content }
				]
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('OpenAI API error:', errorData);
			throw error(502, `OpenAI API error: ${errorData.error?.message || response.statusText}`);
		}

		const data: OpenAIResponseData = await response.json();
		const responseText = extractResponseText(data);
		if (!responseText) {
			console.error('Unexpected OpenAI response format:', data);
			throw error(502, 'Unexpected response format from OpenAI');
		}

		const cleanedJson = cleanJsonResponse(responseText);
		const aiCandidates: AICandidate[] = JSON.parse(cleanedJson);
		if (!Array.isArray(aiCandidates)) throw error(502, 'AI response is not an array');

		const candidates = aiCandidates.map(transformToCandidate);
		return json({ candidates });
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) throw err;
		console.error('Import parse error:', err);
		throw error(500, 'Internal server error');
	}
};
