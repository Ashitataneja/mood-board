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

## Phase 3: Landing crowd

- **Scaling.** The 1440×900 canvas scales by `min(vw/1440, vh/900)`, centred and anchored to the bottom edge, so the crowd is always cropped by the bottom of the screen. The night background fills any side margins.
- **Two layouts.** Windows at least 1024px wide and landscape get the brief's canvas. Everything else gets a 420×900 portrait canvas with a two-column huddle: the name splits over two lines, the shuffle is gentler (26px push over 260px), and the rise is 18px.
- **Hit areas.** Character buttons ignore the pointer except on their painted body path. The crowd overlaps heavily, so without this a front character's empty corners would steal hover from the one behind it.
- **Tab order** runs left to right (About, Writing, Work, Gallery, Contact, Résumé). Stacking order still follows the brief's back-to-front table.
- **"In a hurry?" placement.** At 212px, the name runs to x≈1236 and collided with a pill in the top-right corner. On desktop the pill sits at the right end of the tagline row instead. On phones it shows only "In a hurry?" ("Plain list" stays in its accessible name).
- **Plain-list overlay built now** (the brief lists it under phase 5), so the landing's button works today. It's a modal dialog: focus moves to the title, Tab stays inside it, Escape or "Back to the moods" closes it, and focus returns to the button. Each case study is one click away.
- **Touch.** The first tap selects a character (bubble plus bounce), and a second tap on it, or a tap on the bubble, goes inside. Tapping empty space clears the selection. A tap also focuses the button, so focus-triggered selection ignores focus that follows a touch.
- **`overflow: clip`** on the landing, not `hidden`: Work and Contact run below the screen edge, and focusing them was scrolling the "hidden" container.
- **Entering** is a plain route change for now. The eye dive replaces it in phase 4.
- **`public/resume.pdf`** is a one-page placeholder PDF until you add the real one.
- **About's eyes** stay at the brief's 0.33h for now (flagged in phase 2).

## Phase 4: Eye dive and routing

- **One route for every section** (`/:section/:slug?` → `SectionRoute`), so the section view stays mounted when you move between sections and can cross-fade and slide. An unknown section shows the 404.
- **`DiveProvider`** owns a single fixed overlay (black pupil, colour layer, two eyelids). It watches every location change in a layout effect and chooses the transition there, so browser back and forward get the same treatment as clicks:
  - Character click: the full eye dive (look 150ms, pupil grows 500ms, colour opens 250ms). Timings follow the brief.
  - Landing to section by a link or browser forward, or a deep link on first load: the eye-open entry, two black eyelids parting over 450ms.
  - Section to landing (back pill, Escape, browser back): the reverse dive. The colour shrinks to the character's real pupil position (measured after the landing mounts), then the pupil shrinks back into the eye, then the character blinks.
  - Section to section: the background cross-fades over 600ms while content slides out left and in from the right.
- **The "look" beat snaps.** The clicked character's pupils jump to centre instead of springing, as the brief says. The others glance at its face (their pupils aim at a point a third of the way down its body).
- **The colour opens from the screen centre** on entry, per the brief. On exit it shrinks toward the pupil itself, so the reverse lands precisely in the eye.
- **Escape** goes up one level: from `/work/:slug` to `/work`, and from a section to the crowd. It's ignored while typing in a form field, and dialogs (the plain list) catch it first.
- **Focus.** On arrival, focus moves to the section title. When you return to the crowd with the keyboard, focus goes back to the character you left from (pointer users aren't given focus, which would pop its bubble open).
- **The back pill** is a real link to `/` (so middle-click and new-tab still work); a plain click plays the reverse dive.
- **Clicks during a dive are ignored**, and the landing ignores the pointer until the dive finishes.
- **The section chunk is preloaded** at the start of a dive, so the page is ready under the pupil before the colour opens.
- **Reduced motion:** entering and leaving are ~200ms colour cross-fades; switching is a 200ms fade.
