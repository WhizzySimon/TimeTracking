/**
 * Unit tests for CSV parser
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, applyMapping } from './csv';

describe('parseCSV', () => {
	it('parses simple CSV', () => {
		const content = 'Datum,Von,Bis,Notiz\n2024-01-15,09:00,12:00,Meeting';
		const result = parseCSV(content);

		expect(result.headers).toEqual(['Datum', 'Von', 'Bis', 'Notiz']);
		expect(result.rows).toHaveLength(1);
		expect(result.rows[0]).toEqual(['2024-01-15', '09:00', '12:00', 'Meeting']);
	});

	it('handles quoted fields', () => {
		const content = 'Name,Note\n"John","Hello, World"';
		const result = parseCSV(content);

		expect(result.rows[0]).toEqual(['John', 'Hello, World']);
	});

	it('handles escaped quotes', () => {
		const content = 'Name,Note\n"John","He said ""Hello"""';
		const result = parseCSV(content);

		expect(result.rows[0][1]).toBe('He said "Hello"');
	});

	it('handles semicolon delimiter', () => {
		const content = 'Datum;Von;Bis\n2024-01-15;09:00;12:00';
		const result = parseCSV(content);

		expect(result.headers).toEqual(['Datum', 'Von', 'Bis']);
	});

	it('handles empty content', () => {
		const result = parseCSV('');
		expect(result.headers).toEqual([]);
		expect(result.rows).toEqual([]);
	});

	it('handles Windows line endings', () => {
		const content = 'A,B\r\n1,2\r\n3,4';
		const result = parseCSV(content);

		expect(result.rows).toHaveLength(2);
	});
});

describe('applyMapping', () => {
	it('extracts fields based on mapping', () => {
		const headers = ['Datum', 'Von', 'Bis', 'Notiz'];
		const rows = [['2024-01-15', '09:00', '12:00', 'Meeting']];
		const mapping = { date: 'Datum', startTime: 'Von', endTime: 'Bis', note: 'Notiz' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result).toHaveLength(1);
		expect(result[0].date).toBe('2024-01-15');
		expect(result[0].startTime).toBe('09:00');
		expect(result[0].endTime).toBe('12:00');
		expect(result[0].note).toBe('Meeting');
	});

	it('calculates duration from start/end times', () => {
		const headers = ['Datum', 'Von', 'Bis'];
		const rows = [['2024-01-15', '09:00', '12:00']];
		const mapping = { date: 'Datum', startTime: 'Von', endTime: 'Bis' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result[0].durationMinutes).toBe(180);
	});

	it('parses German date format', () => {
		const headers = ['Datum'];
		const rows = [['15.01.2024']];
		const mapping = { date: 'Datum' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result[0].date).toBe('2024-01-15');
	});

	it('parses duration in hours', () => {
		const headers = ['Datum', 'Dauer'];
		const rows = [['2024-01-15', '2.5h']];
		const mapping = { date: 'Datum', duration: 'Dauer' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result[0].durationMinutes).toBe(150);
	});

	it('skips empty rows', () => {
		const headers = ['Datum', 'Notiz'];
		const rows = [
			['', ''],
			['2024-01-15', 'Test']
		];
		const mapping = { date: 'Datum', note: 'Notiz' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result).toHaveLength(1);
	});

	it('sets sourceRef with line number', () => {
		const headers = ['Datum'];
		const rows = [['2024-01-15'], ['2024-01-16']];
		const mapping = { date: 'Datum' };

		const result = applyMapping(rows, headers, mapping, 'test');

		expect(result[0].sourceRef).toBe('test:2');
		expect(result[1].sourceRef).toBe('test:3');
	});
});
