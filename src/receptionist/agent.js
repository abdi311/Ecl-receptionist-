// Receptionist telefonico di ECL Solutions: logica di conversazione.
// Riceve trascrizioni (dal riconoscimento vocale o, nel prototipo, da testo)
// e produce la risposta da pronunciare. Una istanza = una chiamata.

import { chooseLanguage, normalize, tokenize, isCommonWord } from './language.js';
import {
  intents,
  extractExplicitName,
  extractNameAnswer,
  extractVehicle,
  extractVehicleAnswer,
  extractReason,
  extractReasonAnswer,
  extractPreferences,
  hasPreferences,
  filterSlots,
  parseSlotChoice,
} from './nlu.js';
import { say, formatSlot, GREETING } from './phrases.js';
import { zurichDateKey } from '../time.js';

const GREETING_WORDS = new Set(
  'bonjour bonsoir salut allo buongiorno buonasera ciao salve pronto gruezi gruessech hallo guten tag morgen servus hello hi hey good morning afternoon oui si ja yes'.split(
    ' '
  )
);

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class PhoneReceptionist {
  constructor({ calendar, defaultLanguage = 'fr', now = () => new Date() }) {
    this.calendar = calendar;
    this.defaultLanguage = defaultLanguage;
    this.now = now;
    this.lang = null;
    this.phase = 'open'; // open | booking | proposing | booked | ended
    this.pending = null; // name | vehicle | reason | slot | offer
    this.data = { name: null, vehicle: null, reason: null };
    this.prefs = {};
    this.offered = [];
    this.rejected = new Set();
    this.booking = null;
    this.transcript = [];
  }

  /** Prima frase della chiamata: saluto multilingue, la lingua si decide da come risponde il cliente. */
  start() {
    this.transcript.push({ role: 'agent', text: GREETING });
    return { text: GREETING, lang: null, ended: false, booking: null };
  }

  /**
   * Un turno del cliente.
   * opts.interrupted = true se il cliente ha parlato sopra il receptionist (barge-in):
   * la voce del receptionist va interrotta e si riparte da ciò che ha detto il cliente.
   */
  async handle(text, { interrupted = false } = {}) {
    this.transcript.push({ role: 'caller', text, interrupted });
    const out = await this.#turn(String(text ?? ''), interrupted);
    this.transcript.push({ role: 'agent', text: out.text, lang: out.lang });
    return out;
  }

  get state() {
    return {
      lang: this.lang,
      phase: this.phase,
      pending: this.pending,
      data: { ...this.data },
      prefs: { ...this.prefs },
      offered: this.offered.map((s) => s.start),
      booking: this.booking,
    };
  }

  async #turn(text, interrupted) {
    const choice = chooseLanguage(text, this.lang, this.defaultLanguage);
    const lang = (this.lang = choice.lang);
    const parts = [];
    if (choice.switched && choice.explicit) parts.push(say('switchAck', lang));
    const reply = (...more) => ({
      text: [...parts, ...more].filter(Boolean).join(' '),
      lang,
      ended: this.phase === 'ended',
      booking: this.booking,
      interruptedHandled: interrupted,
    });
    const t = (key, vars) => say(key, lang, vars);
    const todayKey = zurichDateKey(this.now());

    if (this.phase === 'ended') return reply(t('goodbye'));
    if (!text.trim()) return reply(t('notUnderstood'));

    if (intents.goodbye(text)) {
      this.phase = 'ended';
      this.pending = null;
      return reply(t('goodbye'));
    }

    const prefsNow = extractPreferences(text, todayKey);
    const substantive =
      extractVehicle(text) || extractReason(text) || extractExplicitName(text) || hasPreferences(prefsNow);

    // "Aspetti un attimo…" / "Wait…": ci si ferma e si ascolta.
    if (intents.hold(text) && !substantive) return reply(t('listening'));

    if (intents.human(text)) return reply(t('human'), t('anythingElse'));

    if (this.phase === 'booked') {
      if (intents.booking(text)) {
        this.#resetForNewBooking();
      } else if (intents.no(text) || intents.thanks(text)) {
        this.phase = 'ended';
        return reply(t('goodbye'));
      } else if (intents.hours(text)) {
        return reply(t('hours'), t('anythingElse'));
      } else {
        return reply(t('anythingElse'));
      }
    }

    const acks = this.#extract(text, lang, { explicitLang: choice.explicit });
    if (intents.hours(text)) parts.push(t('hours'));

    // ---- Il cliente risponde agli orari proposti ----
    if (this.pending === 'slot') {
      const c = parseSlotChoice(text, this.offered, todayKey);
      if (c.type === 'pick') return reply(...acks.list, ...(await this.#bookSlot(c.slot, lang)));
      if (c.type === 'reject' || c.type === 'prefs') {
        if (c.type === 'reject') for (const s of this.offered) this.rejected.add(s.start);
        this.#mergePrefs(c.prefs ?? {});
        return reply(...acks.list, ...(await this.#propose(lang)));
      }
      const [a, b] = this.offered.map((s) => formatSlot(s, lang, { now: this.now() }));
      const ask = b ? t('whichOne', { a, b }) : t('confirmOne', { a });
      if (interrupted && !acks.any) return reply(t('restate'), ask);
      return reply(...acks.list, ask);
    }

    // ---- Abbiamo chiesto "vuole un appuntamento?" ----
    if (this.pending === 'offer') {
      this.pending = null;
      if (intents.yes(text) && !intents.no(text)) this.phase = 'booking';
      else if (intents.no(text)) return reply(t('anythingElse'));
    }

    if (this.phase === 'open') {
      if (intents.booking(text) || acks.any || hasPreferences(prefsNow)) {
        this.phase = 'booking';
      } else if (intents.hours(text)) {
        return reply(t('anythingElse'));
      } else if (tokenize(text).every((w) => GREETING_WORDS.has(w))) {
        return reply(t('howCanIHelp'));
      } else if (choice.explicit) {
        return reply(t('howCanIHelp'));
      } else {
        this.pending = 'offer';
        return reply(t('offerBooking'));
      }
    }

    return reply(...acks.list, ...(await this.#nextStep(lang, acks, { fresh: choice.explicit })));
  }

  #resetForNewBooking() {
    this.phase = 'booking';
    this.pending = null;
    this.data = { name: this.data.name, vehicle: null, reason: null };
    this.prefs = {};
    this.offered = [];
    this.rejected = new Set();
    this.booking = null;
  }

  #mergePrefs(p) {
    if (p.date || p.weekday !== undefined || p.nextWeek) {
      delete this.prefs.date;
      delete this.prefs.weekday;
      delete this.prefs.nextWeek;
      delete this.prefs.hour;
      delete this.prefs.minute;
    }
    for (const k of ['date', 'weekday', 'nextWeek', 'part', 'hour', 'minute']) {
      if (p[k] !== undefined) this.prefs[k] = p[k];
    }
    if (p.later && this.offered.length) this.prefs.after = this.offered[this.offered.length - 1].start;
  }

  /** Estrae nome, veicolo, motivo, preferenze. Ritorna le frasi di conferma/correzione. */
  #extract(text, lang, { explicitLang }) {
    const list = [];
    let any = false;
    const t = (key, vars) => say(key, lang, vars);
    const pending = this.pending;
    const todayKey = zurichDateKey(this.now());
    const offTopic = explicitLang || intents.hours(text) || intents.hold(text) || intents.human(text);

    // Nome
    let name = extractExplicitName(text);
    if (!name && pending === 'name' && !offTopic && !intents.booking(text)) name = extractNameAnswer(text);
    if (name && name !== this.data.name) {
      list.push(this.data.name ? t('corrected', { value: name }) : t('thanksName', { name }));
      this.data.name = name;
      any = true;
    }

    // Veicolo (il nome viene tolto dalla frase: "Giulia" è anche un modello Alfa Romeo)
    const rest = name ? text.replace(new RegExp(escapeRe(name), 'i'), ' ') : text;
    let vehicle = extractVehicle(rest, { expecting: pending === 'vehicle' });
    if (!vehicle && pending === 'vehicle' && !offTopic && !name) {
      const v = extractVehicleAnswer(text);
      if (v && v.split(/\s+/).some((w) => !isCommonWord(normalize(w)))) vehicle = v;
    }
    // "BMW" detto dopo "BMW X3" non è una correzione
    if (vehicle && this.data.vehicle && normalize(this.data.vehicle).startsWith(normalize(vehicle))) vehicle = null;
    if (vehicle && vehicle !== this.data.vehicle) {
      if (this.data.vehicle) list.push(t('corrected', { value: vehicle }));
      else if (pending === 'vehicle') list.push(t('gotVehicle', { vehicle }));
      this.data.vehicle = vehicle;
      any = true;
    }

    // Motivo
    let reason = null;
    const prefs = extractPreferences(text, todayKey);
    if (pending === 'reason' && !offTopic && !name && !vehicle && !hasPreferences(prefs)) {
      reason = extractReasonAnswer(text);
    } else if (!this.data.reason || intents.correction(text)) {
      reason = extractReason(text);
    }
    if (reason && reason !== this.data.reason) {
      if (this.data.reason) list.push(t('corrected', { value: reason }));
      else if (pending === 'reason') list.push(t('gotReason'));
      this.data.reason = reason;
      any = true;
    }

    if (pending !== 'slot' && hasPreferences(prefs)) this.#mergePrefs(prefs);
    return { list, any };
  }

  async #nextStep(lang, acks, { fresh = false } = {}) {
    const t = (key, vars) => say(key, lang, vars);
    // Dopo un cambio di lingua esplicito si ripete la domanda, senza dire "non ho capito".
    const asked = fresh ? null : this.pending;
    if (!this.data.name) {
      this.pending = 'name';
      return [asked === 'name' && !acks.any ? t('askNameAgain') : t('askName')];
    }
    if (!this.data.vehicle) {
      this.pending = 'vehicle';
      return asked === 'vehicle' && !acks.any ? [t('notUnderstood'), t('askVehicle')] : [t('askVehicle')];
    }
    if (!this.data.reason) {
      this.pending = 'reason';
      return asked === 'reason' && !acks.any ? [t('notUnderstood'), t('askReason')] : [t('askReason')];
    }
    return this.#propose(lang);
  }

  /** Propone al massimo due orari liberi, rispettando le preferenze quando possibile. */
  async #propose(lang) {
    const t = (key, vars) => say(key, lang, vars);
    const todayKey = zurichDateKey(this.now());
    const all = await this.calendar.listAvailableSlots();
    const cand = all.filter((s) => !this.rejected.has(s.start));
    if (!cand.length) {
      this.pending = null;
      this.phase = 'open';
      this.offered = [];
      return [t('noSlots')];
    }
    const p = this.prefs;
    const keepAfter = p.after ? { after: p.after } : {};
    const tries = [
      p,
      { ...p, hour: undefined, minute: undefined },
      { ...p, hour: undefined, minute: undefined, part: undefined },
      { ...keepAfter, fromDate: p.date, part: p.part },
      { ...keepAfter, fromDate: p.date },
      keepAfter,
      {},
    ];
    let list = [];
    let level = 0;
    for (; level < tries.length; level++) {
      const clean = Object.fromEntries(Object.entries(tries[level]).filter(([, v]) => v !== undefined));
      list = filterSlots(cand, clean, todayKey);
      if (list.length) break;
    }
    const relaxed = level > 0 && hasPreferences(p);
    const first = list[0];
    const narrow = p.date || p.weekday !== undefined || p.part;
    const second = narrow
      ? list[1]
      : (list.find((s) => s.date !== first.date || s.hour < 12 !== first.hour < 12) ?? list[1]);
    this.offered = [first, second].filter(Boolean);
    this.pending = 'slot';
    this.phase = 'proposing';
    const [a, b] = this.offered.map((s) => formatSlot(s, lang, { now: this.now() }));
    const proposal = b ? t('proposeTwo', { a, b }) : t('proposeOne', { a });
    return relaxed ? [t('noMatch'), proposal] : [proposal];
  }

  /** Salva sul calendario; conferma al cliente SOLO se il salvataggio è riuscito. */
  async #bookSlot(slot, lang) {
    const t = (key, vars) => say(key, lang, vars);
    let res;
    try {
      res = await this.calendar.book({ start: slot.start, ...this.data, channel: 'phone', language: lang });
    } catch {
      res = { ok: false, error: 'storage_error' };
    }
    if (res.ok) {
      this.booking = res.booking;
      this.phase = 'booked';
      this.pending = null;
      this.offered = [];
      const when = formatSlot(res.booking, lang, { now: this.now(), relative: false });
      return [t('confirmed', { when, ...res.booking, ref: res.booking.id })];
    }
    if (res.error === 'slot_taken' || res.error === 'invalid_slot') {
      this.rejected.add(slot.start);
      return [t('slotTaken'), ...(await this.#propose(lang))];
    }
    this.pending = null;
    this.phase = 'open';
    return [t('saveFailed')];
  }
}
