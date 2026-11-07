import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryCalendar, newCall, talk } from './helpers.js';
import { PhoneReceptionist } from '../src/receptionist/agent.js';

test('saluto iniziale multilingue', () => {
  const agent = new PhoneReceptionist({ calendar: memoryCalendar() });
  const r = agent.start();
  assert.match(r.text, /bonjour.*buongiorno.*grüezi.*hello/i);
});

const flows = {
  fr: ['Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Une Peugeot 308', 'Vidange', 'Le premier'],
  it: ['Buongiorno, vorrei un appuntamento', 'Marco Rossi', 'Una Fiat Panda', 'Il tagliando', 'La prima'],
  de: ['Grüezi, ich möchte einen Termin', 'Anna Müller', 'Einen VW Golf', 'Ölwechsel', 'Den ersten bitte'],
  en: ["Hello, I'd like to book an appointment", 'Sarah Smith', 'A Ford Focus', 'Brake check', 'The first one'],
};

for (const [lang, turns] of Object.entries(flows)) {
  test(`prenotazione completa in ${lang}: nome, veicolo, motivo, max 2 orari, conferma dopo il salvataggio`, async () => {
    const cal = memoryCalendar();
    const agent = newCall(cal);
    const replies = [];
    for (const t of turns.slice(0, -1)) replies.push(await agent.handle(t));
    assert.ok(replies.every((r) => r.lang === lang), replies.map((r) => r.lang).join());
    assert.equal(agent.state.pending, 'slot');
    assert.ok(agent.state.offered.length >= 1 && agent.state.offered.length <= 2);
    assert.equal((await cal.listBookings()).length, 0, 'niente salvato prima della scelta');

    const final = await agent.handle(turns.at(-1));
    const [saved] = await cal.listBookings();
    assert.ok(saved, 'appuntamento salvato');
    assert.equal(saved.start, agent.state.booking.start);
    assert.equal(saved.channel, 'phone');
    assert.equal(saved.language, lang);
    assert.ok(final.text.includes(saved.id), 'la conferma contiene il riferimento salvato');
    assert.equal(final.lang, lang);
    assert.deepEqual(
      { name: saved.name, vehicle: saved.vehicle },
      { name: turns[1], vehicle: agent.state.data.vehicle }
    );
  });
}

test('tutte le informazioni in una frase sola', async () => {
  const agent = newCall(memoryCalendar());
  const r = await agent.handle(
    'Buongiorno, sono Marco Rossi, vorrei portare la mia Golf per il tagliando domani pomeriggio'
  );
  assert.deepEqual(agent.state.data, { name: 'Marco Rossi', vehicle: 'Golf', reason: 'Tagliando' });
  assert.equal(agent.state.pending, 'slot');
  assert.match(r.text, /domani alle 13:30.*domani alle 14:30/);
});

test('cambio di lingua esplicito a metà chiamata (en → fr)', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, "Hi, I'd like to book an appointment", 'Sarah Smith');
  const r = await agent.handle('Sorry, can we speak French?');
  assert.equal(r.lang, 'fr');
  assert.match(r.text, /continuons en français/);
  assert.match(r.text, /véhicule/);
  assert.doesNotMatch(r.text, /pas bien compris/);
  const r2 = await talk(agent, 'Une Renault Clio', 'Les freins font du bruit');
  assert.equal(r2.lang, 'fr');
  assert.equal(agent.state.data.reason, 'Les freins font du bruit');
});

test('cambio di lingua spontaneo (fr → it) senza richiesta esplicita', async () => {
  const agent = newCall(memoryCalendar());
  await agent.handle('Bonjour, je voudrais un rendez-vous');
  const r = await agent.handle('Mi chiamo Giulia Ferri, ho una Fiat Panda e la spia del motore è accesa');
  assert.equal(r.lang, 'it');
  assert.equal(agent.state.data.name, 'Giulia Ferri');
  assert.equal(agent.state.data.vehicle, 'Fiat Panda');
  assert.match(r.text, /Posso proporle/);
});

test('cambio di lingua durante la scelta dell’orario (de → en)', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Grüezi, ich möchte einen Termin', 'Anna Müller', 'Audi A4', 'Inspektion');
  const r = await agent.handle('Sorry, could we continue in English please?');
  assert.equal(r.lang, 'en');
  assert.match(r.text, /Which would you prefer/);
  const done = await agent.handle('The second one');
  assert.match(done.text, /you're booked in/);
});

test('interruzione: "attendez" ferma il receptionist e non prenota nulla', async () => {
  const cal = memoryCalendar();
  const agent = newCall(cal);
  await talk(agent, 'Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange');
  const r = await agent.handle('Attendez', { interrupted: true });
  assert.equal(r.text, 'Oui, je vous écoute.');
  assert.equal(agent.state.pending, 'slot');
  assert.equal((await cal.listBookings()).length, 0);
});

test('interruzione durante la proposta: ripete gli orari se il cliente non ha scelto', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes');
  const r = await agent.handle('Sorry, what?', { interrupted: true });
  assert.match(r.text, /^As I was saying: Which would you prefer/);
});

