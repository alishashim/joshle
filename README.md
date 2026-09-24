# Joshle

A tiny static daily geography game. Turn and zoom the globe, place a pin, then reveal the distance and score. Completion and streaks are saved in this browser.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To check and build the static app:

```sh
npm run typecheck
npm test
npm run validate-content
npm run build
npm run preview
```

The globe uses MapLibre GL JS and OpenFreeMap. Map tiles require a network connection; no API key or backend is needed. Change the map style provider in `src/lib/mapProvider.ts`.

## Deploy to Vercel

Import this repository as a Vite project. Use `npm run build` as the build command and `dist` as the output directory if Vercel does not detect them automatically. The default dataset is the three-round game; no production environment variables, functions, or Gemini access are needed. To revert to the original single-guess game, set `VITE_JOSHLE_DATASET=legacy` in Vercel and redeploy. Remove that variable (or set it to `triple`) to use the three-round game. Add `joshle.alishashim.com` as the project domain and point its DNS to Vercel using the records shown in your Vercel project. Keep the root site separate. The canonical URL and social image in `index.html` already use the production hostname. See Vercel's [build settings](https://vercel.com/docs/builds/configure-a-build) for current dashboard details.

## Deploy to Cloudflare Pages

1. Push this project to a Git repository, then create a **Pages** project connected to that repository. Set the project root to this directory if it lives inside a larger repository.
2. Use `npm run build` as the build command and `dist` as the output directory. The build validates puzzle content and TypeScript before emitting static files. No server functions or environment variables are required.
3. Check the initial `*.pages.dev` deployment on a phone and desktop. In the Pages project, open **Custom domains** and add `joshle.alishashim.com`.
4. If DNS is managed outside Cloudflare, add a CNAME for `joshle` pointing to the project's `*.pages.dev` hostname. Add the custom domain in Pages **before** changing DNS. If the domain is already a Cloudflare zone, Pages can create the CNAME during setup. Wait for the domain and HTTPS certificate to become active, then test the custom URL.

This subdomain setup does not change the existing `alishashim.com` site. The canonical URL and social image in `index.html` assume the production hostname above. Cloudflare's [build settings](https://developers.cloudflare.com/pages/configuration/build-configuration/) and [custom domain guide](https://developers.cloudflare.com/pages/configuration/custom-domains/) have the current dashboard steps.

Before public launch, review the dated clues for visual quality and geographic accuracy. Keep image credits in each puzzle record; the result view displays them. After publishing, verify today's clue, a completed refresh, mobile map controls, image attribution, social preview, and the next day's rollover on the live hostname.

## Daily content

Legacy puzzles live in `src/content/puzzles.ts`. Each record has a permanent `id` and `number`, a date in the `America/New_York` game timezone, an answer, a fact, and local image metadata. The first ten daily clues are manually generated images for September 23–October 2, 2026; puzzle #11 follows on October 3. Their city-named source JPEGs are retained, while the game serves smaller, opaque-named WebP copies. The earlier illustrated test assets remain in the folder but are not daily puzzles.

The three-round dataset lives in `src/content/tripleDays.ts`. Each complete day contains Easy, Medium, and Hard rounds worth 5,000 points each. Day 1 uses three newly generated clues. Days 2–3 reuse six existing WebP clues without altering the legacy records; day 4 has three newly generated images. The two modes have separate save keys (`joshle.game.official` and `joshle.game.triple.v2`) and can have different content on the same date. The triple key was changed when Day 1 was reset so earlier test completions do not hide its new rounds. Local mode checks:

```sh
VITE_JOSHLE_DATASET=legacy npm run dev
VITE_JOSHLE_DATASET=triple npm run dev
VITE_JOSHLE_DATASET=triple npm run build
```

`npm run validate-content` checks both manifests, including triple-day round order, assets, and credits. It also runs during `npm run build`. If today's record is absent, the selected mode shows its latest authored day; development builds also show a content warning. Publish new dated records to keep the daily game fresh.

### Developer-only Gemini puzzle generation

The generator reads `GEMINI_API_KEY` from the shell or ignored `.env.local`. The key and Google SDK are used only by the local Node script; the static site makes no Gemini calls. [Gemini 3.1 Flash Image has no free API tier](https://ai.google.dev/gemini-api/docs/pricing), so generating assets requires a key linked to a billed project. The live site's runtime cost remains independent of Gemini.

For the three-round dataset, `--count 1` generates exactly one complete day (three image requests), while `--count 5` generates five days. Dry-run plans dates and locations without API calls. The maximum batch is 30 days. An incomplete day stays in ignored `scripts/.generated-days/` and resumes on the next run; it enters `tripleDays.ts` only after all three WebPs are valid. `--force` regenerates staged images for an unpublished day. Review every generated day before deploying.

```sh
npm run generate-days -- --count 1 --dry-run
npm run generate-days -- --count 1
npm run generate-days -- --count 5
```

The original single-puzzle generator remains available for the legacy dataset:

```sh
npm run generate-puzzles -- --count 1 --dry-run
npm run generate-puzzles -- --count 1
npm run generate-puzzles -- --count 5
npm run generate-puzzles -- --count 100
```

`--count` means new attempts, with a maximum of 100 per run. Each success adds one dated record to `src/content/puzzles.ts`, one WebP under `public/images/puzzles/`, and a recovery entry in `scripts/generated-puzzles-state.json`. Failed locations remain available for the next run; successful ones are skipped. A lock prevents simultaneous runs. If an image file exists without a matching record or recovery entry, the script skips it; `--force` permits replacing that orphan file. Dry runs make no API calls or file changes. After generating, run `npm run build` and review each image for Josh's identity, plausible local clues, geography, and text or landmark giveaways before deploying.

The 120-place catalog in `scripts/location-catalog.json` spans six continents and stores coordinates from the [GeoNames cities500 gazetteer](https://download.geonames.org/export/dump/), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The result credits GeoNames. Dates continue after the latest authored date in the New York game timezone, and generated IDs and numbers remain permanent. The catalog mixes major cities, smaller cities, and towns; generated scenes are representative depictions, not documentary photos taken at the exact scoring coordinate.

Both root reference images are sent to Gemini for every puzzle: `josh.jpg` guides the pointing pose and composition, and `josh-cutout.jpg` guides Josh's face, hair, and appearance. They stay in place. The generated image already contains Josh, so the app omits its SVG overlay for those puzzles. The prompt makes him roughly 2–3 times heavier and larger-bodied than the reference. `generation.difficulty` records `easy`, `medium`, or `hard`; `generation.sizeTier` uses `very-large` for easy and medium and `enormous` for hard. The generated WebP and metadata are committed as static content, never requested from Gemini by players.

Saves use versioned localStorage entries. The earlier `joshle.game` test save remains untouched. Clearing browser storage resets local progress. `.env.local` is ignored by Git and is not needed to play or build Joshle; the app makes no runtime AI calls.

## Project notes

- `AGENTS.md` sets the product and engineering constraints.
- `PRODUCT_SPEC.md` describes the game loop.
- `CONTENT_GUIDE.md` covers future photo sourcing and attribution.
- `IMPLEMENTATION_PLAN.md` outlines the four build phases.
- `CODEX_PROMPTS.md` contains prompts for those phases.
