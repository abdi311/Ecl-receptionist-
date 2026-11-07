#!/usr/bin/env node
// Azzera il calendario finto (data/calendar.json) e aggiunge qualche appuntamento
// fittizio, così l'agenda non è vuota. Uso: npm run seed
import fs from 'node:fs';
import { config } from '../src/config.js';
import { CalendarService } from '../src/calendar/calendar.js';
import { FileStorage } from '../src/calendar/storage.js';

fs.rmSync(config.calendarFile, { force: true });
const calendar = new CalendarService({ storage: new FileStorage(config.calendarFile) });
const free = await calendar.listAvailableSlots();
const fake = [
  ['Cliente finto 1', 'VW Golf', 'Service'],
  ['Cliente finto 2', 'Audi A3', 'Diagnosi spia motore'],
  ['Cliente finto 3', 'Peugeot 208', 'Freins'],
  ['Cliente finto 4', 'BMW 320d', 'Inspektion'],
];
for (const [i, [name, vehicle, reason]] of fake.entries()) {
  const slot = free[i * 3 + 1];
  if (slot) await calendar.book({ start: slot.start, name, vehicle, reason, channel: 'seed' });
}
console.log(`Calendario finto pronto: ${config.calendarFile}`);
for (const b of await calendar.listBookings()) console.log(`  ${b.local}  ${b.name} – ${b.vehicle}`);
