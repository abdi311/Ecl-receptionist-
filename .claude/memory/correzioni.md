# Correzioni e soluzioni tecniche

Errori risolti, correzioni dell'utente e soluzioni riutilizzabili. Più recenti in cima.

### 2026-11-15 – Modalità automatica blocca codice scaricato
- **Problema:** in Cloud la modalità automatica ha rifiutato di eseguire i test di un pacchetto appena clonato e un `curl` verso le fonti dati.
- **Soluzione:** leggere il codice a mano (grep di URL, `subprocess`, `eval`) e lasciare all'utente il via libera per eseguirlo, oppure aggiungere una regola di permesso per Bash nelle impostazioni.

### 2026-11-15 – App GitHub mobile: "Unable to merge – Cannot merge at this time"
- **Problema:** l'app GitHub su Android non permetteva di unire la PR #2.
- **Causa:** limite dell'app; per l'API la PR era "clean" (nessun conflitto, nessuna regola, nessun controllo).
- **Soluzione:** unire dal browser (pulsante "Merge pull request" in fondo alla pagina) oppure chiedere a
  Claude di unirla, con conferma esplicita dell'utente.
- **Dove:** Pull Request su GitHub.

### 2026-11-15 – `npx skills find` non trova mai niente
- **Problema:** ogni ricerca (anche "react") risponde "No skills found".
- **Causa:** la rete dell'ambiente Cloud blocca `skills.sh` (proxy 403), non mancano le skill.
- **Soluzione:** cercare con la ricerca web; installare con `npx skills add owner/repo --skill nome`,
  che passa da GitHub e funziona. Soluzione definitiva: consentire `skills.sh` nella rete dell'ambiente.
- **Dove:** ricerca skill.

### 2026-11-15 – Skill installate che spariscono
- **Problema:** le skill installate con `-g` finiscono in `~/.claude/skills/`, che si perde con il container.
- **Soluzione:** copiarle anche in `.claude/skills/` del repository e fare commit; Claude Code le carica
  da lì automaticamente in ogni sessione del progetto.
- **Dove:** `.claude/skills/`.

### 2026-11-15 – Skill duplicata `humanizer`
- **Problema:** `blader/humanizer` duplica `anthropic-skills:humanizer`, già disponibile nell'account.
- **Soluzione:** tenute entrambe per ora; da decidere con l'utente se rimuoverne una
  (vedi [PROJECTS/ambiente-claude/TODO.md](../../PROJECTS/ambiente-claude/TODO.md)).
