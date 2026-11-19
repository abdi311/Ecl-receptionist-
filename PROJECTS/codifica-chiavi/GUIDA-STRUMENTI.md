# Guida pratica agli strumenti – Codifica chiavi

Aggiornato: 2026-11-19. Riassunto in italiano dei manuali ufficiali letti da Claude (non è una copia).
Link ai PDF in fondo.

## Quale strumento per quale lavoro

| Lavoro | Strumento principale | Alternativa |
|---|---|---|
| Aggiungere una chiave via OBD (c'è una chiave funzionante) | Autel IM608 → IMMO | OBDSTAR G3 |
| Tutte le chiavi perse (AKL) via OBD | Autel IM608 / OBDSTAR G3 (dipende dalla marca) | — |
| Leggere/scrivere EEPROM o MCU di quadro, BSI, BCM, centralina (al banco) | Xhorse Multi-Prog | Autel XP400 Pro, Xhorse Mini Prog |
| Lettura veloce di un EEPROM SOP8 senza smontare troppo | Xhorse Mini Prog (pinza SOP8) | Multi-Prog |
| Generare chiave da dump (senza auto) | Autel → Programmer → Write Key via Dump | — |
| Leggere/clonare/generare transponder e telecomandi | Autel XP400 Pro / Xhorse (app) | OBDSTAR RFID |
| Testare frequenza telecomando | OBDSTAR → Remote Test | Autel → Key → remote detection |

## Autel MaxiIM IM608 (e IM608 II / Pro II)

**Collegamento**
1. Batteria dell'auto carica: meglio un mantenitore (minimo 12,5 V). La maggior parte dei fallimenti
   viene da tensione bassa.
2. Cavo principale tra la VCI (MaxiFlash JVCI+) e la presa OBD dell'auto.
3. Tablet e VCI accoppiati via Bluetooth (app *VCI Manager*, dispositivo "Maxi…") o via USB.
   Va bene quando in basso a destra compare l'icona verde BT/USB.

**Aggiungere una chiave (esempio dal manuale)**
1. *IMMO* → marca → *Automatic Selection* (legge il VIN) oppure *Manual Selection*
   (modello, anno, tipo chiave).
2. Conferma il profilo veicolo. Prima di tutto apri **Vehicle IMMO Information**: dice tipo di
   chiave/transponder e posizione OBD. Così sai quale chiave nuova serve.
3. *Control Unit* → *Immobilizer/Smart System* → *Key Learning*. Il tablet legge i dati IMMO
   (salvali sempre come backup).
4. "Generare chiave dealer?" → **Sì** → chiave nuova nello slot dell'XP400 Pro → OK.
   Se la chiave è bloccata, chiede se sbloccarla.
5. "Make dealer key success" → passa all'apprendimento sull'auto: indica **quante chiavi in totale**
   (nuove + vecchie da tenere: quelle non riapprese spesso smettono di funzionare).
6. Inserisci/avvicina le chiavi come indica lo schermo, una alla volta.
7. Prova l'avviamento con ogni chiave, poi il telecomando (spesso è un passaggio separato:
   *Remote Control Learning*).

Scorciatoie: **Hot Function → Add Key (guided)** è la procedura guidata più semplice, da usare per
prima. **System Selection** serve per le funzioni dirette (leggere il PIN, keyless, sostituzione
modulo IMMO).

**Programmer (senza auto, solo XP400 Pro):** Key (leggi/scrivi chiave, rileva telecomando),
Chip EEPROM/MCU/ECU (leggi → *Save* → scrivi su chip vergine), Universal Key, Write Key via Dump.

## OBDSTAR X300 Classic G3 (Key Master G3)

Il manuale ufficiale spiega solo l'uso generale del tablet. Le procedure delle chiavi sono
**guidate a schermo** per ogni auto.
- App: **IMMO** (immobilizer; nel G3 anche moto e barche), **Remote Test** (frequenza telecomando),
  **RFID** e **Programmer** (refresh/rinnovo chip chiave), **ECU Flasher**, **ODO METER**.
- Prima registra il dispositivo e aggiornalo (*Personal Center*, *Upgrade*). Alcune funzioni
  consumano **crediti/token** (*Recharge CREDIT*).
- Collegamento: cavo principale alla presa OBD a 16 pin, quadro spento mentre colleghi.
- Spesso è forte su Fiat/Alfa, PSA, Renault, Toyota, Hyundai/Kia e moto. Se l'Autel non supporta
  un'auto, prova il G3.

## Xhorse Multi-Prog

Programmatore da banco per EEPROM, MCU, ECU/TCU e moduli IMMO.
- Si usa con il software/app Xhorse: scegli il tipo di chip, collega con l'adattatore giusto
  (pinza SOP8, adattatore EEPROM, cavo DB15, saldatura), poi **Leggi → Salva → verifica**.
- Alcune memorie a interfaccia parallela richiedono adattatori speciali.
- Manuale completo non ancora letto (Scribd non è raggiungibile dall'ambiente).

## Xhorse Mini Prog ("il piccolo")

- Funzioni: lettura/scrittura EEPROM e MCU, lettura/scrittura moduli, modifica dati, archivio.
- Si comanda dallo smartphone con l'**app Xhorse** via Bluetooth o WiFi: *Connect to device* →
  scegli il numero di serie.
- Tasti: ON/OFF (1–2 s acceso, 4 s spento), **Start** (avvia il lavoro), Pagina, Luce (accende la
  luce sulla pinza 1/2/3).
- Nella confezione: pinze SOP8 n°1, n°2 (larga), n°3, cavo DB15, adattatore EEPROM, aghi.
- Carica con un caricatore da 1,5 A (USB-C).

## Regole d'oro (valgono per tutti)

1. **Mantenitore di batteria** sempre collegato durante la programmazione.
2. **Backup prima di tutto:** salva i dati IMMO letti o il dump EEPROM originale **due volte**
   prima di scrivere qualcosa.
3. Controlla il **tipo di chiave e transponder** prima di comprare la chiave nuova
   (*Vehicle IMMO Information* sull'Autel).
4. Conta tutte le chiavi del cliente: spesso l'auto dimentica quelle non riapprese.
5. Non scollegare nulla e non girare il quadro durante la scrittura.
6. Prima volta su un modello: segui la procedura guidata e scrivi qui gli appunti, così la volta
   dopo ci metti 20 minuti invece di 2 ore.

## Manuali (link)

- OBDSTAR Key Master G3: https://cdn.shopify.com/s/files/1/0052/5395/5651/files/KEY_MASTER_G3_User_Manual.pdf (letto)
- Autel IM608 (prima serie): https://autel.us/wp-content/uploads/maxiim_im608_user_manual.pdf
- Autel IM608 II / Pro II V2.1: https://autel.us/wp-content/uploads/MaxiIM_IM608_II-IM608_Pro_II_User_Manual_EN_V2.1.pdf (letto)
- Xhorse Mini Prog (Magic Motorsport): https://magicmotorsport.shop/media/repository/XDPPR0EN_MiniProg_Manuale.pdf (letto)
- Xhorse Multi-Prog (Scribd): https://www.scribd.com/document/720797782/Multi-PROG-User-Manual (non letto)
- Guida EEPROM Multi-Prog: https://xhorseuk.blogspot.com/2024/01/xhorse-multi-prog-eeprom-readwrite.html (non letta)
