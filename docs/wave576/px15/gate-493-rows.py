"""Wave 576, the 15 px pass (21 Oct 2026): which rows of 493's five 1280 footers differ.

    python docs/wave576/px15/gate-493-rows.py

Pairs each committed before shot (wave 576's head, 13px pledge) with the after
shot 493 just wrote on this head (15px pledge), and reads the pledge's top and
bottom inside the footer from the head build, so the differing rows can be
told apart: everything from the pledge's top down may move, nothing above it.
"""

import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[3]
SHOTS = ROOT / "docs" / "screenshots" / "wave493"
spec = importlib.util.spec_from_file_location("w490", ROOT / "scripts" / "wave490-phone.py")
W = importlib.util.module_from_spec(spec)
spec.loader.exec_module(W)
STILL = "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }"
ROUTES = {"home": "/", "platform": "/platform", "about": "/about", "partners": "/partners", "register": "/register"}
PLEDGE = r"""() => {
  const f = document.querySelector('footer').getBoundingClientRect();
  const p = [...document.querySelectorAll('footer p')].find((x) => x.textContent.trim().startsWith('10% of all profits'));
  const r = p.getBoundingClientRect();
  return [+(r.top - f.top).toFixed(2), +(r.bottom - f.top).toFixed(2), +f.height.toFixed(2)];
}"""

where = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    port = W.serve(ROOT / "dist" / "client")
    for r, path in ROUTES.items():
        ctx = b.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=1)
        pg = ctx.new_page()
        pg.goto(f"http://127.0.0.1:{port}{path}", wait_until="networkidle")
        W.settle(pg)
        pg.add_style_tag(content=STILL)
        where[r] = pg.evaluate(PLEDGE)
        ctx.close()
    b.close()

for r in ROUTES:
    a = np.asarray(Image.open(SHOTS / "before" / f"{r}-1280-footer.png").convert("RGBA")).astype(int)
    c = np.asarray(Image.open(SHOTS / "after" / f"{r}-1280-footer.png").convert("RGBA")).astype(int)
    rows = min(len(a), len(c))
    d = np.abs(a[:rows] - c[:rows]).max(2) > 0
    ys = np.where(d.any(1))[0]
    top, bottom, height = where[r]
    above = int(d[: int(top)].sum())
    print(
        f"{r}: before {a.shape[0]}px, after {c.shape[0]}px; differ {int(d.sum())} px, first differing row "
        f"{int(ys[0]) if len(ys) else None}; pledge in the head footer at rows {top} to {bottom} of {height}; "
        f"px differing above the pledge's top: {above}"
    )
