#!/usr/bin/env python3
"""DCA simulato BTC + HYPE (solo carta, nessun ordine reale).

  python3 trader/crypto/dca.py backtest [--weeks 12|26|52]   # come sarebbe andato il piano nel passato
  python3 trader/crypto/dca.py buy                           # registra l'acquisto simulato di questa settimana
  python3 trader/crypto/dca.py status                        # posizione simulata a prezzi attuali

Prezzi: Yahoo Finance (chart v8, giornaliero). Regole in dca-plan.json, registro in ledger.csv.
"""
import csv, datetime as dt, json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = json.load(open(os.path.join(HERE, "dca-plan.json")))
LEDGER = os.path.join(HERE, "ledger.csv")


def closes(symbol, rng="2y"):
    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{symbol}?range={rng}&interval=1d"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.load(r)["chart"]["result"][0]
    out = {}
    for t, c in zip(res["timestamp"], res["indicators"]["quote"][0]["close"]):
        if c is not None:
            out[dt.datetime.fromtimestamp(t, dt.timezone.utc).date()] = c
    return out


def simulate(prices, dates, plan):
    """prices: {asset: {date: close}}; dates: giorni di acquisto. Ritorna (registro, posizione)."""
    fee = plan["commissione_pct"] / 100
    budget = plan["budget_totale_usd"]
    spent, used, rows = 0.0, set(), []
    for d in dates:
        orders = dict(plan["acquisto_settimanale_usd"])
        for i, rule in enumerate(plan["regole_ribasso"]):
            p = prices[rule["asset"]].get(d)
            if p is not None and p < rule["sotto"] and not (rule["una_volta"] and i in used):
                orders[rule["asset"]] = orders.get(rule["asset"], 0) + rule["extra_usd"]
                used.add(i)
        for asset, usd in orders.items():
            usd = min(usd, budget - spent)
            p = prices[asset].get(d)
            if usd <= 0 or p is None:
                continue
            qty = usd * (1 - fee) / p
            spent += usd
            rows.append({"data": d.isoformat(), "asset": asset, "usd": round(usd, 2),
                         "prezzo": round(p, 4), "quantita": qty})
    return rows


def summary(rows, last):
    pos = {}
    for r in rows:
        a = pos.setdefault(r["asset"], {"usd": 0.0, "qty": 0.0})
        a["usd"] += float(r["usd"]); a["qty"] += float(r["quantita"])
    tot_in = tot_val = 0.0
    print(f"{'asset':6}{'investito':>12}{'quantita':>16}{'prezzo medio':>14}{'prezzo ora':>12}{'valore':>12}{'P/L %':>8}")
    for asset, a in pos.items():
        val = a["qty"] * last[asset]
        tot_in += a["usd"]; tot_val += val
        avg = a["usd"] / a["qty"]
        print(f"{asset:6}{a['usd']:>12,.2f}{a['qty']:>16.6f}{avg:>14,.2f}{last[asset]:>12,.2f}{val:>12,.2f}{(val/a['usd']-1)*100:>8.1f}")
    if tot_in:
        print(f"{'TOTALE':6}{tot_in:>12,.2f}{'':>16}{'':>14}{'':>12}{tot_val:>12,.2f}{(tot_val/tot_in-1)*100:>8.1f}")
    return tot_in, tot_val


def load_prices(rng="2y"):
    return {a: closes(s, rng) for a, s in PLAN["simboli_yahoo"].items()}


