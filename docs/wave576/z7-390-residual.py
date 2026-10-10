import importlib.util, json, tempfile
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
T = Path(tempfile.gettempdir()) / "w576z7"; T.mkdir(exist_ok=True)
shots = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, d, idx in (("base", BASE, (2, 3)), ("head1", HEAD, (3, 4)), ("head2", HEAD, (3, 4))):
        port = W.serve(d)
        ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion="reduce")
        pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")
        W.settle(pg); pg.add_style_tag(content=STILL); W.to_top(pg); pg.wait_for_timeout(200)
        for n, i in zip(("council", "map"), idx):
            k = pg.locator("main").first.locator(":scope > *").nth(i)
            f = T / f"{name}-{n}.png"; k.screenshot(path=str(f), animations="disabled", caret="hide"); shots[(name, n)] = f
            if name == "head1":
                print(n, "rect", pg.evaluate("(i) => { const r = document.querySelector('main').children[i].getBoundingClientRect(); return [r.top + scrollY, r.height]; }", i))
        ctx.close()
    b.close()
def load(k): return np.asarray(Image.open(shots[k]).convert("RGBA")).astype(int)
for n in ("council", "map"):
    for a, c in (("base", "head1"), ("head1", "head2")):
        d = np.abs(load((a, n)) - load((c, n))).max(2)
        ys, xs = np.where(d > 0)
        print(n, a, "vs", c, "differ", int((d > 0).sum()), ">3:", int((d > 3).sum()), "max", int(d.max()),
              "box", (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())) if len(ys) else None)

print("----")
a = load(("base", "council")); b = load(("head1", "council")); d = np.abs(a - b).max(2)
ys, xs = np.where(d > 3)
pts = sorted({(int(x) // 20 * 20, int(y) // 20 * 20) for x, y in zip(xs, ys)})
print(pts[:20], len(pts))
with sync_playwright() as p:
    b2 = p.chromium.launch(); port = W.serve(HEAD)
    ctx = b2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")
    W.settle(pg); pg.add_style_tag(content=STILL)
    for x, y in pts[:6]:
        print((x, y), pg.evaluate("([x,y]) => { const k = document.querySelector('main').children[3]; const t = k.getBoundingClientRect().top + scrollY; const e = document.elementsFromPoint(x + 5, y + 5 + t - scrollY); return e.slice(0,3).map(n => n.tagName + '.' + String(n.className).slice(0,50)); }", [x, y]))
    b2.close()

print("==== masks")
JS = """([sel, i]) => { const k = document.querySelector('main').children[i]; const kr = k.getBoundingClientRect();
  return [...k.querySelectorAll(sel)].map(e => { const r = e.getBoundingClientRect(); return [r.left - kr.left, r.top - kr.top, r.right - kr.left, r.bottom - kr.top]; }); }"""
with sync_playwright() as p:
    b2 = p.chromium.launch(); port = W.serve(HEAD)
    ctx = b2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")
    W.settle(pg); pg.add_style_tag(content=STILL); W.to_top(pg)
    for n, i in (("council", 3), ("map", 4)):
        a = load(("base", n)); bb = load(("head1", n)); d = np.abs(a - bb).max(2) > 0
        for sel in ("canvas", ".tabular-nums", ".logo-marquee", "img", "svg"):
            boxes = pg.evaluate(JS, [sel, i])
            m = np.zeros_like(d)
            for l, t, r, bt in boxes:
                m[max(int(t) - 2, 0):int(bt) + 3, max(int(l) - 2, 0):int(r) + 3] = True
            print(n, sel, len(boxes), "boxes; differing px inside", int((d & m).sum()), "outside", int((d & ~m).sum()))
    b2.close()

print("==== who")
a = load(("base", "map")); bb = load(("head1", "map")); d = np.abs(a - bb).max(2) > 0
rows = np.where(d.any(1))[0]
clusters = []; s = pv = rows[0]
for r in rows[1:]:
    if r > pv + 15: clusters.append((int(s), int(pv))); s = r
    pv = r
clusters.append((int(s), int(pv)))
print(clusters, [int(d[c0:c1+1].sum()) for c0, c1 in clusters])
JSW = """([y0, y1]) => { const k = document.querySelector('main').children[4]; const kr = k.getBoundingClientRect();
  return [...k.querySelectorAll('*')].filter(e => { const r = e.getBoundingClientRect(); return e.children.length === 0 && r.top - kr.top < y1 && r.bottom - kr.top > y0 && r.width > 0; })
   .slice(0, 6).map(e => e.tagName + ' ' + String(e.className).slice(0, 40) + ' | ' + (e.textContent || '').trim().slice(0, 30)); }"""
with sync_playwright() as p:
    b2 = p.chromium.launch(); port = W.serve(HEAD)
    ctx = b2.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True, reduced_motion="reduce")
    pg = ctx.new_page(); pg.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle")
    W.settle(pg); pg.add_style_tag(content=STILL); W.to_top(pg)
    for c in clusters:
        print(c, pg.evaluate(JSW, list(c)))
    b2.close()
