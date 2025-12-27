/**
 * JSON Import for TimeTracker.
 * Parses and validates JSON backup files for restoration.
 * Spec refs: Docs/Specs/subscription-plans.md
 */

import type { Category, TimeEntry, DayType, WorkTimeModel } from '$lib/types';

export interface ImportMeta {
	version: string;
	exportedAt: string;
	schemaVersion: number;
}

export interface ImportData {
	meta: ImportMeta;
	categories: Category[];
	timeEntries: TimeEntry[];
	dayTypes: DayType[];
	workTimeModels: WorkTimeModel[];
}

export interface JsonImportResult {
	success: boolean;
	data?: ImportData;
	errors: string[];
	warnings: string[];
}

function validateMeta(meta: unknown): string[] {
	const errors: string[] = [];
	if (!meta || typeof meta !== 'object') {
		errors.push('Fehlende oder ungültige Meta-Daten');
		return errors;
	}
	const m = meta as Record<string, unknown>;
	if (typeof m.schemaVersion !== 'number') {
		errors.push('Fehlende Schema-Version');
	}
	if (typeof m.exportedAt !== 'string') {
		errors.push('Fehlendes Export-Datum');
	}
	return errors;
}

function validateCategories(categories: unknown): string[] {
	const errors: string[] = [];
	if (!Array.isArray(categories)) {
		errors.push('Kategorien müssen ein Array sein');
		return errors;
	}
	for (let i = 0; i < categories.length; i++) {
		const cat = categories[i];
		if (!cat || typeof cat !== 'object') {
			errors.push(`Kategorie ${i + 1}: Ungültiges Format`);
			continue;
		}
		const c = cat as Record<string, unknown>;
		if (typeof c.id !== 'string') errors.push(`Kategorie ${i + 1}: Fehlende ID`);
		if (typeof c.name !== 'string') errors.push(`Kategorie ${i + 1}: Fehlender Name`);
	}
	return errors;
}

function validateTimeEntries(entries: unknown): string[] {
	const errors: string[] = [];
	if (!Array.isArray(entries)) {
		errors.push('Zeiteinträge müssen ein Array sein');
		return errors;
	}
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		if (!entry || typeof entry !== 'object') {
			errors.push(`Zeiteintrag ${i + 1}: Ungültiges Format`);
			continue;
		}
		const e = entry as Record<string, unknown>;
		if (typeof e.id !== 'string') errors.push(`Zeiteintrag ${i + 1}: Fehlende ID`);
		if (typeof e.date !== 'string') errors.push(`Zeiteintrag ${i + 1}: Fehlendes Datum`);
		if (typeof e.startTime !== 'string') errors.push(`Zeiteintrag ${i + 1}: Fehlende Startzeit`);
	}
	return errors;
}

function validateDayTypes(dayTypes: unknown): string[] {
	if (!Array.isArray(dayTypes)) {
		return ['Tagestypen müssen ein Array sein'];
	}
	return [];
}

function validateWorkTimeModels(models: unknown): string[] {
	if (!Array.isArray(models)) {
		return ['Arbeitszeitmodelle müssen ein Array sein'];
	}
	return [];
}

export function parseJsonImport(jsonString: string): JsonImportResult {
	const errors: string[] = [];
	const warnings: string[] = [];

	let parsed: unknown;
	try {
		parsed = JSON.parse(jsonString);
	} catch {
		return {
			success: false,
			errors: ['Ungültiges JSON-Format'],
			warnings: []
		};
	}

	if (!parsed || typeof parsed !== 'object') {
		return {
			success: false,
			errors: ['JSON muss ein Objekt sein'],
			warnings: []
		};
	}

	const obj = parsed as Record<string, unknown>;

	errors.push(...validateMeta(obj.meta));
	errors.push(...validateCategories(obj.categories));
	errors.push(...validateTimeEntries(obj.timeEntries));
	errors.push(...validateDayTypes(obj.dayTypes));
	errors.push(...validateWorkTimeModels(obj.workTimeModels));

	if (errors.length > 0) {
		return { success: false, errors, warnings };
	}

	const meta = obj.meta as ImportMeta;
	if (meta.schemaVersion > 1) {
		warnings.push(
			`Neuere Schema-Version (${meta.schemaVersion}). Einige Daten werden möglicherweise ignoriert.`
		);
	}

	const data: ImportData = {
		meta,
		categories: obj.categories as Category[],
		timeEntries: obj.timeEntries as TimeEntry[],
		dayTypes: obj.dayTypes as DayType[],
		workTimeModels: obj.workTimeModels as WorkTimeModel[]
	};

	return { success: true, data, errors: [], warnings };
}

export async function parseJsonFile(file: File): Promise<JsonImportResult> {
	try {
		const text = await file.text();
		return parseJsonImport(text);
	} catch {
		return {
			success: false,
			errors: ['Datei konnte nicht gelesen werden'],
			warnings: []
		};
	}
}
