// Calendario finto di ECL Solutions. Unica fonte di verità per telefono e pagina web.
// Gli slot sono generati in ora di Zurigo (Europe/Zurich) e salvati in UTC.

import crypto from 'node:crypto';
import {
  TZ,
  zurichParts,
  zurichToUtc,
  zurichDateKey,
  addDaysToKey,
  weekdayOfKey,
  toZurichIso,
} from '../time.js';

export const DEFAULT_SCHEDULE = {
  slotMinutes: 60,
  openDays: [1, 2, 3, 4, 5], // lun-ven
  ranges: [
    ['08:00', '12:00'],
    ['13:30', '17:30'],
  ],
  leadMinutes: 120, // non si prenota con meno di 2 ore di anticipo
  horizonDays: 21,
};

const MAX_LEN = { name: 80, vehicle: 80, reason: 200 };

function hm(s) {
  const [h, m] = s.split(':').map(Number);
  return { h, m };
}

function newRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(5);
  let s = '';
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `ECL-${s}`;
}

export class CalendarService {
  constructor({ storage, schedule = DEFAULT_SCHEDULE, now = () => new Date() }) {
    this.storage = storage;
    this.schedule = schedule;
    this.now = now;
    this.timezone = TZ;
  }

  /** Tutti gli slot teorici (orario di apertura) a partire da oggi a Zurigo. */
  generateSlots() {
    const { slotMinutes, openDays, ranges, leadMinutes, horizonDays } = this.schedule;
    const now = this.now();
    const earliest = now.getTime() + leadMinutes * 60000;
    const todayKey = zurichDateKey(now);
    const slots = [];
    for (let i = 0; i < horizonDays; i++) {
      const key = addDaysToKey(todayKey, i);
      if (!openDays.includes(weekdayOfKey(key))) continue;
      const [y, mo, d] = key.split('-').map(Number);
      for (const [from, to] of ranges) {
        const a = hm(from);
        const b = hm(to);
        let minutes = a.h * 60 + a.m;
        const end = b.h * 60 + b.m;
        while (minutes + slotMinutes <= end) {
          const start = zurichToUtc(y, mo, d, Math.floor(minutes / 60), minutes % 60);
          if (start.getTime() >= earliest) {
            slots.push({ start, end: new Date(start.getTime() + slotMinutes * 60000) });
          }
          minutes += slotMinutes;
        }
      }
    }
    return slots;
  }

  #describe(slot) {
    const p = zurichParts(slot.start);
    return {
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      local: toZurichIso(slot.start),
      date: zurichDateKey(slot.start),
      hour: p.hour,
      minute: p.minute,
      weekday: p.weekday,
      timezone: TZ,
    };
  }

  /** Slot liberi (non sovrapposti a prenotazioni esistenti), ordinati per orario. */
  async listAvailableSlots({ limit } = {}) {
    const { bookings } = await this.storage.read();
    const free = this.generateSlots()
      .filter((s) => !bookings.some((b) => overlaps(s, b)))
      .map((s) => this.#describe(s));
    return limit ? free.slice(0, limit) : free;
  }

  /** Verifica che l'orario sia uno slot valido della griglia (orario, anticipo, orizzonte). */
  findSlot(startIso) {
    const t = Date.parse(startIso);
    if (Number.isNaN(t)) return null;
    return this.generateSlots().find((s) => s.start.getTime() === t) ?? null;
  }

  /**
   * Prenota uno slot. Lettura, controllo e scrittura avvengono sotto lock:
   * due clienti non possono ottenere lo stesso slot.
   * Ritorna { ok: true, booking } oppure { ok: false, error }.
   */
  async book({ start, name, vehicle, reason, channel = 'unknown', language = null }) {
    const fields = { name, vehicle, reason };
    for (const [k, v] of Object.entries(fields)) {
      if (typeof v !== 'string' || !v.trim()) return { ok: false, error: `missing_${k}` };
      if (v.trim().length > MAX_LEN[k]) return { ok: false, error: `too_long_${k}` };
    }
    const slot = this.findSlot(start);
    if (!slot) return { ok: false, error: 'invalid_slot' };

    return this.storage.withLock(async () => {
      const data = await this.storage.read();
      if (data.bookings.some((b) => overlaps(slot, b))) {
        return { ok: false, error: 'slot_taken' };
      }
      const booking = {
        id: newRef(),
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        local: toZurichIso(slot.start),
        timezone: TZ,
        name: name.trim(),
        vehicle: vehicle.trim(),
        reason: reason.trim(),
        channel,
        language,
        createdAt: this.now().toISOString(),
      };
      data.bookings.push(booking);
      data.bookings.sort((a, b) => a.start.localeCompare(b.start));
      await this.storage.write(data);
      return { ok: true, booking };
    });
  }

  async listBookings() {
    return (await this.storage.read()).bookings;
  }
}

function overlaps(slot, booking) {
  const s = slot.start.getTime();
  const e = slot.end.getTime();
  return Date.parse(booking.start) < e && Date.parse(booking.end) > s;
}
