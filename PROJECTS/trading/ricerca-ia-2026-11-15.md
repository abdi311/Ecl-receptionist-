# Ricerca mercato IA – 15 novembre 2026

Analisi e simulazioni, **non consigli finanziari**. Prezzi Yahoo Finance fino al 13/11/2026; notizie da
fonti web secondarie (elenco in fondo), spesso discordanti. Script: `trader/ia/ai_sim.py`,
risultati grezzi: `trader/ia/risultati.json`.

## 1. Dove siamo

- **La spesa continua a salire.** Hyperscaler (Microsoft, Amazon, Alphabet, Meta, Oracle): 635–830 mld $
  di investimenti nel 2026 a seconda delle stime; per il 2027 si parla di ~1.000 mld $ solo di infrastruttura IA.
  Le previsioni sono state alzate in continuazione da gennaio (+50 % sul 2026, +75 % sul 2027).
- **Dove vanno i soldi:** circa metà in GPU e memoria HBM; la memoria è il collo di bottiglia
  (HBM da 7 a ~55 mld $ in un anno, carenza attesa fino al 2028-29). L'energia è il secondo vincolo
  (Citi: 19 GW nuovi nel 2026, 29 nel 2027, 45 nel 2028).
- **Modelli:** Anthropic ha superato OpenAI per valutazione (965 mld $ a maggio) e quota di spesa aziendale;
  OpenAI resta prima tra i consumatori ma con forti perdite. Possibili IPO tra fine 2026 e 2027.
- **Il punto debole:** il finanziamento. Parte della spesa è a debito, ci sono accordi "circolari"
  (chi vende i chip finanzia chi li compra), e il flusso di cassa di Meta è crollato. Morgan Stanley stima
  che i flussi di cassa coprano solo metà dei ~3.000 mld $ previsti fino al 2028.
- **Novembre 2026:** titoli IA in calo (NVDA −9,3 % il 5/11, il calo giornaliero più forte in un anno).
  **Il 17/11 escono i conti di Nvidia**: le opzioni prezzano un movimento di circa ±10 %.

## 2. Le aree in cui si può investire

| Paniere (pesi uguali) | Titoli | 1 anno | 3 anni | Volatilità | Calo max (3a) |
|---|---|---|---|---|---|
| Chip e memoria | NVDA, AMD, AVGO, TSM, MU | +60 % | +483 % | 44 % | −36 % |
| Cloud (hyperscaler) | MSFT, GOOGL, AMZN, META, ORCL | −2 % | +90 % | 26 % | −26 % |
| Energia e data center | VRT, ETN, CEG, VST | −5 % | +238 % | 46 % | −49 % |
| Software IA | PLTR, NOW, SNOW | −11 % | +187 % | 44 % | −49 % |
| Cripto IA | TAO, FET, RENDER | −37 % | +11 % | 99 % | −86 % |
| ETF semiconduttori | SMH | +37 % | +226 % | 38 % | −36 % |
| Nasdaq 100 | QQQ | +10 % | +85 % | 21 % | −23 % |
| S&P 500 | SPY | +12 % | +79 % | 15 % | −19 % |

Lettura: nell'ultimo anno il denaro è andato su **chip e memoria** (chi vende le "pale" della corsa all'oro);
cloud, software e cripto IA sono rimasti indietro. Chi spende (hyperscaler) è premiato meno di chi incassa.

## 3. Portafogli simulati

| Portafoglio | Composizione |
|---|---|
| Prudente | 50 % SPY, 20 % QQQ, 20 % Cloud, 10 % SMH |
| Bilanciato | 20 % QQQ, 30 % Cloud, 30 % Chip, 20 % Energia |
| Aggressivo | 40 % Chip, 25 % Software IA, 20 % Energia, 15 % Cripto IA |
| Solo NVDA | 100 % Nvidia |
| Solo SPY | 100 % S&P 500 (termine di paragone) |

### Storico
| | 1 anno | 3 anni | 5 anni | Volatilità | Calo max (3a) |
|---|---|---|---|---|---|
| Prudente | +12 % | +97 % | +95 % | 19 % | −22 % |
| Bilanciato | +18 % | +215 % | +286 % | 30 % | −32 % |
| Aggressivo | +18 % | +336 % | +464 % | 38 % | −37 % |
| Solo NVDA | −16 % | +251 % | +445 % | 47 % | −37 % |
| Solo SPY | +12 % | +79 % | +73 % | 15 % | −19 % |

### Ultimi 12 mesi, 10.000 $: tutto subito contro 12 rate mensili
Prudente 11.150 / 10.441 · Bilanciato 11.827 / 10.593 · Aggressivo 11.779 / 11.003 ·
Solo NVDA 8.423 / 8.191 · SPY 11.158 / 10.564. In un anno al rialzo l'acquisto unico ha reso di più;
il DCA serve a ridurre il rischio di entrare nel momento sbagliato, non ad aumentare il rendimento.

### Monte Carlo, prossimi 12 mesi (10.000 percorsi)
A = come gli ultimi 3 anni (ottimista). B = stessa volatilità, rendimento atteso 8 %/anno (più realistico).

