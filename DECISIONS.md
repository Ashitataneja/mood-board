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

## Phase 5: Section shell

- **Shell structure.** `SectionRoute` holds what stays put across sections: background, back pill, "In a hurry?" and the peeking characters. Each section body is its own lazy chunk (`src/sections/registry.ts`), preloaded when a dive starts. Bodies render a `ShellTrack` (the horizontal track plus the rolling character) and `Panel`s.
- **Wheel.** Applies only when the gesture is mostly vertical and the track can actually scroll; horizontal trackpad swipes and touch stay native. The glide keeps its own float position (lerp 0.12 per frame), so it never stalls on whole-pixel rounding. Ctrl+wheel (pinch-zoom) is left alone.
- **Keys.** ←/→ and PageUp/PageDown move panel by panel; Home/End work when the track itself has focus. They're ignored inside form fields.
- **Active panel.** The panel under a point one third across the track. At the very end of the scroll, the last panel wins, because it can never reach the left third. Panels are marked with a `data-active` attribute written directly to the DOM, so scrolling doesn't re-render them.
- **The active shadow** is a separate ink layer behind the card that fades in by opacity, rather than an animated `box-shadow`.
- **Card surfaces.** The brief doesn't say what panels look like, so they're paper cards with a 3px ink border (white cards on Résumé, so they don't vanish paper-on-paper). The hero panel has no card and sits straight on the section colour.
- **Rolling character.** 76px on desktop, 56px on phones (where every pixel of panel height counts). The line runs from x=40 to just before the peeking characters (≈880px at 1440). Per shape: Work's squircle tumbles (rolls, lifting slightly on its corners), the flower spins 1.5× its roll, the arch waddles ±8° without rolling, the burst rolls, the cloud rolls with a bounce, and the square slides (brief §8.6). With reduced motion it just slides. The percentage is written straight to the DOM, with no re-render per scroll frame.
- **Peeking characters.** All are scaled to the same width (96px, or 58px on small screens), so every face reads at the same size; tall Writing just hangs lower. On phones they become a centred row along the bottom and the progress line moves above them. Their accessible names are "Go to About" and so on.
- **Live region.** One polite `role="status"` region. It announces the section (or case study) on arrival and each case-study stage as it becomes active ("Work, case study BHAROSA, stage 3 of 5: Insight").
- **Section bodies for now.** Each section shows real content from the data files as cards: case studies with their mood arc, About facts, posts, gallery tiles, contact links and résumé blocks. Phases 6–9 replace each one with its bespoke interior. Some data moved out of components into `src/content/about.ts` and `src/content/resume.ts`.
- **Known rough edge.** On short phones (≈664px tall), a Work card's "Go inside →" sits below the fold inside the card, which scrolls. Revisit in phase 10.

## Phase 6: Work and the case-study mood arc

- **Background eyes.** The same `Face` component, with translucent fills (white eyes at 8%, pupils at 12%), no mouth, brows on, and a heavy spring (stiffness 40, damping 16). Each eye is `min(600px, 36vw, 62vh)`. The eyes live in the persistent shell (not the sliding body), so they don't duplicate or restart when you move between the Work index and a case study. Bodies steer their mood through a small `BackdropMoodContext`.
- **Tilt cards.** At most 6°, at `perspective: 1000px`, mouse only (touch and reduced motion get no tilt). The glare is a soft blurred white disc in `soft-light` blend, moved by transform. It's a highlight, not a decorative gradient.
- **Shared-layout title.** The card's title and the case study's `h1` share a Motion `layoutId`, so the title flies from the card into place. To let that read, the body transition depends on the move:
  - index ↔ case study: **morph**. The new view appears at once, the old one fades in 300ms, and the hero panel skips its fade-and-rise when you arrived from a card.
  - case study → case study ("Next case study →"): **quick slide**, 420ms.
  - section → section: the 600ms slide from phase 4.
- **Scroll memory.** Leaving a case study back to Work restores the index scroll, so you return to the card you opened and the title flies back to it.
- **Case-study MDX.** Panel text stays in `work.ts`. An optional `src/content/work/<slug>/<stage>.mdx` renders under a panel's body with the building blocks `Stat`, `Quote`, `Figure` (image, video or placeholder) and `BeforeAfter`. The before/after slider is driven by a real range input (so it works with the keyboard and screen readers) and reveals with transforms only. Bharosa has placeholder MDX for research (quote), solution (figure, before/after) and impact (stat). Nothing in them is invented; every value is a `[PLACEHOLDER]`.
- **Mood arc.** On each panel change, the rolling character and the background eyes take that panel's mood. The hero shows Work's usual `intense`, and "Coming soon" cases are `sleepy`.
- **Coming soon.** The panel also links to the next case study, so the chain of case studies never dead-ends.

## Phase 7: About

- **Scroll-driven flower.** The flower's panel is extra-wide; its stage is `position: sticky` (left: 0, which is the track's padding edge) and stays pinned while the track scrolls through it. The flower's progress (0–1) is how far the track has travelled through that pinned range, measured in one rAF-throttled scroll listener and written to a motion value (no React renders while scrolling).
- **Stops.** The panel holds six invisible `data-panel` stops (closed bud, then one per petal), spaced exactly across the pinned range. Arrow keys, PageUp/PageDown and phone scroll-snap therefore step petal by petal, and at stop k exactly k petals are open. To make this possible, the track now measures key-step targets with `getBoundingClientRect`, so stops nested inside a panel work.
- **Petals.** Each petal is its own SVG path: the brief's flower outline `r = 39 + 11·cos(5t)` between ±36° of the petal's angle, down to a hinge arc at radius 24 that frames the photo. A petal opens by flipping over its hinge, `scale(1, s)` along its own radial axis with s going −1 (folded over the photo) → 1 (open). It's transform-only and reads as a fold. Folded backs are a darker pink and open faces a lighter pink, both with a thin ink edge, because pink-on-pink petals were invisible against About's background.
- **Fact cards.** Each card slides and grows out from its petal's tip once that petal is mostly open. On wide screens: right column for petals 1–3, left column for 4–5. On narrow screens they share one slot under the flower, and each new card replaces the previous one.
- **Shy.** Uses the global flinch signal (pointer speed above 4.5 px/ms). The petals spring back to half-closed (edge-on) and a soft pink glow fades in behind the flower. After 600ms of calm they reopen with a softer spring. The rolling About character flinches as usual. None of this happens with reduced motion, which also shows the flower fully open from the start.
- **Accessibility.** The five facts are a real ordered list (with a visually hidden "Five things about me" heading) that is always in the DOM. Only their appearance animates. The petals are `aria-hidden`; the photo has alt text ("Portrait of Ashita Taneja").
- **Content.** `aboutPhoto` and `aboutPhotos` added to `src/content/about.ts`; all photos are placeholders. The facts follow the brief: Commerce, Psychology, Design (M.Des, IIT Jodhpur), Delhi, Before design (KPMG, Sociowash, Karnival). One-liners I don't know are `[PLACEHOLDER]`.

