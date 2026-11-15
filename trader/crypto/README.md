# DCA simulato BTC + HYPE (paper)

Piano e regole: [dca-plan.json](dca-plan.json). Registro acquisti simulati: `ledger.csv` (creato al primo `buy`).
Nessun ordine reale: i prezzi vengono da Yahoo Finance, gli "acquisti" sono solo righe nel registro.

```bash
python3 trader/crypto/dca.py backtest --weeks 12   # anche 26 o 52
python3 trader/crypto/dca.py buy                   # ogni lunedi: registra l'acquisto della settimana
python3 trader/crypto/dca.py status                # posizione simulata a prezzi attuali
```

In sintesi: 12 settimane da lunedi 16/11/2026, 200 $ a settimana (160 BTC / 40 HYPE, cioè 80/20),
riserva di 600 $ per i ribassi (BTC sotto 62.000 -> +150 $, sotto 58.000 -> +300 $; HYPE sotto 55 -> +150 $),
budget massimo 3.000 $, commissione simulata 0,4 %, niente leva e niente vendite. Revisione alla settimana 12.
