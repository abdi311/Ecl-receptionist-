#!/usr/bin/env python3
"""Confronta dump di centraline (EEPROM/Flash) byte per byte.

Uso:
    python3 confronta_dump.py file.bin                # info su un solo file
    python3 confronta_dump.py file_a.bin file_b.bin   # confronto

Stampa dimensione, SHA-256, se il dump sembra vuoto (tutto 0xFF o 0x00) e le zone diverse.
Codice di uscita: 0 = identici (o singolo file plausibile), 1 = diversi o dump vuoto, 2 = errore.
Non modifica mai i file.
"""
import hashlib
import sys

MAX_ZONE = 50


def info(path, data):
    sha = hashlib.sha256(data).hexdigest()
    vuoto = None
    if data and data.count(0xFF) == len(data):
        vuoto = "tutto FF (lettura vuota o memoria cancellata)"
    elif data and data.count(0x00) == len(data):
        vuoto = "tutto 00 (lettura probabilmente fallita)"
    elif not data:
        vuoto = "file di 0 byte"
    ff = data.count(0xFF) / len(data) * 100 if data else 0
    print(f"{path}")
    print(f"  dimensione: {len(data)} byte (0x{len(data):X})")
    print(f"  SHA-256:    {sha}")
    print(f"  byte FF:    {ff:.1f}%")
    if vuoto:
        print(f"  ATTENZIONE: {vuoto}")
    return vuoto is None


def zone_diverse(a, b):
    zone, inizio = [], None
    n = min(len(a), len(b))
    for i in range(n):
        if a[i] != b[i]:
            if inizio is None:
                inizio = i
        elif inizio is not None:
            zone.append((inizio, i - 1))
            inizio = None
    if inizio is not None:
        zone.append((inizio, n - 1))
    return zone


def main(argv):
    if len(argv) not in (2, 3):
        print(__doc__)
        return 2
    try:
        dati = [open(p, "rb").read() for p in argv[1:]]
    except OSError as e:
        print(f"Errore: {e}")
        return 2

    ok = all(info(p, d) for p, d in zip(argv[1:], dati))
    if len(dati) == 1:
        return 0 if ok else 1

    a, b = dati
    print()
    if len(a) != len(b):
        print(f"DIMENSIONI DIVERSE: {len(a)} vs {len(b)} byte. Confronto solo la parte comune.")
    zone = zone_diverse(a, b)
    byte_diversi = sum(f - i + 1 for i, f in zone)
    if not zone and len(a) == len(b):
        print("IDENTICI: i due file coincidono byte per byte.")
        return 0 if ok else 1
    print(f"DIVERSI: {byte_diversi} byte in {len(zone)} zone.")
    for i, f in zone[:MAX_ZONE]:
        print(f"  0x{i:08X} - 0x{f:08X}  ({f - i + 1} byte)")
    if len(zone) > MAX_ZONE:
        print(f"  ... altre {len(zone) - MAX_ZONE} zone")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