## Phase 8: Contact

- **One real form.** The chat is a single `<form>`. The current question is the label of the current input, earlier answers travel as hidden fields, and Enter (or the button) submits each step. The conversation is an `ol` with `role="log"`, so screen readers hear each new question. Focus moves to the new input only after the visitor has started, never on arrival, because arrival focuses the section title.
- **"Prefer a plain form?"** switches to the same four questions as an ordinary labelled form, all at once. It's for anyone who doesn't want the chat; it isn't in the brief.
- **Validation.** Name and topic are required. The email must look like `x@y.zz`; on failure the cloud says so, the input gets `aria-invalid` and a dashed border, and the message is announced (`role="alert"`). "Anything else?" is optional; its button reads "Send without a note" when it's empty.
- **Sending.** The form POSTs JSON (`name, topic, email, message, _subject`) to `VITE_CONTACT_ENDPOINT` (Formspree-compatible), with a `_gotcha` honeypot field to catch spam bots. With no endpoint set, Send opens the visitor's email app with a pre-filled subject and body, and the cloud's line becomes "Your email app should open with this ready to go…" rather than claiming it was sent. If the request fails, the cloud looks worried and offers "Email me directly" plus "Try again".
- **Cloud.** The cloud is 280px on desktop and 110px on phones, **with an ink outline**: on Contact's own red-orange its body was otherwise invisible. Its mood is curious while typing, grin otherwise, and worried on failure. On send it squashes, stretches up about 70px and lands (Motion keyframes, about 850ms). The typing indicator is three bouncing dots for 600ms (250ms and still with reduced motion).
- **Wheel fix (all sections).** A vertical wheel over anything that scrolls vertically and can still move in that direction (the chat log, a long card) now scrolls that element instead of moving the track sideways.
- **Tested** with Formspree mocked in the browser: success, server error, and retry. The posted payload was exactly the four answers plus the subject.

