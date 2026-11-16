"""Porta attrezzi da saldatura a forma di motore V6 (versione 2: motore completo).

I 6 pozzetti candela, che passano attraverso coperchi, teste e blocco, sono i porta attrezzi
(pinzette, cacciaviti, pennelli...). Il collettore di aspirazione ha 12 fori per le punte del saldatore.
Genera:
  porta_attrezzi_V6.stl / .3mf    pezzo unico da stampare
  render/parti/*.stl              parti separate, solo per i render a colori
  render/assi.json                assi dei pozzetti (per mettere gli attrezzi nei render)
Unità: mm.  Uso: python3 genera_v6.py
"""
import json, os
import numpy as np, trimesh
from manifold3d import Manifold, CrossSection

SEG = 128
TILT = 30                       # bancate a V di 60°
ZC = 30                         # altezza asse albero motore
STAGGER = 12                    # sfasamento bancata sinistra
XS_R = [10, 60, 110]            # cilindri bancata destra
XS_L = [x + STAGGER for x in XS_R]
X0, X1 = -28, 142               # lunghezza blocco
D = 85                          # piano blocco (lungo l'asse cilindro)
HEAD_T, COV_T = 24, 19          # spessore testa, coperchio
U_HEAD, U_COV = D + HEAD_T, D + HEAD_T + COV_T
BORE_R, BORE_DEPTH = 17, 88     # pozzetto Ø34, profondo 88
PAN_TOP = 26
FRONT = -34                     # faccia anteriore coperchio distribuzione


def box(x0, x1, y0, y1, z0, z1):
    return Manifold.cube([x1 - x0, y1 - y0, z1 - z0]).translate([x0, y0, z0])


def along_x(m, x0=0.0):
    """Porta un solido costruito lungo Z (sezione in XY) ad avere l'asse lungo X (sezione in YZ)."""
    return m.transform([[0, 0, 1, x0], [1, 0, 0, 0], [0, 1, 0, 0]])


def teardrop(r, y, z, segs=SEG):
    """Sezione a goccia (punta in basso a 45°): tubi orizzontali stampabili senza supporti."""
    a = np.linspace(0, 2 * np.pi, segs, endpoint=False)
    pts = [(y + r * np.cos(t), z + r * np.sin(t)) for t in a] + [(y, z - r * np.sqrt(2))]
    return CrossSection([pts]).hull()


def pipe_x(r, y, z, x0, x1, tear=True):
    cs = teardrop(r, y, z) if tear else CrossSection.circle(r, SEG).translate([y, z])
    return along_x(Manifold.extrude(cs, x1 - x0), x0)


def disc_x(r, y, z, x0, x1):
    return along_x(Manifold.cylinder(x1 - x0, r, r, SEG).translate([y, z, 0]), x0)


def to_bank(m, side):
    """Locale bancata: x, v (fuori), u (asse cilindro) -> mondo."""
    m = m.rotate([-TILT, 0, 0]).translate([0, 0, ZC])
    return m if side > 0 else m.mirror([0, 1, 0])


def local_pt(side, x, v, u):
    a = np.radians(TILT)
    y = u * np.sin(a) + v * np.cos(a)
    z = ZC + u * np.cos(a) - v * np.sin(a)
    return np.array([x, y * side, z])


