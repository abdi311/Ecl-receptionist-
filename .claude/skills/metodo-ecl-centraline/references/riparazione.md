# Riparazione della scheda

Obiettivo: riparare la centralina originale invece di sostituirla. Conserva software, codifica e
immobilizer, ma richiede di aprirla e lavorare sui componenti.

## Prerequisiti

- Guasto dimostrato con `metodo-ecl` e ricondotto alla centralina (es. uscita di un driver che non
  comanda con alimentazione, massa e carico verificati).
- **Backup completo prima di aprire**, se la centralina si legge ancora: un guasto durante la
  riparazione può rendere illeggibile la memoria.

## Passi

1. **Ipotesi sul circuito**: dal sintomo e dal pin che non funziona, risalire al circuito interno
   (alimentazione → regolatore → micro → driver → uscita). Se lo schema interno non è noto con
   certezza, dirlo ("da verificare") e lavorare con misure.
2. **Apertura**: metodo adatto al contenitore (colla, viti, rivetti), protezione ESD, foto della
   scheda prima di toccare nulla. Leggere i componenti solo se leggibili al 100% dalla foto.
3. **Misure sulla scheda** a riposo e alimentata: tensioni di alimentazione e riferimento,
   cortocircuiti verso massa, componente sospetto (resistenza, diodo, transistor/driver).
   Indicare valore atteso e fonte, o "da verificare".
4. **Sostituzione** del componente solo quando la misura dimostra il guasto. Componente uguale
   o equivalente verificato (stesso package, stesse caratteristiche).
5. **Verifica al banco**: alimentazioni corrette, comando dell'uscita (con carico fittizio o
   simulatore se disponibile), lettura memoria invariata rispetto al backup.
6. **Chiusura e montaggio**: sigillatura adatta, verifica su vettura come Fase 5 comune.

## Rischi tipici

- Danneggiare piste o componenti vicini durante la saldatura: temperatura e tempi controllati.
- Riparare la conseguenza e non la causa (es. driver bruciato da un attuatore in corto: verificare
  l'attuatore prima di rimontare, altrimenti si brucia di nuovo).