## Phase 9: Writing, Gallery, Résumé

- **A bug affecting every section, found and fixed here.** The section body's `AnimatePresence` had `initial={false}`. Motion passes that "skip initial animation" setting to every element inside, so the panels' fade-and-rise and the gallery burst never played when you arrived in a section. The presence now keeps initial animations on; only the body container itself appears instantly on first mount (the dive or eyelids are covering it anyway). I measured the burst frame by frame to confirm it now plays, and re-ran the phase 5–7 tests.

### Writing

- **Background** is `color-mix(in srgb, var(--writing) 60%, var(--night))`, stored as the section's `bg`, so the dive's colour layer matches the shell exactly. Paper text on it is well above AA.
- **Stars** live in the persistent shell (like Work's eyes): two seeded layers of dots that drift slowly via CSS and parallax with the pointer at 1.2% and 3%. Reduced motion stops both.
- **Bubbles.** Each post is a paper blob link on its own looping float path, blurred 2px at 70% opacity. Hover or focus brings it into focus (no blur, full opacity, scale 1.05) and dims the others to 35%. A bubble **pauses its drift while hovered or focused**, so it's easy to click. On touch screens (no hover) the bubbles are shown sharp. Small "thought" dots trail toward the sleepy Writing character in the corner. On phones the panel widens and the bubbles zig-zag, one per screen.
- **Reading mode** (`/writing/:slug`): a near-black layer fades in ("lights down"), the post rises in as a 680px column with 20px body text, and only this view scrolls vertically. The peeking characters dim to 30% (full on hover or focus) so the post is all you see. The Writing character in the corner wakes to `smile` when an IntersectionObserver sees the end of the post. Escape returns to Writing. Note that with today's one-line placeholder posts, the end is visible immediately, so it wakes at once.

### Gallery

- **Layout.** Images are scattered in two loose rows across an area about 1.9× the screen width (3.2× on phones), with seeded jitter and a tilt of −8°…8°. The burst comes from the middle of the screen, with a spring and 45ms stagger, timed to start after the panel has appeared.
- **Drag and fling.** Motion `drag` with momentum, constrained to the area with a little elastic. A drag never counts as a click.
- **Lightbox.** A portal dialog with the image as large as fits, plus caption, count, ←/→ buttons and Close. Arrow keys step through the images, Escape closes only the lightbox (it's caught before the section's Escape), Tab stays inside, and focus returns to the tile you were last viewing. The rest of the gallery dims and shrinks back slightly behind it. I didn't fly the tile into the lightbox with a shared layout: tiles can be rotated and dragged anywhere, and the flight looked unreliable.
- **Alt text is enforced at build time.** A Vite plugin compiles `src/content/gallery.ts` in `buildStart` and fails the build (and the dev server) if any `alt` is missing or blank, naming the entry. Verified by blanking tile 3.

### Résumé

- **One rigid sheet:** paper, 1px ink hairlines, Space Mono throughout, a header row (title, name, Download PDF) and four columns (Education, Experience, Skills, Publications). On phones it stacks into one scrolling column.
- **Typewriter.** Every line types in reading order, one at a time, 8ms per character, driven by a rAF clock, with a static block caret on the current line. The **full text is always in the DOM** (the untyped part is just transparent), so screen readers, search and copy-paste get everything immediately. Reduced motion shows it at once.
- **Nothing else moves.** Panels don't lift or fade in. The square in the corner is deadpan: its eyes are fixed (no pointer tracking) and it doesn't breathe, flinch or sleep. It blinks once, slowly (0.9s), when typing finishes. The rolling square slides, as before.

## Phase 10: Polish

- **Accessibility audit.** axe-core (WCAG 2.0/2.1/2.2 A and AA plus best practice) ran on 14 routes and states (including the plain list, the lightbox, the plain contact form and the reader) at 1440×900 and 390×844. It found 12 violations; all are fixed and the final run is **0**:
  - Writing bubbles rest at 82% opacity (was 70%), so their small date text clears 4.5:1. Unfocused bubbles now dim by extra blur rather than by dropping opacity.
  - Gallery placeholder labels sit on a paper chip and are CSS content, so a tile button's accessible name is exactly its alt text. The gallery behind the lightbox is `inert`.
  - The contact log is a `div role="log"` wrapping the list (a role isn't allowed on `ol`).
  - A panel that overflows its height becomes keyboard-focusable so it can be scrolled. This is re-checked when fonts load and when its content resizes.
- **Page titles** for every view ("Work, case study BHAROSA · Ashita Taneja"). They're set alongside the live-region announcement.
- **404.** The whole cast is `worried`, each looking somewhere different, with "Nothing here." and "Back to the crowd?".
- **`/playground` is dev-only.** It isn't in production builds.
- **Icons and sharing.** `scripts/make-icons.cjs` generates `favicon.svg` (Work's intense face, from the same superellipse maths), `apple-touch-icon.png` and `og.png` (the crowd at 1200×630, eyes up toward the name). The Open Graph and Twitter tags need an absolute URL; a build step fills it in from `VITE_SITE_URL`, falling back to Vercel's `VERCEL_PROJECT_PRODUCTION_URL` (set automatically on Vercel), else relative.
- **Font preload.** Anton and Space Mono (400/700, latin) are preloaded by a build step that finds their hashed file names.
- **`robots.txt`** added. Without it, the SPA rewrite served HTML at `/robots.txt`.
- **Text size floor.** `[PLACEHOLDER]` labels and the smallest labels are at least 12px.
- **Short phones.** On screens under 760px tall, Work cards tighten and hide their tags (the tags are repeated on the case study), so "Go inside →" is always visible. On short phones the landing keeps its proportions, with narrow night margins at the sides.
- **Résumé layout shift.** The typewriter used to split each line into typed and untyped text nodes. The untyped node moved with every character, which counted as about 100 layout shifts (CLS 0.12). Each line's full text is now one fixed node (transparent until typed; it's also what screen readers read), with the typed part as an overlay that only grows. The caret is gone: a moving caret is a shift too. CLS is now 0.
- **Reduced motion, audited.** On every route nothing animates once settled, faces don't change while idle (no blink, breath or flinch, even after a fast pointer), and the dive is a cross-fade without the pupil.
- **Measured performance** (production build, headless Chromium, so indicative): landing hover sweep, both dives, fast wheel on Work, the gallery burst and the flower scroll all ran at a median 16.7ms per frame with a 95th percentile ≤ 16.8ms. Only 2 frames went over 20ms, during the dive while the section's code loaded.
- **Lighthouse** (mobile defaults, production build):

  | Route         | Performance | Accessibility | Best practices | SEO  |
  | ------------- | ----------- | ------------- | -------------- | ---- |
  | /             | 94–95       | 100           | 100            | 100  |
  | /work         | 92          | 100           | 100            | 100* |
  | /work/bharosa | 91          | 100           | 100            | 100* |
  | /about        | 92          | 100           | 100            | 100  |
  | /writing      | 93          | 100           | 100            | 100  |
  | /gallery      | 91          | 100           | 100            | 100  |
  | /contact      | 91          | 100           | 100            | 100  |
  | /resume       | 92          | 100           | 100            | 100  |

  \* SEO was 91 before `robots.txt` was added; the only failing audit was robots-txt, now fixed.
