/**
 * Text Parser
 *
 * Parses plain text content into structured data for import.
 * Uses pattern matching to extract time entries from unstructured text.
 *
 * Spec ref: Docs/Specs/ai-import.md Section 8
 */

import type { TimeEntryCandidate } from '../types';
import { generateCandidateId } from '../openai';

export interface TextParseResult {
	candidates: TimeEntryCandidate[];
	unparsedLines: string[];
}

const DATE_PATTERNS = [/(\d{4}-\d{2}-\d{2})/, /(\d{2}\.\d{2}\.\d{4})/, /(\d{2}\/\d{2}\/\d{4})/];

const TIME_RANGE_PATTERN = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/;
const DURATION_PATTERN = /(\d+(?:[.,]\d+)?)\s*(?:h|Std\.?|Stunden?|hours?)/i;
const MINUTES_PATTERN = /(\d+)\s*(?:m|Min\.?|Minuten?|minutes?)/i;

function normalizeDate(dateStr: string): string | null {
	const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) return dateStr;

	const deMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
	if (deMatch) {
		const [, d, m, y] = deMatch;
		return `${y}-${m}-${d}`;
	}

	const usMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (usMatch) {
		const [, m, d, y] = usMatch;
		return `${y}-${m}-${d}`;
	}

	return null;
}

function normalizeTime(timeStr: string): string {
	const [h, m] = timeStr.split(':').map(Number);
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function calculateDuration(start: string, end: string): number {
	const [sh, sm] = start.split(':').map(Number);
	const [eh, em] = end.split(':').map(Number);
	let minutes = eh * 60 + em - (sh * 60 + sm);
	if (minutes < 0) minutes += 24 * 60;
	return minutes;
}

export function parseText(content: string, sourceId: string): TextParseResult {
	const lines = content.split(/\r?\n/);
	const candidates: TimeEntryCandidate[] = [];
	const unparsedLines: string[] = [];

	let currentDate: string | null = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const lineNum = i + 1;

		for (const pattern of DATE_PATTERNS) {
			const match = line.match(pattern);
			if (match) {
				const normalized = normalizeDate(match[1]);
				if (normalized) currentDate = normalized;
				break;
			}
		}

		const timeRangeMatch = line.match(TIME_RANGE_PATTERN);
		const durationMatch = line.match(DURATION_PATTERN);
		const minutesMatch = line.match(MINUTES_PATTERN);

		let startTime: string | null = null;
		let endTime: string | null = null;
		let durationMinutes: number | null = null;

		if (timeRangeMatch) {
			startTime = normalizeTime(timeRangeMatch[1]);
			endTime = normalizeTime(timeRangeMatch[2]);
			durationMinutes = calculateDuration(startTime, endTime);
		} else if (durationMatch) {
			const hours = parseFloat(durationMatch[1].replace(',', '.'));
			durationMinutes = Math.round(hours * 60);
		} else if (minutesMatch) {
			durationMinutes = parseInt(minutesMatch[1], 10);
		}

		if (durationMinutes || (startTime && endTime)) {
			let note = line;
			if (timeRangeMatch) {
				note = line.replace(TIME_RANGE_PATTERN, '').trim();
			}
			if (durationMatch) {
				note = line.replace(DURATION_PATTERN, '').trim();
			}
			if (minutesMatch) {
				note = line.replace(MINUTES_PATTERN, '').trim();
			}
			for (const pattern of DATE_PATTERNS) {
				note = note.replace(pattern, '').trim();
			}
			note = note.replace(/^[-–:,\s]+|[-–:,\s]+$/g, '');

			candidates.push({
				id: generateCandidateId(),
				date: currentDate,
				startTime,
				endTime,
				durationMinutes,
				categoryGuess: null,
				categoryId: null,
				note: note || null,
				sourceRef: `${sourceId}:${lineNum}`,
				confidence: currentDate ? 0.6 : 0.4,
				flags: [],
				selected: true,
				edited: false
			});
		} else if (line.length > 10) {
			unparsedLines.push(line);
		}
	}

	return { candidates, unparsedLines };
}
