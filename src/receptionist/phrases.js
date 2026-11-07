// Frasi del receptionist nelle quattro lingue. Brevi, parlate, cortesi.

import { TZ, zurichParts, zurichDateKey, addDaysToKey } from '../time.js';

const LOCALES = { fr: 'fr-CH', it: 'it-CH', de: 'de-CH', en: 'en-GB' };

export const GREETING = 'ECL Solutions, bonjour, buongiorno, grüezi, hello!';

const P = {
  howCanIHelp: {
    fr: 'Bonjour ! Comment puis-je vous aider ?',
    it: 'Buongiorno! Come posso aiutarla?',
    de: 'Grüezi! Wie kann ich Ihnen helfen?',
    en: 'Hello! How can I help you?',
  },
  askName: {
    fr: "Avec plaisir. Puis-je avoir votre nom, s'il vous plaît ?",
    it: 'Volentieri. Mi può dire il suo nome, per favore?',
    de: 'Gerne. Darf ich Ihren Namen haben?',
    en: 'Of course. May I have your name, please?',
  },
  askNameAgain: {
    fr: 'Pardon, je n’ai pas saisi votre nom. Vous pouvez me le redire ?',
    it: 'Scusi, non ho capito il nome. Me lo può ripetere?',
    de: 'Entschuldigung, ich habe Ihren Namen nicht verstanden. Können Sie ihn wiederholen?',
    en: "Sorry, I didn't catch your name. Could you say it again?",
  },
  thanksName: {
    fr: 'Merci, {name}.',
    it: 'Grazie, {name}.',
    de: 'Danke, {name}.',
    en: 'Thank you, {name}.',
  },
  askVehicle: {
    fr: 'Quel véhicule allez-vous nous amener ? La marque et le modèle suffisent.',
    it: 'Che veicolo ci porta? Bastano marca e modello.',
    de: 'Um welches Fahrzeug geht es? Marke und Modell reichen.',
    en: 'Which vehicle will you be bringing in? Make and model is enough.',
  },
  gotVehicle: {
    fr: '{vehicle}, très bien.',
    it: '{vehicle}, perfetto.',
    de: '{vehicle}, alles klar.',
    en: '{vehicle}, got it.',
  },
  askReason: {
    fr: 'Et quel est le motif de la visite ?',
    it: 'E qual è il motivo della visita?',
    de: 'Und worum geht es bei dem Besuch?',
    en: "And what's the reason for the visit?",
  },
  gotReason: {
    fr: 'C’est noté.',
    it: 'Ho preso nota.',
    de: 'Notiert.',
    en: 'Noted.',
  },
  corrected: {
    fr: 'Je corrige : {value}.',
    it: 'Correggo: {value}.',
    de: 'Ich korrigiere: {value}.',
    en: "I've updated that: {value}.",
  },
  proposeTwo: {
    fr: 'Je peux vous proposer {a}, ou {b}. Qu’est-ce qui vous arrange ?',
    it: 'Posso proporle {a}, oppure {b}. Cosa le va meglio?',
    de: 'Ich kann Ihnen {a} anbieten, oder {b}. Was passt Ihnen besser?',
    en: 'I can offer you {a}, or {b}. Which suits you better?',
  },
  proposeOne: {
    fr: 'Je peux vous proposer {a}. Est-ce que ça vous convient ?',
    it: 'Posso proporle {a}. Le va bene?',
    de: 'Ich kann Ihnen {a} anbieten. Passt Ihnen das?',
    en: 'I can offer you {a}. Does that work for you?',
  },
  noMatch: {
    fr: 'À ce moment-là, nous sommes déjà complets.',
    it: 'In quel momento siamo già al completo.',
    de: 'Zu dieser Zeit sind wir leider schon ausgebucht.',
    en: "We're already fully booked at that time.",
  },
  noSlots: {
    fr: "Je suis désolée, l'agenda est complet pour les trois prochaines semaines. Je transmets votre demande, un collègue vous rappellera.",
    it: "Mi dispiace, l'agenda è piena per le prossime tre settimane. Passo la richiesta a un collega che la richiamerà.",
    de: 'Es tut mir leid, der Kalender ist für die nächsten drei Wochen voll. Ich gebe Ihre Anfrage weiter, ein Kollege ruft Sie zurück.',
    en: "I'm sorry, we're fully booked for the next three weeks. I'll pass your request on and a colleague will call you back.",
  },
  whichOne: {
    fr: 'Lequel préférez-vous : {a}, ou {b} ?',
    it: 'Quale preferisce: {a}, oppure {b}?',
    de: 'Was ist Ihnen lieber: {a}, oder {b}?',
    en: 'Which would you prefer: {a}, or {b}?',
  },
  confirmOne: {
    fr: 'Je vous le réserve, {a} ?',
    it: 'Glielo prenoto, {a}?',
    de: 'Soll ich {a} für Sie eintragen?',
    en: 'Shall I book {a} for you?',
  },
  restate: {
    fr: 'Je disais :',
    it: 'Dicevo:',
    de: 'Ich sagte gerade:',
    en: 'As I was saying:',
  },
  slotTaken: {
    fr: 'Oh, désolée, ce créneau vient d’être pris par un autre client.',
    it: 'Oh, mi scusi, quell’orario è appena stato preso da un altro cliente.',
    de: 'Oh, Entschuldigung, dieser Termin wurde gerade von einem anderen Kunden gebucht.',
    en: "Oh, sorry, that slot has just been taken by another customer.",
  },
  saveFailed: {
    fr: "Je n'arrive pas à enregistrer le rendez-vous pour le moment. Je transmets votre demande, un collègue vous rappellera pour confirmer.",
    it: 'Al momento non riesco a registrare l’appuntamento. Passo la richiesta a un collega che la richiamerà per confermare.',
    de: 'Ich kann den Termin gerade nicht speichern. Ich gebe Ihre Anfrage weiter, ein Kollege ruft Sie zur Bestätigung zurück.',
    en: "I can't save the appointment right now. I'll pass your request on and a colleague will call you back to confirm.",
  },
  confirmed: {
    fr: 'C’est enregistré : {when}. Véhicule : {vehicle}, motif : {reason}, au nom de {name}. Votre référence est {ref}. Puis-je faire autre chose pour vous ?',
    it: 'Fatto, è registrato: {when}. Veicolo: {vehicle}, motivo: {reason}, a nome di {name}. Il riferimento è {ref}. Posso fare altro per lei?',
    de: 'Erledigt, der Termin ist eingetragen: {when}. Fahrzeug: {vehicle}, Grund: {reason}, auf den Namen {name}. Ihre Referenz ist {ref}. Kann ich sonst noch etwas für Sie tun?',
    en: "Done, you're booked in: {when}. Vehicle: {vehicle}, reason: {reason}, under the name {name}. Your reference is {ref}. Is there anything else I can do for you?",
  },
  listening: {
    fr: 'Oui, je vous écoute.',
    it: 'Certo, mi dica.',
    de: 'Ja, ich höre.',
    en: 'Sure, go ahead.',
  },
  notUnderstood: {
    fr: 'Pardon, je n’ai pas bien compris. Pouvez-vous répéter ?',
    it: 'Scusi, non ho capito bene. Può ripetere?',
    de: 'Entschuldigung, das habe ich nicht ganz verstanden. Können Sie das wiederholen?',
    en: "Sorry, I didn't quite get that. Could you say it again?",
  },
  offerBooking: {
    fr: 'Je peux vous fixer un rendez-vous à l’atelier. Ça vous intéresse ?',
    it: 'Posso fissarle un appuntamento in officina. Le interessa?',
    de: 'Ich kann Ihnen einen Termin in der Werkstatt geben. Möchten Sie das?',
    en: 'I can book you an appointment at the workshop. Would you like that?',
  },
  hours: {
    fr: 'Nous sommes ouverts du lundi au vendredi, de 8h à 12h et de 13h30 à 17h30.',
    it: 'Siamo aperti dal lunedì al venerdì, dalle 8 alle 12 e dalle 13:30 alle 17:30.',
    de: 'Wir haben von Montag bis Freitag geöffnet, von 8 bis 12 Uhr und von 13:30 bis 17:30 Uhr.',
    en: "We're open Monday to Friday, from 8 to 12 and from 1:30 to 5:30 pm.",
  },
  human: {
    fr: 'Je transmets votre demande, un collègue vous rappellera dès que possible.',
    it: 'Passo la sua richiesta a un collega, che la richiamerà appena possibile.',
    de: 'Ich gebe Ihre Anfrage weiter, ein Kollege ruft Sie so bald wie möglich zurück.',
    en: "I'll pass your request on, and a colleague will call you back as soon as possible.",
  },
  anythingElse: {
    fr: 'Puis-je faire autre chose pour vous ?',
    it: 'Posso fare altro per lei?',
    de: 'Kann ich sonst noch etwas für Sie tun?',
    en: 'Is there anything else I can do for you?',
  },
  goodbye: {
    fr: 'Merci de votre appel et bonne journée !',
    it: 'Grazie della chiamata e buona giornata!',
    de: 'Vielen Dank für Ihren Anruf und einen schönen Tag!',
    en: 'Thanks for calling, have a nice day!',
  },
  switchAck: {
    fr: 'Bien sûr, continuons en français.',
    it: 'Certo, continuiamo in italiano.',
    de: 'Natürlich, machen wir auf Deutsch weiter.',
    en: "Of course, let's continue in English.",
  },
};

