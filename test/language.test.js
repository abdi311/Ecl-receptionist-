import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage, chooseLanguage } from '../src/receptionist/language.js';

const samples = {
  fr: ['Bonjour, je voudrais prendre rendez-vous', 'Les freins font du bruit', "C'est pour une vidange s'il vous plaît"],
  it: ['Buongiorno, vorrei un appuntamento', 'La spia del motore è accesa', 'Mi chiamo Marco e ho una Golf'],
  de: ['Grüezi, ich möchte einen Termin', 'Die Bremsen quietschen', 'Mein Name ist Anna und ich habe einen Audi'],
  en: ["Hi, I'd like to book an appointment", 'The brakes are making a noise', 'My name is Sarah and I drive a Ford'],
};

for (const [lang, list] of Object.entries(samples)) {
  for (const s of list) {
    test(`riconosce ${lang}: "${s}"`, () => assert.equal(detectLanguage(s).lang, lang));
  }
}

test('parole isolate o nomi non cambiano la lingua', () => {
  assert.equal(chooseLanguage('Golf', 'it').lang, 'it');
  assert.equal(chooseLanguage('ok', 'de').lang, 'de');
  assert.equal(chooseLanguage('Jean Dupont', 'en').lang, 'en');
});

test('richiesta esplicita di cambio lingua', () => {
  assert.deepEqual(chooseLanguage('In italiano per favore', 'fr'), { lang: 'it', switched: true, explicit: true });
  assert.equal(chooseLanguage('Can we speak German?', 'fr').lang, 'de');
  assert.equal(chooseLanguage('Parlez-vous anglais ?', 'de').lang, 'en');
  assert.equal(chooseLanguage('Auf Französisch bitte', 'en').lang, 'fr');
});

test('cambio spontaneo con frase chiara in altra lingua', () => {
  const r = chooseLanguage('Ich möchte lieber am Donnerstag kommen', 'fr');
  assert.equal(r.lang, 'de');
  assert.equal(r.switched, true);
});