# ------------------------------------------------------------------ bancata
def bank_parts(side, xs):
    p = {}
    # blocco cilindri con nervature laterali
    blk = box(X0, X1, -31, 31, -40, D)
    for xr in np.linspace(X0 + 14, X1 - 14, 7):
        blk += box(xr - 2, xr + 2, 31, 33.5, 10, D - 4)          # nervature
    for x in xs:                                                # tappi di fusione
        blk += Manifold.cylinder(2, 7, 7, 48).rotate([-90, 0, 0]).translate([x, 31, 52])
    p["blocco"] = blk
    # testa con guarnizione e porte di scarico
    head = box(X0, X1, -33, 33, D + 1.2, U_HEAD)
    head += box(X0 + 1, X1 - 1, -32, 32, D, D + 1.2)               # linea guarnizione
    p["testa"] = head
    # coperchio punterie smussato con flangia e viti
    cov = Manifold.batch_hull([box(X0 + 1, X1 - 2, -28, 28, U_HEAD, U_COV - 6),
                               box(X0 + 5, X1 - 6, -23, 23, U_COV - 0.01, U_COV)])
    cov += box(X0 + 1, X1 - 2, -30, 30, U_HEAD, U_HEAD + 3)
    for xb in np.linspace(X0 + 8, X1 - 9, 6):
        for vb in (-29, 29):
            cov += Manifold.cylinder(2.5, 2.6, 2.6, 24).translate([xb, vb, U_HEAD + 3])
    # nervature decorative sui fianchi del coperchio
    for k in range(3):
        cov += Manifold.batch_hull([box(X0 + 6, X1 - 7, 26 - k * 0.01, 28.6, U_HEAD + 5 + k * 3.5, U_HEAD + 6.2 + k * 3.5)])
    for x in xs:                                                # anelli pozzetti candela
        cov += Manifold.cylinder(3, 21.5, 21.5, SEG).translate([x, 0, U_COV])
        cov += Manifold.cylinder(1.2, 21.5, 20.5, SEG).translate([x, 0, U_COV + 3])
    # tappo olio sulla bancata destra
    if side > 0:
        cov += Manifold.cylinder(6, 9, 9, 64).translate([(xs[0] + xs[1]) / 2, 14, U_COV - 8])
        for k in range(8):
            cov += box(-1, 1, -10, -8.5, 0, 6).rotate([0, 0, k * 22.5]).translate([(xs[0] + xs[1]) / 2, 14, U_COV - 2])
    p["coperchio"] = cov
    return {k: to_bank(v, side) for k, v in p.items()}


R = bank_parts(+1, XS_R)
L = bank_parts(-1, XS_L)
parts = {
    "blocco": R["blocco"] + L["blocco"],
    "teste": R["testa"] + L["testa"],
    "coperchi": R["coperchio"] + L["coperchio"],
}

# ------------------------------------------------------------------ basamento e coppa
crank = Manifold.batch_hull([box(X0, X1, -42, 42, PAN_TOP, 40), box(X0, X1, -38, 38, 40, 46)])
valley = box(X0, X1, -26, 26, 60, 122) ^ (parts["blocco"] + box(X0, X1, -16, 16, 60, 122)).hull()
parts["blocco"] = parts["blocco"] + crank + valley
parts["blocco"] = parts["blocco"] ^ box(-300, 300, -300, 300, PAN_TOP, 400)

pan = box(FRONT, X1, -38, 38, 0, 18)
pan += Manifold.batch_hull([box(FRONT, X1, -38, 38, 18, 18.1), box(FRONT, X1, -44, 44, 22.9, 23)])
pan += box(FRONT, X1, -44, 44, 23, PAN_TOP)
for xr in np.linspace(FRONT + 15, X1 - 15, 6):
    pan += box(xr - 1.5, xr + 1.5, -39.5, 39.5, 0, 18)           # nervature coppa
for xb in np.linspace(FRONT + 6, X1 - 6, 9):
    for yb in (-43, 43):
        pan += Manifold.cylinder(2, 2.4, 2.4, 6, ).translate([xb, yb, PAN_TOP])   # viti esagonali
pan += box(X1 - 0.01, X1 + 4, -6, 6, 3, 9)                         # tappo scarico
parts["coppa"] = pan

# ------------------------------------------------------------------ aspirazione
plen = Manifold.batch_hull([box(-8, 128, -15, 15, 112, 146), box(-6, 126, -11, 11, 146, 152)])
runners = Manifold()
for side, xs in ((1, XS_R), (-1, XS_L)):
    for x in xs:
        p0 = [x, side * 9, 146]
        p1 = [x, side * 19, 143]
        port = local_pt(1, x, -33, D + 14)
        p2 = [x, side * port[1], port[2]]
        s = [Manifold.sphere(7, 48).translate(p) for p in (p0, p1, p2)]
        runners += Manifold.batch_hull([s[0], s[1]]) + Manifold.batch_hull([s[1], s[2]])
        runners += Manifold.batch_hull([s[1].translate([0, 0, -18]), s[2].translate([0, 0, -12]), s[1], s[2]])
throttle = pipe_x(13, 0, 134, -24, -8) + pipe_x(15, 0, 134, -27, -24)
intake = plen + runners + throttle
# rail iniettori
intake += pipe_x(3.2, 24, 150, -2, 122, tear=True) + pipe_x(3.2, -24, 150, 10, 134, tear=True)
parts["aspirazione"] = intake

