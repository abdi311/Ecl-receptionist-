// Utility per il fuso orario Europe/Zurich, senza librerie esterne.
// Tutti gli orari vengono salvati in UTC (ISO) e mostrati/generati in ora di Zurigo.

export const TZ = 'Europe/Zurich';

const partsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  weekday: 'short',
});

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Componenti di data/ora viste a Zurigo. weekday: 0 = domenica. */
export function zurichParts(date) {
  const o = {};
  for (const p of partsFmt.formatToParts(date)) o[p.type] = p.value;
  return {
    year: +o.year,
    month: +o.month,
    day: +o.day,
    hour: +o.hour % 24,
    minute: +o.minute,
    second: +o.second,
    weekday: WEEKDAYS.indexOf(o.weekday),
  };
}

function offsetMs(date) {
  const p = zurichParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Converte un'ora "da orologio" di Zurigo in un Date (istante UTC). Gestisce l'ora legale. */
export function zurichToUtc(year, month, day, hour = 0, minute = 0) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const o1 = offsetMs(new Date(guess));
  let t = guess - o1;
  const o2 = offsetMs(new Date(t));
  if (o2 !== o1) t = guess - o2;
  return new Date(t);
}

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' del giorno a Zurigo. */
export function zurichDateKey(date) {
  const p = zurichParts(date);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function addDaysToKey(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function weekdayOfKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** ISO con offset di Zurigo, es. 2026-11-09T09:00:00+01:00 */
export function toZurichIso(date) {
  const p = zurichParts(date);
  const off = Math.round(offsetMs(date) / 60000);
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
