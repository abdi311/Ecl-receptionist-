# Ambiente Claude – Decisioni

Più recenti in cima. Decisioni generali (memoria, lingua, prima le skill) in
[.claude/memory/decisioni.md](../../.claude/memory/decisioni.md).

### 2026-11-15 – Skill su misura `metodo-ecl-centraline`
- **Decisione:** skill nuova, separata da `metodo-ecl`, per i lavori sulle centraline: clonazione/sostituzione,
  riparazione, aggiornamento software, rimappatura prestazioni. Strumenti: programmatori EEPROM,
  Autotuner/Flex/PCMFlash, WinOLS + HxD. Risultato: checklist con cancelli + scheda lavoro.
- **Regole chiave:** guasto dimostrato prima; nessuna scrittura senza due letture identiche; checksum verificati;
  conferma esplicita prima di scrivere; mai togliere sistemi antinquinamento; immobilizer solo stesso veicolo.
- **Motivo:** nessuna skill seria disponibile su skills.sh per flash/rimappatura.
- **Stato:** attiva (bozza in revisione).

### 2026-11-15 – Nessuna skill di memoria di terzi
- **Decisione:** sistema di memoria scritto su misura invece di skill come Memory Kit o claude-memory-kit.
- **Motivo:** skills.sh non è raggiungibile per verificarle; le richieste dell'utente (struttura
  `PROJECTS/`, GitHub come archivio) sono specifiche; i file Markdown bastano e non richiedono installazioni.
- **Stato:** attiva.

### 2026-11-15 – Skill per diagnosi auto, ECU, reverse engineering, elettronica
- **Decisione:** nessuna installata; in attesa di approvazione dell'utente.
- **Candidati consigliati** (dati da siti terzi, non verificati):
  - `mitsuhiko/agent-stuff` → `ghidra` (reverse engineering) – scelta migliore.
  - `aklofas/kicad-happy` → `kicad` (elettronica, PCB).
  - `zhinkgit/embeddedskills` → `can` (CAN bus).
  - `a5c-ai/babysitter` → `uds-diagnostics` (diagnostica UDS).
- **Da evitare:** `washabii14/automotive-embedded-skills` (file offuscato ad alto rischio);
  `aradotso/.../s800-vehicle-network-security-testing` (penetration test, non diagnosi).
- **Lacuna:** nessuna skill seria per flash/rimappatura ECU → risolta il 2026-11-15 con la skill su misura `metodo-ecl-centraline`.
- **Stato:** in attesa.