# ------------------------------------------------------------------ scarichi (a goccia)
exh = Manifold()
for side, xs in ((1, XS_R), (-1, XS_L)):
    c = local_pt(1, 0, 46, D + 6)
    yl, zl = side * c[1], c[2] - 6
    log = pipe_x(8, yl, zl, X0 + 2, X1 - 2)
    for x in xs:
        a = local_pt(1, x, 33, D + 12)
        flange = Manifold.cube([18, 1, 12], center=True).rotate([-TILT, 0, 0]).translate(a * [1, 1, 1])
        flange = flange if side > 0 else flange.mirror([0, 1, 0])
        stub = along_x(Manifold.extrude(teardrop(7, yl, zl), 14), x - 7)
        exh += Manifold.batch_hull([flange, stub])
    exh += log
parts["scarichi"] = exh

# ------------------------------------------------------------------ distribuzione, pulegge, cinghia
front_shape = (parts["blocco"] + parts["teste"]).rotate([0, 90, 0]).slice(-X0 - 1)
tc = Manifold.extrude(front_shape.offset(-2.5, ), 6).translate([0, 0, -X0]).rotate([0, -90, 0])
tc += Manifold.extrude(front_shape.offset(-6), 2).translate([0, 0, -X0 + 6]).rotate([0, -90, 0])
tc ^= box(-300, 300, -300, 300, PAN_TOP, 400)
parts["distribuzione"] = tc

PUL = {"albero": (0, 30, 26), "pompa": (0, 84, 16), "alternatore": (-46, 110, 11), "tendicinghia": (34, 72, 10)}
BELT_X = (-55, -45)
pul = Manifold()
y, z, r = PUL["albero"]
pul += along_x(Manifold.extrude(teardrop(r, y, z), 24), -58) ^ box(-300, 300, -300, 300, 0, 400)
for k in range(3):                                                   # gole poly-V
    g = disc_x(r + 1, y, z, -56 + k * 3.2, -54.5 + k * 3.2) - disc_x(r - 1.2, y, z, -60, -40)
    pul -= g
pul += disc_x(9, y, z, -61, -58) + disc_x(5, y, z, -63, -61)
for name in ("pompa", "alternatore", "tendicinghia"):
    y, z, r = PUL[name]
    pul += disc_x(r, y, z, -57, -43) + disc_x(r * 0.45, y, z, -60, -57)
y, z, r = PUL["pompa"]
pul += disc_x(12, y, z, -43, FRONT)                                 # corpo pompa acqua
y, z, r = PUL["alternatore"]
alt = Manifold.batch_hull([disc_x(21, y, z, -43, FRONT + 0.01), disc_x(19, y, z, -44, -43)])
for k in range(6):
    alt -= box(-41, -36, -1, 1, -23, 23).rotate([k * 30, 0, 0]).translate([0, y, z]) - disc_x(16, y, z, -60, 0)
alt += Manifold.batch_hull([box(FRONT - 4, FRONT, y - 6, y + 6, z - 40, z - 10), disc_x(6, y, z - 18, FRONT - 4, FRONT)])
pul += alt
y, z, r = PUL["tendicinghia"]
pul += Manifold.batch_hull([disc_x(5, y, z, -43, FRONT), disc_x(5, y - 14, z + 20, -43, FRONT)])
parts["pulegge"] = pul

centers = [CrossSection.circle(r + 2.2, SEG).translate([y, z]) for (y, z, r) in PUL.values()]
inner = [CrossSection.circle(r, SEG).translate([y, z]) for (y, z, r) in PUL.values()]
belt_cs = CrossSection.batch_hull(centers) - CrossSection.batch_hull(inner)
belt = along_x(Manifold.extrude(belt_cs, BELT_X[1] - BELT_X[0]), BELT_X[0])
parts["cinghia"] = belt ^ box(-300, 300, -300, 300, 0, 400)

# ------------------------------------------------------------------ filtro olio e flangia posteriore
fy = 58
filt = Manifold.cylinder(30, 13, 13, SEG).translate([96, fy, 0])
filt += Manifold.cylinder(3, 13, 11, SEG).translate([96, fy, 30])
for k in range(16):
    filt -= Manifold.cylinder(26, 1.1, 1.1, 16).translate([96 + 13 * np.cos(k * np.pi / 8), fy + 13 * np.sin(k * np.pi / 8), 3])
filt += Manifold.batch_hull([Manifold.cylinder(4, 10, 10, SEG).translate([96, fy, 32]), box(86, 106, 40, 42, 32, 46)])
parts["filtro"] = filt

