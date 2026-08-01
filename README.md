# Impact Property Platform

You are building a production marketing website for The Impact Investment Platform, a UK social-impact property and supported-housing business. The audience is local authorities, housing associations, care and support providers, institutional and private investors, landlords, developers and estate agents. These are procurement-minded, sceptical readers. The site has to look expensive and read as credible — not startup-playful.

Technical requirements — follow exactly:

Next.js 14+ with the App Router, TypeScript, /app directory

Tailwind CSS for all styling. No CSS-in-JS, no styled-components, no inline style objects except where a dynamic value genuinely requires it

All design tokens defined once in tailwind.config.ts and CSS custom properties in globals.css. Never hardcode a hex value in a component

lucide-react for all icons. No emoji anywhere, ever

next/font for fonts (self-hosted, no render-blocking CDN link)

next/image for every image, with sizes set and priority on hero images only

Fully responsive: 360px, 768px, 1024px, 1440px, 1920px. Design mobile-up but the desktop composition is the one being signed off

Semantic HTML: one <h1> per page, real <section> landmarks, <nav>, <main>, <footer>

Accessibility: WCAG 2.2 AA. Visible focus rings, aria-label on icon-only buttons, prefers-reduced-motion respected on every animation, all interactive targets 44px minimum

SEO: per-page metadata export with title, description and Open Graph tags. sitemap.ts and robots.ts

Content lives in typed data files under /content (e.g. content/stats.ts, content/solutions.ts), not inlined in JSX, so copy can be edited without touching layout

No backend, no auth, no database. Forms validate client-side with react-hook-form + zod and post to a stubbed /api/enquiry route handler that logs and returns 200

Six routes only:

RoutePage/Home/the-problemThe Problem/solutionsOur Solutions/platformThe Platform/aboutAbout Us/contactContact

Editorial rules that override any design instinct you have:

Never invent a statistic. Every number on this site is either supplied in these prompts with its source, or it is rendered as an em-dash placeholder (—) with the condition that will fill it. A made-up figure is the single thing that would kill this site with a council.

Every statistic displays its source inline, in small muted text directly beneath it. No bare stats. The one exception is illustrative product data inside a LiveWindow component — sample match scores, example property rows — which is labelled once, at the panel, as "illustrative interface data".

No stock-photo faces standing in for real people. Where a portrait or testimonial is required and not yet available, render the empty state — initials in a circle, or a dashed "Case study slot" card — never a placeholder human.

One orange action per page. Orange is the scarcest colour on the site; it marks the single action that page exists to get. That one action may appear twice — once in the hero, once in the closing band — but it must be the same action with the same label. No page ever offers two different orange actions. The persistent "Book a demo" button in the site header is chrome and sits outside this count. Every other action on a page is secondary (teal outline) or ghost.

No screenshots of the product. Where the platform interface is shown, it is built as real HTML — a "live window" component with real markup — never an image of a UI.

Acknowledge these rules, scaffold the project with the six empty routes, install the dependencies, and stop. Do not build any UI yet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://impact-property-connect.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/46db7a0c-2de4-420e-8011-b224224576b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
