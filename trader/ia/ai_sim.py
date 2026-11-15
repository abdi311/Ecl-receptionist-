#!/usr/bin/env python3
"""Simulazioni sul mercato IA (solo analisi, nessun ordine).

  python3 trader/ia/ai_sim.py            # tutto: storico, lump vs DCA, Monte Carlo, scenari
  python3 trader/ia/ai_sim.py --json     # salva anche trader/ia/risultati.json

Prezzi giornalieri da Yahoo Finance (chart v8). Panieri a pesi uguali, ribilanciati ogni giorno.
"""
import datetime as dt, json, math, os, random, statistics as st, sys, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))

PANIERI = {
    "Chip e memoria":      ["NVDA", "AMD", "AVGO", "TSM", "MU"],
    "Cloud (hyperscaler)": ["MSFT", "GOOGL", "AMZN", "META", "ORCL"],
    "Energia e data center": ["VRT", "ETN", "CEG", "VST"],
    "Software IA":         ["PLTR", "NOW", "SNOW"],
    "Cripto IA":           ["TAO22974-USD", "FET-USD", "RENDER-USD"],
    "ETF semiconduttori (SMH)": ["SMH"],
    "Nasdaq 100 (QQQ)":    ["QQQ"],
    "S&P 500 (SPY)":       ["SPY"],
}

PORTAFOGLI = {
    "Prudente":    {"S&P 500 (SPY)": 0.5, "Nasdaq 100 (QQQ)": 0.2, "Cloud (hyperscaler)": 0.2, "ETF semiconduttori (SMH)": 0.1},
    "Bilanciato":  {"Nasdaq 100 (QQQ)": 0.2, "Cloud (hyperscaler)": 0.3, "Chip e memoria": 0.3, "Energia e data center": 0.2},
    "Aggressivo":  {"Chip e memoria": 0.4, "Software IA": 0.25, "Energia e data center": 0.2, "Cripto IA": 0.15},
    "Solo NVDA":   {"NVDA": 1.0},
    "Solo SPY":    {"S&P 500 (SPY)": 1.0},
}


def fetch(sym, rng="5y"):
    url = f"https://query2.finance.yahoo.com/v8/finance/chart/{sym}?range={rng}&interval=1d"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                res = json.load(r)["chart"]["result"][0]
            q = res["indicators"].get("adjclose", [{}])[0].get("adjclose") or res["indicators"]["quote"][0]["close"]
            return {dt.datetime.fromtimestamp(t, dt.timezone.utc).date(): c for t, c in zip(res["timestamp"], q) if c}
        except Exception as e:
            err = e; time.sleep(2)
    print(f"  ! {sym}: {err}"); return {}


def series_returns(px, days):
    """rendimenti tra giorni consecutivi della lista days (None se manca il dato)."""
    out = []
    for a, b in zip(days, days[1:]):
        pa, pb = px.get(a), px.get(b)
        out.append(pb / pa - 1 if pa and pb else None)
    return out


def basket_returns(members, prices, days):
    rs = [series_returns(prices[m], days) for m in members if prices.get(m)]
    out = []
    for i in range(len(days) - 1):
        v = [r[i] for r in rs if r[i] is not None]
        out.append(sum(v) / len(v) if v else None)
    return out


def stats(rets, start_idx=0):
    r = [x for x in rets[start_idx:] if x is not None]
    if len(r) < 20: return None
    eq, peak, mdd = 1.0, 1.0, 0.0
    for x in r:
        eq *= 1 + x; peak = max(peak, eq); mdd = min(mdd, eq / peak - 1)
    yrs = len(r) / 252
    return {"totale": eq - 1, "annuo": eq ** (1 / yrs) - 1 if yrs > 0 else 0,
            "volatilita": st.pstdev(r) * math.sqrt(252), "max_drawdown": mdd, "giorni": len(r)}


def lump_vs_dca(rets, capital=10000, months=12):
    """ultimi 12 mesi: tutto al giorno 0 contro 12 rate mensili uguali (ogni 21 giorni)."""
    r = [x if x is not None else 0 for x in rets[-252:]]
    eq = [1.0]
    for x in r: eq.append(eq[-1] * (1 + x))
    lump = capital * eq[-1]
    rate = capital / months
    dca = sum(rate * eq[-1] / eq[i * 21] for i in range(months))
    return lump, dca


