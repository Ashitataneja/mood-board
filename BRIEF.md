# Build prompt: "The Mood Board" — Ashita Taneja's portfolio

Paste everything below into Claude Code (or save it as `BRIEF.md` in an empty folder and tell Claude Code: "Read BRIEF.md and build it phase by phase").

---

## 0. Who you are and how to work

You are a senior creative front-end engineer and motion designer. You are building my personal design portfolio. It must feel alive, smooth and playful, but it is still a **professional portfolio for interaction-design roles at companies like Google, Microsoft and Amazon**. Charm comes from motion, not from clutter.

How I want you to work:

- Work **phase by phase** (section 14). At the end of each phase: run the dev server, check it in the browser, fix what's broken, then stop and give me a short summary plus what to look at. Do not jump ahead.
- Commit to git after each phase with a clear message.
- If something in this brief is ambiguous, pick the option that keeps motion smooth and the site usable, write the assumption in `DECISIONS.md`, and keep going. Only stop and ask me for things you cannot decide (for example, which email address or form service to use).
- Never invent facts about me or my projects. Anything you don't know goes in as a visible `[PLACEHOLDER]`.
- Keep all content in data files (section 11) so I can edit text without touching components.

---

## 1. The concept in one paragraph

The portfolio is **a crowd of shape characters, and each character _is_ a section**. There is no navigation bar. Each character has a mood that matches its section (Work is intense, About is shy, Writing is sleepy, Gallery is excited, Contact is eager, Résumé is deadpan). Every character watches your cursor, blinks, breathes, flinches if you move too fast, and falls asleep if you leave them alone. Click a character and you **dive in through its eye** into its world. Inside, content runs **horizontally**, the character **rolls along the bottom edge as a progress bar**, and the other characters **peek up from the bottom edge** as the way to move between sections. Inside a case study, the character's **face changes with the story** (worried at the problem, curious during research, surprised at the insight, smiling at the solution, proud at the impact).

Name of the idea: **The Mood Board** (a literal board of moods).

---

## 2. Tech stack

- **Vite + React + TypeScript**.
- **Motion** (`motion`, formerly Framer Motion) for springs, layout animation, gestures (drag, fling) and `AnimatePresence`.
- **React Router** for real URLs: `/`, `/work`, `/work/:slug`, `/about`, `/writing`, `/writing/:slug`, `/gallery`, `/contact`, `/resume`. Browser back and forward must work. Deep links open straight into the section (skip the crowd intro, but play a short eye-open entry).
- **Plain CSS with CSS custom properties** (CSS Modules are fine). No Tailwind. No UI kit.
- Content as **TypeScript data files** for sections, and **MDX** for blog posts and case-study body text (`@mdx-js/rollup`).
- No canvas or WebGL is needed. Everything is DOM + SVG, animated with `transform` and `opacity` only.
- Deployable to Vercel or Netlify as a static site.

---

## 3. Design tokens

