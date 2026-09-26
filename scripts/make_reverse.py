# Wave 493. Committed as staged by Cowork on 26 Sep 2026, unchanged below this comment.
# Source artwork: the platform repo's iip-frontend/iip-web/public/logos/platform/iig-logo.png
# (2006 by 310, RGBA, the owner's re-crop of wave 188). Run on that file it reproduces the
# staged iig-logo-reverse.png pixel for pixel (checked in wave 493); the site's
# public/images/brand/logo-lockup.webp and logo-lockup-reverse.webp are the staged WebP
# exports of the source and of this script's output.
"""Derive the on-dark (reverse) Impact Investment Group lockup from the supplied artwork.
Every navy pixel (blue channel more than 30 above red) and every neutral blend pixel becomes
white; every orange pixel (red more than 40 above blue) is kept as supplied; alpha is untouched.
python make_reverse.py iig-logo.png iig-logo-reverse.png
"""
import sys
from PIL import Image
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
a = np.array(Image.open(src).convert('RGBA')).astype(int)
r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
orange = (r > b + 40) & (al > 0)
lift = (al > 0) & ~orange
out = a.copy()
out[lift, 0] = 255; out[lift, 1] = 255; out[lift, 2] = 255
Image.fromarray(out.astype('uint8'), 'RGBA').save(dst)
print(src, '->', dst, 'lifted', int(lift.sum()), 'orange kept', int(orange.sum()))
