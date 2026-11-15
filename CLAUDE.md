# Istruzioni permanenti per Claude Code

Questo file viene letto automaticamente all'inizio di ogni sessione. La riga qui sotto importa anche
l'indice della memoria, così ogni nuova chat o sessione Cloud parte già con il contesto.

@MEMORY.md

## Lingua

Rispondi sempre in italiano, a meno che l'utente non chieda esplicitamente un'altra lingua.

## Memoria permanente (obbligatoria)

L'ambiente Cloud è temporaneo: tutto ciò che non è salvato su GitHub va perso. La memoria vive in
questo repository.

| Dove | Cosa contiene |
|---|---|
| `CLAUDE.md` | Regole, comportamento e preferenze permanenti (questo file). |
| `MEMORY.md` | Indice centrale: progetti attivi, ultima sessione, dove trovare cosa. Breve. |
| `.claude/memory/` | Archivio trasversale: conoscenze, decisioni generali, correzioni, registro sessioni. |
| `PROJECTS/<progetto>/` | Per ogni progetto: `STATO.md`, `CRONOLOGIA.md`, `DECISIONI.md`, `TODO.md`. |
| `.claude/skills/` | Skill di progetto (caricate automaticamente) e indice in `.claude/skills/README.md`. |

### Inizio sessione
1. `CLAUDE.md` e `MEMORY.md` sono già nel contesto: leggili con attenzione.
2. Se il branch di lavoro non contiene la memoria più recente, recuperala da GitHub
   (`git fetch origin` e controlla il branch indicato in `MEMORY.md`).
3. Prima di lavorare su un progetto leggi `PROJECTS/<progetto>/STATO.md` e `TODO.md`.

### Durante la sessione
- Decisione importante presa con l'utente → `PROJECTS/<progetto>/DECISIONI.md`
  (o `.claude/memory/decisioni.md` se riguarda tutto il lavoro).
- Errore risolto, correzione dell'utente o soluzione tecnica → `.claude/memory/correzioni.md`.
- Fatto stabile utile in futuro (ambiente, strumenti, limiti) → `.claude/memory/conoscenze.md`.
- Skill installata o rimossa → `.claude/skills/README.md`.

### Fine sessione (o prima di chiudere un lavoro)
1. Aggiorna `PROJECTS/<progetto>/STATO.md`, `TODO.md` e `CRONOLOGIA.md`.
2. Aggiungi una riga in `.claude/memory/sessioni.md`.
3. Aggiorna la sezione "Ultima sessione" di `MEMORY.md`.
4. Fai commit e push su GitHub sul branch di lavoro.

### Regole della memoria
- Non cancellare informazioni importanti senza autorizzazione: se qualcosa non è più valido,
  segnalo come superato (~~barrato~~ o "Superato il AAAA-MM-GG da …") invece di eliminarlo.
- Non duplicare: ogni informazione ha un solo posto; altrove metti un link.
- Voci sempre datate (AAAA-MM-GG), le più recenti in cima nei registri.
- **Mai** salvare password, token, chiavi API, codici o dati personali sensibili (email, telefoni,
  indirizzi di clienti). Se servono, scrivi solo *dove* si trovano (es. "nelle impostazioni
  dell'ambiente Cloud").
- `MEMORY.md` resta un indice corto (sotto ~150 righe): i dettagli vanno nei file collegati.

## Prima le skill

Prima di iniziare qualsiasi attività:

1. Controlla se una skill già installata può aiutare (vedi `.claude/skills/README.md`).
2. Usa la skill `find-skills` per cercare su skills.sh quando una skill adatta potrebbe esistere
   (`npx skills find <query>`). Nota: dall'ambiente Cloud skills.sh può essere bloccato,
   vedi `.claude/memory/conoscenze.md`.
3. Valuta i candidati per qualità, popolarità (installazioni), reputazione dell'autore e pertinenza.
4. Presenta l'opzione migliore con il comando di installazione, es.
   `npx skills add <owner/repo> --skill <name> -g -a claude-code`.
5. Non installare mai skill di terzi senza l'approvazione esplicita dell'utente.
6. Se non esiste una skill adatta, svolgi il compito con le tue capacità o proponi una skill su misura.

Non iniziare lavori complessi prima di aver controllato le skill pertinenti.
