# Trading – TODO

## Da fare
- [ ] 17/11/2026: conti Nvidia, rilanciare `python3 trader/ia/ai_sim.py --json` e confrontare.
- [ ] DCA simulato: ogni lunedì `python3 trader/crypto/dca.py buy` per 12 settimane (dal 16/11/2026), revisione alla 12ª.
- [ ] Controllo mensile ricavi Hyperliquid su DefiLlama (regola di stop HYPE).
- [ ] Confermare le regole in `trader/config.json` (budget, perdita max per trade e al giorno, trade al giorno) con `/trader-budget`.
- [ ] Impostare `SEC_USER_AGENT` ("Nome email") nelle variabili dell'ambiente Cloud, non nel repository.
- [ ] Eseguire i test del pacchetto (`python3 -m unittest discover -s tests`, dal clone del repo originale) dopo aver consentito l'esecuzione.
- [ ] Creare un conto **paper** Alpaca e collegare il suo server MCP (chiavi solo nelle impostazioni, strumento ordini su "Needs approval").
- [ ] Primo giro completo in paper su un titolo, con registro in `CRONOLOGIA.md`.

## Completate
- [x] 2026-11-15 – Regola permessi in `.claude/settings.json`, ambiente Cloud `Ecl-receptionist-` con gli host dei dati, prima scansione `daily`.
- [x] 2026-11-15 – Installate le 11 skill `trader-*`, creati 4 agenti, cartella `trader/` con config paper.
