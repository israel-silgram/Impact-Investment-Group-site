import importlib.util, io, subprocess, json
from pathlib import Path
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
ROOT = Path(r'C:\Users\Israel\Documents\repos\iigs-uc576')
spec = importlib.util.spec_from_file_location("w490", ROOT / "scripts" / "wave490-phone.py")
W = importlib.util.module_from_spec(spec); spec.loader.exec_module(W)
STILL = "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }"
BASE = Path(r'C:\Users\Israel\AppData\Local\Temp\iigs-w576-base\dist\client')
HEAD = ROOT / 'dist' / 'client'
routes = {"home": "/", "platform": "/platform", "about": "/about", "partners": "/partners", "register": "/register"}
tops = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, d in (("base", BASE), ("head", HEAD)):
        port = W.serve(d)
        for r, path in routes.items():
            ctx = b.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
            pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}{path}", wait_until="networkidle")
            W.settle(pg); pg.add_style_tag(content=STILL)
            tops[(name, r)] = pg.evaluate("() => { const f = document.querySelector('footer').getBoundingClientRect(); return [+(f.top + scrollY).toFixed(3), +f.height.toFixed(3)]; }")
            ctx.close()
    b.close()
for r in routes:
    blob = subprocess.run(["git", "-C", str(ROOT), "show", f"73fcf6f:docs/screenshots/wave493/before/{r}-1280-footer.png"], capture_output=True).stdout
    a = np.asarray(Image.open(io.BytesIO(blob)).convert("RGBA")).astype(int)
    c = np.asarray(Image.open(ROOT / f"docs/screenshots/wave493/before/{r}-1280-footer.png").convert("RGBA")).astype(int)
    rows = min(len(a), len(c))
    d = np.abs(a[:rows] - c[:rows]).max(2) > 0
    ys = np.where(d.any(1))[0]
    seg = []
    if len(ys):
        s = pv = ys[0]
        for y in ys[1:]:
            if y > pv + 8: seg.append((int(s), int(pv))); s = y
            pv = y
        seg.append((int(s), int(pv)))
    print(f"{r}: base footer shot {a.shape[0]}px, head {c.shape[0]}px, differ {int(d.sum())} px in rows {seg[:6]}{' ...' if len(seg) > 6 else ''}; footer top base {tops[('base', r)][0]} head {tops[('head', r)][0]} (fraction {tops[('base', r)][0] % 1:.3f} -> {tops[('head', r)][0] % 1:.3f}), height {tops[('base', r)][1]} -> {tops[('head', r)][1]}")

print("---- split by column and by row band (logo column = x 0 to 339; legal band = last 120 rows of the head shot's base)")
for r in routes:
    blob = subprocess.run(["git", "-C", str(ROOT), "show", f"73fcf6f:docs/screenshots/wave493/before/{r}-1280-footer.png"], capture_output=True).stdout
    a = np.asarray(Image.open(io.BytesIO(blob)).convert("RGBA")).astype(int)
    c = np.asarray(Image.open(ROOT / f"docs/screenshots/wave493/before/{r}-1280-footer.png").convert("RGBA")).astype(int)
    rows = min(len(a), len(c)); d = np.abs(a[:rows] - c[:rows]).max(2) > 0
    legal = rows - 120
    print(f"{r}: logo column above the legal band {int(d[:legal, :340].sum())}; rest above the legal band {int(d[:legal, 340:].sum())}; legal band {int(d[legal:].sum())}")
