# ECL Receptionist – Decisioni

Più recenti in cima. Ricostruite dal README e dai commit del 2026-11-07.

### 2026-11-07 – Nessun servizio esterno o a pagamento nel prototipo
- **Decisione:** niente numero reale, WhatsApp Business, riconoscimento/sintesi vocale o LLM a pagamento;
  solo Node.js senza dipendenze.
- **Motivo:** provare il comportamento gratis e in locale prima di collegare servizi reali.
- **Stato:** attiva.

### 2026-11-07 – Regole della prenotazione
- **Decisione:** chiedere sempre nome, veicolo e motivo; proporre al massimo due orari; confermare solo
  dopo aver salvato l'appuntamento.
- **Stato:** attiva.

### 2026-11-07 – WhatsApp risponde solo con il link
- **Decisione:** su WhatsApp nessuna conversazione, solo il link alla pagina di prenotazione.
- **Stato:** attiva.

### 2026-11-07 – Un solo calendario, fuso Europe/Zurich
- **Decisione:** telefono e pagina web usano lo stesso calendario; due clienti non possono prendere lo
  stesso orario.
- **Stato:** attiva.
