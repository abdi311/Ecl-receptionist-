# Skill

Le cartelle qui dentro sono skill di progetto: Claude Code le carica automaticamente in ogni sessione
di questo repository, anche in Cloud. Per conservare una skill installata con `-g` (che finisce in
`~/.claude/skills/` e si perde con il container) copiala qui e fai commit.

Aggiorna questa tabella ogni volta che una skill viene aggiunta o rimossa.

## Installate in questo branch

| Skill | Fonte | Aggiunta | Note |
|---|---|---|---|
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) (`skills/find-skills`) | 2026-11-15 | Cerca skill su skills.sh. Da Cloud skills.sh è bloccato: vedi `.claude/memory/conoscenze.md`. |
| `metodo-ecl-centraline` | Creata su misura (estende `anthropic-skills:metodo-ecl`) | 2026-11-15 | Clonazione, riparazione, aggiornamento e rimappatura ECU con cancelli di sicurezza, script `confronta_dump.py` e scheda lavoro. Antinquinamento sempre intatto. |
| `humanizer` | [blader/humanizer](https://github.com/blader/humanizer) v4.0.0, MIT | 2026-11-15 | Rende naturali i testi scritti da AI. Copiati solo `SKILL.md` e `LICENSE`. Duplica `anthropic-skills:humanizer`. |

Per reinstallarle a livello utente:

```bash
npx skills add vercel-labs/skills --skill find-skills -g -a claude-code
npx skills add blader/humanizer -g -a claude-code
```

## In attesa (altri branch)

| Skill | Dove | Stato |
|---|---|---|
| 11 skill Founder (`founder-board`, `-brand`, `-cfo`, `-competitors`, `-consumer`, `-launch`, `-marketing`, `-offer`, `-ops`, `-plan`, `-pricing`) | `claude/founder-skill-installation-80u0uy`, da `Jakeschincariol/founder-skill` | PR #1 aperta, non unita |

## Disponibili nell'account (non nel repository)

Skill dell'account claude.ai, già presenti in ogni sessione: tra queste `anthropic-skills:metodo-ecl`
(diagnosi auto/ECU), `anthropic-skills:ig`, `anthropic-skills:find-skills`, `anthropic-skills:humanizer`.

## Consigliate, non installate

Vedi [PROJECTS/ambiente-claude/DECISIONI.md](../../PROJECTS/ambiente-claude/DECISIONI.md).
