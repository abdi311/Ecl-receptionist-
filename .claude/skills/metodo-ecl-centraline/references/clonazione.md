# Clonazione / sostituzione centralina

Obiettivo: la centralina di ricambio deve diventare identica all'originale (software, dati di
codifica, adattamenti, immobilizer), così l'auto riparte senza adattamenti OBD e senza passare dal
costruttore. È preferita all'adattamento via OBD perché conserva tutto ciò che la centralina aveva
imparato.

## Prerequisiti (cancello d'ingresso)

- Guasto della centralina originale **dimostrato** con `metodo-ecl` (alimentazioni, masse,
  cablaggio e attuatori esclusi con misure).
- Documenti del veicolo verificati: la clonazione è per lo stesso veicolo.
- Centralina di ricambio **compatibile**: stessa famiglia e stesso codice hardware (o
  compatibilità confermata da documentazione, altrimenti "da verificare"). Verificare anche
  la versione dell'hardware se il costruttore ne ha più di una.
- La centralina originale si legge ancora (almeno EEPROM). Se non si legge, vedi in fondo.

## Passi

1. **Identifica** micro, EEPROM esterna (se presente) e modalità supportate dallo strumento per
   entrambe le centraline. Annota cosa supporta lo strumento (OBD / bench / boot) e quali aree legge
   (Flash interna, EEPROM interna/emulata, EEPROM esterna, eventuali aree protette).
2. **Backup dell'originale**: due letture complete di tutte le aree, confronto con
   `scripts/confronta_dump.py`, SHA-256 annotati.
3. **Backup del ricambio** prima di sovrascriverlo, per poterlo ripristinare se serve.
4. **Confronto codici**: codice software dell'originale e del ricambio. Se sono diversi, si scrive
   sul ricambio il software dell'originale (Flash) oltre all'EEPROM.
5. **Scrittura sul ricambio** (Flash, poi EEPROM, salvo indicazioni diverse dello strumento), dopo
   riepilogo e conferma esplicita.
6. **Rilettura del ricambio** e confronto con i file dell'originale: devono coincidere nelle aree
   scritte. Differenze in aree note come specifiche della singola centralina (es. numero di serie
   dove lo strumento lo prevede) vanno segnalate, non ignorate.
7. **Montaggio e verifica**: avviamento (immobilizer), DTC, parametri, eventuali adattamenti di base
   richiesti (es. corpo farfallato, se previsti), prova su strada, DTC finali.

## Rischi tipici

- Ricambio con hardware simile ma non uguale: rischio di centralina che non avvia o con funzioni
  mancanti.
- Lettura in boot su scheda aperta: rischio di danni meccanici o ESD; seguire il punto di contatto
  indicato dallo strumento, mai a memoria.
- Clonare solo l'EEPROM quando il software del ricambio è diverso.

## Se l'originale non si legge

Non improvvisare. Opzioni da valutare con il tecnico: riparazione dell'originale per renderla
leggibile (`riparazione.md`), lettura diretta dell'EEPROM esterna dissaldata con programmatore,
oppure adattamento ufficiale via OBD/costruttore. Spiega cosa si perde con ogni opzione.
