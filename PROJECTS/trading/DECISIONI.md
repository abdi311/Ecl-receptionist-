# Trading – Decisioni

### 2026-11-15 – DCA simulato BTC + HYPE
- **Decisione:** 12 settimane, 200 $/settimana 80/20 BTC/HYPE, riserva 600 $ sui ribassi, budget 3.000 $, solo paper.
- **Motivo:** richiesta dell'utente dopo la ricerca cripto; mercato ribassista con paura alta, ingressi graduali.
  Valori proposti da Claude, modificabili in `trader/crypto/dca-plan.json`.
- **Stato:** attiva.

### 2026-11-15 – Pacchetto Day Trader v2 come base
- **Decisione:** usare le 11 skill di `Jakeschincariol/day-trader-skill`, copiate nel repository (`.claude/skills/`) per non perderle col container.
- **Motivo:** richiesta dell'utente ("la skill con 11 skill"); stesso autore delle skill Founder; MIT, niente chiavi API, dati pubblici, nessun ordine automatico.
- **Alternative scartate:** `tradermonty/claude-trading-skills` (molto più grande, orientato a investimento/ricerca), installazione come plugin (si perde col container).
- **Stato:** attiva.

### 2026-11-15 – Solo paper trading, ordini sempre confermati
- **Decisione:** `paper: true`; ogni ordine passa da `trading-risk-guard` (PASS) e dal "sì" esplicito dell'utente. Niente margine, short, opzioni.
- **Motivo:** sicurezza; il pacchetto stesso lo imposta così. Passare al reale richiede una nuova decisione scritta qui.
- **Stato:** attiva.

### 2026-11-15 – Quattro agenti
- **Decisione:** `trading-scout` (scanner+news), `trading-planner` (entry, exit, timemachine, budget), `trading-risk-guard` (solo lettura, risk), `trading-monitor` (alerts, news, analyst, pelosi). Il broker resta alla sessione principale, davanti all'utente.
- **Motivo:** separare chi trova, chi pianifica e chi controlla; il controllore non può modificare gli ordini.
- **Stato:** attiva.
