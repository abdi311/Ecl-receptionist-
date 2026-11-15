# Trading – TODO

## Da fare
- [ ] Confermare le regole in `trader/config.json` (budget, perdita max per trade e al giorno, trade al giorno) con `/trader-budget`.
- [ ] Impostare `SEC_USER_AGENT` ("Nome email") nelle variabili dell'ambiente Cloud, non nel repository.
- [ ] Eseguire i test del pacchetto (`python3 -m unittest discover -s tests`, dal clone del repo originale) dopo aver consentito l'esecuzione.
- [ ] Verificare che la rete Cloud raggiunga Yahoo Finance, SEC, Nasdaq Trader; se bloccati, aggiungerli agli host consentiti.
- [ ] Creare un conto **paper** Alpaca e collegare il suo server MCP (chiavi solo nelle impostazioni, strumento ordini su "Needs approval").
- [ ] Primo giro completo in paper su un titolo, con registro in `CRONOLOGIA.md`.

## Completate
- [x] 2026-11-15 – Installate le 11 skill `trader-*`, creati 4 agenti, cartella `trader/` con config paper.