export function say(key, lang, vars = {}) {
  const tpl = P[key]?.[lang] ?? P[key]?.fr;
  if (!tpl) throw new Error(`phrase mancante: ${key}`);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

const WORDS = {
  today: { fr: "aujourd'hui", it: 'oggi', de: 'heute', en: 'today' },
  tomorrow: { fr: 'demain', it: 'domani', de: 'morgen', en: 'tomorrow' },
  at: { fr: 'à', it: 'alle', de: 'um', en: 'at' },
};

function time(lang, h, m) {
  const mm = String(m).padStart(2, '0');
  if (lang === 'fr') return `${h}h${mm === '00' ? '' : mm}`;
  if (lang === 'de') return `${h}${mm === '00' ? '' : ':' + mm} Uhr`;
  if (lang === 'en') return `${h > 12 ? h - 12 : h}${mm === '00' ? '' : ':' + mm} ${h >= 12 ? 'pm' : 'am'}`;
  return `${h}:${mm}`;
}

/**
 * Orario parlato, in ora di Zurigo. relative=true usa "oggi/domani" quando possibile.
 * slot: { start: ISO UTC }
 */
export function formatSlot(slot, lang, { now = new Date(), relative = true } = {}) {
  const d = new Date(slot.start);
  const p = zurichParts(d);
  const todayKey = zurichDateKey(now);
  const key = zurichDateKey(d);
  const t = time(lang, p.hour, p.minute);
  const at = WORDS.at[lang];
  if (relative && key === todayKey) return `${WORDS.today[lang]} ${at} ${t}`;
  if (relative && key === addDaysToKey(todayKey, 1)) return `${WORDS.tomorrow[lang]} ${at} ${t}`;
  const date = new Intl.DateTimeFormat(LOCALES[lang], {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
  return `${date} ${at} ${t}`;
}
