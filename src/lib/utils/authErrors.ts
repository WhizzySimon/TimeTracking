/**
 * Translate Supabase auth error messages to German.
 * Maps known error codes/messages to user-friendly German translations.
 */

const errorTranslations: Record<string, string> = {
	// Login errors
	'Invalid login credentials': 'E-Mail oder Passwort falsch',
	invalid_credentials: 'E-Mail oder Passwort falsch',
	'Email not confirmed': 'E-Mail-Adresse noch nicht bestätigt. Bitte prüfen Sie Ihr Postfach.',

	// Signup errors
	'User already registered': 'Diese E-Mail ist bereits registriert',
	user_already_exists: 'Diese E-Mail ist bereits registriert',
	'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben',
	'Signup requires a valid password': 'Bitte geben Sie ein gültiges Passwort ein',

	// Rate limiting
	'For security purposes, you can only request this once every 60 seconds':
		'Aus Sicherheitsgründen können Sie dies nur einmal pro Minute anfordern',
	'Email rate limit exceeded': 'Zu viele Anfragen. Bitte warten Sie einen Moment.',

	// Network errors
	'Failed to fetch': 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.',
	NetworkError: 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.',
	'Network request failed': 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.',

	// Session errors
	'No session returned from login': 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.',
	'Session expired': 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.',
	'Invalid Refresh Token': 'Sitzung abgelaufen. Bitte melden Sie sich erneut an.',

	// Password reset
	'Unable to validate email address: invalid format': 'Ungültiges E-Mail-Format'
};

export function translateAuthError(error: unknown): string {
	if (!(error instanceof Error)) {
		return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
	}

	const message = error.message;

	// Check for exact match first
	if (errorTranslations[message]) {
		return errorTranslations[message];
	}

	// Check for partial matches
	for (const [key, translation] of Object.entries(errorTranslations)) {
		if (message.toLowerCase().includes(key.toLowerCase())) {
			return translation;
		}
	}

	// Check for network-related errors
	if (
		message.includes('fetch') ||
		message.includes('network') ||
		message.includes('ECONNREFUSED')
	) {
		return 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung.';
	}

	// Return original message if no translation found (might already be German from our code)
	if (message.includes('ist') || message.includes('Bitte') || message.includes('erforderlich')) {
		return message;
	}

	// Generic fallback
	return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
}
