"""Normalise the named files to LF in place.

The worktree is checked out with core.autocrlf=true, so every source file on
disk carries CRLF while the blob git stores carries LF. prettier (through
eslint) reads the disk, so it reports one error per line on every file in the
tree, changed or not. Wave 412 measured lint on an LF-normalised copy for
exactly this reason. Normalising a file this wave has edited costs nothing:
git stores LF either way, so the commit is identical.
"""
import io
import sys

for path in sys.argv[1:]:
    data = io.open(path, "rb").read()
    fixed = data.replace(b"\r\n", b"\n")
    if fixed != data:
        io.open(path, "wb").write(fixed)
        print("LF", path)
