// Canale WhatsApp: qualsiasi messaggio riceve SOLO il link alla pagina di prenotazione.
// Nel prototipo WhatsApp Business NON è collegato: la risposta viene solo calcolata,
// non inviata. Per collegarlo servirà l'API ufficiale (a pagamento) — vedi README.

import { detectLanguage } from '../receptionist/language.js';

export function bookingUrl(baseUrl, lang) {
  const url = new URL('/book', baseUrl);
  if (lang) url.searchParams.set('lang', lang);
  return url.toString();
}

/**
 * @param {{ from: string, text?: string }} message
 * @returns {{ to: string, text: string, sent: false }}
 */
export function replyToWhatsApp(message, { baseUrl }) {
  const { lang } = detectLanguage(message?.text ?? '');
  return { to: message?.from ?? null, text: bookingUrl(baseUrl, lang), sent: false };
}
