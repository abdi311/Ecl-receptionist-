// Riconoscimento della lingua (fr, it, de, en) basato su parole frequenti.
// Pensato per frasi brevi e parlate. Nessun servizio esterno.

export const LANGS = ['fr', 'it', 'de', 'en'];

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`´]/g, "'");
}

export function tokenize(text) {
  return normalize(text)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

const words = (s) => new Set(s.split(/\s+/).filter(Boolean));

const LEXICON = {
  fr: words(`bonjour bonsoir salut allo je j me m moi mon ma mes voudrais veux voulais aimerais souhaite souhaiterais
    rendez vous rdv oui ouais non merci le les du des est c et pour avec une voiture vehicule appelle
    demain matin apres midi premier premiere deuxieme plutot plait parfait accord revoir bonne journee
    quel quelle quand lundi mardi mercredi jeudi vendredi samedi frein freins vidange voyant moteur pneus
    entretien revision panne bruit ca ce cette aucun autre semaine prochaine heure heures nous etes avez
    pouvez peux qui que pas suis allume fait faire prendre fixer reserver creneau parle parlez francais
    bien tres aujourd hui ni sur au aux dans la un de l`),
  it: words(`buongiorno buonasera ciao salve pronto vorrei voglio volevo vorremmo appuntamento prenotare
    prenotazione si no grazie mille il lo gli della del dello di per con una un uno macchina auto vettura
    chiamo mi sono domani mattina mattino pomeriggio primo prima secondo seconda meglio perfetto va bene
    accordo arrivederci giornata quale quando lunedi martedi mercoledi giovedi venerdi sabato freni
    tagliando spia motore gomme pneumatici guasto rumore revisione cambio olio nessuno altro settimana
    prossima ora ore siete potete posso e che non ho ha mia mio la le ma accesa fare fissare parlo parla
    italiano oggi dopo nella alla questa questo sua suo lei`),
  de: words(`guten tag abend hallo gruezi gruessech gruss servus ich moechte mochte will wollte haette hatte
    gern gerne termin vereinbaren buchen reservieren ja nein danke vielen der die das den dem des fur fuer
    mit ein eine einen auto wagen fahrzeug heisse name ist bin vormittag nachmittag ersten erste erster
    zweite zweiten lieber bitte passt gut perfekt einverstanden tschuss tschuess auf wiederhoren
    wiedersehen welche welcher wann montag dienstag mittwoch donnerstag freitag samstag bremsen service
    inspektion olwechsel oelwechsel kontrollleuchte motor reifen panne gerausch keiner andere anderen
    woche nachste naechste uhr sind haben sie konnen koennen kann und nicht mein meine meinem meinen habe
    hat es um am leuchtet sprechen deutsch heute ubermorgen morgen fruh lieber`),
  en: words(`hello hi hey good morning afternoon evening i id would like want need appointment book booking
    schedule yes yeah yep no nope thanks thank you the a an for with car vehicle my name is am im it its
    this that tomorrow first second either neither none other another prefer please great perfect fine
    sure bye goodbye which when monday tuesday wednesday thursday friday saturday brakes brake service oil
    change warning light engine tyres tires noise next week oclock are have can could and not do does
    what at on speak english today on s m make some`),
};

const LANGUAGE_NAMES = {
  fr: /\b(francais|french|franzosisch|franzoesisch|francese)\b/,
  it: /\b(italiano|italian|italienisch|italien)\b/,
  de: /\b(deutsch|german|allemand|tedesco|schwiizerdutsch|schweizerdeutsch)\b/,
  en: /\b(english|anglais|inglese|englisch)\b/,
};

/** Punteggio per lingua. */
export function scoreLanguages(text) {
  const raw = String(text).toLowerCase();
  const tokens = tokenize(text);
  const scores = { fr: 0, it: 0, de: 0, en: 0 };
  for (const t of tokens) {
    for (const l of LANGS) if (LEXICON[l].has(t)) scores[l] += 1;
  }
  if (/[äöüß]/.test(raw)) scores.de += 2;
  if (/[çœêâîû]/.test(raw)) scores.fr += 2;
  if (/\b(qu|j|c|d|n|s)'/.test(normalize(text))) scores.fr += 1;
  if (/\b(zione|zioni)\b|zion[ei]\b/.test(normalize(text))) scores.it += 1;
  if (/\b(i'm|i'd|i'll|don't|can't|it's|that's)\b/.test(normalize(text))) scores.en += 2;
  return scores;
}

/** Lingua più probabile, con margine sul secondo classificato. */
export function detectLanguage(text) {
  const scores = scoreLanguages(text);
  const ranked = LANGS.slice().sort((a, b) => scores[b] - scores[a]);
  const [best, second] = ranked;
  if (scores[best] === 0) return { lang: null, margin: 0, scores };
  return { lang: best, margin: scores[best] - scores[second], scores };
}

/** Richiesta esplicita di cambiare lingua ("in italiano per favore", "can we speak English?"). */
export function explicitLanguageRequest(text) {
  const n = normalize(text);
  if (tokenize(text).length > 9) return null;
  for (const l of LANGS) if (LANGUAGE_NAMES[l].test(n)) return l;
  return null;
}

/**
 * Decide la lingua del turno, dato il turno precedente.
 * Cambia lingua solo con una richiesta esplicita o con un segnale chiaro,
 * così parole isolate ("ok", "Golf", un nome) non provocano cambi.
 */
export function chooseLanguage(text, current, fallback = 'fr') {
  const explicit = explicitLanguageRequest(text);
  if (explicit) return { lang: explicit, switched: explicit !== current, explicit: true };
  const { lang, scores } = detectLanguage(text);
  if (!current) return { lang: lang ?? fallback, switched: false, explicit: false };
  if (lang && lang !== current && scores[lang] - scores[current] >= 2) {
    return { lang, switched: true, explicit: false };
  }
  return { lang: current, switched: false, explicit: false };
}

/** Parola comune (presente nel lessico di almeno una lingua). */
export function isCommonWord(norm) {
  return LANGS.some((l) => LEXICON[l].has(norm));
}
