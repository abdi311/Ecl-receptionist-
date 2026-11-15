"""Porta attrezzi saldatura a forma di motore V6 (6 cilindri cavi).
Genera STL e 3MF pronti per Bambu Studio. Unità: mm. Uso: python3 genera_v6.py
"""
import numpy as np, trimesh
from manifold3d import Manifold, CrossSection

SEG = 96
V_ANGLE = 60                 # angolo tra le bancate
TILT = V_ANGLE / 2
ZC = -24                     # asse "albero motore" (sotto il piatto)
PITCH = 50                   # interasse cilindri
STAGGER = 12                 # sfasamento bancate (come un V6 vero)
BORE_R = 17                  # foro utile Ø34
TUBE_R = 21                  # esterno cilindro Ø42
BLOCK_HALF = 23              # semi-larghezza blocco bancata
DECK_U = 70                  # altezza piano blocco lungo l'asse
BORE_START = 45              # fondo foro lungo l'asse
TOP_U = 140                  # bocca cilindro lungo l'asse

def bank(side, xs):
    """Una bancata costruita lungo +Z poi inclinata di ±TILT attorno a X."""
    xmin, xmax = min(xs) - 25, max(xs) + 25
    solid = Manifold.cube([xmax - xmin, 2 * BLOCK_HALF, DECK_U + 10]).translate([xmin, -BLOCK_HALF, -10])
    bores = Manifold()
    for x in xs:
        tube = Manifold.cylinder(TOP_U - DECK_U + 1, TUBE_R, TUBE_R, SEG).translate([x, 0, DECK_U - 1])
        # alette decorative: rastremate a ~20° così stampano senza supporti anche inclinate
        for k, u0 in enumerate([DECK_U + 14, DECK_U + 32, DECK_U + 50]):
            fin = (Manifold.cylinder(8, TUBE_R, 24.5, SEG).translate([x, 0, u0])
                   + Manifold.cylinder(3, 24.5, 24.5, SEG).translate([x, 0, u0 + 8]))
            tube += fin
        # anello "testata" in cima
        tube += Manifold.cylinder(8, TUBE_R, 24.5, SEG).translate([x, 0, TOP_U - 12])
        tube += Manifold.cylinder(4, 24.5, 24.5, SEG).translate([x, 0, TOP_U - 4])
        solid += tube
        bores += Manifold.cylinder(TOP_U - BORE_START + 5, BORE_R, BORE_R, SEG).translate([x, 0, BORE_START])
    solid -= bores
    ang = -TILT if side > 0 else TILT
    return solid.rotate([ang, 0, 0]).translate([0, 0, ZC])

xa = [-PITCH, 0, PITCH]
xb = [x + STAGGER for x in xa]
eng = bank(+1, xa) + bank(-1, xb)

# collettore centrale (valle della V) con fori per punte saldatore
x0, x1 = -75, 87
plen = Manifold.cube([x1 - x0, 32, 55]).translate([x0, -16, 0])
holes = Manifold()
for i in range(6):
    for y in (-7, 7):
        xx = x0 + 17 + i * (x1 - x0 - 34) / 5
        holes += Manifold.cylinder(40, 3.4, 3.4, 40).translate([xx + (6 if y > 0 else 0), y, 20])
plen -= holes

# coppa olio (base) con smusso a 45°
pan_x0, pan_x1, pan_w, pan_h = -98, 94, 100, 10
L, W = pan_x1 - pan_x0, pan_w
rect = CrossSection.square([L, W], center=True)
base = (Manifold.extrude(rect, pan_h - 3)
        + Manifold.extrude(rect, 3, scale_top=[(L - 6) / L, (W - 6) / W]).translate([0, 0, pan_h - 3]))
base = base.translate([(pan_x0 + pan_x1) / 2, 0, 0])

# scritta "V6" incisa sulla coppa davanti
def seg(p, q, w=3.2):
    p, q = np.array(p, float), np.array(q, float)
    d = q - p; n = np.array([-d[1], d[0]]) / np.linalg.norm(d) * w / 2
    return CrossSection([[tuple(p + n), tuple(q + n), tuple(q - n), tuple(p - n)]])
v = seg((0, 14), (6, -14)) + seg((12, 14), (6, -14))
six = (CrossSection.circle(7, 48) - CrossSection.circle(3.8, 48)).translate([26, -7]) + seg((19.4, -7), (24, 13)) + seg((24, 13), (31, 14))
txt = (v + six).translate([0, 0])
# orientata leggibile guardando dal davanti (lato -X): ruota di 90°
txt = txt.rotate(-90).translate([pan_x0 + 11, 16])
base -= Manifold.extrude(txt, 2).translate([0, 0, pan_h - 1.6])

part = eng + plen
part = part ^ Manifold.cube([400, 400, 400]).translate([-200, -200, 0])  # taglio al piatto z=0
part += base

m = part.to_mesh()
mesh = trimesh.Trimesh(m.vert_properties[:, :3], m.tri_verts, process=True)
mesh.apply_translation([-mesh.bounds[0][0], -mesh.bounds[0][1], 0])
print("watertight:", mesh.is_watertight, "volume cm3:", round(mesh.volume / 1000, 1))
print("ingombro mm:", np.round(mesh.extents, 1))
mesh.export("porta_attrezzi_V6.stl")
mesh.export("porta_attrezzi_V6.3mf")

# controllo sbalzi: facce rivolte verso il basso oltre 50° dalla verticale (escluso il piano)
n = mesh.face_normals; c = mesh.triangles_center
bad = (n[:, 2] < -np.sin(np.radians(40))) & (c[:, 2] > 0.5)
print("area sbalzi critici mm2:", round(mesh.area_faces[bad].sum(), 1))
