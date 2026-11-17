# Ambiente Claude – Stato

Aggiornato: 2026-11-17

- **In breve:** come lavora Claude in questo repository: regole, memoria permanente, skill.
- **Branch:** `claude/vercel-labs-skills-setup-4v2ify` (regole, memoria, `find-skills`, `humanizer`)
  unito a `main` con la PR #2; `claude/founder-skill-installation-80u0uy` (11 skill Founder, PR #1 aperta).
- **Fatto:**
  - Regole permanenti in `CLAUDE.md`: italiano, prima le skill, protocollo memoria.
  - Sistema di memoria: `MEMORY.md`, `.claude/memory/`, `PROJECTS/`, `.claude/skills/README.md`.
  - Skill `find-skills` e `humanizer` copiate in `.claude/skills/` (restano tra le sessioni).
  - Ricerca skill per diagnosi auto, ECU, reverse engineering, elettronica: raccomandazioni
    in [DECISIONI.md](DECISIONI.md); niente installato.
  - 2026-11-17: plugin ECC (`ecc@ecc` v2.2.3) attivo per il progetto tramite `.claude/settings.json`,
    hook `minimal`. Dettagli in [DECISIONI.md](DECISIONI.md).
- **Problemi aperti:** skills.sh bloccato dalla rete dell'ambiente; nessuno sulla memoria: è su `main` dal 2026-11-15 (PR #2).
- **Prossimo passo:** vedi [TODO.md](TODO.md).
