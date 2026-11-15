# Come funziona la memoria

| File | Quando scriverci | Formato |
|---|---|---|
| `conoscenze.md` | Fatti stabili e verificati (ambiente, strumenti, limiti, preferenze di lavoro). | Sezioni per argomento; ogni voce con data di verifica. |
| `decisioni.md` | Decisioni che valgono per tutto il lavoro, non per un solo progetto. | Registro, più recente in cima. |
| `correzioni.md` | Errori risolti, correzioni dell'utente, soluzioni tecniche riutilizzabili. | Problema → causa → soluzione. |
| `sessioni.md` | A fine sessione, una riga. | Data · branch · cosa è stato fatto · link. |

Le decisioni e la storia di un singolo progetto vanno in `PROJECTS/<progetto>/`, non qui.

## Regole

- Una informazione, un solo posto. Altrove metti un link.
- Non eliminare voci importanti: segnale come **Superato il AAAA-MM-GG** con il motivo.
- Niente password, token, chiavi o dati personali sensibili.
- Dopo ogni aggiornamento: commit e push su GitHub.

## Modello di voce per `decisioni.md`

```
### AAAA-MM-GG – Titolo breve
- **Decisione:** …
- **Motivo:** …
- **Alternative scartate:** …
- **Stato:** attiva | superata il … da …
```

## Modello di voce per `correzioni.md`

```
### AAAA-MM-GG – Titolo breve
- **Problema:** …
- **Causa:** …
- **Soluzione:** …
- **Dove:** file / comando / progetto
```
