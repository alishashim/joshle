# AGENTS.md — Joshle

## Mission

Build **Joshle**, a tiny daily geography game for **joshle.alishashim.com**.

Joshle should feel like a polished independent web game in the same broad interaction family as MapTap / GeoHistory: a clue is shown, the player rotates a globe, drops a pin, submits, then sees distance and score.

The product must be:
- fun in roughly 20–90 seconds,
- excellent on mobile and desktop,
- cheap enough to operate at **$0 for the MVP**, excluding the user's existing domain,
- static-first and low-maintenance,
- visually intentional rather than template-like,
- easy for one person to keep adding daily puzzles to.

Do not expand the scope unless a requested feature directly improves that loop.

---

## Product concept

### MVP: Photo Josh

Each daily puzzle shows a real location photo with a small recurring fictional character, **Josh**, composited over it in the UI.

Josh is a deliberately simple original vector mascot stored in the repository. He can be a large-bodied/chubby adult cartoon character if desired, but **the joke must be the fictional recurring Josh character and his travels — not ridicule of an identifiable real person**.

The player answers one question:

> **Where in the world is Josh?**

Flow:
1. Show today's photo.
2. Player inspects geographic clues.
3. Player rotates/zooms a 3D globe.
4. Player taps/clicks once to place a guess pin.
5. Player can reposition the pin until submitting.
6. Submit locks the guess.
7. Reveal the real location, draw a geodesic line between guess and answer, show distance and a 0–5000 score.
8. Show a short location fact and image attribution.
9. Offer a spoiler-free Copy Result button.
10. Persist completion and streak locally.

### Later mode: Stat Josh

A future alternate mode can show a world statistic and ask the player to locate the country it belongs to. Do not build this until the photo mode is complete and polished.

---

## Hard constraints

1. **No runtime AI.** No LLM calls, image generation calls, embeddings, moderation APIs, or AI service dependencies.
2. **No paid map API required for MVP.** Use MapLibre GL JS with a free/open basemap provider behind a small provider abstraction.
3. **No backend required for MVP.** Daily puzzle data is static and committed to the repo.
4. **No accounts, auth, database, global leaderboard, chat, social feed, or admin dashboard in MVP.**
5. **No scraping random people's photos.**
6. Location photos must have known reuse rights. Prefer Public Domain / CC0. If CC BY or CC BY-SA is used, preserve complete attribution/license metadata and render it in the result state.
7. Never silently remove required map or photo attribution.
8. Must work well with touch, mouse, trackpad, and keyboard.
9. Must have a reduced-motion path.
10. Do not copy proprietary assets, copywriting, source code, distinctive layouts, or branding from MapTap, GeoHistory, GeoGuessr, etc.

---

## Recommended stack

Keep it deliberately boring:

- **Vite**
- **React**
- **TypeScript** with strict mode
- **MapLibre GL JS** for the globe
- **OpenFreeMap** as the initial public basemap source
- plain CSS / CSS Modules (choose one and stay consistent)
- Vitest for unit tests
- Playwright only for a very small set of end-to-end smoke tests if needed

Do not add a component framework unless the app genuinely needs it.
Do not add Tailwind unless the repository already uses it.
Do not add Redux/Zustand/etc. for this tiny state model.

If OpenFreeMap becomes unsuitable, preserve the map-provider boundary so a self-hosted PMTiles basemap can replace it without rewriting game logic.

---

## Architecture

Keep the codebase shallow and legible.

Suggested structure:

```text
src/
  app/
    App.tsx
    gameState.ts
  components/
    PhotoClue.tsx
    Globe.tsx
    GameHUD.tsx
    ResultSheet.tsx
    ShareButton.tsx
  game/
    distance.ts
    scoring.ts
    dailyPuzzle.ts
    share.ts
  content/
    puzzles.ts
    types.ts
  lib/
    storage.ts
    mapProvider.ts
  styles/
    globals.css
public/
  images/puzzles/
  mascot/
```

Prefer pure functions for date selection, distance, scoring, and share formatting.

Keep map-specific imperative code inside the Globe component or a dedicated map adapter. The rest of the app should not know MapLibre internals.

---

## Daily puzzle model

Use an explicit static schema. Example:

```ts
export type Puzzle = {
  id: string;
  date: string; // YYYY-MM-DD in the game's canonical timezone
  image: {
    src: string;
    alt: string;
    author?: string;
    sourceUrl?: string;
    license: 'PUBLIC_DOMAIN' | 'CC0' | 'CC_BY' | 'CC_BY_SA';
    licenseUrl?: string;
    attributionText?: string;
  };
  answer: {
    lat: number;
    lng: number;
    label: string;
    countryCode: string;
  };
  fact: string;
  joshPlacement?: {
    xPct: number;
    yPct: number;
    scale: number;
    flipX?: boolean;
  };
};
```

