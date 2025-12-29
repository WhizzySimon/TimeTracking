/**
 * Unit tests for text parser
 * Spec ref: Docs/Features/Specs/ai-import.md Section 8
 */

import { describe, it, expect } from 'vitest';
import { parseText } from './text';

describe('parseText', () => {
	it('extracts time ranges', () => {
		const content = '09:00 - 12:00 Meeting';
		const result = parseText(content, 'test');

		expect(result.candidates).toHaveLength(1);
		expect(result.candidates[0].startTime).toBe('09:00');
		expect(result.candidates[0].endTime).toBe('12:00');
		expect(result.candidates[0].durationMinutes).toBe(180);
	});

	it('extracts duration in hours', () => {
		const content = '2.5h Development work';
		const result = parseText(content, 'test');

		expect(result.candidates).toHaveLength(1);
		expect(result.candidates[0].durationMinutes).toBe(150);
	});

	it('extracts duration in minutes', () => {
		const content = '45 Min Standup';
		const result = parseText(content, 'test');

		expect(result.candidates).toHaveLength(1);
		expect(result.candidates[0].durationMinutes).toBe(45);
	});

	it('extracts dates in ISO format', () => {
		const content = '2024-01-15\n09:00 - 10:00 Meeting';
		const result = parseText(content, 'test');

		expect(result.candidates[0].date).toBe('2024-01-15');
	});

	it('extracts dates in German format', () => {
		const content = '15.01.2024\n09:00 - 10:00 Meeting';
		const result = parseText(content, 'test');

		expect(result.candidates[0].date).toBe('2024-01-15');
	});

	it('carries date forward to subsequent entries', () => {
		const content = `2024-01-15
09:00 - 10:00 Meeting
10:30 - 12:00 Development`;
		const result = parseText(content, 'test');

		expect(result.candidates).toHaveLength(2);
		expect(result.candidates[0].date).toBe('2024-01-15');
		expect(result.candidates[1].date).toBe('2024-01-15');
	});

	it('extracts note from remaining text', () => {
		const content = '09:00 - 10:00 Important meeting with team';
		const result = parseText(content, 'test');

		expect(result.candidates[0].note).toBe('Important meeting with team');
	});

	it('handles empty input', () => {
		const result = parseText('', 'test');
		expect(result.candidates).toHaveLength(0);
	});

	it('sets sourceRef with line numbers', () => {
		const content = 'Line 1\n2h Work';
		const result = parseText(content, 'test');

		expect(result.candidates[0].sourceRef).toBe('test:2');
	});

	it('assigns lower confidence without date', () => {
		const content = '09:00 - 10:00 Meeting';
		const result = parseText(content, 'test');

		expect(result.candidates[0].confidence).toBeLessThan(0.5);
	});

	it('assigns higher confidence with date', () => {
		const content = '2024-01-15\n09:00 - 10:00 Meeting';
		const result = parseText(content, 'test');

		expect(result.candidates[0].confidence).toBeGreaterThanOrEqual(0.5);
	});
});
