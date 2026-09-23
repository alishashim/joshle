# Joshle — Product Spec

## One-sentence pitch

**A daily photo-geography game where Josh has gone somewhere in the world and you have one globe pin to find him.**

## Why this version

The original gag can survive without paying for image generation or scraping identifiable people. Josh becomes one recurring fictional mascot stored as a tiny SVG. The location clue is a real, reusable photo. Every puzzle therefore costs $0 to render and can be authored as a small static data record.

This also makes the product easier to recognize: the repeated character is the brand, while the world photo is the puzzle.

## Core loop

1. Open Joshle.
2. See today's numbered puzzle and a single photo.
3. Read: **Where in the world is Josh?**
4. Inspect the scene.
5. Rotate the globe and tap a location.
6. Submit.
7. See the correct location, distance, score out of 5000, and a one-line fact.
8. Copy result.
9. Come back tomorrow.

The game should not require instructions after a player's first session.

## Round count

Start with **one puzzle per day**.

MapTap / GeoHistory-style games often use multiple questions, but one stronger image puzzle gives Joshle a more distinctive identity and dramatically reduces content-production overhead. If it feels too thin after testing, expand to three daily photos before considering five.

## Puzzle difficulty

A good puzzle contains multiple soft clues rather than one giant giveaway.

Good clue sources:
- road markings,
- transit design,
- architecture,
- landscape,
- utility poles,
- language fragments,
- flags used incidentally,
- vegetation,
- coastlines,
- mountains,
- driving side,
- distinctive but not instantly famous landmarks.

Avoid an endless run of obvious Eiffel Tower / Statue of Liberty puzzles.

## Scoring

One guess, maximum 5000 points.

Use great-circle distance and an exponential curve:

```text
score = round(5000 × e^(-distanceKm / 2000))
```

Display:
- score, prominently,
- distance, secondarily,
- guessed and correct pins,
- connecting arc.

## Streak

A streak increments when the player completes consecutive canonical game dates.

Missing a day breaks the current streak. Do not sell streak freezes or add manipulative notifications in MVP.

## Content rhythm

The content author should be able to add a puzzle in roughly five minutes once they have a suitable photo.

Each puzzle needs:
- date,
- image file,
- image attribution/license metadata,
- latitude/longitude,
- human-readable place label,
- country code,
- one short fact,
- Josh overlay position.

## Josh mascot

Josh is a fictional adult mascot. Keep the drawing simple enough to be recognizable at small sizes and easy to place into different scenes.

The mascot can be intentionally round/large-bodied to preserve the absurdist tone. Avoid mocking copy about real bodies or presenting a real person's appearance as the task.

Potential recurring visual traits:
- round silhouette,
- tiny travel hat,
- neutral T-shirt,
- little backpack,
- deadpan expression,
- same pose in MVP.

Do not overdesign him. A deliberately simple SVG is funnier and cheaper.

## Result copy

Example:

```text
JOSHLE #42 🌍
4,218 / 5,000
612 km away
🔥 7 day streak
joshle.alishashim.com
```

Do not include the actual country/location in copied results.

## First-run help

Use at most a 3-step overlay:

1. Look at the photo.
2. Tap the globe to place Josh's location.
3. Submit once you're happy with your guess.

Never show it again after dismissal unless opened from Help.

## Screens / states

### Playing
- compact Joshle wordmark,
- puzzle number / date,
- clue photo with Josh overlay,
- globe,
- pending guess marker,
- Submit Guess button.

### Revealed
- correct pin appears,
- line connects the two pins,
- camera frames both,
- result sheet shows score + distance + answer,
- short fact,
- photo attribution,
- Copy Result.

### Already completed
Opening later the same day should immediately show the revealed state with the player's stored guess and score.

### Missing puzzle / offline content failure
Show a compact, human error message. Do not crash the app.

## Nice-to-have after MVP

In likely order:
1. archive calendar,
2. 3-photo daily format,
3. statistic clue mode,
4. practice/random mode,
5. small friend-group leaderboards,
6. richer mascot variations.

Do not build these before the daily loop is excellent.

## Explicitly out of scope for MVP

- accounts,
- email collection,
- payments,
- subscriptions,
- public leaderboards,
- friends,
- comments,
- content CMS,
- runtime AI,
- image-generation APIs,
- server-rendering requirement,
- native app,
- ad network,
- complex analytics.