rear = (parts["blocco"] + parts["teste"] + parts["coppa"]).rotate([0, 90, 0]).slice(-X1 + 1)
fl = Manifold.extrude(rear.offset(2, ), 6).translate([0, 0, -X1 - 6]).rotate([0, -90, 0])
parts["blocco"] = parts["blocco"] + (fl ^ box(-300, 300, -300, 300, 0, 400))

# ------------------------------------------------------------------ fori (pozzetti candela, punte saldatore)
holes = Manifold()
axes = []
for side, xs in ((1, XS_R), (-1, XS_L)):
    for x in xs:
        holes += to_bank(Manifold.cylinder(BORE_DEPTH + 10, BORE_R, BORE_R, SEG).translate([x, 0, U_COV + 4.2 - BORE_DEPTH]), side)
        top = local_pt(side, x, 0, U_COV + 4.2)
        bot = local_pt(side, x, 0, U_COV + 4.2 - BORE_DEPTH)
        axes.append({"top": top.tolist(), "bottom": bot.tolist()})
tips = []
for i in range(6):
    for yy in (-6.5, 6.5):
        xx = 4 + i * 14 + (7 if yy > 0 else 0)
        holes += Manifold.cylinder(40, 3.4, 3.4, 40).translate([xx, yy, 117])
        tips.append([xx, yy, 152])

# scritta "V6" in rilievo sul collettore (font da matplotlib)
try:
    from matplotlib.textpath import TextPath
    from matplotlib.font_manager import FontProperties
    tp = TextPath((0, 0), "V6", size=15, prop=FontProperties(family="DejaVu Sans", weight="bold"))
    from manifold3d import FillRule
    polys = [np.array(p, dtype=float) for p in tp.to_polygons() if len(p) > 2]
    cs = CrossSection(polys, FillRule.EvenOdd)
    bb = cs.bounds()
    cs = cs.translate([-(bb[0] + bb[2]) / 2, -(bb[1] + bb[3]) / 2]).rotate(-90)
    parts["scritta"] = Manifold.extrude(cs, 3.6).translate([108, 0, 150.4])
except Exception as e:  # noqa
    print("scritta saltata:", e)

for k in parts:
    parts[k] = parts[k] - holes

# ------------------------------------------------------------------ export
def tm(m):
    mm = m.to_mesh()
    return trimesh.Trimesh(mm.vert_properties[:, :3], mm.tri_verts, process=False)

whole = Manifold()
for m in parts.values():
    whole += m
# via le schegge a volume zero nate da facce coincidenti: resta un solo corpo
whole = max(whole.decompose(), key=lambda c: c.volume())
mesh = tm(whole)
off = -mesh.bounds[0]
off[2] = 0
mesh.apply_translation(off)
print("watertight:", mesh.is_watertight, "| corpi:", len(mesh.split(only_watertight=False)),
      "| volume cm3:", round(mesh.volume / 1000, 1), "| ingombro mm:", np.round(mesh.extents, 1))
mesh.export("porta_attrezzi_V6.stl")
mesh.export("porta_attrezzi_V6.3mf")

# divisione per AMS a 2 colori: rosso = coperchi, cinghia, filtro, scritta; giallo = il resto
red = Manifold()
for k in ("coperchi", "cinghia", "filtro", "scritta"):
    red += parts[k]
red = red ^ whole
yellow = whole - red
for name, m in (("giallo", yellow), ("rosso", red)):
    t = tm(m)
    t.apply_translation(off)
    t.export(f"colore_{name}.stl")
    print(name, "volume cm3:", round(m.volume() / 1000, 1))

os.makedirs("render/parti", exist_ok=True)
for k, m in parts.items():
    m = Manifold.batch_boolean([c for c in m.decompose() if c.volume() > 1], __import__("manifold3d").OpType.Add)
    t = tm(m)
    t.apply_translation(off)
    t.export(f"render/parti/{k}.stl")
for a in axes:
    a["top"] = (np.array(a["top"]) + off).tolist()
    a["bottom"] = (np.array(a["bottom"]) + off).tolist()
json.dump({"pozzetti": axes, "punte": [(np.array(t) + off).tolist() for t in tips],
           "ingombro": mesh.extents.tolist()}, open("render/assi.json", "w"), indent=1)

n, c = mesh.face_normals, mesh.triangles_center
bad = (n[:, 2] < -np.cos(np.radians(45))) & (c[:, 2] > 0.5)
print("area sbalzi >45°: %.0f mm2" % mesh.area_faces[bad].sum())
