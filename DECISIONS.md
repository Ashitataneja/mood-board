# Decisions and assumptions

Assumptions made where the brief was open. Each one favours smooth motion and a usable site.

## Phase 1: Setup

- **Versions.** React 18.3, React Router 6.30 (with the v7 future flags on), Motion 14, Vite 5, TypeScript 5.9. React 18 rather than 19 because `@axe-core/react` only supports React 18's DOM API.
- **MDX frontmatter.** `remark-frontmatter` + `remark-mdx-frontmatter`, so each post exports `frontmatter` (title, date, standfirst). Posts are collected with `import.meta.glob` in `src/content/writing.ts`.
- **Fonts.** Self-hosted with `@fontsource` (Anton 400, Instrument Sans 400/600/700, Space Mono 400/700). `font-display: swap` is the @fontsource default. Anton preload is deferred to phase 10, where the font file hash is known at build time.
- **Fluid type.** Desktop sizes from the brief are the `clamp()` maximums; minimums are 88 / 44 / 36 / 26 / 18 / 12 px.
- **Focus colour.** One global `:focus-visible` rule (3px dashed, 5px offset). Each surface sets `--focus-color` to its text colour so the outline always contrasts.
- **Display type overflow.** Anton at line-height 0.9 paints above its line box. Interactive elements that sit above display headings get `position: relative; z-index: 1` so the heading never swallows their clicks (this broke the back link in testing).
- **Section order on the landing.** `sections.ts` lists the cast back-to-front (writing, gallery, about, work, contact, resume) to match the crowd table; `z` records it explicitly.
- **SPA hosting.** `public/_redirects` (Netlify) and `vercel.json` (Vercel) rewrite every path to `index.html` so deep links work.
- **Contact endpoint.** Read from `VITE_CONTACT_ENDPOINT`; empty means the `mailto:` fallback. Waiting on your choice of service (see `.env.example`).
- **Gallery placeholders.** 12 entries with an empty `src` and a token colour in `placeholder`. Alt text is set now so the phase 9 build check passes from day one.
- **Axe.** `@axe-core/react` runs in dev only (append `?noaxe` to a URL to switch it off while debugging).
