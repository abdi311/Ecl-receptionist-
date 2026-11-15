# ECL Receptionist – Stato

Aggiornato: 2026-11-15 (ricostruito dalla cronologia Git; il codice non è stato modificato da allora)

- **In breve:** prototipo del receptionist multilingue di ECL Solutions (francese, italiano, tedesco,
  inglese) per prendere appuntamenti in officina.
- **A che punto è:** prototipo funzionante con 52 test automatici. Non unito a `main`, nessuna PR.
- **Branch:** `claude/ecl-receptionist-prototype-xb9bmu` (ultimo commit `bd71c80`, 2026-11-07).
- **Cosa fa:**
  - Telefono simulato via testo: riconosce e cambia lingua, gestisce interruzioni e correzioni,
    chiede nome, veicolo e motivo, propone al massimo due orari, conferma solo dopo il salvataggio.
  - WhatsApp: risponde solo con il link alla pagina di prenotazione (non collegato).
  - Pagina `/book` con lo stesso calendario del telefono.
  - Calendario finto in `data/calendar.json`, fuso Europe/Zurich, con blocco contro doppie prenotazioni.
  - Simulatore nel browser (`/simulator`) anche a voce, con la voce gratuita del browser.
- **Non collegato di proposito:** numero reale, WhatsApp Business, servizi a pagamento
  (riconoscimento vocale, sintesi vocale, LLM). Solo Node.js, nessuna dipendenza esterna.
- **Come provarlo** (Node.js ≥ 20):
  ```bash
  git checkout claude/ecl-receptionist-prototype-xb9bmu
  npm test        # 52 test
  npm run demo    # chiamate di prova in 4 lingue
  npm run chat    # telefonata via testo nel terminale
  npm start       # http://localhost:3000/book e /simulator
  ```
- **Codice:** `src/receptionist/` (agente, lingua, comprensione, frasi), `src/calendar/`,
  `src/channels/` (telefono, WhatsApp), `src/server.js`, `public/`, `test/`.
- **Prossimo passo:** vedi [TODO.md](TODO.md).