def monte_carlo(rets, n=10000, days=252, drift_annuo=None, seed=7):
    r = [x for x in rets if x is not None]
    if drift_annuo is not None:   # stessa volatilita, rendimento atteso spostato
        mu_now = st.mean(r); mu_new = (1 + drift_annuo) ** (1 / 252) - 1
        r = [x - mu_now + mu_new for x in r]
    rnd = random.Random(seed); block = 10; finals = []; dd30 = 0
    for _ in range(n):
        eq, peak, hit = 1.0, 1.0, False
        for _ in range(days // block):
            s = rnd.randrange(0, len(r) - block)
            for x in r[s:s + block]:
                eq *= 1 + x; peak = max(peak, eq)
                if eq / peak < 0.7: hit = True
        finals.append(eq - 1); dd30 += hit
    finals.sort()
    pct = lambda p: finals[int(p / 100 * (n - 1))]
    return {"p5": pct(5), "p25": pct(25), "mediana": pct(50), "p75": pct(75), "p95": pct(95),
            "prob_perdita": sum(f < 0 for f in finals) / n, "prob_calo_30": dd30 / n}


def window_return(rets, days, a, b):
    eq = 1.0
    for d, x in zip(days[1:], rets):
        if a < d <= b and x is not None: eq *= 1 + x
    return eq - 1


def main():
    want_json = "--json" in sys.argv
    tickers = sorted({t for m in PANIERI.values() for t in m} | {"NVDA"})
    print(f"Scarico {len(tickers)} serie da Yahoo (5 anni)...")
    prices = {t: fetch(t) for t in tickers}
    days = sorted(prices["SPY"])            # giorni di borsa USA
    end = days[-1]
    idx = lambda d: next(i for i, x in enumerate(days) if x >= d)
    R = {name: basket_returns(m, prices, days) for name, m in PANIERI.items()}
    R["NVDA"] = basket_returns(["NVDA"], prices, days)
    for pname, w in PORTAFOGLI.items():
        R[pname] = [sum(w[k] * (R[k][i] if R[k][i] is not None else 0) for k in w) for i in range(len(days) - 1)]

    out = {"data": end.isoformat(), "storico": {}, "lump_dca": {}, "montecarlo": {}, "scenari": {}}
    print(f"\nDati fino al {end}. Pesi uguali dentro ogni paniere, ribilanciati ogni giorno.\n")

    print("1) STORICO  (rend. totale | annuo | volatilita | massimo calo)")
    for k in list(PANIERI) + list(PORTAFOGLI):
        row = {}
        for label, years in (("1a", 1), ("3a", 3), ("5a", 5)):
            s = stats(R[k], max(0, len(R[k]) - 252 * years))
            row[label] = s
        out["storico"][k] = row
        f = lambda s: "   n.d.  " if not s else f"{s['totale']*100:+8.0f}%"
        s3 = row["3a"] or row["1a"]
        print(f"  {k:26} 1a{f(row['1a'])}  3a{f(row['3a'])}  5a{f(row['5a'])}   vol {s3['volatilita']*100:4.0f}%  calo max(3a) {s3['max_drawdown']*100:4.0f}%")

    print("\n2) ULTIMI 12 MESI su 10.000 $: tutto subito contro 12 rate mensili")
    for k in PORTAFOGLI:
        l, d = lump_vs_dca(R[k]); out["lump_dca"][k] = {"tutto_subito": l, "dca": d}
        print(f"  {k:12} tutto subito {l:9,.0f} $   DCA {d:9,.0f} $")

    print("\n3) MONTE CARLO 12 mesi, 10.000 percorsi (blocchi di 10 giorni presi dagli ultimi 3 anni)")
    print("   A = rendimenti come negli ultimi 3 anni (ottimista);  B = stessa volatilita, rendimento atteso 8%/anno")
    last3 = lambda r: r[-756:]
    for k in PORTAFOGLI:
        a = monte_carlo(last3(R[k])); b = monte_carlo(last3(R[k]), drift_annuo=0.08)
        out["montecarlo"][k] = {"A_storico": a, "B_neutro": b}
        for lab, m in (("A", a), ("B", b)):
            print(f"  {k:12} {lab}: 5% {m['p5']*100:+5.0f}%  mediana {m['mediana']*100:+5.0f}%  95% {m['p95']*100:+6.0f}%"
                  f"   P(perdita) {m['prob_perdita']*100:3.0f}%   P(calo -30% in corso d'anno) {m['prob_calo_30']*100:3.0f}%")

    print("\n4) SCENARI DI CRISI")
    scen = {"Orso 2022 (3 gen - 14 ott 2022)": (dt.date(2022, 1, 3), dt.date(2022, 10, 14)),
            "DeepSeek + dazi (24 gen - 7 apr 2025)": (dt.date(2025, 1, 24), dt.date(2025, 4, 7))}
    for sname, (a, b) in scen.items():
        print(f"  {sname}")
        out["scenari"][sname] = {}
        for k in PORTAFOGLI:
            v = window_return(R[k], days, a, b); out["scenari"][sname][k] = v
            print(f"    {k:12} {v*100:+6.0f}%")
    beta = {}
    spy = R["S&P 500 (SPY)"][-756:]
    for k in PORTAFOGLI:
        x = R[k][-756:]; pairs = [(p, q) for p, q in zip(x, spy) if p is not None and q is not None]
        mx = st.mean(p for p, _ in pairs); my = st.mean(q for _, q in pairs)
        cov = sum((p - mx) * (q - my) for p, q in pairs) / len(pairs); var = st.pvariance([q for _, q in pairs])
        beta[k] = cov / var
    print("  Ipotesi 'scoppio bolla IA' (nel 2000-2002 il Nasdaq perse il 78%)")
    print("  stima con la sensibilita' (beta) al mercato degli ultimi 3 anni, mercato S&P -40%:")
    out["scenari"]["Scoppio bolla (S&P -40%)"] = {}
    for k in PORTAFOGLI:
        v = max(-0.95, beta[k] * -0.40); out["scenari"]["Scoppio bolla (S&P -40%)"][k] = v
        print(f"    {k:12} beta {beta[k]:.2f}  -> {v*100:+5.0f}%")

    if want_json:
        json.dump(out, open(os.path.join(HERE, "risultati.json"), "w"), indent=1, default=str)
        print("\nSalvato trader/ia/risultati.json")
    print("\nSimulazioni su dati passati: descrivono rischi e intervalli, non prevedono il futuro.")


if __name__ == "__main__":
    main()
