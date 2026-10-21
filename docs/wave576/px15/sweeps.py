"""Wave 576, the 15 px pass (21 Oct 2026): the sweeps over the pass's added lines.

    python docs/wave576/px15/sweeps.py [base]            # base defaults to 16fd5a1b
    python docs/wave576/px15/sweeps.py --cached [base]   # the staged tree, before a commit

Reads `git diff --unified=0 <base> HEAD` as UTF-8 bytes and counts, over the
added text lines only (binary files have none): U+2014 and U+2013, a
C:\\Users path, key shapes, UK postcodes outside the ZZ area, and email
addresses outside the example domains. Exits 1 on any hit.
"""

import re
import subprocess
import sys

args = [a for a in sys.argv[1:] if a != "--cached"]
cached = "--cached" in sys.argv[1:]
base = args[0] if args else "16fd5a1b"
target = ["--cached", base] if cached else [base, "HEAD"]
raw = subprocess.run(["git", "diff", "--unified=0", "--no-color", *target],
                     capture_output=True, check=True).stdout
added = [l[1:] for l in raw.split(b"\n") if l.startswith(b"+") and not l.startswith(b"+++")]
text = b"\n".join(added)
checks = {
    "U+2014 em dash": text.count("\u2014".encode("utf-8")),
    "U+2013 en dash": text.count("\u2013".encode("utf-8")),
    "C:\\Users path": len(re.findall(rb"[A-Za-z]:[\\/]+Users[\\/]", text, re.I)),
    "key shape": len(re.findall(
        rb"(sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|xox[abpr]-[A-Za-z0-9-]{10,}"
        rb"|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.)", text)),
}
postcodes = [m for m in re.findall(rb"\b([A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})\b", text) if not m.startswith(b"ZZ")]
emails = [m for m in re.findall(rb"[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})", text)
          if not re.fullmatch(rb"(.*\.)?example\.(com|org|net)", m.lower())]
checks["postcode outside ZZ"] = len(postcodes)
checks["email outside example domains"] = len(emails)
print(f"sweeps over git diff {' '.join(target)}: {len(added)} added lines, {len(text)} bytes")
for name, n in checks.items():
    print(f"  {name:<32} {n}")
for m in postcodes:
    print("    postcode:", m.decode())
for m in emails:
    print("    email domain:", m.decode())
raise SystemExit(1 if any(checks.values()) else 0)
