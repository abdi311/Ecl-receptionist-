// Server HTTP del prototipo (solo moduli standard di Node).
//   GET  /book                       pagina di prenotazione (fr/it/de/en)
//   GET  /api/slots                  slot liberi (Europe/Zurich)
//   POST /api/bookings               prenota uno slot (409 se già preso)
//   GET  /api/bookings               elenco prenotazioni (solo prototipo)
//   GET  /simulator                  simulatore della chiamata via testo
//   POST /api/phone/sessions         nuova chiamata simulata
//   POST /api/phone/sessions/:id/messages   turno del cliente { text, interrupted }
//   POST /webhooks/whatsapp          WhatsApp finto: risponde solo con il link (non invia nulla)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { config } from './config.js';
import { CalendarService } from './calendar/calendar.js';
import { FileStorage } from './calendar/storage.js';
import { PhoneReceptionist } from './receptionist/agent.js';
import { replyToWhatsApp } from './channels/whatsapp.js';
import { TZ } from './time.js';

const PUBLIC_DIR = path.join(config.root, 'public');
const SESSION_TTL_MS = 30 * 60 * 1000;

function send(res, status, body, type = 'application/json; charset=utf-8') {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(payload);
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw Object.assign(new Error('too_large'), { status: 413 });
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error('invalid_json'), { status: 400 });
  }
}

function sendPage(res, file) {
  send(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, file), 'utf8'), 'text/html; charset=utf-8');
}

export function createServer({ calendar, baseUrl = config.publicBaseUrl, defaultLanguage = config.defaultLanguage, now }) {
  const sessions = new Map();

  function cleanup() {
    const limit = Date.now() - SESSION_TTL_MS;
    for (const [id, s] of sessions) if (s.lastSeen < limit) sessions.delete(id);
  }

  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const p = url.pathname;

      if (req.method === 'GET' && (p === '/' || p === '/book')) return sendPage(res, 'book.html');
      if (req.method === 'GET' && p === '/simulator') return sendPage(res, 'simulator.html');
      if (req.method === 'GET' && p === '/health') return send(res, 200, { ok: true, timezone: TZ });

      if (req.method === 'GET' && p === '/api/slots') {
        const slots = await calendar.listAvailableSlots();
        return send(res, 200, { timezone: TZ, slots });
      }

      if (req.method === 'GET' && p === '/api/bookings') {
        return send(res, 200, { timezone: TZ, bookings: await calendar.listBookings() });
      }

      if (req.method === 'POST' && p === '/api/bookings') {
        const body = await readJson(req);
        const result = await calendar.book({
          start: body.start,
          name: body.name,
          vehicle: body.vehicle,
          reason: body.reason,
          language: ['fr', 'it', 'de', 'en'].includes(body.lang) ? body.lang : null,
          channel: 'web',
        });
        if (result.ok) return send(res, 201, result);
        return send(res, result.error === 'slot_taken' ? 409 : 400, result);
      }

      if (req.method === 'POST' && p === '/api/phone/sessions') {
        cleanup();
        const id = crypto.randomUUID();
        const agent = new PhoneReceptionist({ calendar, defaultLanguage, now });
        sessions.set(id, { agent, lastSeen: Date.now() });
        return send(res, 201, { id, reply: agent.start() });
      }

      const m = p.match(/^\/api\/phone\/sessions\/([\w-]+)\/messages$/);
      if (req.method === 'POST' && m) {
        const s = sessions.get(m[1]);
        if (!s) return send(res, 404, { error: 'unknown_session' });
        s.lastSeen = Date.now();
        const body = await readJson(req);
        const reply = await s.agent.handle(String(body.text ?? '').slice(0, 500), {
          interrupted: Boolean(body.interrupted),
        });
        return send(res, 200, { reply, state: s.agent.state });
      }

      if (req.method === 'POST' && p === '/webhooks/whatsapp') {
        const body = await readJson(req);
        return send(res, 200, { reply: replyToWhatsApp(body, { baseUrl }) });
      }

      send(res, 404, { error: 'not_found' });
    } catch (e) {
      send(res, e.status ?? 500, { error: e.status ? e.message : 'internal_error' });
      if (!e.status) console.error(e);
    }
  });
}

// Avvio diretto: npm start
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const calendar = new CalendarService({ storage: new FileStorage(config.calendarFile) });
  createServer({ calendar }).listen(config.port, () => {
    console.log(`ECL receptionist (prototipo) su ${config.publicBaseUrl}`);
    console.log(`  Pagina di prenotazione: ${config.publicBaseUrl}/book`);
    console.log(`  Simulatore telefonata:  ${config.publicBaseUrl}/simulator`);
    console.log(`  Calendario finto:       ${config.calendarFile} (fuso ${TZ})`);
  });
}
