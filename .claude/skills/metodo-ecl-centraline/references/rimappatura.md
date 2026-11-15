# Rimappatura prestazioni

Obiettivo: modificare le mappe per aumentare potenza/coppia o migliorare la guidabilità, in modo
sicuro per il motore e **senza toccare i sistemi antinquinamento**.

## Limiti fissi

- Nessuna rimozione o disattivazione di FAP/DPF, EGR, SCR/AdBlue, catalizzatore, sonde lambda,
  sistemi evaporativi o della diagnosi OBD delle emissioni. Se richiesto, rifiuta spiegando il
  motivo e proponi la diagnosi del guasto reale con `metodo-ecl` (es. FAP che si intasa: perché?).
- La modifica di potenza va in genere omologata o annotata sulla licenza di circolazione
  (Svizzera: ufficio della circolazione; procedura specifica "da verificare"). Informare il cliente.
- La mappa viene sovrascritta da aggiornamenti ufficiali successivi.

## Prerequisiti (cancello d'ingresso)

- **Motore sano, dimostrato**: nessun DTC attivo, prova su strada con registrazione dei parametri
  (pressione sovralimentazione richiesta/reale, pressione rail, portata aria, temperatura gas di
  scarico se disponibile, correzioni accensione/ battito per i benzina, correzioni minimo e
  bilanciamento iniettori per i diesel). Una rimappatura su un motore con un difetto lo peggiora.
- Frizione, cambio e componenti in grado di reggere la coppia in più (valutazione "da verificare"
  per il caso specifico).

## Passi

1. **Lettura e backup** completi (Fase 2 comune). Il file originale non si tocca mai.
2. **Identificazione del file** in WinOLS: codice software, mappe riconosciute. Se le mappe non sono
   identificate con certezza, non modificarle a intuito: "da verificare".
3. **Modifiche** con limiti prudenti, una famiglia di mappe alla volta, documentando ogni mappa
   modificata con valore prima/dopo. Mantieni i limitatori di protezione del motore (temperatura gas
   di scarico, protezione componenti, limitatore di fumosità sui diesel).
4. **Confronto originale/modificato** con WinOLS e con `scripts/confronta_dump.py`: le zone
   cambiate devono corrispondere solo alle mappe modificate più i checksum.
5. **Checksum** corretti e verificati (WinOLS o strumento) prima della scrittura.
6. **Scrittura** dopo riepilogo e conferma esplicita.
7. **Verifica**: registrazione su strada degli stessi parametri del punto di partenza; valori reali
   che seguono i richiesti, nessun battito in testa, temperature nei limiti, nessun DTC.

## Rischi tipici

- Mappe identificate male → comportamento imprevedibile.
- Coppia oltre il limite della frizione o del cambio automatico.
- Checksum non corretti → centralina che non avvia (serve il recupero dal backup).
