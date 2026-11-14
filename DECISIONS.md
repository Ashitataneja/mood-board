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

## Phase 2: Characters

- **Mouth morphing without flubber.** Every mouth in `moods.ts` is rewritten to one shared structure (`M p0 C … p1 C … p0 Z`): quadratics become cubics, line mouths retrace themselves, and the "o" is two cubic halves. Motion can then interpolate the `d` string directly. Filled mouths fade their ink fill in; line mouths have zero area, so the fill never shows.
- **Mouth size and position.** The brief doesn't give these. Mouth width is `1.5 × E`, centred, with its top `0.78 × E` below the eye line. The name label sits just under the mouth.
- **Closed eyes.** With the lid fully down, its lower edge is tangent to the eye and the brief's lid line disappears. So once a lid passes ~85%, the line fades out and a curved "closed eye" stroke fades in. Proud, asleep and wink now read clearly as closed.
- **Lid clip.** The lid is clipped to a circle 1px larger than the eye, so no white ring shows around a closed eye.
- **Pointer tracking.** One `pointermove` / `pointerdown` listener in `CharacterProvider` writes to two motion values. Each face batches its recompute with `frame.read` (once per frame, however many events) and feeds four springs. Verified: 0 React DOM mutations while the pointer moves.
- **Flinch.** Speed is measured between pointer events at least 8ms apart, so tiny time gaps don't create false spikes. Touch input never triggers flinch.
- **Sleep.** Checked every 500ms against the last input (pointer, key, wheel or scroll). Order for falling asleep: work, about, writing, gallery, contact, résumé, 300ms apart; waking runs in reverse.
- **Breathing** is a CSS keyframe animation on a wrapper (compositor only), with a negative delay per character so they never breathe in sync.
- **Blush glow** is a soft radial blur behind the body. The brief asks for it on About only; it's driven by the `blush` mood, so it appears wherever that mood is used.
- **Reduced motion.** No breathing, blinking or flinching. Mood changes and pupil moves jump instantly. Sleep still happens, but there are no floating z's.
- **`/playground`.** Has a mood picker for everyone, plus Blink, Flinch, Sleep and Wake buttons, a body-spin toggle (to prove the face stays upright), the 76px outlined progress size, and a 6 × 14 matrix of every character in every mood.
