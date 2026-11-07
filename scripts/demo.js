#!/usr/bin/env node
// Prova via testo, completamente scriptata (nessun file toccato: calendario in memoria).
// Mostra: le 4 lingue, cambio di lingua a metà chiamata, interruzioni, correzioni,
// e due clienti che provano a prendere lo stesso slot.

import { CalendarService } from '../src/calendar/calendar.js';
import { MemoryStorage } from '../src/calendar/storage.js';
import { PhoneReceptionist } from '../src/receptionist/agent.js';
import { replyToWhatsApp } from '../src/channels/whatsapp.js';

// Lunedì 9 novembre 2026, 08:00 a Zurigo: orario fisso per una demo riproducibile.
const now = () => new Date('2026-11-09T07:00:00Z');
const calendar = new CalendarService({ storage: new MemoryStorage(), now });

const c = { bot: '\x1b[36m', me: '\x1b[32m', dim: '\x1b[2m', y: '\x1b[33m', off: '\x1b[0m' };

async function call(title, turns) {
  console.log(`\n${c.y}=== ${title} ===${c.off}`);
  const agent = new PhoneReceptionist({ calendar, now });
  console.log(`${c.bot}Receptionist:${c.off} ${agent.start().text}`);
  for (const turn of turns) {
    const [text, opts] = Array.isArray(turn) ? turn : [turn, {}];
    if (opts.interrupted) console.log(`${c.dim}   (il cliente interrompe il receptionist)${c.off}`);
    console.log(`${c.me}Cliente:${c.off} ${text}`);
    const r = await agent.handle(text, opts);
    console.log(`${c.bot}Receptionist [${r.lang}]:${c.off} ${r.text}`);
  }
  return agent;
}

await call('Francese', [
  'Bonjour, je voudrais prendre rendez-vous',
  'Jean Dupont',
  'Une Peugeot 308',
  'Le voyant moteur est allumé depuis hier',
  'Le premier',
]);

await call('Italiano, tutto in una frase + preferenza', [
  'Buongiorno, sono Marco Rossi, vorrei portare la mia Golf per il tagliando domani pomeriggio',
  'La seconda va bene',
]);

await call('Tedesco con correzione e preferenza di giorno', [
  'Grüezi, ich möchte einen Termin vereinbaren',
  'Mein Name ist Anna Müller',
  'Einen BMW X3',
  'Ölwechsel und die Bremsen quietschen',
  'Geht es auch am Donnerstag?',
  'Entschuldigung, nicht der BMW, es ist ein Audi A4',
  'Den ersten bitte',
]);

await call('Inglese → francese a metà chiamata, con interruzione', [
  "Hi, I'd like to book an appointment",
  'Sarah Smith',
  ['Sorry, can we speak French?', { interrupted: true }],
  'Une Renault Clio',
  'Les freins font du bruit',
  ['Attendez', { interrupted: true }],
  "Aucun des deux, plutôt jeudi matin",
  'Le deuxième',
  'Non merci, au revoir',
]);

await call('Cambio lingua spontaneo (fr → it)', [
  'Bonjour, je voudrais un rendez-vous',
  'Scusi, parlo meglio italiano, mi chiamo Giulia Ferri',
  'Una Fiat Panda',
  'La spia del motore è accesa',
  'Il primo',
]);

// ---- Due clienti, stesso slot ----
console.log(`\n${c.y}=== Due clienti vogliono lo stesso slot ===${c.off}`);
const a = new PhoneReceptionist({ calendar, now });
const b = new PhoneReceptionist({ calendar, now });
a.start();
b.start();
for (const t of ['Bonjour, un rendez-vous svp', 'Paul Martin', 'Une Dacia Duster', 'Vidange', 'vendredi matin']) await a.handle(t);
for (const t of ['Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes', 'friday morning']) await b.handle(t);
console.log(`Offerto a Paul: ${a.state.offered[0]}  |  offerto a Tom: ${b.state.offered[0]}`);
const [ra, rb] = await Promise.all([a.handle('Le premier'), b.handle('The first one')]);
console.log(`${c.bot}A Paul [${ra.lang}]:${c.off} ${ra.text}`);
console.log(`${c.bot}A Tom  [${rb.lang}]:${c.off} ${rb.text}`);

// ---- WhatsApp ----
console.log(`\n${c.y}=== WhatsApp (non collegato: la risposta viene solo calcolata) ===${c.off}`);
for (const text of ['Ciao, vorrei un appuntamento per la mia Golf', 'Bonjour, vous êtes ouverts samedi ?', 'Hallo']) {
  const r = replyToWhatsApp({ from: '+41790000000', text }, { baseUrl: 'http://localhost:3000' });
  console.log(`${c.me}Messaggio:${c.off} ${text}\n${c.bot}Risposta:${c.off}  ${r.text}`);
}

console.log(`\n${c.y}=== Calendario finale (Europe/Zurich) ===${c.off}`);
for (const bk of await calendar.listBookings()) {
  console.log(`  ${bk.local}  ${bk.id}  ${bk.name} – ${bk.vehicle} – ${bk.reason} [${bk.language}]`);
}
