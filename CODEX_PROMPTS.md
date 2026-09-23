# Joshle — Codex Prompts

Use these in separate Codex chats in the same project/repository.

Before every phase, make sure `AGENTS.md` is at the repository root. Codex should treat it as the source of truth.

---

## Prompt 1 — Scaffold + globe proof

```text
Read AGENTS.md completely, then inspect the repository.

Implement Phase 1 from IMPLEMENTATION_PLAN.md: the Joshle skeleton and 3D globe interaction proof.

Important constraints:
- This must not feel like AI-generated template UI. It should feel like a small, nearly native-feeling web game built for this exact interaction.
- Use Vite + React + strict TypeScript unless the existing repo already has an equivalent setup worth preserving.
- Use MapLibre GL JS and the map-provider boundary described in AGENTS.md.
- The globe is the hero, not a dashboard card.
- Make touch interaction first-class.
- A tap/click places one guess marker; another tap/click moves it.
- Add a Submit Guess control that is disabled until a marker exists, but use a temporary hard-coded answer only if needed to prove the interaction.
- Add graceful map/WebGL loading and error handling.
- Make the layout responsive from the beginning.
- Avoid component libraries and unnecessary dependencies.

Agent usage:
- Be token-conscious.
- If subagents are supported, use at most one lightweight subagent to verify the current MapLibre globe API or review the focused implementation. Do not have multiple agents re-read the repo.
- Use stronger reasoning only if globe/touch behavior becomes genuinely tricky.

Process:
1. Inspect only the relevant files.
2. State a concise implementation plan.
3. Implement it fully.
4. Run the relevant typecheck/build/tests.
5. Fix issues introduced by your changes.
6. Summarize what changed, any deliberate tradeoffs, and the exact commands I should run.

Do not proceed into later phases unless required to make Phase 1 structurally sound.
```

---

## Prompt 2 — Complete one-puzzle game loop

```text
Read AGENTS.md and IMPLEMENTATION_PLAN.md. Inspect the current Phase 1 implementation rather than assuming its structure.

Implement Phase 2: make Joshle a complete one-puzzle game.

Requirements:
- Add the typed Puzzle content model.
- Add one local sample puzzle with a local clue image placeholder if a licensed image is not already present.
- Create an ORIGINAL simple `josh.svg` mascot in the repo. It must not resemble a copyrighted character or real person. Keep it deliberately simple and iconic rather than over-rendered.
- Overlay Josh on the clue image using per-puzzle placement metadata, not by baking him into the photo.
- Add accurate Haversine distance calculation.
- Add deterministic scoring from 0–5000 according to AGENTS.md.
- When submitted: lock the guess, reveal the correct marker, draw a geodesic connection, and frame the relevant area cleanly.
- Add the result UI with score, distance, answer label, short fact, and photo attribution area.
- Add focused unit tests for distance and scoring.

Design bar:
- No AI-slop visual language: no generic gradient hero, glass cards, feature tiles, excessive rounded containers, or decorative clutter.
- Treat the photo and globe as the content.
- Desktop and mobile should both feel intentionally composed.
- Keep motion restrained and purposeful.

Agent usage:
- Be token-conscious.
- If useful, delegate only a narrow task (for example, validating map line rendering or reviewing the SVG/accessibility). Do not ask another agent to independently design the entire app.

Run checks and leave the app in a working, testable state. Do not build streaks/share/daily rollover yet.
```

---

## Prompt 3 — Daily game + persistence

```text
Read AGENTS.md and the existing implementation. Implement Phase 3 from IMPLEMENTATION_PLAN.md.

Turn the current single-puzzle demo into a real static daily game with no backend.

Build:
- canonical game-date calculation using the timezone in AGENTS.md,
- date-to-puzzle selection,
- stable puzzle numbering,
- at least three adjacent development/test puzzle records using local placeholder assets if needed,
- versioned localStorage persistence,
- completed puzzle restoration after refresh,
- current streak and best streak,
- spoiler-free Copy Result,
- a first-run micro tutorial that does not recur after dismissal,
- content validation that catches duplicate dates, invalid coordinates, missing required attribution metadata, and missing local image references where practical,
- graceful behavior when today's puzzle is missing.

Security/cheating note:
Do not waste time trying to make static answer data impossible to inspect. This is a casual daily game. Avoid obvious UI leaks, but do not add encryption/obfuscation theater.

Quality:
- Add/update focused tests for date selection, persistence parsing/migration, streak behavior, and share output.
- Preserve the clean product feel from prior phases.
- Keep dependencies minimal.

Agent usage:
Use at most 1–2 narrow subagent tasks if genuinely useful; prefer cheaper/lightweight agents for mechanical review and reserve stronger reasoning for tricky date/state bugs.

Run typecheck/tests/build and fix your own regressions.
```

---

## Prompt 4 — Production polish + deployment

```text
Read AGENTS.md and review the running app as a product, not just as code. Implement Phase 4 from IMPLEMENTATION_PLAN.md.

Your job is to make Joshle feel launchable at joshle.alishashim.com without turning it into a larger product.

Priorities:
1. Mobile touch experience.
2. Globe responsiveness and camera behavior.
3. Strong photo/globe visual hierarchy.
4. Result reveal clarity.
5. Performance.
6. Accessibility.
7. Production metadata/deployment docs.

Explicitly inspect for and remove AI-slop patterns: generic gradients, unnecessary cards, over-rounded UI, bloated marketing copy, ornamental icons, fake depth, and anything that looks like a generated SaaS template.

Refine:
- spacing and responsive breakpoints,
- photo crop/contain behavior,
- Josh overlay responsiveness,
- map loading/error states,
- keyboard focus,
- reduced motion,
- result animation,
- button states,
- copy feedback,
- basemap visual noise / label visibility,
- favicon/title/meta description/social metadata,
- static deployment instructions including the custom subdomain setup at a high level.

Do not add accounts, backend, leaderboards, subscriptions, archive, analytics, or extra modes unless they already exist and are required to repair a regression.

If browser automation is available, use a lightweight agent or browser-check pass to inspect at least one mobile and one desktop viewport and report concrete issues before the final polish patch. Avoid broad redundant agent work.

Finish by running all relevant checks and provide a concise launch checklist.
```

---

## Optional later prompt — Add real content workflow

```text
Read AGENTS.md and CONTENT_GUIDE.md.

Build a lightweight local authoring workflow for Joshle content without adding a CMS or backend.

Goal: I should be able to add a new puzzle quickly and confidently.

Implement only repository-local tooling, such as:
- a documented puzzle template,
- a validation command,
- an optional small CLI script that asks for date, coordinates, label, image filename, license/source/author, fact, and Josh placement,
- image existence checks,
- duplicate-date checks,
- a generated content index if useful.

Do not scrape images automatically. Do not call AI services. Do not build an admin website.

Keep it transparent enough that I can also edit puzzle data by hand.
```
