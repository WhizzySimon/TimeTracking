/**
 * OCR Parser
 *
 * Extracts text from images using browser-native or external OCR.
 * Handwritten text is flagged with low confidence.
 *
 * Spec ref: Docs/Features/Specs/ai-import.md Section 8
 */

import type { TimeEntryCandidate } from '../types';
import { parseText } from './text';

export interface OCRResult {
	text: string;
	confidence: number;
	isHandwritten: boolean;
}

export interface OCRParseResult {
	ocrResult: OCRResult;
	candidates: TimeEntryCandidate[];
}

export async function performOCR(imageDataUrl: string): Promise<OCRResult> {
	const response = await fetch('/api/import/ocr', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ image: imageDataUrl })
	});

	if (!response.ok) {
		throw new Error('OCR processing failed');
	}

	return response.json();
}

export async function parseImage(imageDataUrl: string, sourceId: string): Promise<OCRParseResult> {
	const ocrResult = await performOCR(imageDataUrl);

	const { candidates } = parseText(ocrResult.text, sourceId);

	const adjustedCandidates = candidates.map((c) => ({
		...c,
		confidence: ocrResult.isHandwritten
			? Math.min(c.confidence, 0.4)
			: c.confidence * ocrResult.confidence,
		flags: ocrResult.isHandwritten ? [...c.flags, 'handwritten' as const] : c.flags
	}));

	return {
		ocrResult,
		candidates: adjustedCandidates
	};
}

export function isImageFile(filename: string): boolean {
	const ext = filename.toLowerCase().split('.').pop();
	return ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(ext || '');
}
