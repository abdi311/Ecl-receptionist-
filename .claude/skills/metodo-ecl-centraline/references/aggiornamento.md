# Aggiornamento software ufficiale

Obiettivo: installare una versione software del costruttore (campagna di richiamo, bollettino
tecnico, risoluzione di un difetto noto) con lo strumento ufficiale o un'interfaccia compatibile.

## Prerequisiti

- Motivo documentato: campagna, bollettino tecnico (TSB) o difetto noto che l'aggiornamento
  risolve, collegato al sintomo dimostrato con `metodo-ecl`. Non aggiornare "per provare".
- Versione attuale e versione di destinazione note; compatibilità confermata dalla documentazione
  del costruttore ("da verificare" se non disponibile).
- Se la centralina è stata rimappata: l'aggiornamento sovrascrive la mappa. Informare il cliente
  e salvare il file prima.

## Passi

1. **Stato prima**: DTC salvati, codici e versioni annotati, backup del software attuale se lo
   strumento lo permette (non sempre possibile via OBD ufficiale: annotarlo).
2. **Preparazione**: alimentazione stabile (obbligatoria, gli aggiornamenti OBD sono lunghi),
   PC senza sospensione né aggiornamenti automatici, connessione stabile se lo strumento è online,
   utenze elettriche dell'auto spente.
3. **Aggiornamento** dopo riepilogo e conferma esplicita. Non interrompere.
4. **Dopo**: adattamenti/codifiche richiesti dal costruttore, cancellazione DTC di sessione,
   verifica versione installata, prova su strada nelle condizioni del sintomo, DTC finali.

## Se l'aggiornamento si interrompe

Non spegnere e non scollegare. Seguire la procedura di ripristino dello strumento ufficiale.
Se non riparte, la centralina potrebbe richiedere lettura al banco o in boot con il backup:
fermarsi e valutare con il tecnico.