Validation requirements:
- date must be unique,
- coordinates must be valid,
- image path must exist at build time where practical,
- licensed images requiring attribution must include it,
- puzzle IDs must remain stable after publishing.

Use a simple content validation script run during `npm run build` or `npm run validate-content`.

---

## Daily rollover

All players should get the same puzzle at the same time.

For MVP, define one canonical timezone in a single constant. Default to:

```ts
America/New_York
```

Compute the game date using `Intl.DateTimeFormat` with that timezone. Do not depend on the browser's local calendar date.

If today's date has no authored puzzle, fall back gracefully to the most recent puzzle and display a small non-blocking dev/content warning only in development.

---

## Scoring

Distance is great-circle distance using the Haversine formula.

Use kilometers internally.

Recommended score:

```ts
score = Math.round(5000 * Math.exp(-distanceKm / 2000));
score = clamp(score, 0, 5000);
```

Properties:
- exact / extremely close guesses approach 5000,
- scores decay smoothly rather than linearly,
- very distant guesses approach zero,
- one deterministic formula works everywhere.

Keep the formula isolated in `src/game/scoring.ts` and cover it with unit tests. If game feel testing suggests a better curve later, changing it should require editing one function.

---

## Local persistence

Use localStorage only.

Persist:
- completed puzzle IDs,
- score for each completed puzzle,
- guess coordinate for each completed puzzle,
- current streak,
- best streak,
- last completed canonical date,
- user preferences such as reduced decorative motion if needed.

Version the storage object. Handle corrupt or old data without crashing.

Never require storage access for initial render; degrade gracefully if it is blocked.

---

## Share format

No answer coordinates or country names in the copied text.

Example:

```text
JOSHLE #42 🌍
4,218 / 5,000
📍 612 km
🔥 7
joshle.alishashim.com
```

A tiny distance-band emoji can be added later, but do not create a Wordle clone full of meaningless squares just because other daily games do it.

---

## UI / design direction

The visual target is **small premium web toy**, not dashboard.

### Principles
- The globe is the hero.
- The photo and globe should both be visible without unnecessary navigation on common desktop sizes.
- On mobile, use a vertical layout with photo/clue above and globe taking most of the remaining viewport.
- One primary action at a time.
- Use strong typography, restrained spacing, and a very small palette.
- Prefer system fonts for zero dependency and fast loading.
- Use icons only where they improve recognition.
- Animations should communicate state, not decorate empty space.

### Avoid "AI slop"
Do not produce:
- giant gradient headlines,
- purple/blue neon as a default aesthetic,
- glassmorphism everywhere,
- excessive rounded cards,
- generic SaaS hero sections,
- rows of feature cards,
- fake testimonials,
- meaningless sparkles,
- emoji sprinkled through every control,
- dozens of tiny settings,
- huge marketing copy before the game,
- gratuitous dark-mode visual effects,
- generated-looking illustrations.

Joshle should look like someone designed **this specific game**.

### Suggested visual language
- mostly neutral map/photo presentation,
- warm off-white or near-black interface chrome,
- one unmistakable accent color for guess/submit state,
- compact lowercase `joshle` wordmark,
- circular pin marker,
- crisp 1px dividers where structure is needed,
- result panel feels editorial, not modal-heavy.

Do not hard-code a fashionable palette before seeing the map/photo content. Build color through CSS custom properties so it can be tuned quickly.

---

## Globe behavior

Required:
- globe projection at world zoom,
- drag to rotate,
- pinch / wheel to zoom,
- tap/click on land or water to place guess,
- one visible guess marker,
- subsequent taps move the marker before submission,
- submit button disabled until a guess exists,
- after submit, guess marker and answer marker are both visible,
- show a connecting geodesic arc/line,
- camera fits both points where practical,
- map labels must not make the game trivial if the intended difficulty depends on locating a country from a photo.

For MVP, prefer a subdued basemap and hide unnecessary POI labels. Country borders/coastlines are useful; city labels may be disabled at lower zooms.

Do not prevent guesses in oceans. A wrong ocean guess is still a valid guess.

---

## Mascot implementation

Josh should cost nothing to generate or serve.

Preferred approach:
- create one original SVG mascot in-repo,
- keep it intentionally simple and iconic,
- overlay it above the clue photo using ordinary HTML/CSS,
- store per-puzzle placement metadata (`xPct`, `yPct`, `scale`, `flipX`).

