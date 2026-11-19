# Conoscenze

Fatti stabili e verificati. Ogni voce indica quando è stata verificata.

## Ambiente Cloud di Claude Code

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
- **Ambiente "Codifica chiavi (manuali)"** (creato 2026-11-19): consente cdn.shopify.com, autel.us,
  magicmotorsport.shop, obdexpress.co.uk, manuals.plus, manualslib, manualshive e alcuni blog Xhorse/OBDSTAR.
  Scribd non è consentito. Il PC dell'utente non è collegato in Remote Control (nessuna cartella condivisa).
- **PDF:** `pdftotext` è installato e serve per leggere i manuali scaricati.
- **Strumenti presenti:** Node.js 22, Claude Code CLI, Chromium + Playwright.

## Il repository

- Nome GitHub: `abdi311/Ecl-receptionist-`. Branch predefinito: `main`.
- Lavoro Claude sempre su branch `claude/...`; niente PR senza richiesta esplicita.
- Commit con le righe di attribuzione indicate dalla sessione.

## Preferenze di lavoro dell'utente

- Lingua: sempre italiano (regola in `CLAUDE.md`).
- Prima di installare skill di terzi serve la sua approvazione.
- Vuole vedere i file proposti prima che venga creata una Pull Request.
