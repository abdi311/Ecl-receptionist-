# MEMORY – indice centrale

Punto di partenza per ogni sessione. Qui ci sono solo riassunti e collegamenti: i dettagli stanno nei
file indicati. Aggiornato: 2026-11-15 (sessione trading).

## Ultima sessione

- **Data:** 2026-11-15 · **Branch:** `ccr-5f196704-gimg0r`
- **Fatto:** preparato il trading: 11 skill `trader-*` (Day Trader v2) in `.claude/skills/`, 4 agenti in
  `.claude/agents/trading-*.md`, cartella `trader/` con regole in paper trading.
- **Da continuare:** vedi [PROJECTS/trading/TODO.md](PROJECTS/trading/TODO.md).

## Progetti

| Progetto | Stato | Dove |
|---|---|---|
| ECL Receptionist (prototipo receptionist multilingue) | Prototipo funzionante, non ancora unito a `main` | [PROJECTS/ecl-receptionist/](PROJECTS/ecl-receptionist/STATO.md) |
| Trading (day trading, skill `trader-*`, solo paper) | Ambiente pronto, nessun trade | [PROJECTS/trading/](PROJECTS/trading/STATO.md) |
| Ambiente Claude (skill, memoria, regole) | In corso | [PROJECTS/ambiente-claude/](PROJECTS/ambiente-claude/STATO.md) |

## Branch e Pull Request aperte

| Branch | Contenuto | Stato |
|---|---|---|
| `main` | `README.md` + regole, memoria, skill `find-skills` e `humanizer` (PR #2 unita il 2026-11-15) | — |
| `claude/ecl-receptionist-prototype-xb9bmu` | Prototipo receptionist | Nessuna PR |
| `claude/founder-skill-installation-80u0uy` | 11 skill Founder in `.claude/skills/` | PR #1 aperta |
| `ccr-5f196704-gimg0r` | Skill e agenti di trading | PR verso `main` |
| `claude/vercel-labs-skills-setup-4v2ify` | Branch di lavoro per gli aggiornamenti della memoria | PR #2 unita; ripartito da `main` |

La memoria è su `main`. Gli aggiornamenti successivi passano dal branch di lavoro: se una sessione
non li trova su `main`, recuperali con `git fetch origin` da quel branch.

## Archivio

- [Conoscenze](.claude/memory/conoscenze.md): limiti dell'ambiente Cloud, strumenti, fatti stabili.
- [Decisioni generali](.claude/memory/decisioni.md): scelte che valgono per tutto il lavoro.
- [Correzioni e soluzioni](.claude/memory/correzioni.md): errori risolti, correzioni dell'utente.
- [Registro sessioni](.claude/memory/sessioni.md): una riga per sessione.
- [Skill](.claude/skills/README.md): skill installate, in attesa e consigliate.
- [Come funziona la memoria](.claude/memory/README.md).
