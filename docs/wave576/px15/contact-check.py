"""Wave 576, the 15 px pass (21 Oct 2026): is the built contact/index.html whole?

    python docs/wave576/px15/contact-check.py [dist/client]

The static build prerenders /contact and its six ?enquiry= variants, and every
one of them is written to contact/index.html (crawlLinks plus
autoSubfolderIndex in vite.config.ts, unchanged since wave 412). Which variant
lands is down to the order the writes finish in, and two writes can interleave.
Prints the variant the file holds (the pressed enquiry button), whether
anything follows the first </html>, and exits 1 if something does.
"""

import re
import sys
from pathlib import Path

build = Path(sys.argv[1] if len(sys.argv) > 1 else "dist/client")
html = (build / "contact" / "index.html").read_text(encoding="utf-8")
end = html.find("</html>")
tail = html[end + len("</html>"):].strip() if end >= 0 else None
pressed = re.findall(r'aria-pressed="true"[^>]*>([^<]+)<', html)
print(f"contact/index.html: {len(html.encode('utf-8'))} bytes; </html> {html.count('</html>')} time(s); "
      f"pressed {pressed}; after the first </html>: {len(tail) if tail is not None else 'no </html>'} chars")
raise SystemExit(0 if tail == "" else 1)
