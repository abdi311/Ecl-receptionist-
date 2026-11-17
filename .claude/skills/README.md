# Skill

Le cartelle qui dentro sono skill di progetto: Claude Code le carica automaticamente in ogni sessione
di questo repository, anche in Cloud. Per conservare una skill installata con `-g` (che finisce in
`~/.claude/skills/` e si perde con il container) copiala qui e fai commit.

Aggiorna questa tabella ogni volta che una skill viene aggiunta o rimossa.

## Installate in questo branch

| Skill | Fonte | Aggiunta | Note |
|---|---|---|---|
| `find-skills` | [vercel-labs/skills](https://github.com/vercel-labs/skills) (`skills/find-skills`) | 2026-11-15 | Cerca skill su skills.sh. Da Cloud skills.sh è bloccato: vedi `.claude/memory/conoscenze.md`. |
| `teardown` | [elvarofficial/teardown](https://github.com/elvarofficial/teardown), commit `a91262a`, MIT | 2026-11-17 | Simulatori 3D interattivi di macchine reali (HTML offline) + video 60 fps. 16 MB (14 MB sono GIF demo in `docs/`). Per usarla: `npm install` nella cartella + `ffmpeg` per i video. Codice controllato: nessuna chiamata di rete. Versione registrata in `skills-lock.json`. |
| `ai-video` | [0xadvait/ai-video-skill](https://github.com/0xadvait/ai-video-skill), commit `79b1edf`, MIT | 2026-11-17 | Video AI completi: prompt, fotogrammi, generazione (Seedance, Kling, Wan, Veo, OmniHuman, VEED), voce, montaggio, upscale. 7,4 MB (GIF demo in `media/`). Servono chiavi API a pagamento (Replicate, fal, Gemini, ElevenLabs) e `pip install -r scripts/requirements.txt`. Codice controllato: chiama solo quei servizi. |
| `humanizer` | [blader/humanizer](https://github.com/blader/humanizer) v4.0.0, MIT | 2026-11-15 | Rende naturali i testi scritti da AI. Copiati solo `SKILL.md` e `LICENSE`. Duplica `anthropic-skills:humanizer`. |

Per reinstallarle a livello utente:

```bash
npx skills add vercel-labs/skills --skill find-skills -g -a claude-code
npx skills add blader/humanizer -g -a claude-code
npx skills add elvarofficial/teardown -a claude-code -y   # nel progetto
npx skills add 0xadvait/ai-video-skill --skill ai-video -a claude-code -y   # nel progetto
```

## Plugin attivi nel progetto

| Plugin | Fonte | Aggiunto | Note |
|---|---|---|---|
| `ecc@ecc` (Everything Claude Code) v2.2.3 | [affaan-m/ECC](https://github.com/affaan-m/ECC), MIT | 2026-11-17 | Attivato in `.claude/settings.json`; 327 skill, 72 agenti, 98 comandi, hook `minimal`. Vedi [DECISIONI](../../PROJECTS/ambiente-claude/DECISIONI.md). |

## In attesa (altri branch)

| Skill | Dove | Stato |
|---|---|---|
| 11 skill Founder (`founder-board`, `-brand`, `-cfo`, `-competitors`, `-consumer`, `-launch`, `-marketing`, `-offer`, `-ops`, `-plan`, `-pricing`) | `claude/founder-skill-installation-80u0uy`, da `Jakeschincariol/founder-skill` | PR #1 aperta, non unita |

## Disponibili nell'account (non nel repository)

Skill dell'account claude.ai, già presenti in ogni sessione: tra queste `anthropic-skills:metodo-ecl`
(diagnosi auto/ECU), `anthropic-skills:ig`, `anthropic-skills:find-skills`, `anthropic-skills:humanizer`.

## Consigliate, non installate

Vedi [PROJECTS/ambiente-claude/DECISIONI.md](../../PROJECTS/ambiente-claude/DECISIONI.md).
