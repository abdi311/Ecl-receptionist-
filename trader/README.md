# trader/ – cartella di lavoro delle skill di trading

Qui le 11 skill `trader-*` (in `.claude/skills/`) leggono e scrivono i loro file: ognuna legge
quello che ha scritto la precedente.

| File | Chi lo scrive | Cosa contiene |
|---|---|---|
| `config.json` | tu (con `/trader-budget`) | Regole: budget, perdita massima, limiti giornalieri. **`paper: true`** |
| `watchlist.json`, scansioni | `trader-scanner` | Titoli con un setup |
| `plan.json` | `trader-exit` | Entrata, stop, target, ora di chiusura |
| `orders.json` | `trader-budget` | L'ordine proposto (bracket) |
| `alerts.json`, `prices.json` | `trader-alerts` | Allarmi su prezzo, stop, target |
| `portfolio.json`, registro | `trader-broker` | Cassa, posizioni, ordini eseguiti |

Regole fisse:
- Si parte **solo in paper trading**. Il passaggio al conto reale si decide esplicitamente con l'utente
  e si annota in `PROJECTS/trading/DECISIONI.md`.
- **Nessun ordine senza il "sì" dell'utente**, scritto in chat, per quell'ordine preciso.
- `sec_user_agent` resta vuoto: nome ed email vanno nella variabile d'ambiente `SEC_USER_AGENT`
  (impostazioni dell'ambiente Cloud), mai nel repository. Le chiavi del broker idem.