test('interruzione con nuova informazione: il cliente cambia giorno mentre il receptionist parla', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange');
  const r = await agent.handle('Non, plutôt jeudi après-midi', { interrupted: true });
  assert.match(r.text, /jeudi 12 novembre à 13h30.*jeudi 12 novembre à 14h30/);
});

test('correzione del veicolo e del nome a metà chiamata', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Grüezi, ich möchte einen Termin', 'Mein Name ist Anna Müller', 'Einen BMW X3', 'Ölwechsel');
  let r = await agent.handle('Entschuldigung, nicht der BMW, es ist ein Audi A4');
  assert.equal(agent.state.data.vehicle, 'Audi A4');
  assert.match(r.text, /Ich korrigiere: Audi A4/);
  r = await agent.handle('Und mein Name ist Anna Meier');
  assert.equal(agent.state.data.name, 'Anna Meier');
});

test('rifiuto degli orari: ne propone altri, mai più di due', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange');
  const first = agent.state.offered;
  await agent.handle('Aucun des deux ne me convient');
  const second = agent.state.offered;
  assert.ok(second.length <= 2);
  assert.ok(second.every((s) => !first.includes(s)));
});

test('"oui" con due orari proposti: chiede quale, non prenota', async () => {
  const cal = memoryCalendar();
  const agent = newCall(cal);
  await talk(agent, 'Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange');
  const r = await agent.handle('Oui');
  assert.match(r.text, /Lequel préférez-vous/);
  assert.equal((await cal.listBookings()).length, 0);
});

test('scelta per orario ("alle 13:30")', async () => {
  const cal = memoryCalendar();
  const agent = newCall(cal);
  await talk(agent, 'Buongiorno, vorrei un appuntamento', 'Marco Rossi', 'Fiat Panda', 'Tagliando');
  await agent.handle('Va bene alle 13:30');
  const [b] = await cal.listBookings();
  assert.equal(b.local, '2026-11-09T13:30:00+01:00');
});

test('slot preso da un altro cliente tra proposta e scelta: niente conferma, nuovi orari', async () => {
  const cal = memoryCalendar();
  const agent = newCall(cal);
  await talk(agent, 'Bonjour, je voudrais un rendez-vous', 'Jean Dupont', 'Peugeot 208', 'Vidange');
  const [taken] = agent.state.offered;
  // nel frattempo qualcuno prenota dalla pagina web
  const web = await cal.book({ start: taken, name: 'Web', vehicle: 'Golf', reason: 'x', channel: 'web' });
  assert.equal(web.ok, true);
  const r = await agent.handle('Le premier');
  assert.match(r.text, /vient d’être pris/);
  assert.doesNotMatch(r.text, /enregistré/);
  assert.equal(agent.state.booking, null);
  assert.ok(!agent.state.offered.includes(taken));
  assert.equal((await cal.listBookings()).length, 1);
});

test('due chiamate in contemporanea sullo stesso slot: una conferma, l’altra riceve nuovi orari', async () => {
  const cal = memoryCalendar();
  const a = newCall(cal);
  const b = newCall(cal);
  await talk(a, 'Bonjour, un rendez-vous svp', 'Paul Martin', 'Dacia Duster', 'Vidange');
  await talk(b, 'Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes');
  assert.equal(a.state.offered[0], b.state.offered[0]);
  const [ra, rb] = await Promise.all([a.handle('Le premier'), b.handle('The first one')]);
  const confirmed = [ra, rb].filter((r) => r.booking);
  assert.equal(confirmed.length, 1);
  assert.equal((await cal.listBookings()).length, 1);
  const loser = ra.booking ? rb : ra;
  assert.match(loser.text, /(just been taken|vient d’être pris)/);
});

test('se il salvataggio fallisce, il receptionist NON conferma', async () => {
  const cal = memoryCalendar();
  cal.book = async () => {
    throw new Error('disco pieno');
  };
  const agent = newCall(cal);
  await talk(agent, 'Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes');
  const r = await agent.handle('The first one');
  assert.doesNotMatch(r.text, /booked in|reference/);
  assert.match(r.text, /can't save/);
  assert.equal(agent.state.booking, null);
});

test('la conferma arriva solo dopo che book() ha risolto con successo', async () => {
  const cal = memoryCalendar();
  const order = [];
  const original = cal.book.bind(cal);
  cal.book = async (args) => {
    order.push('book:start');
    const res = await original(args);
    order.push('book:saved');
    return res;
  };
  const agent = newCall(cal);
  await talk(agent, 'Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes');
  const r = await agent.handle('The first one');
  order.push('reply');
  assert.deepEqual(order, ['book:start', 'book:saved', 'reply']);
  assert.match(r.text, /booked in/);
});

test('orari di apertura, poi si riprende la prenotazione', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Buongiorno, vorrei un appuntamento', 'Marco Rossi');
  const r = await agent.handle('Scusi, che orari avete?');
  assert.match(r.text, /Siamo aperti/);
  assert.match(r.text, /Che veicolo/);
});

test('fine chiamata', async () => {
  const agent = newCall(memoryCalendar());
  await talk(agent, 'Hello, I need an appointment', 'Tom Baker', 'Ford Focus', 'Brakes', 'The first one');
  const r = await agent.handle('No thanks, bye');
  assert.equal(r.ended, true);
});
