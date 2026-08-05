// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build. Opt-in only: set STATIC_BUILD=true (see .github/workflows/deploy.yml).
// Everything below is inert for Lovable / Cloudflare builds, which stay SSR.
const isStaticBuild = process.env.STATIC_BUILD === "true";
// Project pages are served from https://<user>.github.io/<repo>/, so assets and
// the router need that prefix. Override with BASE_PATH for a custom domain.
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  ...(isStaticBuild
    ? {
        vite: {
          base: basePath,
          // The prerenderer boots `vite preview`; pin it to IPv4 loopback so it
          // works on CI runners without an IPv6 stack.
          preview: { host: "127.0.0.1" },
        },
        // No server to deploy on Pages — skip the Nitro/Cloudflare bundle so the
        // build emits plain client output that the prerenderer can fill in.
        nitro: false,
      }
    : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isStaticBuild
      ? {
          prerender: {
            enabled: true,
            crawlLinks: true,
            autoSubfolderIndex: true,
            failOnError: true,
            retryCount: 2,
          },
          pages: [
            { path: "/", prerender: { enabled: true } },
            { path: "/the-problem", prerender: { enabled: true } },
            { path: "/solutions", prerender: { enabled: true } },
            { path: "/platform", prerender: { enabled: true } },
            { path: "/about", prerender: { enabled: true } },
            { path: "/contact", prerender: { enabled: true } },
          ],
        }
      : {}),
  },
});
