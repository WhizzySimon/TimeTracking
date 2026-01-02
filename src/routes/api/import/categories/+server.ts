/**
 * Category Guessing API Endpoint
 *
 * Suggests categories for note texts using pattern matching.
 * Premium-only endpoint.
 *
 * Spec ref: TempAppDevDocs/Features/Specs/ai-import.md Section 8
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isPremium } from '$lib/stores/user';
import { get } from 'svelte/store';

interface CategoryGuessRequest {
	texts: string[];
	userCategories: string[];
}

interface CategoryGuess {
	text: string;
	category: string | null;
	confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
	Meeting: ['meeting', 'besprechung', 'call', 'termin', 'konferenz', 'standup', 'daily', 'weekly'],
	Entwicklung: [
		'entwicklung',
		'development',
		'coding',
		'programmierung',
		'implementation',
		'bugfix',
		'feature'
	],
	Review: ['review', 'code review', 'pr review', 'prüfung'],
	Dokumentation: ['dokumentation', 'documentation', 'docs', 'wiki', 'readme'],
	Support: ['support', 'hilfe', 'help', 'ticket', 'anfrage'],
	Planung: ['planung', 'planning', 'konzept', 'design', 'architektur'],
	Testing: ['test', 'testing', 'qa', 'qualität', 'quality'],
	Admin: ['admin', 'administration', 'verwaltung', 'orga', 'organisation']
};

function findBestMatch(text: string, userCategories: string[]): CategoryGuess {
	const normalized = text.toLowerCase();

	for (const userCat of userCategories) {
		if (normalized.includes(userCat.toLowerCase())) {
			return { text, category: userCat, confidence: 0.9 };
		}
	}

	for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
		for (const keyword of keywords) {
			if (normalized.includes(keyword)) {
				const matchingUserCat = userCategories.find(
					(uc) => uc.toLowerCase() === category.toLowerCase()
				);
				if (matchingUserCat) {
					return { text, category: matchingUserCat, confidence: 0.8 };
				}
				return { text, category: null, confidence: 0.4 };
			}
		}
	}

	return { text, category: null, confidence: 0.2 };
}

export const POST: RequestHandler = async ({ request }) => {
	if (!get(isPremium)) {
		throw error(403, 'Premium subscription required');
	}

	let body: CategoryGuessRequest;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	if (!body.texts || !Array.isArray(body.texts)) {
		throw error(400, 'texts array required');
	}

	const userCategories = body.userCategories || [];
	const guesses = body.texts.map((text) => findBestMatch(text, userCategories));

	return json({ guesses });
};
