# Ambiente Claude – Cronologia

Più recente in cima.

### 2026-11-17
- Riepilogo per l'utente di skill installate e configurazione dell'ambiente Cloud (Default, rete limitata).
- `/plugin` non disponibile in Cloud: installato ECC con l'installer npm ufficiale (anteprima, poi conferma).
- Creato `.claude/settings.json` (marketplace ECC + plugin `ecc@ecc` attivo).
- Installata la skill `teardown` (elvarofficial/teardown) in `.claude/skills/` su richiesta dell'utente; il nome digitato (`elvairofficial`) era sbagliato, confermato quello giusto; codice controllato prima.
- Provata `teardown`: costruito il simulatore V8 interattivo (esempio della skill), controllato a fotogrammi, inviato all'utente.
- Installata la skill `ai-video` (0xadvait/ai-video-skill) in `.claude/skills/`; codice controllato prima.

### 2026-11-15
- Installata `find-skills` (vercel-labs/skills).
- Aggiunta regola "prima le skill" in `CLAUDE.md`, poi regola "sempre in italiano".
- Ricerca skill per diagnosi auto, ECU, reverse engineering, elettronica (skills.sh bloccato: usata la ricerca web).
- Installata `humanizer` (blader/humanizer) su richiesta dell'utente; controllato il contenuto: solo istruzioni, licenza MIT.
- Creato il sistema di memoria permanente; copiate `find-skills` e `humanizer` in `.claude/skills/`.
- Verificato il recupero della memoria da una sessione nuova su clone pulito; aperta PR #2 verso `main`.
- PR #2 unita a `main` da Claude su richiesta esplicita dell'utente (l'app GitHub mobile mostrava "Unable to merge").

### 2026-11-08
- Aggiunte 11 skill Founder (da `Jakeschincariol/founder-skill`, commit `fd9385b`) in `.claude/skills/`
  sul branch `claude/founder-skill-installation-80u0uy`; aperta PR #1.
