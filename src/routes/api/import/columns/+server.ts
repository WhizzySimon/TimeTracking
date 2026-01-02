/**
 * Column Mapping API Endpoint
 *
 * Suggests column mappings for CSV/Excel headers using AI.
 * Premium-only endpoint.
 *
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isPremium } from '$lib/stores/user';
import { get } from 'svelte/store';

interface ColumnMappingRequest {
	headers: string[];
	sampleRows: string[][];
}

const KNOWN_PATTERNS: Record<string, string[]> = {
	date: ['datum', 'date', 'tag', 'day', 'd'],
	startTime: ['von', 'start', 'beginn', 'anfang', 'from', 'begin'],
	endTime: ['bis', 'ende', 'end', 'to', 'stop'],
	duration: ['dauer', 'duration', 'zeit', 'time', 'stunden', 'hours', 'minuten', 'minutes'],
	category: ['kategorie', 'category', 'typ', 'type', 'art', 'projekt', 'project'],
	note: [
		'notiz',
		'note',
		'bemerkung',
		'comment',
		'beschreibung',
		'description',
		'text',
		'tätigkeit',
		'activity',
		'aufgabe',
		'task'
	]
};

function matchPattern(header: string): string | null {
	const normalized = header.toLowerCase().trim();

	for (const [field, patterns] of Object.entries(KNOWN_PATTERNS)) {
		for (const pattern of patterns) {
			if (normalized === pattern || normalized.includes(pattern)) {
				return field;
			}
		}
	}

	return null;
}

function suggestMapping(headers: string[]): Record<string, string> {
	const mapping: Record<string, string> = {};
	const usedFields = new Set<string>();

	for (const header of headers) {
		const field = matchPattern(header);
		if (field && !usedFields.has(field)) {
			mapping[header] = field;
			usedFields.add(field);
		}
	}

	return mapping;
}

function calculateConfidence(mapping: Record<string, string>, headers: string[]): number {
	const mappedCount = Object.keys(mapping).length;
	const requiredFields = ['date', 'duration'];
	const hasRequired = requiredFields.every((f) => Object.values(mapping).includes(f));

	if (!hasRequired) {
		return 0.3;
	}

	const ratio = mappedCount / Math.min(headers.length, 6);
	return Math.min(0.95, 0.5 + ratio * 0.45);
}

export const POST: RequestHandler = async ({ request }) => {
	if (!get(isPremium)) {
		throw error(403, 'Premium subscription required');
	}

	let body: ColumnMappingRequest;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body.headers || !Array.isArray(body.headers)) {
		throw error(400, 'headers array required');
	}

	const mapping = suggestMapping(body.headers);
	const confidence = calculateConfidence(mapping, body.headers);

	return json({
		mapping,
		confidence
	});
};
