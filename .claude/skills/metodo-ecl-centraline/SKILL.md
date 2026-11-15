---
name: metodo-ecl-centraline
description: >-
  Metodo ECL per i lavori sulle centraline (ECU/TCU): clonazione o sostituzione, riparazione della
  scheda, aggiornamento software del costruttore e rimappatura prestazioni. Guida passo-passo con
  controlli di sicurezza (backup verificato, alimentazione stabile, checksum) e produce la scheda
  lavoro finale. Usala ogni volta che si parla di leggere, scrivere, flashare, clonare, riparare,
  aggiornare o rimappare una centralina, di dump EEPROM/Flash, di Autotuner, Flex, PCMFlash,
  programmatori EEPROM (Xprog, Orange5, CH341, T48), WinOLS o HxD, anche se l'utente non dice
  "Metodo ECL". Per la sola diagnosi di un guasto usa prima `metodo-ecl`.
---

# Metodo ECL – Lavori sulle centraline

Estende `metodo-ecl` (diagnosi). Il principio resta lo stesso: **prova prima di intervenire**.
Su una centralina un errore costa caro e spesso non si torna indietro (centralina bloccata,
immobilizer perso, auto ferma in officina). Per questo ogni lavoro segue fasi con dei **cancelli**:
non si passa alla fase dopo finché il cancello non è superato.

Lingua: italiano (francese solo se richiesto).

## Regole fisse

- **Il guasto della centralina va dimostrato.** Prima di sostituire, clonare o riparare, deve
  esserci una diagnosi secondo `metodo-ecl` che esclude alimentazioni, masse, cablaggio e
  componenti esterni. Se manca, dillo e proponi di farla.
- **Nessuna scrittura senza backup verificato.** Leggi due volte (EEPROM e Flash, più eventuali
  altre memorie/aree indicate dallo strumento), confronta le due letture byte per byte e controlla
  che il dump non sia vuoto (tutto `FF` o tutto `00`). Usa `scripts/confronta_dump.py`.
  Conserva gli originali in sola lettura e lavora su una copia.
- **Alimentazione stabile** durante lettura e scrittura: alimentatore stabilizzato o mantenitore
  di carica adatto, mai la sola batteria. Valori e modalità secondo il manuale dello strumento
  (scrivi "da verificare" se non sono noti con certezza).
- **Checksum**: prima di scrivere un file modificato, i checksum devono essere corretti dallo
  strumento o da WinOLS, e la correzione deve essere confermata. Mai scrivere un file con checksum
  non verificato.
- **Mai dare per certo un dato non verificato**: pinout, punti di boot, modalità supportate
  (OBD / bench / boot), protezioni del micro, compatibilità tra codici hardware/software.
  Se non è sicuro: ricerca, poi "da verificare". Lo stesso vale per foto di schede: solo ciò che
  è leggibile al 100%.
- **Conferma esplicita prima di ogni scrittura**: riassumi cosa verrà scritto, su quale centralina,
  con quale file (nome + SHA-256) e chiedi conferma. Non presentare mai una scrittura come
  già fatta: la fa il tecnico.
- **Legalità e antinquinamento**: niente rimozione o disattivazione di FAP/DPF, EGR, SCR/AdBlue,
  catalizzatore, sonde lambda o diagnosi OBD delle emissioni, anche se richiesto. Spiega perché
  (illegale su strada, revisione/omologazione) e proponi la diagnosi del guasto reale con
  `metodo-ecl`. Per la rimappatura prestazioni ricorda che la modifica di potenza va in genere
  omologata o annotata sulla licenza di circolazione (in Svizzera: ufficio della circolazione,
  "da verificare" per il caso specifico).
- **Immobilizer e proprietà**: clonazione e trasferimento immobilizer solo per sostituire la
  centralina dello stesso veicolo, con documenti del veicolo verificati. Non aiutare ad aggirare
  l'immobilizer di un veicolo di cui non è chiara la proprietà.
- **Dati mancanti**: se manca un dato critico (veicolo, VIN, motore, cambio, codice hardware e
  software della centralina, tipo di micro, strumento disponibile), chiedilo prima di proseguire.

