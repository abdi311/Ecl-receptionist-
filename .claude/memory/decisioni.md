# Decisioni generali

Decisioni che valgono per tutto il lavoro. Più recenti in cima.
Le decisioni di un solo progetto stanno in `PROJECTS/<progetto>/DECISIONI.md`.

### 2026-11-15 – Memoria permanente nel repository GitHub
- **Decisione:** la memoria è fatta di file Markdown nel repository: `CLAUDE.md`, `MEMORY.md`,
  `.claude/memory/`, `PROJECTS/`, `.claude/skills/`. `CLAUDE.md` importa `MEMORY.md` con `@MEMORY.md`,
  così ogni sessione lo carica da sola.
- **Motivo:** il container Cloud è temporaneo; GitHub è l'unico archivio che sopravvive.
- **Alternative scartate:** memoria automatica di Claude Code (sta nel container); hook di avvio
  (non serve: l'import di `CLAUDE.md` basta ed è più semplice); skill di memoria di terzi
  (non verificabili da qui, vedi [PROJECTS/ambiente-claude/DECISIONI.md](../../PROJECTS/ambiente-claude/DECISIONI.md)).
- **Stato:** attiva.

### 2026-11-15 – Rispondere sempre in italiano
- **Decisione:** tutte le risposte in italiano, salvo richiesta diversa dell'utente.
- **Stato:** attiva (regola in `CLAUDE.md`).

### 2026-11-15 – Prima le skill
- **Decisione:** prima di ogni attività cercare una skill adatta; niente installazioni di terzi
  senza approvazione.
- **Stato:** attiva (regola in `CLAUDE.md`).
