import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
import { replyToWhatsApp } from '../src/channels/whatsapp.js';
import { tempFile, fileCalendar, now } from './helpers.js';

let server;
let base;
let calendar;

before(async () => {
  calendar = fileCalendar(tempFile());
  server = createServer({ calendar, baseUrl: 'https://ecl.example', now });
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('pagina di prenotazione e simulatore rispondono', async () => {
  for (const p of ['/book', '/simulator']) {
    const r = await fetch(base + p);
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-type'), /text\/html/);
  }
});

test('API slot: fuso Europe/Zurich', async () => {
  const data = await (await fetch(base + '/api/slots')).json();
  assert.equal(data.timezone, 'Europe/Zurich');
  assert.ok(data.slots.length > 0);
  assert.match(data.slots[0].local, /\+01:00$/);
});

test('pagina web: due prenotazioni simultanee sullo stesso slot → 201 e 409', async () => {
  const { slots } = await (await fetch(base + '/api/slots')).json();
  const start = slots[5].start;
  const body = (name) => ({ start, name, vehicle: 'VW Golf', reason: 'Service', lang: 'it' });
  const [a, b] = await Promise.all([post('/api/bookings', body('Uno')), post('/api/bookings', body('Due'))]);
  assert.deepEqual([a.status, b.status].sort(), [201, 409]);
  const loser = await (a.status === 409 ? a : b).json();
  assert.equal(loser.error, 'slot_taken');
});

test('telefono e pagina condividono il calendario', async () => {
  // il telefono prenota…
  const s = await (await post('/api/phone/sessions', {})).json();
  for (const text of ['Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange']) {
    await post(`/api/phone/sessions/${s.id}/messages`, { text });
  }
  const res = await (await post(`/api/phone/sessions/${s.id}/messages`, { text: 'Le premier' })).json();
  const booked = res.state.booking;
  assert.ok(booked);
  // …e la pagina non mostra più quello slot e non può prenotarlo
  const { slots } = await (await fetch(base + '/api/slots')).json();
  assert.ok(!slots.some((x) => x.start === booked.start));
  const r = await post('/api/bookings', { start: booked.start, name: 'Web', vehicle: 'Golf', reason: 'x' });
  assert.equal(r.status, 409);
});

test('validazione input pagina web', async () => {
  const r = await post('/api/bookings', { start: '2026-11-09T07:15:00Z', name: 'A', vehicle: 'B', reason: 'C' });
  assert.equal(r.status, 400);
  const bad = await fetch(base + '/api/bookings', { method: 'POST', body: '{nope' });
  assert.equal(bad.status, 400);
});

test('WhatsApp: la risposta è solo il link di prenotazione e non viene inviata', async () => {
  const data = await (await post('/webhooks/whatsapp', { from: '+41790000000', text: 'Ciao, vorrei un appuntamento' })).json();
  assert.deepEqual(data.reply, { to: '+41790000000', text: 'https://ecl.example/book?lang=it', sent: false });

  for (const text of ['Bonjour', 'Hallo, haben Sie morgen Zeit?', 'Can I come tomorrow?', '', '👍']) {
    const r = replyToWhatsApp({ from: 'x', text }, { baseUrl: 'https://ecl.example' });
    assert.match(r.text, /^https:\/\/ecl\.example\/book(\?lang=(fr|it|de|en))?$/, `"${text}" → ${r.text}`);
  }
});
