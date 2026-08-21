/**
 * Where the contact form posts.
 *
 * ⚠️ THE SITE HAS NO SERVER OF ITS OWN IN PRODUCTION.
 *
 * vite.config.ts sets `nitro: false` under STATIC_BUILD, which is the mode the
 * GitHub Pages workflow builds in. That is not a tuning choice, it is what
 * makes the output a folder of files Pages can serve. The consequence is that
 * every file route under src/routes/api is absent from the deployed site: a
 * POST to /api/enquiry lands on GitHub Pages, which answers with 404.html, so
 * the form has never delivered anything from the live site.
 *
 * Forms therefore post cross-origin to the platform backend on Render. That
 * backend must list this site's origin in IIP_CORS_ORIGINS or the browser
 * blocks the request before it is ever sent, and the form shows its generic
 * failure line with nothing in the backend logs to explain it.
 *
 * VITE_API_BASE overrides the default at build time. It is baked into the
 * bundle, so it is a public value and must never carry a credential.
 */

/** Render-assigned backend host, confirmed in the platform's render.yaml. */
const FALLBACK_API_BASE = "https://iip-backend-cy7o.onrender.com";

// Bracket access: Vite types import.meta.env with an index signature, and the
// repo compiles under noPropertyAccessFromIndexSignature.
const configured = import.meta.env["VITE_API_BASE"] as string | undefined;

/** Backend origin with any trailing slash removed, so joins never double up. */
export const apiBase = (configured?.trim() || FALLBACK_API_BASE).replace(/\/+$/, "");

/** Join a backend path onto the base. Leading slashes on `path` are optional. */
export function apiUrl(path: string): string {
  return `${apiBase}/${path.replace(/^\/+/, "")}`;
}