Do not bake Josh permanently into third-party photos unless the photo license clearly permits derivative works and the repo preserves the required license obligations.

The SVG must be original code/art created for this project, not traced from a known character or real person.

---

## Image content pipeline

MVP content should be **curated, not fetched live**.

Preferred workflow:
1. Find a Public Domain / CC0 location photo, or a compatible CC image with proper attribution.
2. Verify the file page and license manually.
3. Download a web-sized copy into `public/images/puzzles/`.
4. Rename to an opaque stable filename such as `p_0042.webp`.
5. Record source URL, author, license, and attribution in the puzzle record.
6. Optimize the image locally to WebP/AVIF where practical while retaining the original source metadata in the puzzle record.
7. Position Josh with content metadata instead of editing the photo.

Do not hotlink puzzle photos in production unless intentionally chosen after reviewing the source's requirements.

---

## Performance budget

Target a fast first play on a normal phone.

- Lazy-load nonessential assets.
- Preload only today's clue image and essential CSS.
- Keep the initial JS payload modest.
- Avoid loading every daily image at startup.
- Do not import a large icon package for a handful of icons.
- Respect image dimensions/aspect ratio to avoid layout shift.
- Map can show a lightweight loading state while WebGL initializes.

If WebGL fails, show a graceful unsupported-browser message rather than a broken black box.

---

## Accessibility

Minimum bar:
- semantic buttons,
- visible keyboard focus,
- sufficient contrast,
- photo has useful alt text without giving away the answer,
- controls have accessible names,
- result does not rely on color alone,
- reduced motion respected,
- `Esc` should close nonessential overlays,
- no critical interaction requiring hover.

Map interaction is inherently visual; do not pretend the game is fully nonvisual-accessible if it is not. Still make surrounding UI robust.

---

## Testing priorities

Unit test:
- Haversine distance,
- score boundaries,
- canonical date calculation,
- daily puzzle selection,
- localStorage migration/parsing,
- share string contains no answer leak.

Smoke test manually or with Playwright:
- mobile viewport,
- desktop viewport,
- place/move/submit guess,
- result appears,
- refresh preserves completed state,
- next puzzle selection logic,
- WebGL failure UI.

Do not chase 100% coverage.

---

## Deployment

The app should compile to static assets.

Keep deployment host-agnostic. It should work on any static host that supports HTTPS and custom domains.

Expected production hostname:

```text
joshle.alishashim.com
```

Do not modify the user's existing root site as part of the game build unless explicitly asked.

Include deployment documentation for either:
- Vercel static deployment, or
- Cloudflare Pages static deployment.

No serverless functions should be required for MVP.

---

## Agent behavior

### General
- Read this file before changing code.
- Read only the files needed for the current task.
- Prefer small, coherent diffs.
- Do not rewrite working code to match personal preferences.
- Do not add speculative abstractions.
- Do not leave TODOs for core requested behavior.
- Run the relevant checks after changes.
- Fix errors you introduce.

### Token-conscious operation
The owner is working within a limited plan. Be economical.

- Do not repeatedly dump entire files into context.
- Use targeted searches and line ranges.
- Summarize discoveries instead of re-reading the same files.
- Do not ask another agent to independently re-analyze the entire repository.
- Use the smallest model/agent capable of a mechanical task when the environment supports model selection.
- Reserve stronger reasoning for architecture, tricky map behavior, difficult bugs, and final review.
- Prefer one strong focused implementation pass over many speculative passes.

### Subagents
If the coding environment supports additional agents, use them selectively rather than by default.

Good delegation:
- one lightweight agent to inspect a narrow unfamiliar library/API surface,
- one lightweight agent to review a focused diff for bugs/accessibility,
- a stronger agent only for a genuinely hard architectural or debugging problem.

Bad delegation:
- multiple agents all reading the full repository,
- duplicate implementation attempts,
- agents generating long essays instead of code/results,
- parallel redesigns of an already-decided UI.

For this project, usually **0–2 subagents per phase** is enough.

---

## Definition of done for MVP

Joshle MVP is done when:
- today's static puzzle reliably loads,
- the photo clue is presented cleanly,
- the Josh SVG overlay works,
- the user can rotate/zoom the globe and place/move a pin,
- submit computes accurate distance and a deterministic 0–5000 score,
- the answer and connecting line are revealed elegantly,
- attribution and short fact are visible after reveal,
- result sharing works,
- completion/streak survives refresh,
- mobile and desktop both feel intentionally designed,
- build/tests pass,
- there are no paid runtime dependencies,
- the app can be deployed statically to `joshle.alishashim.com`.
