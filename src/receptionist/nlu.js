// Comprensione delle frasi del cliente (fr / it / de / en), a regole.
// Estrae: nome, veicolo, motivo, preferenze di giorno/ora, scelta dello slot, intenti.

import { normalize, tokenize, isCommonWord } from './language.js';
import { addDaysToKey, weekdayOfKey } from '../time.js';

const has = (re, text) => re.test(normalize(text));

// ---------- Token con testo originale ----------
function splitTokens(text) {
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => {
      const word = chunk.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
      const norm = normalize(word).replace(/^(l|d|j|qu|c|m|n|s)'/, '');
      return { chunk, word, norm, endsClause: /[,.;:!?]$/.test(chunk) };
    })
    .filter((t) => t.word);
}

const capitalize = (w) => (w ? w[0].toUpperCase() + w.slice(1) : w);
const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

// ---------- Intenti ----------
const RE = {
  booking:
    /rendez[- ]vous|\brdv\b|reserv|\bfixer\b|creneau|\bpasser\b|\bamener\b|appuntament|prenot|fissare|passare|portare|\btermin|\bbuchen\b|vereinbar|vorbei|appointment|\bbook|schedul|\bslot\b|\bbring\b|come in/,
  hours:
    /horaire|heures d'ouverture|\bouverts?\b|\borari|aperti\b|apertura|offnungszeit|oeffnungszeit|geoffnet|\boffen\b|opening hours|\bopen\b/,
  goodbye:
    /au revoir|bonne (journee|soiree)|arrivederci|buona (giornata|serata)|ciao ciao|\btschu?e?ss\b|auf wieder(horen|hoeren|sehen)|\bbye\b|goodbye|nice day|c'est tout|e tutto|das wars|das ist alles|that'?s all|nothing else|rien d'autre|niente altro|nient'altro|nichts weiter|sonst nichts|\bschonen tag\b|\bschoenen tag\b/,
  thanks: /\bmerci\b|\bgrazie\b|\bdanke\b|\bthanks?\b/,
  human:
    /operat(eur|rice|ore|or)\b|quelqu'un|une personne|un humain|collegue|una persona|collega|un umano|mitarbeiter|menschen|mit jemandem|real person|\bsomeone\b|\bhuman\b|\bstaff\b/,
  hold: /\b(attendez|attends|un instant|une seconde|un moment|aspetta|aspetti|un attimo|un momento|warte|warten sie|moment|augenblick|wait|hold on|one sec|just a sec|one moment|hang on)\b/,
  yes: /\b(oui|ouais|volontiers|d'accord|daccord|parfait|ok|okay|si|certo|va bene|perfetto|volentieri|ja|gerne|genau|klar|passt|yes|yeah|yep|sure|fine|great|perfect|ca marche|c'est bon|d'acc)\b/,
  no: /\b(non|no|nein|nope)\b/,
  reject:
    /\b(aucun|aucune|autre|autres|nessuno|nessuna|altro|altra|altri|altre|keiner|keine|keins|andere|anderen|anderer|anderes|neither|none|other|another|different)\b|pas possible|ne (me )?convient pas|ne va pas|non (mi )?va|non posso|non riesco|kann (ich )?nicht|geht nicht|passt (mir )?nicht|can'?t|cannot|doesn'?t work|won'?t work|not possible/,
  later: /plus tard|piu tardi|\bspaeter\b|\bspater\b|\blater\b/,
  correction: /plutot|en fait|pardon|desole|anzi|invece|scusi|scusa|eigentlich|entschuldigung|sorry|actually|i mean|correction/,
};

export const intents = {
  booking: (t) => has(RE.booking, t),
  hours: (t) => has(RE.hours, t),
  goodbye: (t) => has(RE.goodbye, t),
  thanks: (t) => has(RE.thanks, t),
  human: (t) => has(RE.human, t),
  hold: (t) => has(RE.hold, t) && tokenize(t).length <= 5,
  yes: (t) => has(RE.yes, t),
  no: (t) => has(RE.no, t) && !has(RE.yes, t),
  reject: (t) => has(RE.reject, t) || has(RE.later, t),
  later: (t) => has(RE.later, t),
  correction: (t) => has(RE.correction, t),
};

// ---------- Nome ----------
const NAME_EXPLICIT =
  /(?:je m['’]appelle|mon nom (?:est|c['’]est)|mi chiamo|il mio nome (?:è|e)|ich hei(?:ß|ss)e|mein name ist|hier spricht|my name is|my name['’]s)\s+([^,.;!?]+)/iu;
const NAME_WEAK =
  /^(?:(?:oui|si|sì|ja|yes|alors|allora|also|so|bonjour|buongiorno|hallo|hello|gr[üu]ezi|ok)[,!.]?\s+)*(?:c['’]est|moi c['’]est|ici|sono|io sono|ich bin|hier ist|i['’]m|i am|this is|it['’]s)?\s*([^,.;!?]+)/iu;
const NAME_PARTICLES = set('de di da van von del della le la du des dos');
const NAME_STOP = set(
  'et e und and je ich i avec con mit with per pour fur fuer for qui che who mais ma aber but voudrais vorrei mochte moechte would'
);

function cleanName(raw) {
  const words = raw.trim().split(/\s+/);
  const out = [];
  for (let i = 0; i < words.length && out.length < 4; i++) {
    const w = words[i];
    if (!/^[\p{L}][\p{L}'’-]*$/u.test(w)) break;
    const n = normalize(w);
    if (NAME_STOP.has(n)) break;
    if (NAME_PARTICLES.has(n) && out.length > 0 && words[i + 1] && /^\p{Lu}/u.test(words[i + 1])) {
      out.push(w);
      continue;
    }
    if (isCommonWord(n)) break;
    out.push(capitalize(w));
  }
  return out.length ? out.join(' ') : null;
}

// "sono Marco Rossi", "je suis Jean Dupont", "hier ist Anna": valido solo se seguito da una maiuscola.
const NAME_INTRO =
  /(?:^|[\s,.;!?])(?:sono|io sono|je suis|moi c['’]est|ici|ich bin|hier ist|i['’]m|i am|this is)\s+(\p{Lu}[^,.;!?]*)/u;

/** Nome detto esplicitamente ("je m'appelle…", "mi chiamo…"). Vale in qualsiasi momento. */
export function extractExplicitName(text) {
  const m = String(text).match(NAME_EXPLICIT);
  if (m) return cleanName(m[1]);
  const intro = String(text).match(NAME_INTRO);
  return intro ? cleanName(intro[1]) : null;
}

/** Risposta alla domanda "come si chiama?". */
export function extractNameAnswer(text) {
  const explicit = extractExplicitName(text);
  if (explicit) return explicit;
  if (tokenize(text).length > 6) return null;
  const m = String(text).match(NAME_WEAK);
  return m ? cleanName(m[1]) : null;
}

// ---------- Veicolo ----------
const BRANDS = [
  'alfa romeo', 'land rover', 'range rover', 'mercedes-benz', 'mercedes benz', 'mercedes', 'vw', 'volkswagen',
  'audi', 'bmw', 'opel', 'peugeot', 'renault', 'citroen', 'fiat', 'lancia', 'ford', 'toyota', 'honda', 'nissan',
  'mazda', 'hyundai', 'kia', 'skoda', 'seat', 'cupra', 'volvo', 'tesla', 'porsche', 'mini', 'dacia', 'suzuki',
  'subaru', 'mitsubishi', 'jeep', 'jaguar', 'smart', 'lexus', 'abarth', 'maserati', 'ferrari', 'lamborghini',
  'iveco', 'alpine', 'mg', 'byd',
];
const MODELS = set(`golf polo passat tiguan touran t-roc troc caddy transporter arteon octavia fabia superb kodiaq
  karoq kamiq yeti clio megane captur twingo kangoo scenic kadjar zoe partner berlingo c3 c4 c5 panda punto tipo
  ducato doblo giulia giulietta stelvio mito ypsilon yaris corolla rav4 aygo auris c-hr focus fiesta kuga transit
  mondeo puma astra corsa insignia mokka zafira a1 a3 a4 a5 a6 a7 a8 q2 q3 q5 q7 q8 tt x1 x2 x3 x4 x5 x6 qashqai
  juke micra leaf leon ibiza arona ateca formentor sandero duster logan swift vitara ignis tucson kona i10 i20 i30
  sportage ceed picanto niro cx-3 cx-5 cx-30 mx-5 civic jazz cr-v xc40 xc60 xc90 v40 v60 v90 cayenne macan
  panamera cooper countryman 500x 500l multipla`);
const NUMERIC_MODELS = set('106 107 108 206 207 208 307 308 407 508 2008 3008 5008 500 595 147 156 159');
const NEGATIONS = set('pas non not nicht kein keine keinen no');
const ARTICLES = set('un une a an una uno ein eine einen einem einer ma mon la le my mia mio meine mein meinen il der die das den dem the');
const MODEL_TAIL_STOP = set(
  'de del della di du des per pour fur fuer for avec con mit with et e und and demain domani morgen tomorrow il le la the my qui che'
);

function isNegated(toks, i) {
  const p1 = toks[i - 1];
  const p2 = toks[i - 2];
  if (p1 && !p1.endsClause && NEGATIONS.has(p1.norm)) return true;
  if (p1 && p2 && !p2.endsClause && !p1.endsClause && ARTICLES.has(p1.norm) && NEGATIONS.has(p2.norm)) return true;
  return false;
}

function modelTail(toks, i, max) {
  const out = [];
  for (let j = i; j < toks.length && out.length < max; j++) {
    if (toks[j - 1]?.endsClause) break;
    const t = toks[j];
    if (MODEL_TAIL_STOP.has(t.norm)) break;
    const looksModel =
      MODELS.has(t.norm) || NUMERIC_MODELS.has(t.norm) || /^\p{Lu}[\p{L}\p{N}-]*$/u.test(t.word) || /^\d{1,4}[a-z]?$/i.test(t.word);
    if (!looksModel) break;
    if (/^(19|20)\d\d$/.test(t.word)) break; // anno: lo ignoriamo
    out.push(t.word);
  }
  return out;
}

/** Marca/modello riconosciuti nella frase (anche come correzione: "non una Golf, una Polo"). */
export function extractVehicle(text, { expecting = false } = {}) {
  const toks = splitTokens(text);
  for (let i = 0; i < toks.length; i++) {
    const two = toks[i + 1] ? `${toks[i].norm} ${toks[i + 1].norm}` : null;
    let brandLen = 0;
    if (two && BRANDS.includes(two)) brandLen = 2;
    else if (BRANDS.includes(toks[i].norm)) brandLen = 1;
    if (brandLen) {
      if (isNegated(toks, i)) continue;
      const brand = toks
        .slice(i, i + brandLen)
        .map((t) => (t.word.length <= 3 ? t.word.toUpperCase() : capitalize(t.word)))
        .join(' ');
      const tail = toks[i + brandLen - 1].endsClause ? [] : modelTail(toks, i + brandLen, 2);
      return [brand, ...tail].join(' ');
    }
    const isModel = MODELS.has(toks[i].norm) || (expecting && NUMERIC_MODELS.has(toks[i].norm));
    if (isModel) {
      if (isNegated(toks, i)) continue;
      const tail = toks[i].endsClause ? [] : modelTail(toks, i + 1, 1);
      return [capitalize(toks[i].word), ...tail].join(' ');
    }
  }
  return null;
}

const VEHICLE_FILLER =
  /^(?:(?:oui|si|sì|ja|yes|alors|allora|also|so|euh|ehm|ähm|um)[,!.]?\s+)*(?:c['’]est|j['’]ai|è|ho|ich habe|es ist|das ist|it['’]s|i have|i drive|je roule en|guido)?\s*(?:une|un|una|uno|un['’]|ein|eine|einen|a|an|la mia|il mio|ma|mon|meine|mein|meinen|my)?\s*/iu;

/** Risposta alla domanda "che veicolo?". */
export function extractVehicleAnswer(text) {
  const known = extractVehicle(text, { expecting: true });
  if (known) return known;
  const clause = String(text).split(/[,.;!?]/)[0].replace(VEHICLE_FILLER, '').trim();
  const words = clause.split(/\s+/).filter(Boolean);
  if (!words.length || words.length > 6) return null;
  return words.map((w, i) => (i === 0 ? capitalize(w) : w)).join(' ');
}

// ---------- Motivo ----------
const REASON_KEYWORDS = [
  'vidange', 'entretien', 'service', 'revision', 'frein', 'freins', 'plaquettes', 'pneus', 'pneu', 'voyant',
  'diagnostic', 'panne', 'bruit', 'climatisation', 'clim', 'batterie', 'embrayage', 'controle', 'expertise',
  'reparation', 'demarre pas', 'distribution', 'injecteurs', 'tagliando', 'freni', 'gomme', 'pneumatici', 'spia',
  'diagnosi', 'guasto', 'rumore', 'cambio olio', 'olio', 'frizione', 'aria condizionata', 'climatizzatore',
  'batteria', 'collaudo', 'riparazione', 'distribuzione', 'cinghia', 'iniettori', 'non parte', 'inspektion',
  'olwechsel', 'oelwechsel', 'bremsen', 'reifen', 'reifenwechsel', 'kontrollleuchte', 'motorleuchte', 'gerausch',
  'geraeusch', 'klimaanlage', 'kupplung', 'mfk', 'reparatur', 'diagnose', 'zahnriemen', 'springt nicht an',
  'oil change', 'brakes', 'brake', 'tyres', 'tires', 'tyre', 'tire', 'warning light', 'check engine',
  'engine light', 'noise', 'air conditioning', 'battery', 'clutch', 'inspection', 'repair', 'timing belt',
  'ecu', 'centralina', 'calculateur', 'steuergerat', 'steuergeraet', 'reprogrammation', 'rimappatura', 'tuning',
  'chiptuning', 'fap', 'dpf', 'egr', 'adblue', 'turbo', 'injectors', 'won t start',
].map((k) => k.split(' '));

const REASON_CUES = set('pour per fur fuer wegen for because parce perche weil about concernant riguardo');
const REASON_STOP = set(
  'sur de du della dello del alla al an am auf on my ma mon mes mia mio meinem meiner meinen mein of demain domani morgen tomorrow heute oggi today lundi mardi mercredi jeudi vendredi lunedi martedi mercoledi giovedi venerdi montag dienstag mittwoch donnerstag freitag monday tuesday wednesday thursday friday et e und and mais ma aber but svp please bitte stp'
);
const LEADING_ARTICLES =
  /^(?:(?:le|la|les|l['’]|un|une|des|du|de|il|lo|gli|i|un['’]|una|uno|dei|degli|delle|der|die|das|den|dem|ein|eine|einen|einem|einer|a|an|the|my|ma|mon|mes|mia|mio|meine|mein|meinen)\s+|l['’])/iu;

function findReasonKeyword(toks) {
  for (let i = 0; i < toks.length; i++) {
    for (const kw of REASON_KEYWORDS) {
      if (kw.every((w, k) => toks[i + k]?.norm === w)) return { index: i, length: kw.length };
    }
  }
  return null;
}

function stripArticles(s) {
  let prev;
  let out = s.trim();
  do {
    prev = out;
    out = out.replace(LEADING_ARTICLES, '').trim();
  } while (out !== prev);
  return out.replace(/[,.;:!?]+$/, '');
}

/** Motivo riconosciuto da parole chiave ("per il tagliando", "wegen der Bremsen"). */
export function extractReason(text) {
  const toks = splitTokens(text);
  const hit = findReasonKeyword(toks);
  if (!hit) return null;
  let start = hit.index;
  for (let j = hit.index - 1; j >= Math.max(0, hit.index - 3); j--) {
    if (toks[j].endsClause) break;
    if (REASON_CUES.has(toks[j].norm)) {
      start = j + 1;
      break;
    }
  }
  const kwEnd = hit.index + hit.length;
  const out = [];
  for (let j = start; j < toks.length && out.length < 8; j++) {
    if (j >= kwEnd && REASON_STOP.has(toks[j].norm)) break;
    out.push(toks[j].word);
    if (toks[j].endsClause && j >= kwEnd - 1) break;
  }
  const reason = stripArticles(out.join(' '));
  return reason ? capitalize(reason) : null;
}

const REASON_FILLER =
  /^(?:(?:oui|si|sì|ja|yes|alors|allora|also|so|euh|ehm|ähm|um|well)[,!.]?\s+)*(?:c['’]est|è|es ist|it['’]s|it is)?\s*/iu;
const REASON_CUE_START = /^(?:pour|per|für|fuer|wegen|for|because|parce que|perché|perche|weil)\s+/iu;

/** Risposta alla domanda "qual è il motivo?": si tiene la frase del cliente, ripulita. */
export function extractReasonAnswer(text) {
  let s = String(text).trim().replace(REASON_FILLER, '');
  if (REASON_CUE_START.test(s)) s = stripArticles(s.replace(REASON_CUE_START, ''));
  s = s.replace(/[.!?]+$/, '').trim();
  const words = s.split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return capitalize(words.slice(0, 20).join(' '));
}

// ---------- Preferenze di giorno / orario ----------
const WEEKDAY_NAMES = [
  [1, /\b(lundi|lunedi|montag|monday)\b/],
  [2, /\b(mardi|martedi|dienstag|tuesday)\b/],
  [3, /\b(mercredi|mercoledi|mittwoch|wednesday)\b/],
  [4, /\b(jeudi|giovedi|donnerstag|thursday)\b/],
  [5, /\b(vendredi|venerdi|freitag|friday)\b/],
  [6, /\b(samedi|sabato|samstag|saturday)\b/],
  [0, /\b(dimanche|domenica|sonntag|sunday)\b/],
];

/**
 * Preferenze espresse nella frase. todayKey: 'YYYY-MM-DD' a Zurigo.
 * Ritorna { date?, weekday?, part?: 'morning'|'afternoon', hour?, minute?, nextWeek?, later? }
 */
export function extractPreferences(text, todayKey) {
  const n = normalize(text);
  const p = {};
  if (/apres[- ]demain|dopodomani|ubermorgen|uebermorgen|day after tomorrow/.test(n)) p.date = addDaysToKey(todayKey, 2);
  else if (/\b(demain|domani|tomorrow)\b/.test(n) || (/\bmorgen\b/.test(n) && !/guten morgen/.test(n)))
    p.date = addDaysToKey(todayKey, 1);
  else if (/\b(aujourd'?hui|aujourd hui|oggi|heute|today)\b/.test(n)) p.date = todayKey;

  if (!p.date) {
    for (const [wd, re] of WEEKDAY_NAMES) {
      if (re.test(n)) {
        p.weekday = wd;
        break;
      }
    }
  }
  if (/\b(matin|matinee|mattina|mattino|vormittag|vormittags|morgens|morning)\b|morgen fruh/.test(n)) p.part = 'morning';
  if (/apres[- ]midi|\bpomeriggio\b|\bnachmittags?\b|\bafternoon\b/.test(n)) p.part = 'afternoon';
  if (/semaine prochaine|settimana prossima|prossima settimana|nachste woche|naechste woche|next week/.test(n))
    p.nextWeek = true;
  if (RE.later.test(n)) p.later = true;

  const hour =
    n.match(/\b(\d{1,2})\s*(?:h|uhr)\s*(\d{2})?\b/) ||
    n.match(/\b(\d{1,2})[:.](\d{2})\b/) ||
    n.match(/\b(\d{1,2})\s*(am|pm)\b/) ||
    n.match(/\b(?:a|vers|alle|verso|um|gegen|at|around)\s+(?:le |les |ore )?(\d{1,2})\b/);
  if (hour) {
    let h = Number(hour[1]);
    if (hour[2] === 'pm' && h < 12) h += 12;
    const minute = /^\d{2}$/.test(hour[2] ?? '') ? Number(hour[2]) : 0;
    if (h >= 1 && h <= 6) h += 12; // "alle 2" = 14:00 in orario d'officina
    if (h >= 7 && h <= 19) {
      p.hour = h;
      p.minute = minute;
    }
  }
  return p;
}

export const hasPreferences = (p) => Object.keys(p).length > 0;

/** Filtra gli slot secondo le preferenze. */
export function filterSlots(slots, prefs, todayKey) {
  return slots.filter((s) => {
    if (prefs.date && s.date !== prefs.date) return false;
    if (prefs.weekday !== undefined && s.weekday !== prefs.weekday) return false;
    if (prefs.part === 'morning' && s.hour >= 12) return false;
    if (prefs.part === 'afternoon' && s.hour < 12) return false;
    if (prefs.nextWeek) {
      const wd = weekdayOfKey(todayKey) || 7;
      const nextMonday = addDaysToKey(todayKey, 8 - wd);
      if (s.date < nextMonday || s.date >= addDaysToKey(nextMonday, 7)) return false;
    }
    if (prefs.hour !== undefined && s.hour * 60 + s.minute < prefs.hour * 60 + (prefs.minute ?? 0)) return false;
    if (prefs.after && s.start <= prefs.after) return false;
    if (prefs.fromDate && s.date < prefs.fromDate) return false;
    return true;
  });
}

// ---------- Scelta tra gli slot proposti ----------
const FIRST = /\b(premier|premiere|1er|1ere|primo|prima|erste|ersten|erster|erstes|first|1st|former)\b/;
const SECOND = /\b(deuxieme|second|seconde|2e|2eme|secondo|seconda|zweite|zweiten|zweiter|zweites|2nd|latter)\b/;
const LAST = /\b(dernier|derniere|ultimo|ultima|letzte|letzten|last)\b/;

/**
 * Interpreta la risposta alla proposta di slot.
 * Ritorna { type: 'pick', slot } | { type: 'reject' } | { type: 'prefs' } | { type: 'ambiguous' } | { type: 'none' }
 */
export function parseSlotChoice(text, offered, todayKey) {
  const n = normalize(text);
  if (!offered.length) return { type: 'none' };

  let byOrdinal = null;
  if (FIRST.test(n)) byOrdinal = offered[0];
  else if (SECOND.test(n) && offered[1]) byOrdinal = offered[1];
  else if (LAST.test(n)) byOrdinal = offered[offered.length - 1];
  if (byOrdinal && !RE.reject.test(n)) return { type: 'pick', slot: byOrdinal };

  const prefs = extractPreferences(text, todayKey);
  const constraints = { ...prefs };
  delete constraints.later;
  delete constraints.nextWeek;
  if (Object.keys(constraints).length && !intents.reject(text)) {
    const exactHour = (s) => prefs.hour === undefined || (s.hour === prefs.hour && s.minute === (prefs.minute ?? 0));
    const matches = filterSlots(offered, { ...constraints, hour: undefined }, todayKey).filter(exactHour);
    if (matches.length === 1) return { type: 'pick', slot: matches[0] };
    if (matches.length > 1) return { type: 'ambiguous' };
    return { type: 'prefs', prefs };
  }
  if (intents.reject(text)) return { type: 'reject', prefs };
  if (hasPreferences(prefs)) return { type: 'prefs', prefs };
  if (intents.yes(text) && !intents.no(text)) {
    return offered.length === 1 ? { type: 'pick', slot: offered[0] } : { type: 'ambiguous' };
  }
  return { type: 'none' };
}