| | Scenario | Peggior 5 % | Mediana | Miglior 5 % | Prob. di perdere | Prob. di un calo del 30 % durante l'anno |
|---|---|---|---|---|---|---|
| Prudente | A | −7 % | +25 % | +64 % | 11 % | 1 % |
| | B | −21 % | +6 % | +39 % | 38 % | 5 % |
| Bilanciato | A | −8 % | +46 % | +125 % | 9 % | 9 % |
| | B | −35 % | +3 % | +59 % | 45 % | 33 % |
| Aggressivo | A | −12 % | +61 % | +185 % | 9 % | 25 % |
| | B | −46 % | 0 % | +76 % | 51 % | 58 % |
| Solo NVDA | A | −23 % | +58 % | +216 % | 14 % | 44 % |
| | B | −51 % | +1 % | +102 % | 49 % | 72 % |
| Solo SPY | A | −4 % | +21 % | +49 % | 8 % | 0 % |
| | B | −15 % | +7 % | +31 % | 31 % | 1 % |

### Scenari di crisi
| | Orso 2022 | DeepSeek + dazi (gen–apr 2025) | Bolla che scoppia (S&P −40 %, stima con beta) |
|---|---|---|---|
| Prudente | −31 % | −20 % | −49 % |
| Bilanciato | −36 % | −30 % | −66 % |
| Aggressivo | −52 % | −36 % | −78 % |
| Solo NVDA | −63 % | −32 % | −81 % |
| Solo SPY | −24 % | −17 % | −40 % |

## 4. Conclusioni

1. **Il ciclo IA è reale e i soldi spesi sono enormi**, ma il mercato premia ormai solo chi incassa
   (chip, memoria) e dubita di chi spende (cloud) e di chi deve ancora dimostrare ricavi (software, cripto IA).
2. **Più IA = più rischio, in modo quasi proporzionale.** Il portafoglio Aggressivo nel caso realistico (B)
   ha una mediana ~0 % e più di una possibilità su due di passare per un −30 % nel corso dell'anno.
3. **Concentrarsi su un solo titolo (NVDA) è la scelta più rischiosa**: stessi rendimenti attesi dei panieri
   con oscillazioni molto più forti.
4. **Le cripto IA finora non hanno seguito il boom delle azioni IA** (+11 % in 3 anni contro +483 % dei chip, calo max −86 %).
5. **Le cose da guardare a breve:** conti Nvidia 17/11, investimenti annunciati per il 2027, costo del
   debito, prezzi della memoria, IPO di Anthropic/OpenAI.

Un modo ragionevole per esporsi: base larga (SPY/QQQ), una parte IA tramite ETF (SMH) o panieri invece
che titoli singoli, ingressi graduali, e una quota IA che si possa sopportare anche con un −50/−60 %.

## Fonti
- [Motley Fool – Nvidia 17/11](https://www.fool.com/investing/2026/11/01/prediction-nvidia-stock-is-going-to-soar-after-dat/), [Motley Fool – stime capex](https://www.fool.com/investing/2026/11/12/great-news-nvidia-micron-broadcom-amd-wall-street-mistake/), [24/7 Wall St.](https://247wallst.com/investing/2026/10/20/ai-chip-stocks-bounce-back-as-hyperscaler-earnings-loom-meta-equity-raise-in-focus/), [economy.com.pk](https://economy.com.pk/nvidia-after-the-selloff-what-to-watch-before-earnings/), [AL Capital](https://alcapitaladvisory.com/research/intelligence/ai-infrastructure.html), [PrimeXBT](https://primexbt.com/for-traders/ai-stocks/)
- [Deloitte – memoria](https://www.deloitte.com/us/en/insights/industry/technology/why-memory-chip-crunch-is-greater-than-expected.html), [Software Strategies – previsioni](https://softwarestrategiesblog.com/2026/10/22/ai-infrastructure-spending-forecasts-compared-gartner-idc-delloro-goldman-sachs-2030/), [Introl](https://introl.com/blog/hyperscaler-capex-600b-ai-infrastructure-debt-financing-2026), [EnkiAI](https://enkiai.com/data-center/ai-infrastructure-2026-551b-memory/)
- [Invezz – Anthropic](https://invezz.com/news/2026/05/30/the-new-ai-king-how-anthropic-eclipsed-openais-valuation-and-leapt-to-965b/), [TradingKey – IPO](https://www.tradingkey.com/analysis/stocks/us-stocks/262124033-openai-vs-anthropic-ai-unicorn-ipo-race-tradingkey), [MarketScale](https://www.marketscale.com/industries/software-and-technology/three-fault-lines-reshaping-enterprise-ai-in-2026-adoption-cost-and-security)
- [NPR – bolla](https://npr.org/2025/11/23/nx-s1-5615410/ai-bubble-nvidia-openai-revenue-bust-data-centers), [UBS](https://www.ubs.com/global/en/wealthmanagement/insights/chief-investment-office/house-view/daily/2025/latest-10102025.html), [Outlook Business](https://www.outlookbusiness.com/explainers/inside-the-ai-bubble-how-openai-nvidia-are-weaving-a-web-of-circular-deals)
