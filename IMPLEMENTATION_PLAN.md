# Joshle — Implementation Plan

## Recommendation: build in 4 phases

Do not one-shot the entire product. The globe interaction is the only technically risky part, and the visual polish depends on seeing that interaction running. Four focused passes will waste fewer tokens than asking an agent to repeatedly repair one huge generated implementation.

Each phase should end in a runnable app.

---

## Phase 1 — Skeleton + globe proof

### Goal
Prove the core interaction with almost no product chrome.

### Build
- Vite + React + strict TypeScript.
- Full viewport app shell.
- MapLibre GL JS globe.
- OpenFreeMap provider wired through a tiny adapter/config module.
- User can drag, zoom, and tap to place a single marker.
- Tapping again moves marker.
- Submit button state exists but can use a hard-coded answer for now.
- Basic responsive split layout on desktop and stacked layout on mobile.
- Error state for WebGL/map initialization failure.

### Do not build yet
- streak,
- share,
- content pipeline,
- archive,
- fancy animation.

### Exit criteria
The globe interaction feels good on mouse and touch and is not fighting React state.

---

## Phase 2 — Real game loop

### Goal
Make one complete puzzle playable.

### Build
- Puzzle TypeScript schema.
- One local sample puzzle image.
- Photo clue component.
- Original in-repo Josh SVG overlay.
- Haversine distance.
- 0–5000 scoring.
- Submit locks guess.
- Correct marker + connecting geodesic line.
- Fit/reframe globe after reveal.
- Result panel with location, score, distance, fact, attribution.
- Unit tests for distance/scoring.

### Exit criteria
A new visitor can understand and complete the puzzle without explanation from the developer.

---

## Phase 3 — Daily system + persistence

### Goal
Turn the demo into a real daily game.

### Build
- Canonical game timezone constant.
- Date → puzzle selection.
- Stable puzzle number.
- At least 3 local test puzzles on adjacent dates.
- localStorage versioned save model.
- completed state survives refresh.
- streak + best streak.
- Copy Result.
- first-run micro tutorial.
- content validation script.
- sensible missing-puzzle behavior.

### Exit criteria
The same deployed build behaves like a daily game across multiple dates without a server.

---

## Phase 4 — Design polish + production

### Goal
Make it feel intentionally designed and ship it.

### Build / refine
- visual hierarchy,
- mobile layout,
- desktop layout,
- image loading state,
- globe loading state,
- accessible focus states,
- reduced motion,
- result reveal transition,
- map style simplification,
- meta title/description/favicon/social card,
- basic privacy-respecting analytics only if explicitly requested,
- production build checks,
- deployment instructions for `joshle.alishashim.com`.

### Final QA
- Safari/iPhone-sized viewport,
- Chrome desktop,
- touch simulation,
- slow connection,
- blocked localStorage,
- map/WebGL failure,
- refresh after completion,
- no answer leakage in share string,
- license attribution present.

---

## Cost model

### Required recurring services for MVP
- AI: **$0**
- image generation: **$0**
- database: **$0**
- auth: **$0**
- server functions: **$0**
- paid map token: **$0**

The site can be a static build on a free hosting tier, subject to that provider's current limits/terms. The existing domain is outside this calculation.

### Map dependency
OpenFreeMap currently provides a public free service without registration/API keys. Keep it replaceable. If its terms/service ever change, the map adapter should make switching providers or self-hosting PMTiles a contained task.

---

## Content launch target

Before public launch, curate at least **14 puzzles** so there is a two-week buffer.

Better: 30.

Do not wait to create 365 before shipping. The daily content format should be quick enough to refill in batches.
