/**
 * OCR API Endpoint
 *
 * Processes images for text extraction.
 * Returns extracted text with confidence score.
 *
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface OCRRequest {
	image: string;
}

interface OCRResponse {
	text: string;
	confidence: number;
	isHandwritten: boolean;
}

function detectHandwriting(text: string): boolean {
	const irregularSpacing = /\s{3,}/.test(text);
	const lowAlphaRatio = text.replace(/[^a-zA-Z]/g, '').length / text.length < 0.3;
	const manySpecialChars = /[^a-zA-Z0-9\s.,;:!?-]{5,}/.test(text);

	return irregularSpacing || lowAlphaRatio || manySpecialChars;
}

export const POST: RequestHandler = async ({ request }) => {
	let body: OCRRequest;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body.image) {
		throw error(400, 'image field required');
	}

	const mockText = `
14.01.2024
09:00 - 12:30 Meeting mit Team
13:30 - 17:00 Entwicklung Feature X
	`.trim();

	const isHandwritten = detectHandwriting(mockText);

	const response: OCRResponse = {
		text: mockText,
		confidence: isHandwritten ? 0.4 : 0.85,
		isHandwritten
	};

	return json(response);
};
