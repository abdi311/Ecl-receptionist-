# Guida al clone delle chiavi

Aggiornato: 2026-11-19. Metodo scelto dall'utente come predefinito (vedi [DECISIONI.md](DECISIONI.md)).
Le voci da verificare sono segnate così: ⚠️. Si confermano alla prima prova sul tuo strumento.

## Cos'è il clone

Si copia il **transponder** (il chip che autorizza l'avviamento) della chiave originale su un chip
clonabile. L'auto vede due chiavi identiche e non si collega all'OBD.

**Il clone copia solo il chip di avviamento, non il telecomando.** Per i pulsanti servono:
- un telecomando a codice fisso (raro sulle auto recenti), che si clona anche lui;
- un telecomando universale generato (Autel IKEY / Xhorse) per i modelli supportati;
- l'apprendimento del telecomando sull'auto (spesso è una procedura breve, anche senza strumento).

Va detto al cliente prima del lavoro: "chiave che avvia" e "chiave che avvia e apre col telecomando"
sono due prezzi diversi.

## Si clona o no? Dipende dal transponder

Prima di tutto si **legge la chiave originale** (Autel XP400 Pro → Programmer → Key → Read).
Lo strumento dice il tipo di chip.

| Transponder | Clone | Note |
|---|---|---|
| ID11, ID12, ID13, ID33, ID4C, ID4D (fissi) | ✅ Facile | Copia diretta in un minuto. Auto vecchie (anni '90 e primi 2000). |
| ID4D60/61/63/67/68/70 (Ford, Toyota, Nissan…) | ✅ Di solito | ID4D70 e alcuni Toyota: ⚠️ a volte richiede calcolo. |
| ID44 / PCF7935 (BMW EWS, VAG vecchi) | ✅ | |
| ID46 / PCF7936 (Hitag2: Fiat, PSA, Renault, Opel, Hyundai/Kia, Honda…) | ✅ Con raccolta dati | Bisogna "sniffare" all'auto: chip clone nel blocchetto, giri il quadro più volte, poi calcolo. |
| ID48 / Megamos Crypto (VAG fino a ~2013, Fiat, Honda) | ✅ Con calcolo | Calcolo online o lungo. Il calcolo consuma tempo/crediti. |
| ID8A / Hitag AES, ID4A, ID49 Hitag Pro, ID47 Hitag3, Megamos AES (VAG MQB nuovi), DST80 nuovi | ❌ Quasi mai | Su auto recenti si fa la programmazione via OBD. |
| Chiavi keyless / smart key | ❌ In genere no | Programmazione via OBD. |

**Regola pratica:** auto fino al 2012-2014 di solito si clona; dopo il 2015 quasi sempre OBD.

## Materiale

- **Chip clone universali** dello strumento che usi:
  - Autel: ⚠️ chip "Super Chip" Autel (o le chiavi IKEY, che hanno il super chip dentro).
  - Xhorse: Super Chip XT27A/XT27B. Si scrivono con gli strumenti Xhorse per transponder
    (Key Tool Plus, Key Tool Max, Mini Key Tool). ⚠️ Il Multi-Prog e il Mini Prog sono per EEPROM e
    MCU, non per transponder: verificare se l'app Xhorse li abilita al clone.
- Chiave/guscio con la lama giusta (taglio con la macchina taglia-chiavi) e il chip clone dentro.

## Procedura con Autel IM608 + XP400 Pro

1. **Leggi l'originale:** Programmer → Key → appoggia la chiave sull'area chip dell'XP400 Pro
   → leggi. Scrivi il tipo di chip.
2. Scegli **Clone** (⚠️ il nome esatto del menu può variare con la versione del software).
3. **Chip fisso (ID13, 33, 4C, 4D…):** inserisci il super chip, scrivi, fine.
4. **ID46:** lo strumento chiede di raccogliere i dati all'auto:
   - metti il super chip (nella chiave nuova o da solo vicino all'antenna del blocchetto);
   - gira il quadro on/off quante volte lo indica lo schermo (l'auto non parte, è normale);
   - torna all'XP400 Pro, leggi i dati raccolti, calcola, scrivi.
5. **ID48:** leggi l'originale, avvia il calcolo (online), aspetta, scrivi sul super chip.
6. **Prova:** l'auto deve partire con la copia. Prova anche l'originale.
7. **Telecomando:** genera o apprendi a parte, se richiesto.

## Procedura con OBDSTAR G3

Il G3 ha un'area di lettura chip/chiave sul tablet e l'app **RFID**. ⚠️ Verificare nel menu se fa il
clone e con quali chip: alla prima prova annotare qui il percorso del menu.

## Prima di clonare

- **Il cliente deve dimostrare che l'auto è sua** (libretto + documento): vale per qualsiasi copia
  di chiave.
- Se il cliente **perde** una chiave clonata, l'auto continua ad accettarla: non si può cancellare
  solo la copia. In quel caso serve la programmazione via OBD, che azzera le chiavi vecchie.
  Va detto al cliente.
- Se la lettura dice "chip non clonabile", non perdere tempo: vai in OBD con l'Autel
  (vedi [GUIDA-STRUMENTI.md](GUIDA-STRUMENTI.md)).

## Schede dei modelli provati

Da riempire: marca, modello, anno, chip letto, strumento, clone riuscito sì/no, tempo impiegato.