```css
:root {
  /* stage */
  --night: #141414; /* landing background */
  --ink: #1b1a17; /* text, outlines */
  --paper: #f2e8d5; /* warm off-white */
  --white: #ffffff;

  /* character colours (one per section) */
  --work: #2b4bf2; /* electric blue */
  --about: #ff4fa3; /* hot pink */
  --writing: #1f6b43; /* deep green (dark enough for paper-coloured text) */
  --gallery: #ffe13b; /* acid yellow */
  --contact: #ff5a36; /* signal red-orange */
  --resume: #f2e8d5; /* paper */

  /* accent tints for placeholders and tiles */
  --tint-lilac: #9fb4ff;
  --tint-mint: #7fd1a4;

  /* motion */
  --spring-pop: cubic-bezier(0.34, 1.56, 0.64, 1); /* overshoot, for hover and settle */
  --ease-dive: cubic-bezier(0.7, 0, 0.2, 1); /* for the eye dive */
  --ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

Text colour rules (these pass WCAG AA; keep them):

| Background                             | Text colour |
| -------------------------------------- | ----------- |
| work, writing, night                   | paper       |
| about, gallery, contact, resume, paper | ink         |

**Fonts** (Google Fonts, self-host with `@fontsource` if possible):

- **Anton**: display. Section titles, character names, big numbers.
- **Instrument Sans** (400/600/700): body and UI.
- **Space Mono** (400/700): small labels, eyebrows, metadata, the résumé typewriter.

Type scale (desktop): display 210px / 0.9, H1 84px, H2 66px, H3 40px, body 20–22px / 1.45, label 13–15px mono with 2px letter-spacing. Scale everything down fluidly with `clamp()` for smaller screens.

---

## 4. The characters

These must be **original characters**. I've shown references, but do not copy any existing illustrator's characters. The style is: **flat bold shapes, no outlines on the body, big white eyes with black pupils, one simple mouth line, optional brows. No cheeks, hair or limbs.** Keep them grown-up and moody, not childish.

### 4.1 The cast

| id        | Section | Shape                                             | Colour      | Default mood | Hover line                                              |
| --------- | ------- | ------------------------------------------------- | ----------- | ------------ | ------------------------------------------------------- |
| `work`    | Work    | squircle (superellipse, n≈4.2)                    | `--work`    | `intense`    | "I'm the serious one. Six case studies in here."        |
| `about`   | About   | 5-petal flower                                    | `--about`   | `wink`       | "Hi. I'm a bit shy. Commerce, psychology, then design." |
| `writing` | Writing | tall arch (semicircle top, flat sides and bottom) | `--writing` | `sleepy`     | "I overthink things. Professionally."                   |
| `gallery` | Gallery | 14-point starburst                                | `--gallery` | `open`       | "Ooh, pictures! Sketches, photos and experiments."      |
| `contact` | Contact | scalloped cloud (8 bumps)                         | `--contact` | `grin`       | "Say hi! I'd love to hear from you."                    |
| `resume`  | Résumé  | rounded square (superellipse, n≈9)                | `--resume`  | `deadpan`    | "Just the facts. One page."                             |

### 4.2 Shapes

Generate each body as an **SVG path** from a function (not an image), so it stays crisp at any size and can be morphed later:

- squircle and square: superellipse `x = sign(cos t)·|cos t|^(2/n)`, the same for y.
- flower: polar `r(t) = 39 + 11·cos(5t)` (in a 100-unit box), rotated so a petal points up.
- starburst: 28 points alternating radius 50 and 40.
- cloud: polar `r(t) = 43 + 7·|sin(4t)|`.
- arch: semicircle top whose radius equals half the width, then straight sides down to a flat bottom.

Put these in `src/characters/shapes.ts` as `shapePath(shape, width, height): string`. Memoise.

### 4.3 The face system

One `<Face>` component, used at every size (from 18px eyes on the rolling progress character to 84px eyes on the landing).

Parts:

- **Two eyes:** white circles of size `E` (default `0.2 × min(w, h)`), gap `0.32 × E`, horizontally centred. Vertical position depends on the shape: squircle `0.27h`, arch `0.38w` from the top, everything else `0.33h`.
- **Pupils:** black circles, size `E × pupilScale` (set by mood). They **track the pointer**: offset is the unit vector from the eye centre to the pointer, multiplied by `min(1, distance / 260) × 0.2E`. Smooth this with a spring (stiffness ~300, damping ~25) so the eyes glide and never jitter.
- **Lids:** a rectangle in the body colour that slides down from the top of each eye. Height 0–100% is set by mood. When a lid is partly or fully closed, draw a thin line in the text colour along its lower edge, so a closed eye reads as a closed eye.
- **Blink:** every 4–7 seconds (randomised per character, never in sync), both lids close and open in about 140ms.
- **Brows (optional):** two short rounded bars above the eyes, rotated ±14° for worry.
- **Mouth:** one SVG path in a 60×30 viewBox, stroke width 4 in the text colour, round caps. Filled mouths use ink as the fill. **Morph between mouth paths** when the mood changes (use Motion's path animation, or `flubber` if the point counts differ).

Mouth paths:

```ts
flat: 'M12 15 L48 15';
smile: 'M10 8 Q30 32 50 8';
small: 'M18 12 Q30 22 42 12';
worry: 'M12 24 Q30 8 48 24';
o: 'M22 14 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z'; // filled
open: 'M14 6 Q30 36 46 6 Z'; // filled
grin: 'M6 6 Q30 36 54 6 Z'; // filled
```

### 4.4 Moods

```ts
// lidL / lidR: 0–100 (% closed); pupil: scale of E; look: pupils biased upward
intense:   { lidL: 0,   lidR: 0,   pupil: .56, mouth: 'flat' }
wink:      { lidL: 0,   lidR: 100, pupil: .45, mouth: 'smile' }
sleepy:    { lidL: 50,  lidR: 50,  pupil: .42, mouth: 'small' }
open:      { lidL: 0,   lidR: 0,   pupil: .38, mouth: 'open' }
grin:      { lidL: 8,   lidR: 8,   pupil: .45, mouth: 'grin' }
deadpan:   { lidL: 38,  lidR: 38,  pupil: .30, mouth: 'flat' }
worried:   { lidL: 12,  lidR: 12,  pupil: .34, mouth: 'worry', brows: true }
curious:   { lidL: 0,   lidR: 0,   pupil: .46, mouth: 'o', look: 'up' }
surprised: { lidL: 0,   lidR: 0,   pupil: .74, mouth: 'open' }
smile:     { lidL: 10,  lidR: 10,  pupil: .45, mouth: 'smile' }
proud:     { lidL: 100, lidR: 100, pupil: .40, mouth: 'grin' }
asleep:    { lidL: 100, lidR: 100, pupil: .40, mouth: 'flat' }
flinch:    { lidL: 55,  lidR: 55,  pupil: .24, mouth: 'worry', brows: true }
blush:     { lidL: 20,  lidR: 20,  pupil: .35, mouth: 'small' } // plus a soft pink glow, About only
```

Every mood change animates: lids and pupil size spring, mouth morphs, brows fade in or out. Nothing snaps.

### 4.5 Life behaviours (global)

- **Breathing:** each body scales very slightly (x 1→1.012, y 1→1.022) from its bottom centre on a ~3.4s loop, staggered per character.
- **Flinch:** if pointer speed goes above ~4.5 px/ms, all visible characters switch to `flinch` for 450ms and shrink to 0.97, then recover with a spring.
- **Sleep:** after 9 seconds with no pointer, scroll or key input, everyone switches to `asleep` one by one (staggered ~300ms), and a soft "z z z" floats up from Work. Any input wakes them, staggered the other way.
- **Pointer tracking:** a single `pointermove` listener at the root writes into a shared motion value (store it in context). Characters read it. **Do not re-render React on every mouse move.** Use motion values and `useTransform`.

Put all of this in `src/characters/` with a `useMood()` hook and a `CharacterProvider` for the shared pointer, idle and flinch state.

---

## 5. Landing: the crowd (`/`)

Canvas reference size: 1440×900. Lay it out at that size, then scale to the viewport.

- Background `--night`.
- My name **ASHITA TANEJA** in Anton, ~212px, paper colour, top-left (60, 26).
- Under it, a Space Mono label: `DESIGNER + RESEARCHER · HOVER TO MEET THE MOODS · CLICK ONE TO GO INSIDE`.
- The crowd, huddled along the bottom, overlapping and cropped by the bottom edge, back to front:

| id      | x    | y   | w   | h   |
| ------- | ---- | --- | --- | --- |
| writing | 400  | 330 | 280 | 560 |
| gallery | 900  | 300 | 340 | 340 |
| about   | 140  | 520 | 340 | 340 |
| work    | 560  | 450 | 420 | 500 |
| contact | 1020 | 560 | 320 | 320 |
| resume  | 1250 | 650 | 180 | 180 |

- Each character shows its name in small Space Mono below its mouth, in its text colour.
- **Hover or focus a character:**
  - It rises 28px and scales to 1.07 with `--spring-pop`.
  - Its mood brightens (sleepy becomes smile, deadpan becomes smile, the others stay as they are).
  - The **rest of the crowd shuffles away from it**: push each one sideways by `60 × max(0, 1 − |dx| / 560)` px, scale 0.97, drop 6px. This must feel like a crowd making room.
  - A speech bubble (paper on ink, 26px radius, hard 6px shadow in the character's colour) appears above it with the section name in Anton and the hover line.
- A small "In a hurry? Plain list" button sits top-right (section 9).
- Every character is a real `<button>` with an `aria-label` like "Work. I'm the serious one. Six case studies in here. Opens the section."

---

## 6. Entering a character: the eye dive

This is the signature moment. Total about 900ms.

1. **Look (0–150ms):** the clicked character's pupils snap to look straight at the viewer (centre). The others glance at it.
2. **Pupil grows (150–650ms):** the character's left pupil scales up from its own position until a black circle covers the whole viewport (`--ease-dive`). Use a fixed overlay circle positioned at the pupil's screen coordinates and animate its `scale`. Do not animate width and height.
3. **Colour (650–900ms):** inside the black, the section's colour opens from the centre as a circle (clip-path circle 0% to 150%). The section content fades and rises in (opacity 0→1, y 24→0), staggered.
4. **Leaving (back button or Escape):** reverse it. Section colour shrinks to a pupil, the pupil shrinks back into the character's eye, then the character blinks once.
5. **Switching sections while inside** (peeking characters): skip the black. Cross-fade the background colour over 600ms, slide the old content out to the left and the new in from the right.

With reduced motion on, all of this becomes a 200ms cross-fade.

---

## 7. The section shell (shared by every section)

- Full viewport in the section colour.
- **Top-left:** "← Back to the crowd" pill (inside a case study: "← Back to Work").
- **Top-right:** "In a hurry?" pill.
- **Horizontal track:** content panels in a row with 44px gaps and 64px side padding.
  - Native horizontal scroll (`overflow-x: auto`, hidden scrollbar), so touch and trackpads work.
  - Vertical mouse wheel scrolls horizontally: convert `deltaY` to `scrollLeft`, smoothed with a lerp (~0.12 per frame) so it glides. Use a non-passive wheel listener added in an effect.
  - Arrow keys and PageUp/PageDown move panel by panel when the track has focus.
  - The **active panel** (the one nearest the viewport's left third) lifts by 6px and gains a hard 14px ink shadow. The others sit flat.
- **The rolling progress character:** a 76px copy of the section's character, with a 4px ink outline so it shows against its own colour, travels along a thin line at the bottom (x 40 → ~900) as you scroll.
  - Its **body rotates according to the distance travelled** (rolling: `angle = distance / radius`). Its **face stays upright**.
  - Each shape moves in its own way: the squircle and square tumble, the flower spins, the arch waddles (rocks ±8° instead of rolling), the burst rolls, the cloud bounces slightly as it rolls.
  - Above it, a Space Mono label shows the section name and either a percentage or the current case-study stage ("03 · INSIGHT").
- **Peeking characters (the navigation):** bottom-right, every other section's character peeks up from below the screen edge so only its eyes and the top of its head show. Their eyes follow the pointer.
  - On hover or focus, it rises 46px with a spring and shows its name in a small ink pill.
  - Click to switch sections (section 6, step 5).
- Escape always goes back one level.

---

## 8. Inside each character

Each section has its own interior behaviour. **The shell in section 7 stays the same everywhere.**

### 8.1 Work: "the focused mind" (`/work`)

- **Background:** two very large, faint versions of Work's eyes (about 600px, white at 8% opacity, pupils at 12%) fill the back wall and follow the pointer slowly (heavier spring). You are being watched by someone serious.
- **Panels:** a hero panel ("WORK" in display type, "Six case studies. Scroll sideways.") followed by one card per case study: eyebrow, cover image area, title in Anton 84px, a one-line summary, tag pills, and a "Go inside →" button.
- **Card hover:** a 3D tilt toward the pointer (max 6°, `perspective: 1000px`) and a glare highlight that follows the pointer.
- **Opening a case study** (`/work/:slug`) uses a shared-layout animation: the card's title flies to become the case-study title.

#### Case study page: the mood arc

- Panels follow the story: `problem → research → insight → solution → impact`. Each panel has a `mood` (default mapping: worried, curious, surprised, smile, proud).
- **Both** the rolling progress character **and** the big background eyes change mood as each panel becomes active. Mouth morphs, lids spring, brows fade.
- Each panel shows a small chip, "MOOD · WORRIED".
- Panels can contain: big number stat, heading, body (MDX), image or video, quote card, before/after slider. Build these as MDX components.
- The last panel has "Next case study →", which plays a quick sideways cross-fade to the next case.

### 8.2 About: "it opens up slowly" (`/about`)

- In the centre, a large version of the flower. Its **petals start closed** around my photo (each petal is its own SVG path that can rotate open).
- As you scroll, **petals unfold one by one**. Each opened petal reveals one fact on a small card that slides out from under it:
  1. Commerce
  2. Psychology
  3. Design: M.Des, Smart Product Design, IIT Jodhpur (2024–2026)
  4. Delhi
  5. Before design: KPMG, Sociowash, Karnival
- **Shy behaviour:** if the pointer moves fast, the petals flinch half-closed and the flower switches to `blush` (a soft pink radial glow fades in behind it). When the pointer is still or slow for 600ms, it opens again.
- After the flower, the panels continue with a short bio (`[PLACEHOLDER: 3–4 sentence bio]`) and a row of photos.

### 8.3 Writing: "its dreams" (`/writing`)

- Darker background (mix `--writing` with 40% night). Slow drifting dots like stars, parallaxing gently with the pointer.
- Posts are **floating thought bubbles** (rounded blobs in paper colour) that drift slowly on their own sine paths. They are slightly blurred (`filter: blur(2px)`) and at 70% opacity.
- **Hover a bubble:** it comes into focus (blur 0, opacity 1, scale 1.05) and the others dim further.
- **Click:** "lights down". Everything except the post fades to near-black, and the post opens as a centred reading column (`/writing/:slug`, MDX, max 680px wide, 20px body text). Here, and only here, content scrolls **vertically**, because it's long-form reading.
- The Writing character sits sleepy in the corner. It wakes up (switches to `smile`) when you reach the end of a post.

### 8.4 Gallery: "it can't contain itself" (`/gallery`)

- On entry, all images **burst out from the centre** and land scattered across a wide area, each tilted −8° to 8°, with a staggered spring.
- **Drag and fling:** every image can be dragged (Motion `drag` with inertia), glides to a stop, and stays within the bounds of the area.
- **Click an image:** it opens large in the centre, the rest shuffle back and dim, and arrow keys move to the next or previous image. Escape closes it.
- The gallery area is wider than the screen, so horizontal scroll still applies. The rolling starburst still tracks progress.
- Every image needs real alt text. Add an `alt` field in the data file and fail the build if any image is missing one.

### 8.5 Contact: "it talks to you" (`/contact`)

- No form layout. The cloud character sits on the left. Its questions appear one bubble at a time, as a chat:
  1. "Hi! What's your name?"
  2. "Nice to meet you, {name}. What should we talk about?" (offer quick-reply chips: "A role", "A project", "Just saying hi", plus free text)
  3. "Where can I reply?" (email field, validated)
  4. "Anything else?" (optional message)
- Each answer appears as my-side bubble on the right. The cloud shows a typing indicator (three bouncing dots) for ~600ms before each question.
- **Send:** the cloud jumps (squash, then stretch), switches to `grin`, and shows "Got it! I'll reply soon." plus direct links: email, LinkedIn, résumé.
- Submission: use **Formspree** (or whatever service I give you) through an environment variable. Ask me which service and endpoint to use. Until then, use a `mailto:` fallback.
- Under the hood it's a real `<form>` with labelled inputs, so screen readers and keyboard users get a normal form.

### 8.6 Résumé: "the joke is that nothing moves" (`/resume`)

- Deliberately rigid. A strict grid on paper colour, black hairlines, Space Mono everywhere.
- Text **types out line by line** (fast, ~8ms per character, one line at a time), then stops. No springs, no wobble.
- The square character sits in the corner, deadpan. It blinks once, slowly, when typing finishes. That's the only motion.
- The rolling progress character **slides**, it doesn't roll. Square things don't roll.
- Content: Education (M.Des, Smart Product Design, IIT Jodhpur, 2024–2026), Experience (KPMG, Sociowash, Karnival: `[PLACEHOLDER: roles and dates]`), Skills `[PLACEHOLDER]`, Publications `[PLACEHOLDER]`, and a big "Download PDF ↓" button (`/public/resume.pdf`, placeholder file).
- With reduced motion, the text appears instantly.

---

## 9. "In a hurry?": the plain list

Available from the landing page and every section. It's a full-screen overlay on night: a big "THE QUICK VERSION" title, six large coloured buttons (one per section), a list of every case study with its one-line summary, plus Résumé download and Contact. **It must be fully usable without any of the playful interactions.** Recruiters with 90 seconds should be able to get everything from here. Escape or "Back to the moods" closes it.

---

## 10. Responsive and touch

- **Desktop ≥1024px:** everything as described.
- **Tablet and mobile:**
  - The landing crowd becomes a tighter 2-column huddle. Eyes follow the last touch point.
  - The first tap on a character shows its bubble and plays a little bounce. A second tap (or tapping the bubble) enters.
  - Sections keep horizontal swiping with CSS scroll-snap (`x mandatory`). Panels are 86vw wide.
  - Peeking characters shrink to a row of 44px faces along the bottom edge.
  - The Gallery fling still works with touch drag.
- Test at 390×844, 768×1024, 1280×800 and 1440×900.

---

## 11. Content model

`src/content/sections.ts` holds the cast (section 4.1) plus each section's hero copy.

`src/content/work.ts`:

```ts
export const caseStudies = [
  {
    slug: 'bharosa',
    title: 'BHAROSA', // working title for my M.Des thesis
    eyebrow: 'CASE STUDY 01 · M.DES THESIS',
    summary:
      'How adults with visual impairment in India plan money, and how far they would trust AI to help.',
    tags: ['23 participants', 'Field research', 'AI trust'],
    cover: '[PLACEHOLDER]',
    panels: [
      {
        stage: 'problem',
        mood: 'worried',
        title: 'Money is hard. Harder when apps are not built for you.',
        body: 'Adults with visual impairment (VI) in India manage money through apps, cash and people they trust. I wanted to understand how they plan and decide, not only how they pay.',
      },
      {
        stage: 'research',
        mood: 'curious',
        stat: '23',
        title: 'conversations: 13 VI, 10 sighted',
        body: 'Field visits including NAB Delhi, an 11-step qualitative pipeline, and one honest pivot: my first finding did not hold up, so I moved from access to planning.',
      },
      {
        stage: 'insight',
        mood: 'surprised',
        title: 'Advice, yes. Autopilot, never.',
        body: 'Almost everyone wanted AI to advise on money decisions. Almost no one wanted it to act on its own.',
      },
      {
        stage: 'solution',
        mood: 'smile',
        title: '[PLACEHOLDER: design response]',
        body: '[PLACEHOLDER]',
      },
      {
        stage: 'impact',
        mood: 'proud',
        title: '[PLACEHOLDER: what changed]',
        body: '[PLACEHOLDER]',
      },
    ],
  },
  {
    slug: 'aangan',
    title: 'AANGAN',
    eyebrow: 'CASE STUDY 02',
    summary: 'A village courtyard where families aged 40–70 live as neighbours again.',
    tags: ['n=39 survey', 'Interviews', 'Playful UX'],
    panels: [],
  },
  {
    slug: 'hand-it-over',
    title: 'HAND IT OVER',
    eyebrow: 'CASE STUDY 03',
    summary: 'Why handing your phone to someone feels risky in Indian homes.',
    tags: ['40-person survey', 'Diary study', 'Privacy'],
    panels: [],
  },
  {
    slug: 'clearcase',
    title: 'CLEARCASE',
    eyebrow: 'CASE STUDY 04',
    summary: 'Keeping humans in charge when AI rejects an ad.',
    tags: ['AI oversight', 'Product design'],
    panels: [],
  },
  {
    slug: 'lumen',
    title: 'LUMEN',
    eyebrow: 'CASE STUDY 05',
    summary: 'A design system migrated, audited and documented in Figma.',
    tags: ['Design systems', 'Figma'],
    panels: [],
  },
  {
    slug: 'agent-project',
    title: '[AGENT PROJECT]',
    eyebrow: 'CASE STUDY 06',
    summary: 'Overseeing AI agents that negotiate with each other.',
    tags: ['AI agents', 'Oversight'],
    panels: [],
  },
];
```

Case studies with empty `panels` show a "Coming soon" state, with the character in `sleepy` mood and the line "Still brewing."

Blog posts: `src/content/writing/*.mdx` with frontmatter `title, date, standfirst`. Create 3 placeholder posts.

Gallery: `src/content/gallery.ts` with `{ src, alt, caption, width, height }`. Use 12 coloured placeholder rectangles until I add images.

---

## 12. Accessibility (non-negotiable)

My thesis is about accessibility, so reviewers will check this.

- Every character, peeking face and card is a real `<button>` or `<a>` with a meaningful accessible name. Decorative SVG (eyes, mouths, background eyes, stars) is `aria-hidden`.
- Visible focus styles everywhere (3px dashed outline in a contrasting colour, offset 4–6px). Focusing a character triggers the same response as hovering it.
- Full keyboard path: Tab through the crowd, Enter to dive in, arrows through panels, Tab to the peeking faces, Escape to go back.
- **`prefers-reduced-motion`:** no breathing, blinking, flinching, drifting or rolling. The eye dive becomes a cross-fade. Mood changes still happen, but instantly. The gallery burst becomes a simple fade-in grid.
- Announce section changes and case-study stage changes through a polite `aria-live` region ("Work, case study Bharosa, stage 3 of 5: Insight").
- Colour contrast at AA minimum for all text (use the pairings in section 3).
- Horizontal tracks get `role="region"`, an `aria-label` and `tabIndex=0`.
- Run axe (for example `@axe-core/react` in dev) and fix every issue it reports.

---

## 13. Performance and motion quality

- Animate **only `transform` and `opacity`** (plus `clip-path` for the dive). No layout properties in animations.
- One pointer listener, one idle timer and one `requestAnimationFrame` loop at most, all shared through context and motion values. Characters must not cause React re-renders on pointer move.
- Springs, not linear tweens, for anything a character does. Default spring: stiffness 260, damping 22. Hover pop: stiffness 400, damping 18.
- Must hold **60fps** on a mid-range laptop. Check with the Performance panel during hover, the dive and fast scrolling.
- Lighthouse targets: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95.
- Lazy-load images and each section's interior code (`React.lazy` per route).
- Preload the Anton font. Use `font-display: swap`.

---

## 14. Build phases (do them in order, stop after each)

1. **Setup:** Vite + React + TS, Motion, Router, fonts, tokens, ESLint and Prettier, folder structure, and a `/playground` route.
2. **Characters:** shape generators, `<Character>`, `<Face>`, the mood system, blink, breathe, pointer tracking, flinch and sleep. Show all 6 characters × all moods on `/playground`, with buttons to switch moods and preview the mouth morphs.
3. **Landing crowd:** layout, hover and focus behaviour (rise, crowd shuffle, speech bubble), responsive scaling, the hurry button.
4. **Eye dive and routing:** enter, exit, switch, browser back and forward, deep links, Escape.
5. **Section shell:** horizontal track with wheel smoothing, active panel, rolling progress character (per-shape movement), peeking navigation, plain-list overlay, live region.
6. **Work and the case-study mood arc:** watching background eyes, tilt cards, shared-layout transition into a case study, Bharosa fully built, "Coming soon" state.
7. **About:** the unfolding flower, shy and blush behaviour.
8. **Contact:** the chat form, typing indicator, send celebration, mailto fallback.
9. **Writing, Gallery, Résumé:** dreams and reading mode, burst-and-fling gallery with lightbox, typewriter résumé.
10. **Polish:** mobile and touch, reduced motion, axe fixes, performance pass, Lighthouse, meta tags and Open Graph image (the crowd), favicon (Work's face), 404 page (all characters looking confused, mood `worried`, "Nothing here. Back to the crowd?").

After each phase, give me: what you built, what to try, anything you had to assume, and anything that still feels off.

---

## 15. Don'ts

- No top navigation bar, hamburger menu or sticky header.
- No scroll-jacking that changes scroll speed or traps the user. The wheel-to-horizontal mapping must feel like normal scrolling.
- No lorem ipsum. Use `[PLACEHOLDER: what goes here]`.
- No copying of the reference illustrations, and no emoji as UI.
- No gradients for decoration, no glassmorphism, no generic SaaS card styling.
- Don't add sections I didn't ask for.
- Don't let the playfulness hide the content: every case study must be reachable in two clicks from the landing page, and in one from the plain list.
