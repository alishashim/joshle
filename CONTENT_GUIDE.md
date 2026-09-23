# Joshle — Content & Zero-Cost Asset Guide

## Goal

Keep daily content legally reusable, stable, cheap, and easy to maintain without any runtime AI or paid asset service.

## Recommended photo source

### Best default: Wikimedia Commons

Use Commons as a discovery source, then **download the selected image into the repo** rather than relying on a live API at game runtime.

Prefer, in this order:
1. Public Domain,
2. CC0,
3. CC BY,
4. CC BY-SA only when the attribution/share-alike implications are understood and recorded.

Every selected file must be checked on its individual file page. Do not assume that every Commons image has the same license.

Store the exact source URL and credit text in the puzzle object.

## Why local copies

Local puzzle assets make the game:
- faster,
- less fragile,
- independent from third-party rate limits,
- easier to cache,
- easier to test,
- deterministic for old puzzles.

Use web-sized files rather than full-resolution originals.

## Image preparation

For each selected image:
1. Save the source page URL.
2. Record creator/author.
3. Record the exact license.
4. Download an appropriately sized version.
5. Crop only when the license permits derivatives.
6. Export a web-efficient version such as WebP.
7. Keep roughly 1400–2000px on the long edge unless visual testing suggests otherwise.
8. Give the final asset an opaque ID such as `p_0042.webp`.
9. Add attribution to the corresponding puzzle record.

Do not put the answer in the filename.

## Josh overlay

The existing SVG overlay remains for authored photos. Gemini-generated puzzles contain Josh in the generated WebP and set `image.includesJosh` so he is not drawn twice. Generated scenes are labeled as AI-generated and need human review before publication.

For licensed third-party photos, keep Josh as an SVG overlay instead of baking him into the source image.

Instead, render the same `josh.svg` as a positioned layer above the image:

```text
photo
  └── Josh overlay at x%, y%, scale, optional horizontal flip
```

This gives each puzzle a custom composition while keeping authoring quick.

### Placement rules
- Josh should not cover the most important geographic clue.
- Josh should look intentionally placed, not randomly pasted.
- Keep enough contrast to see him without adding giant outlines or glow.
- Allow a subtle CSS drop shadow only if needed.
- On narrow crops, make sure he remains within the visible safe region.

## Puzzle quality checklist

Before publishing a puzzle, ask:
- Is there enough visual evidence to make a reasoned guess?
- Is the answer defensible at the selected coordinate?
- Is the coordinate a city/landmark location rather than a random country centroid when the image is specific?
- Is there an accidental giant text sign that directly names the place?
- Is the photo license verified?
- Is attribution complete?
- Does Josh cover anything important?
- Does the image still work on a phone crop?
- Is the fact short and actually interesting?

## Content balance

Across a month, avoid overconcentrating on Western Europe and North America.

Aim for variety across:
- continents,
- dense cities and rural scenes,
- climates,
- coastal/inland locations,
- easier and harder puzzles.

Do not make tiny islands or nearly clue-free wilderness the default difficulty trick.

## Optional future statistic mode

A second mode can use static public datasets and ask which country a number belongs to.

Examples of suitable themes:
- obesity prevalence,
- life expectancy,
- average height,
- population density,
- internet use,
- coffee consumption,
- road fatalities,
- renewable energy share.

For each dataset, pin a source snapshot into the repo. Do not depend on a remote API during gameplay.

For potentially sensitive health/social statistics, use neutral wording and avoid turning individual populations into targets of ridicule.

## Attribution UI

Keep attribution out of the way during guessing but available after reveal.

Example result footer:

```text
Photo: Jane Example · CC BY 4.0 · Wikimedia Commons
```

Make the source and license links accessible.

## Asset manifest

Consider maintaining `content/assets.json` or equivalent with:

```json
{
  "p_0042.webp": {
    "sourceUrl": "...",
    "author": "...",
    "license": "CC_BY_4_0",
    "licenseUrl": "..."
  }
}
```

The content validation script should fail if a referenced image lacks required metadata.
