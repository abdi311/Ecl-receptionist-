import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CalendarService } from '../src/calendar/calendar.js';
import { MemoryStorage, FileStorage } from '../src/calendar/storage.js';
import { PhoneReceptionist } from '../src/receptionist/agent.js';

// Lunedì 9 novembre 2026, 08:00 a Zurigo (CET, UTC+1).
export const NOW_ISO = '2026-11-09T07:00:00Z';
export const now = () => new Date(NOW_ISO);

export function memoryCalendar() {
  return new CalendarService({ storage: new MemoryStorage(), now });
}

export function tempFile() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecl-cal-'));
  return path.join(dir, 'calendar.json');
}

export function fileCalendar(file) {
  return new CalendarService({ storage: new FileStorage(file), now });
}

export function newCall(calendar) {
  const agent = new PhoneReceptionist({ calendar, now });
  agent.start();
  return agent;
}

/** Esegue i turni e restituisce l'ultima risposta. */
export async function talk(agent, ...turns) {
  let last;
  for (const t of turns) last = await agent.handle(t);
  return last;
}