## Scegli il lavoro

| Lavoro | Quando | Leggi |
|---|---|---|
| Clonazione / sostituzione | Centralina guasta dimostrata, ricambio disponibile | `references/clonazione.md` |
| Riparazione della scheda | Guasto hardware sulla centralina (alimentazione, driver, componente) | `references/riparazione.md` |
| Aggiornamento software | Aggiornamento ufficiale del costruttore (campagna, TSB, nuova versione) | `references/aggiornamento.md` |
| Rimappatura prestazioni | Modifica mappe per potenza/coppia, sistemi antinquinamento intatti | `references/rimappatura.md` |

Leggi solo il file del lavoro scelto. Se il lavoro non è chiaro, chiedilo.

## Fasi comuni a tutti i lavori

**Fase 0 – Raccolta dati e motivo del lavoro.** Veicolo (marca, modello, motore, cambio, anno, VIN,
km), centralina (marca, tipo, codice hardware e software, micro se noto), strumento disponibile,
motivo del lavoro e diagnosi che lo giustifica.
*Cancello:* dati critici presenti e motivo giustificato.

**Fase 1 – Preparazione.** Modalità di accesso (OBD / bench / boot) verificata per quella
centralina e quello strumento, alimentazione stabile, cablaggi e adattatori giusti, protezione ESD
se si apre la centralina, stato DTC salvato (codici, freeze frame, stato, contatori).
*Cancello:* modalità confermata dallo strumento o dalla documentazione, non a memoria.

**Fase 2 – Backup.** Due letture complete, confronto byte per byte, controllo dump non vuoti,
SHA-256 annotati, file nominati in modo chiaro (vedi sotto), copia di sicurezza fuori dal PC
di lavoro.
*Cancello:* le due letture coincidono e i dump sono plausibili.

**Fase 3 – Lavoro specifico.** Segui il file in `references/`.

**Fase 4 – Scrittura.** Riepilogo e conferma esplicita, alimentazione controllata, nessuna
interruzione (niente sospensione del PC, cavi fissati). Se la scrittura fallisce: non spegnere,
non staccare, segui la procedura di recupero dello strumento e riprova dal backup.
*Cancello:* lo strumento conferma scrittura e verifica completate.

**Fase 5 – Verifica.** Rilettura e confronto con il file scritto (dove lo strumento lo permette),
avviamento, lettura DTC, parametri principali, adattamenti richiesti, prova su strada nelle
condizioni del sintomo originale, nuova lettura DTC.
*Cancello:* nessun DTC nuovo e comportamento corretto su strada.

**Fase 6 – Scheda lavoro.** Compila `assets/scheda-lavoro.md`.

## Nomi dei file

`<VIN o targa>_<centralina>_<HW>_<SW>_<EEPROM|FLASH>_<ORIGINALE|MOD|CLONE>_<AAAA-MM-GG>.bin`
Esempio: `WVWZZZ1KZ8W000000_EDC17C46_03L906018XX_EEPROM_ORIGINALE_2026-11-15.bin`.

## Strumento di confronto dump

```bash
python3 scripts/confronta_dump.py lettura1.bin lettura2.bin
```
Stampa dimensione, SHA-256, se il file è vuoto (tutto FF/00) e le zone diverse. Codice di uscita
0 se identici, 1 se diversi, 2 in caso di errore. Usalo per verificare il backup (Fase 2), per
controllare un file scritto contro la rilettura (Fase 5) e per vedere quanto cambia un file
modificato rispetto all'originale.

## Formato della risposta

1. **Dati mancanti** (se ce ne sono)
2. **Lavoro e fase attuale** (es. "Clonazione – Fase 2 Backup")
3. **Rischi principali** per questo caso
4. **Checklist della fase**: passo · strumento · controllo · cancello
5. **Prossimo passo** e cosa serve dal tecnico

Non saltare fasi. Se il tecnico è già a una fase avanzata, riprendi da lì, ma controlla che i
cancelli precedenti siano stati superati (soprattutto il backup). A lavoro finito, produci la
scheda lavoro.
