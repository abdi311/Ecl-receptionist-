# Ambiente Claude – Stato

Aggiornato: 2026-11-15

- **In breve:** come lavora Claude in questo repository: regole, memoria permanente, skill.
- **Branch:** `claude/vercel-labs-skills-setup-4v2ify` (regole, memoria, `find-skills`, `humanizer`)
  e `claude/founder-skill-installation-80u0uy` (11 skill Founder, PR #1 aperta).
- **Fatto:**
  - Regole permanenti in `CLAUDE.md`: italiano, prima le skill, protocollo memoria.
  - Sistema di memoria: `MEMORY.md`, `.claude/memory/`, `PROJECTS/`, `.claude/skills/README.md`.
  - Skill `find-skills` e `humanizer` copiate in `.claude/skills/` (restano tra le sessioni).
  - Ricerca skill per diagnosi auto, ECU, reverse engineering, elettronica: raccomandazioni
    in [DECISIONI.md](DECISIONI.md); niente installato.
- **Problemi aperti:** skills.sh bloccato dalla rete dell'ambiente; memoria non ancora su `main` (PR #2 aperta).
- **Prossimo passo:** vedi [TODO.md](TODO.md).
