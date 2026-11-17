# Ambiente Claude – Decisioni

Più recenti in cima. Decisioni generali (memoria, lingua, prima le skill) in
[.claude/memory/decisioni.md](../../.claude/memory/decisioni.md).

### 2026-11-17 – Plugin ECC (Everything Claude Code) installato
- **Decisione:** installare `ecc@ecc` da [affaan-m/ECC](https://github.com/affaan-m/ECC) (v2.2.3, MIT),
  ambito `project` (l'utente lo vuole permanente), hook `minimal` (consigliato; l'utente non ha scelto).
- **Come:** `npx --package ecc-universal ecc setup --mode claude-plugin --scope project --hooks minimal`,
  dopo anteprima `--dry-run` e conferma dell'utente. Risultato: `.claude/settings.json`.
- **Note:** 327 skill, 72 agenti, 98 comandi, hook automatici, server MCP `chrome-devtools`. Le
  dipendenze npm del plugin non sono state installate (il suo `package.json` usa `overrides`).
  Il profilo hook `minimal` è salvato fuori dal repository: nelle sessioni nuove potrebbe valere il
  profilo predefinito di ECC.
- **Stato:** attiva.

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
- **Lacuna:** nessuna skill seria per flash/rimappatura ECU → proposta skill su misura legata al Metodo ECL.
- **Stato:** in attesa.
