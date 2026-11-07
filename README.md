# ECL Solutions – Receptionist (prototipo)

Primo prototipo del receptionist multilingue di ECL Solutions.

- **Telefono** (simulato via testo): parla francese, italiano, tedesco e inglese, riconosce la lingua del
  cliente, segue i cambi di lingua e gestisce le interruzioni. Per prenotare chiede **nome, veicolo e motivo**,
  propone **al massimo due orari** e **conferma solo dopo aver salvato** l'appuntamento.
- **WhatsApp**: risponde a qualsiasi messaggio **solo con il link** alla pagina di prenotazione.
- **Pagina di prenotazione** (`/book`): usa lo **stesso calendario** del telefono.
- **Calendario finto** in `data/calendar.json`, fuso **Europe/Zurich**. Due clienti non possono prenotare lo
  stesso slot, neanche da processi diversi (telefono e pagina web).

**Non collegati** (di proposito): numero di telefono reale, WhatsApp Business, servizi a pagamento
(riconoscimento vocale, sintesi vocale, LLM). Il prototipo usa solo Node.js, senza dipendenze esterne.

## Come provarlo

Serve Node.js 20 o più recente. Non c'è niente da installare.

```bash
git checkout claude/ecl-receptionist-prototype-xb9bmu

npm test          # 52 test automatici
npm run demo      # chiamate di prova già scritte, in 4 lingue, più due clienti sullo stesso slot
```

### Telefonata via testo nel terminale

```bash
npm run seed      # (opzionale) calendario finto con qualche appuntamento già preso
npm run chat
```

Scrivi come se parlassi al telefono. Il receptionist "parla" parola per parola: **se premi Invio mentre
sta ancora parlando, lo interrompi** (barge-in) e lui si ferma ad ascoltarti.
Comandi: `/bookings` (mostra il calendario), `/reset` (nuova chiamata), `/fast`, `/quit`.

Esempio:

```
Receptionist: ECL Solutions, bonjour, buongiorno, grüezi, hello!
Cliente: Buongiorno, sono Marco Rossi, vorrei portare la mia Golf per il tagliando domani pomeriggio
Receptionist [it]: Grazie, Marco Rossi. Posso proporle domani alle 13:30, oppure domani alle 14:30. Cosa le va meglio?
Cliente: La seconda va bene
Receptionist [it]: Fatto, è registrato: martedì 10 novembre alle 14:30. Veicolo: Golf, motivo: Tagliando, a nome di Marco Rossi. Il riferimento è ECL-GQDHN. Posso fare altro per lei?
```

Cose da provare:

- cambiare lingua a metà: `Can we speak French?`, `In italiano per favore`, oppure rispondere direttamente
  in un'altra lingua;
- interrompere: `Attendez` / `Aspetti` / `Moment` / `Wait`, oppure `Non, plutôt jeudi après-midi`
  mentre propone gli orari;
- correggere: `Entschuldigung, nicht der BMW, es ist ein Audi A4`;
- rifiutare gli orari: `Aucun des deux`, `Nessuno dei due`, `Later`.

### Pagina di prenotazione, simulatore nel browser e WhatsApp finto

```bash
npm start         # http://localhost:3000
```

- `http://localhost:3000/book`: pagina di prenotazione (lingua da `?lang=fr|it|de|en` o dal browser).
- `http://localhost:3000/simulator`: la stessa telefonata in chat; se invii mentre il receptionist
  "parla" è un'interruzione. Opzione "voce del browser" per sentirlo (sintesi vocale locale del browser,
  gratuita).
- WhatsApp finto (calcola la risposta ma non invia niente):

  ```bash
  curl -s -X POST localhost:3000/webhooks/whatsapp \
    -H 'content-type: application/json' \
    -d '{"from":"+41790000000","text":"Ciao, vorrei un appuntamento"}'
  # {"reply":{"to":"+41790000000","text":"http://localhost:3000/book?lang=it","sent":false}}
  ```

Prova del calendario condiviso: prenota uno slot con `npm run chat` (o dal simulatore), poi ricarica `/book`:
quello slot non c'è più. Se provi a prenotarlo comunque via API ricevi `409 slot_taken`.

## Regole del calendario finto

Definite in `src/calendar/calendar.js` (`DEFAULT_SCHEDULE`):

- lunedì–venerdì, 08:00–12:00 e 13:30–17:30, ora di Zurigo (gestisce ora legale/solare);
- slot da 60 minuti, almeno 2 ore di anticipo, prenotabili fino a 21 giorni avanti;
- salvataggio in UTC + ora locale di Zurigo (`local`, es. `2026-11-09T10:00:00+01:00`).

**Doppie prenotazioni.** Lettura, controllo e scrittura avvengono sotto lock (mutex nel processo + lock su
file tra processi, scrittura atomica). I test lo verificano con 10 richieste simultanee nello stesso processo,
telefono + pagina web sullo stesso file, 6 processi separati e due richieste HTTP simultanee: vince sempre
una sola.

## Struttura

```
src/
  time.js                  fuso Europe/Zurich
  calendar/calendar.js     slot, prenotazione anti-doppione
  calendar/storage.js      archivio in memoria / su file con lock
  receptionist/language.js riconoscimento lingua e cambi lingua
  receptionist/nlu.js      nome, veicolo, motivo, preferenze, scelta dello slot
  receptionist/phrases.js  frasi nelle 4 lingue, orari "parlati"
  receptionist/agent.js    conversazione telefonica (una istanza = una chiamata)
  channels/whatsapp.js     risposta WhatsApp = solo link
  channels/telephony.js    ponte voce (non collegato): dove agganciare STT/TTS e barge-in
  server.js                pagina /book, API, simulatore, webhook WhatsApp finto
public/                    book.html, simulator.html
scripts/                   chat.js, demo.js, seed.js
test/                      test automatici (node --test)
```

## Limiti del prototipo e prossimi passi

- La comprensione è a regole (parole chiave per lingua): copre bene i casi tipici, non frasi molto
  libere. Per la versione reale si può mettere un LLM al posto di `nlu.js`, tenendo la stessa logica di
  calendario e la regola "conferma solo dopo il salvataggio".
- La voce naturale richiede un provider di telefonia + riconoscimento e sintesi vocale in streaming
  (servizi a pagamento, non collegati). `src/channels/telephony.js` mostra dove agganciarli: la lingua di
  ogni risposta sceglie la voce (fr-CH, it-CH, de-CH, en-GB) e quando il cliente parla sopra il receptionist
  la voce si ferma e il turno arriva come interruzione.
- Il calendario è un file JSON: va sostituito con il calendario reale (es. Google Calendar) mantenendo la
  stessa interfaccia `listAvailableSlots()` / `book()`.
- `GET /api/bookings` espone l'elenco degli appuntamenti senza autenticazione: va bene solo in locale.
