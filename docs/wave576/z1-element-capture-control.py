import sys, importlib.util
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
cases = [("/partner-with-broker", 390, 844, True), ("/partner-with-housing-association", 1280, 900, False), ("/partner-with-support-provider", 1280, 900, False), ("/partner-with-investor", 390, 844, True)]
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, d in (("base", BASE), ("head", HEAD)):
        port = W.serve(d)
        for route, w, h, t in cases:
            ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=t, has_touch=t, reduced_motion="reduce")
            pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}{route}", wait_until="networkidle")
            W.settle(pg); pg.add_style_tag(content=STILL); W.to_top(pg); pg.wait_for_timeout(200)
            f = f"{Path(r'C:\Users\Israel\AppData\Local\Temp')}/exp-{name}-{route.strip('/')}-{w}.png"
            pg.locator("main").first.screenshot(path=f, animations="disabled", caret="hide")
            out[(name, route, w)] = f
            ctx.close()
    b.close()
for route, w, h, t in cases:
    a = np.asarray(Image.open(out[("base", route, w)]).convert("RGBA")).astype(int)
    c = np.asarray(Image.open(out[("head", route, w)]).convert("RGBA")).astype(int)
    print(route, w, a.shape, c.shape, int((np.abs(a - c).max(2) > 0).sum()) if a.shape == c.shape else "shape")
