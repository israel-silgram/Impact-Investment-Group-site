"""Lighthouse mobile and the transferred weight, before and after, one server each.

Same instrument and the same gzipping server wave 414 used, because a number
taken without compression is a fact about the server and not about the site.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

ROUTES = ["/", "/platform", "/register/investor", "/about"]
GZ = Path("C:/Users/Israel/AppData/Local/Temp/gzserve.py")


def serve(root, port):
    return subprocess.Popen([sys.executable, str(GZ), root, str(port)])


def lighthouse(url, out):
    subprocess.run(
        ["bunx", "lighthouse", url, "--quiet", "--output=json", f"--output-path={out}",
         "--only-categories=performance,accessibility,best-practices,seo",
         "--chrome-flags=--headless=new --no-sandbox"],
        check=False, shell=True, capture_output=True, text=True,
    )
    if not Path(out).exists():
        return None
    data = json.loads(Path(out).read_text(encoding="utf-8"))
    cat = data["categories"]
    audits = data["audits"]
    return {
        "perf": round(cat["performance"]["score"] * 100),
        "a11y": round(cat["accessibility"]["score"] * 100),
        "bp": round(cat["best-practices"]["score"] * 100),
        "seo": round(cat["seo"]["score"] * 100),
        "fcp": audits["first-contentful-paint"]["displayValue"],
        "lcp": audits["largest-contentful-paint"]["displayValue"],
        "tbt": audits["total-blocking-time"]["displayValue"],
        "cls": audits["cumulative-layout-shift"]["displayValue"],
        "bytes": round(audits["total-byte-weight"]["numericValue"] / 1024),
    }


def main():
    label, root, port = sys.argv[1], sys.argv[2], int(sys.argv[3])
    server = serve(root, port)
    time.sleep(2)
    Path("docs/wave490").mkdir(parents=True, exist_ok=True)
    rows = []
    try:
        for route in ROUTES:
            slug = route.strip("/").replace("/", "-") or "home"
            out = f"docs/wave490/lh-{label}-{slug}.json"
            read = lighthouse(f"http://127.0.0.1:{port}{route}", out)
            if read is None:
                print(f"{label:<6} {route:<22} NOT RUN, lighthouse wrote no report")
                continue
            rows.append((route, read))
            print(
                f"{label:<6} {route:<22} perf={read['perf']:>3} a11y={read['a11y']:>3} "
                f"bp={read['bp']:>3} seo={read['seo']:>3}  FCP={read['fcp']:<7} "
                f"LCP={read['lcp']:<7} TBT={read['tbt']:<8} CLS={read['cls']:<6} "
                f"{read['bytes']} KiB"
            )
    finally:
        server.terminate()


if __name__ == "__main__":
    main()
