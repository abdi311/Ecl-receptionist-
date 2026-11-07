import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zurichToUtc, toZurichIso, zurichParts } from '../src/time.js';
import { CalendarService } from '../src/calendar/calendar.js';
import { MemoryStorage } from '../src/calendar/storage.js';
import { memoryCalendar, tempFile, fileCalendar, NOW_ISO } from './helpers.js';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));

test('fuso Europe/Zurich: ora solare e ora legale', () => {
  assert.equal(zurichToUtc(2026, 11, 9, 9, 0).toISOString(), '2026-11-09T08:00:00.000Z'); // CET
  assert.equal(zurichToUtc(2026, 7, 6, 9, 0).toISOString(), '2026-07-06T07:00:00.000Z'); // CEST
  // giorno del cambio d'ora (29 marzo 2026)
  assert.equal(zurichToUtc(2026, 3, 30, 8, 0).toISOString(), '2026-03-30T06:00:00.000Z');
  assert.equal(toZurichIso(new Date('2026-07-06T07:00:00Z')), '2026-07-06T09:00:00+02:00');
});

test('gli slot rispettano orari di apertura a Zurigo, anticipo minimo e giorni feriali', async () => {
  const cal = memoryCalendar();
  const slots = await cal.listAvailableSlots();
  assert.ok(slots.length > 50);
  // adesso sono le 08:00 di lunedì: con 2 ore di anticipo il primo slot è alle 10:00
  assert.equal(slots[0].local, '2026-11-09T10:00:00+01:00');
  for (const s of slots) {
    assert.equal(s.timezone, 'Europe/Zurich');
    const p = zurichParts(new Date(s.start));
    assert.ok(p.weekday >= 1 && p.weekday <= 5, 'solo lun-ven');
    const m = p.hour * 60 + p.minute;
    assert.ok((m >= 480 && m + 60 <= 720) || (m >= 810 && m + 60 <= 1050), `fuori orario: ${s.local}`);
  }
});

test('slot in ora legale: stessi orari di orologio a Zurigo', async () => {
  const cal = new CalendarService({ storage: new MemoryStorage(), now: () => new Date('2026-07-06T05:00:00Z') });
  const [first] = await cal.listAvailableSlots();
  assert.equal(first.local, '2026-07-06T09:00:00+02:00');
  assert.equal(first.start, '2026-07-06T07:00:00.000Z');
});

test('prenotazione: salva e poi lo slot non è più disponibile', async () => {
  const cal = memoryCalendar();
  const [slot] = await cal.listAvailableSlots();
  const res = await cal.book({ start: slot.start, name: 'A', vehicle: 'VW Golf', reason: 'Service', channel: 'web' });
  assert.equal(res.ok, true);
  assert.match(res.booking.id, /^ECL-/);
  const after = await cal.listAvailableSlots();
  assert.ok(!after.some((s) => s.start === slot.start));
});

test('stesso slot, due clienti in sequenza: il secondo riceve slot_taken', async () => {
  const cal = memoryCalendar();
  const [slot] = await cal.listAvailableSlots();
  const a = await cal.book({ start: slot.start, name: 'A', vehicle: 'Golf', reason: 'Service' });
  const b = await cal.book({ start: slot.start, name: 'B', vehicle: 'Polo', reason: 'Freni' });
  assert.equal(a.ok, true);
  assert.deepEqual(b, { ok: false, error: 'slot_taken' });
  assert.equal((await cal.listBookings()).length, 1);
});

test('stesso slot, 10 clienti in contemporanea (stesso processo): uno solo vince', async () => {
  const cal = memoryCalendar();
  const [slot] = await cal.listAvailableSlots();
  const results = await Promise.all(
    Array.from({ length: 10 }, (_, i) => cal.book({ start: slot.start, name: `C${i}`, vehicle: 'Golf', reason: 'x' }))
  );
  assert.equal(results.filter((r) => r.ok).length, 1);
  assert.equal(results.filter((r) => r.error === 'slot_taken').length, 9);
});

test('stesso slot, due istanze sullo stesso file (telefono + pagina web): uno solo vince', async () => {
  const file = tempFile();
  const phone = fileCalendar(file);
  const web = fileCalendar(file);
  const [slot] = await web.listAvailableSlots();
  const [a, b] = await Promise.all([
    phone.book({ start: slot.start, name: 'Tel', vehicle: 'Golf', reason: 'x', channel: 'phone' }),
    web.book({ start: slot.start, name: 'Web', vehicle: 'Polo', reason: 'y', channel: 'web' }),
  ]);
  assert.equal([a, b].filter((r) => r.ok).length, 1);
  assert.equal((await phone.listBookings()).length, 1);
});

test('stesso slot, 6 processi separati in contemporanea: uno solo vince', async () => {
  const file = tempFile();
  const cal = fileCalendar(file);
  const [slot] = await cal.listAvailableSlots();
  const worker = path.join(here, 'fixtures', 'book-worker.js');
  const outs = await Promise.all(
    Array.from({ length: 6 }, (_, i) => run(process.execPath, [worker, file, slot.start, `P${i}`]))
  );
  const results = outs.map((o) => JSON.parse(o.stdout));
  assert.equal(results.filter((r) => r.ok).length, 1, JSON.stringify(results));
  assert.equal(results.filter((r) => r.error === 'slot_taken').length, 5);
  const bookings = await cal.listBookings();
  assert.equal(bookings.length, 1);
});

test('rifiuta orari fuori griglia, nel passato e dati mancanti', async () => {
  const cal = memoryCalendar();
  const ok = { name: 'A', vehicle: 'Golf', reason: 'x' };
  assert.equal((await cal.book({ ...ok, start: '2026-11-09T07:15:00Z' })).error, 'invalid_slot');
  assert.equal((await cal.book({ ...ok, start: '2026-11-08T09:00:00Z' })).error, 'invalid_slot'); // domenica/passato
  assert.equal((await cal.book({ ...ok, start: '2026-11-14T09:00:00Z' })).error, 'invalid_slot'); // sabato
  assert.equal((await cal.book({ ...ok, start: NOW_ISO })).error, 'invalid_slot'); // < 2h di anticipo
  assert.equal((await cal.book({ ...ok, start: 'boh' })).error, 'invalid_slot');
  const [slot] = await cal.listAvailableSlots();
  assert.equal((await cal.book({ ...ok, name: ' ', start: slot.start })).error, 'missing_name');
});
