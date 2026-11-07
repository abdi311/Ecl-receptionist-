#!/usr/bin/env node
// Prova della telefonata via testo nel terminale.
// Il receptionist "parla" parola per parola: se premi Invio mentre sta parlando,
// è un'interruzione (barge-in) e il receptionist si ferma e ti ascolta.
//
// Comandi: /bookings  /reset  /fast  /quit
// Usa lo stesso calendario del server (data/calendar.json), quindi gli slot
// presi dalla pagina web risultano occupati anche al telefono, e viceversa.

import readline from 'node:readline';
import { config } from '../src/config.js';
import { CalendarService } from '../src/calendar/calendar.js';
import { FileStorage } from '../src/calendar/storage.js';
import { PhoneReceptionist } from '../src/receptionist/agent.js';

const calendar = new CalendarService({ storage: new FileStorage(config.calendarFile) });
let agent;
let fast = process.argv.includes('--fast') || !process.stdout.isTTY;
let speaking = null;
let bargedIn = false;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });

function speak(reply) {
  const prefix = `\x1b[36mReceptionist${reply.lang ? ` [${reply.lang}]` : ''}:\x1b[0m `;
  if (fast) {
    process.stdout.write(prefix + reply.text + '\n');
    return Promise.resolve();
  }
  const words = reply.text.split(' ');
  process.stdout.write(prefix);
  return new Promise((resolve) => {
    let i = 0;
    const timer = setInterval(() => {
      process.stdout.write((i ? ' ' : '') + words[i++]);
      if (i >= words.length) {
        clearInterval(timer);
        speaking = null;
        process.stdout.write('\n');
        resolve();
      }
    }, 120);
    speaking = { timer, resolve };
  });
}

function stopSpeaking() {
  if (!speaking) return false;
  clearInterval(speaking.timer);
  process.stdout.write(' \x1b[33m— [interrotto]\x1b[0m\n');
  speaking.resolve();
  speaking = null;
  return true;
}

function newCall() {
  agent = new PhoneReceptionist({ calendar, defaultLanguage: config.defaultLanguage });
  console.log('\n\x1b[2m--- nuova chiamata (scrivi /quit per uscire) ---\x1b[0m');
  speak(agent.start());
}

let queue = Promise.resolve();
rl.on('line', (line) => {
  const interrupted = stopSpeaking() || bargedIn;
  bargedIn = false;
  queue = queue.then(() => onLine(line.trim(), interrupted));
});
rl.on('close', () => queue.then(() => process.exit(0)));

async function onLine(text, interrupted) {
  if (!text) return;
  if (text === '/quit') return rl.close();
  if (text === '/reset') return newCall();
  if (text === '/fast') {
    fast = !fast;
    return console.log(`modalità veloce: ${fast ? 'on' : 'off'}`);
  }
  if (text === '/bookings') {
    for (const b of await calendar.listBookings()) {
      console.log(`  ${b.local}  ${b.id}  ${b.name} – ${b.vehicle} – ${b.reason} (${b.channel})`);
    }
    return;
  }
  if (!process.stdin.isTTY) console.log(`\x1b[32mCliente:\x1b[0m ${text}`);
  const reply = await agent.handle(text, { interrupted });
  speak(reply);
  if (reply.ended) {
    await new Promise((r) => setTimeout(r, fast ? 0 : 400));
    newCall();
  }
}

newCall();
