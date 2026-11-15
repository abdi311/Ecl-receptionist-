# MEMORY – indice centrale

Punto di partenza per ogni sessione. Qui ci sono solo riassunti e collegamenti: i dettagli stanno nei
file indicati. Aggiornato: 2026-11-15.

## Ultima sessione

- **Data:** 2026-11-15 · **Branch:** `claude/vercel-labs-skills-setup-4v2ify`
- **Fatto:** installate le skill `find-skills` e `humanizer`; creato il flusso "prima le skill";
  ricerca di skill per diagnosi auto, ECU, reverse engineering ed elettronica; creato questo sistema di memoria
  e unito a `main` (PR #2).
- **Da continuare:** vedi [PROJECTS/ambiente-claude/TODO.md](PROJECTS/ambiente-claude/TODO.md).

## Progetti

| Progetto | Stato | Dove |
|---|---|---|
| ECL Receptionist (prototipo receptionist multilingue) | Prototipo funzionante, non ancora unito a `main` | [PROJECTS/ecl-receptionist/](PROJECTS/ecl-receptionist/STATO.md) |
| Ambiente Claude (skill, memoria, regole) | In corso | [PROJECTS/ambiente-claude/](PROJECTS/ambiente-claude/STATO.md) |

## Branch e Pull Request aperte

| Branch | Contenuto | Stato |
|---|---|---|
| `main` | `README.md` + regole, memoria, skill `find-skills` e `humanizer` (PR #2 unita il 2026-11-15) | — |
| `claude/ecl-receptionist-prototype-xb9bmu` | Prototipo receptionist | Nessuna PR |
| `claude/founder-skill-installation-80u0uy` | 11 skill Founder in `.claude/skills/` | PR #1 aperta |
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
