# Conoscenze

Fatti stabili e verificati. Ogni voce indica quando è stata verificata.

## Ambiente Cloud di Claude Code

- **`/plugin` non funziona nelle sessioni Cloud** (verificato 2026-11-17), ma il comando `claude`
  sì: `claude plugin list --json` e gli installer via `npx` installano plugin. Un plugin in ambito
  `project` scrive `extraKnownMarketplaces` + `enabledPlugins` in `.claude/settings.json` del
  repository, che resta tra le sessioni. Le preferenze del plugin (es. profilo hook di ECC) finiscono
  invece in `~/.claude/settings.json` e si perdono con il container.
- **Eseguire pacchetti npm di terzi** (`npx ...`) viene bloccato dal controllo permessi automatico
  finché l'utente non lo approva esplicitamente in chat (verificato 2026-11-17).
- **Il container è temporaneo** (verificato 2026-11-15). Viene eliminato dopo un periodo di
  inattività. Tutto ciò che sta fuori dal repository (es. `~/.claude/skills/`, `~/.agents/`) si perde.
  Le skill da conservare vanno in `.claude/skills/` del repository.
- **La memoria automatica di Claude Code** (`~/.claude/projects/.../memory/`) sta anch'essa nel
  container, quindi in Cloud non è affidabile. La memoria vera è in questo repository.
- **skills.sh è bloccato dalla rete** (verificato 2026-11-15): `npx skills find` risponde sempre
  "No skills found" e `curl` riceve 403. `npx skills add owner/repo` invece funziona, perché scarica
  da GitHub. Per cercare skill si usa la ricerca web. Per sbloccarlo bisogna aggiungere `skills.sh`
  agli host consentiti nelle impostazioni di rete dell'ambiente.
- **Accesso GitHub** (verificato 2026-11-15): limitato al repository `abdi311/Ecl-receptionist-`.
- **Strumenti presenti:** Node.js 22, Claude Code CLI, Chromium + Playwright.

## Il repository

- Nome GitHub: `abdi311/Ecl-receptionist-`. Branch predefinito: `main`.
- Lavoro Claude sempre su branch `claude/...`; niente PR senza richiesta esplicita.
- Commit con le righe di attribuzione indicate dalla sessione.

## Preferenze di lavoro dell'utente

- Lingua: sempre italiano (regola in `CLAUDE.md`).
- Prima di installare skill di terzi serve la sua approvazione.
- Vuole vedere i file proposti prima che venga creata una Pull Request.
