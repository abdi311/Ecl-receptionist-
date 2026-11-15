# Trading (day trading con le skill trader-*) – Stato

Aggiornato: 2026-11-15

- **In breve:** day trading assistito su azioni USA con le 11 skill di
  [Jakeschincariol/day-trader-skill](https://github.com/Jakeschincariol/day-trader-skill) (v2.0.0, MIT,
  commit `3d0f4ef` del 2026-10-20) e 4 agenti che le coordinano.
- **A che punto è:** ambiente pronto, nessun trade fatto. Modalità **paper** (simulata).
- **Dove sta:**
  - skill: `.claude/skills/trader-*` (licenza in `.claude/skills/_licenze/`)
  - agenti: `.claude/agents/trading-*.md` (scout, planner, risk-guard, monitor)
  - dati e regole: `trader/` (vedi [trader/README.md](../../trader/README.md)); regole in `trader/config.json`
- **Branch / PR:** `ccr-5f196704-gimg0r`, PR verso `main` aperta a fine sessione.
- **Come provarlo:** in una sessione chiedi "scansiona il mercato" (agente `trading-scout`) oppure lancia
  `/trader-scanner`. Flusso completo: scanner → news → entry → exit → timemachine → budget → risk → broker.
- **Problemi aperti:**
  - Test del pacchetto non eseguiti: la modalità automatica di questa sessione blocca l'esecuzione di
    codice scaricato. Codice letto a mano: solo Python standard, chiamate solo a fonti pubbliche
    (Yahoo Finance, Stooq, Nasdaq Trader, SEC EDGAR, House Clerk), nessun ordine inviato dagli script.
  - Raggiungibilità di Yahoo/SEC/Nasdaq dalla rete Cloud non verificata.
  - Nessun broker collegato (Alpaca paper da configurare, chiavi solo nelle impostazioni).
  - `SEC_USER_AGENT` non impostato: news 8-K, analyst e parte delle notizie saltano la SEC.
  - Valori di `trader/config.json` sono quelli d'esempio (budget 5.000 $, perdita max 50 $/trade):
    da confermare con l'utente.
- **Prossimo passo:** vedi [TODO.md](TODO.md)
