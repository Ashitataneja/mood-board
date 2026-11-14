# The Mood Board

Ashita Taneja's portfolio. A crowd of shape characters; each one is a section. See `BRIEF.md` for the full spec and `DECISIONS.md` for assumptions.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run lint
npm run format
```

## Where things live

| Path                    | What                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/content/`          | All editable text: `sections.ts` (cast + hero copy), `work.ts` (case studies), `gallery.ts`, `writing/*.mdx` |
| `src/styles/tokens.css` | Colours, motion curves, type scale                                                                           |
| `src/characters/`       | Shapes, faces, moods, life behaviours (phase 2)                                                              |
| `src/routes/`           | One file per route, lazy-loaded                                                                              |
| `/playground`           | Dev page for tokens, type and (from phase 2) every character × mood                                          |
