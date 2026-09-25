"""Lighthouse mobile and the transferred weight, before and after, one server each.

Same instrument and the same gzipping server wave 414 used, because a number
taken without compression is a fact about the server and not about the site.

WAVE 490b: FIVE RUNS PER ROUTE, AND THE MEDIAN. The first cut of this script
took one run per route per build on a machine running two other waves, and
read /platform's LCP as 4.6s before and 5.4s after with nothing in the diff to
explain it. A single Lighthouse run moves by more than that between two runs
of the same build. So each route runs RUNS times, the median of each metric is
the reading, every run's figures are printed so the spread is visible, the
median run's report is kept as the evidence, and every best-practices audit
that did not pass is named rather than summarised as a score.

WAVE 490b, AND THE SERVER IS THIS SCRIPT'S OWN. The first five-run batch
failed best practices on `errors-in-console` in 13 of 40 runs, and every one of
those errors was `net::ERR_CONNECTION_REFUSED` on a font or a script chunk:
the wave 414 server this script borrowed from the temp directory is a
single-threaded `socketserver.TCPServer` with a listen backlog of 5, and
Lighthouse opens more connections than that at once. That is a fact about the
test server, not the site, so the server now lives here: the same gzip rule,
threaded, with a backlog of 128.

Usage:
    python scripts/wave490-perf.py <label> <dist/client> <port> [runs]
"""
import functools
import gzip
import http.server
import json
import socketserver
import threading
import urllib.request
import statistics
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROUTES = ["/", "/platform", "/register/investor", "/about"]
RUNS = 5


class GzipHandler(http.server.SimpleHTTPRequestHandler):
    """Static files, gzipping text, JavaScript, JSON and SVG, as GitHub Pages
    does; a miss is served the build's own 404.html, as GitHub Pages does."""

    def log_message(self, *args):
        pass

    def send_error(self, code, message=None, explain=None):
        page = Path(self.directory) / "404.html"
        if code == 404 and page.exists():
            body = page.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def do_GET(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path = path / "index.html"
        if not path.is_file():
            return super().do_GET()
        data = path.read_bytes()
        ctype = self.guess_type(str(path))
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "public, max-age=600")
        if ctype.startswith(("text/", "application/javascript", "application/json",
                             "image/svg")) and "gzip" in self.headers.get("Accept-Encoding", ""):
            data = gzip.compress(data, 6)
            self.send_header("Content-Encoding", "gzip")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True
    request_queue_size = 128


def serve(root, port):
    httpd = Server(("127.0.0.1", port), functools.partial(GzipHandler, directory=str(root)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


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
    if data.get("runtimeError") or data["categories"]["performance"]["score"] is None:
        return {"error": (data.get("runtimeError") or {}).get("code", "no score")}
    cat = data["categories"]
    audits = data["audits"]
    failing = sorted(
        ref["id"] for ref in cat["best-practices"]["auditRefs"]
        if ref.get("weight", 0) > 0
        and audits.get(ref["id"], {}).get("score") is not None
        and audits[ref["id"]]["score"] < 1
    )
    return {
        "perf": round(cat["performance"]["score"] * 100),
        "a11y": round(cat["accessibility"]["score"] * 100),
        "bp": round(cat["best-practices"]["score"] * 100),
        "seo": round(cat["seo"]["score"] * 100),
        "fcp": audits["first-contentful-paint"]["numericValue"],
        "lcp": audits["largest-contentful-paint"]["numericValue"],
        "tbt": audits["total-blocking-time"]["numericValue"],
        "cls": audits["cumulative-layout-shift"]["numericValue"],
        "bytes": round(audits["total-byte-weight"]["numericValue"] / 1024),
        "bp_failing": failing,
        "bp_titles": {i: audits[i]["title"] for i in failing},
    }


def main():
    label, root, port = sys.argv[1], sys.argv[2], int(sys.argv[3])
    runs = int(sys.argv[4]) if len(sys.argv) > 4 else RUNS
    server = serve(root, port)
    # Wait for the server to answer rather than for a fixed time: the first
    # run of this version met CHROME_INTERSTITIAL_ERROR on a server that had
    # not bound yet after a 2s sleep.
    for _ in range(50):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=2).read()
            break
        except Exception:
            time.sleep(0.3)
    Path("docs/wave490").mkdir(parents=True, exist_ok=True)
    # Every run's report is written outside the repository; only the median
    # run's is kept in docs/wave490, beside the figures every run printed.
    scratch = Path(tempfile.gettempdir()) / "wave490-lh-runs"
    scratch.mkdir(parents=True, exist_ok=True)
    try:
        for route in ROUTES:
            slug = route.strip("/").replace("/", "-") or "home"
            reads = []
            for index in range(runs):
                out = scratch / f"lh-{label}-{slug}-{index + 1}.json"
                read = None
                # A run that errors is retried twice and never averaged in.
                for _attempt in range(3):
                    read = lighthouse(f"http://127.0.0.1:{port}{route}", str(out))
                    if read is None or "error" not in read:
                        break
                    print(f"{label:<6} {route:<22} run {index + 1}: {read['error']}, retried")
                    read = None
                if read is None:
                    print(f"{label:<6} {route:<22} run {index + 1}: NOT RUN, no report")
                    continue
                reads.append((out, read))
                print(
                    f"{label:<6} {route:<22} run {index + 1}: perf={read['perf']:>3} "
                    f"bp={read['bp']:>3} LCP={read['lcp']:>6.0f}ms TBT={read['tbt']:>4.0f}ms "
                    f"CLS={read['cls']:.3f} FCP={read['fcp']:>5.0f}ms {read['bytes']} KiB "
                    f"bp failing={read['bp_failing']}"
                )
            if not reads:
                continue
            med = {k: statistics.median(r[k] for _, r in reads)
                   for k in ("perf", "a11y", "bp", "seo", "fcp", "lcp", "tbt", "cls", "bytes")}
            # The run whose LCP is the median is the report that is kept.
            ordered = sorted(reads, key=lambda pair: pair[1]["lcp"])
            keep_path, keep = ordered[len(ordered) // 2]
            Path(f"docs/wave490/lh-{label}-{slug}.json").write_bytes(keep_path.read_bytes())
            failing = sorted({i for _, r in reads for i in r["bp_failing"]})
            titles = {}
            for _, r in reads:
                titles.update(r["bp_titles"])
            print(
                f"{label:<6} {route:<22} MEDIAN of {len(reads)}: perf={med['perf']:.0f} "
                f"a11y={med['a11y']:.0f} bp={med['bp']:.0f} seo={med['seo']:.0f} "
                f"FCP={med['fcp']:.0f}ms LCP={med['lcp']:.0f}ms TBT={med['tbt']:.0f}ms "
                f"CLS={med['cls']:.3f} {med['bytes']:.0f} KiB; best-practices audits "
                f"failing in any run: "
                + (", ".join(f"{i} ({titles[i]})" for i in failing) or "none")
            )
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