def cmd_backtest(weeks):
    prices = load_prices()
    common = sorted(set(prices["BTC"]) & set(prices["HYPE"]))
    end = common[-1]
    mondays = [d for d in common if d.weekday() == 0 and d > end - dt.timedelta(weeks=weeks)]
    plan = dict(PLAN)
    # budget proporzionale alla durata, cosi un backtest lungo non si ferma a budget finito
    plan["budget_totale_usd"] = PLAN["budget_totale_usd"] * len(mondays) / PLAN["settimane"]
    rows = simulate(prices, mondays, plan)
    last = {a: prices[a][end] for a in prices}
    print(f"Backtest {len(mondays)} lunedi, {mondays[0]} -> {mondays[-1]}, valutato al {end}")
    tin, tval = summary(rows, last)
    extra = [r for r in rows if float(r["usd"]) not in (plan["acquisto_settimanale_usd"]["BTC"], plan["acquisto_settimanale_usd"]["HYPE"])]
    print(f"Acquisti extra sui ribassi: {len(extra)}")
    # confronto: tutto al primo lunedi con la stessa cifra e lo stesso 80/20
    w = plan["acquisto_settimanale_usd"]; share = {a: w[a] / sum(w.values()) for a in w}
    d0 = mondays[0]
    lump = sum(tin * share[a] * (1 - plan["commissione_pct"] / 100) / prices[a][d0] * last[a] for a in w)
    print(f"Confronto: stessa cifra ({tin:,.0f} $) tutta il {d0} -> {lump:,.2f} $ ({(lump/tin-1)*100:.1f} %)")
    print("Risultato passato su dati Yahoo: non dice nulla sul futuro.")


def cmd_buy():
    prices = load_prices("1mo")
    today = max(set(prices["BTC"]) & set(prices["HYPE"]))
    rows = []
    if os.path.exists(LEDGER):
        rows = list(csv.DictReader(open(LEDGER)))
    if any(r["data"] == today.isoformat() for r in rows):
        print(f"Acquisto del {today} gia registrato."); return
    if len({r["data"] for r in rows}) >= PLAN["settimane"] + 3:
        print("Piano concluso: fai la revisione."); return
    # rispetta le regole "una volta" gia usate e il budget gia speso
    plan = json.loads(json.dumps(PLAN))
    spent = sum(float(r["usd"]) for r in rows)
    plan["budget_totale_usd"] = PLAN["budget_totale_usd"] - spent
    used_flags = {r.get("regola") for r in rows}
    plan["regole_ribasso"] = [x for i, x in enumerate(PLAN["regole_ribasso"]) if str(i) not in used_flags]
    new = simulate(prices, [today], plan)
    base = PLAN["acquisto_settimanale_usd"]
    for r in new:
        r["regola"] = ""
        if float(r["usd"]) > base.get(r["asset"], 0):
            for i, x in enumerate(PLAN["regole_ribasso"]):
                if x["asset"] == r["asset"] and r["prezzo"] < x["sotto"] and str(i) not in used_flags:
                    r["regola"] = str(i)
    write_header = not os.path.exists(LEDGER)
    with open(LEDGER, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["data", "asset", "usd", "prezzo", "quantita", "regola"])
        if write_header: w.writeheader()
        for r in new: w.writerow(r)
    for r in new:
        print(f"SIMULATO {r['data']}: {r['asset']} {r['usd']} $ a {r['prezzo']:,} -> {r['quantita']:.6f}")
    print(f"Speso finora: {spent + sum(float(r['usd']) for r in new):,.2f} di {PLAN['budget_totale_usd']} $")


def cmd_status():
    if not os.path.exists(LEDGER):
        print("Nessun acquisto simulato ancora. Usa: dca.py buy"); return
    rows = list(csv.DictReader(open(LEDGER)))
    prices = load_prices("5d")
    last = {a: prices[a][max(prices[a])] for a in prices}
    print(f"Posizione simulata ({len({r['data'] for r in rows})} settimane), prezzi Yahoo")
    summary(rows, last)


if __name__ == "__main__":
    args = sys.argv[1:] or ["status"]
    if args[0] == "backtest":
        cmd_backtest(int(args[2]) if len(args) > 2 and args[1] == "--weeks" else 12)
    elif args[0] == "buy":
        cmd_buy()
    else:
        cmd_status()
