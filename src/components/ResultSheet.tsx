import type { Puzzle } from '../content/types';

const licenses = {
  PUBLIC_DOMAIN: 'Public domain',
  CC0: 'CC0',
  CC_BY: 'CC BY',
  CC_BY_SA: 'CC BY-SA',
  GENERATED: 'AI-generated',
} as const;

export function ResultSheet({ puzzle, distance, score, streak, onCopy, copyStatus }: {
  puzzle: Puzzle;
  distance: number;
  score: number;
  streak: number;
  onCopy: () => void;
  copyStatus: string;
}) {
  const attribution = puzzle.image.attributionText ?? puzzle.image.author ?? 'Image credit unavailable';

  return (
    <section className="result-sheet" aria-labelledby="result-title" aria-live="polite">
      <div className="result-score">
        <span className="readout-label">Your score</span>
        <strong>{score.toLocaleString()}<small> / 5,000</small></strong>
        <span className="result-streak">{streak} day streak</span>
      </div>
      <div className="result-copy">
        <p className="result-kicker">{Math.round(distance).toLocaleString()} km from the answer</p>
        <h2 id="result-title">{puzzle.answer.label}</h2>
        <p className="result-fact">{puzzle.fact}</p>
        <p className="photo-credit">
          Image: {puzzle.image.sourceUrl ? <a href={puzzle.image.sourceUrl} target="_blank" rel="noreferrer">{attribution}</a> : attribution}
          {puzzle.image.licenseUrl ? <> · <a href={puzzle.image.licenseUrl} target="_blank" rel="noreferrer">{licenses[puzzle.image.license]}</a></> : ` · ${licenses[puzzle.image.license]}`}
        </p>
        {puzzle.generation && <p className="photo-credit">Location data: <a href={puzzle.generation.coordinateSourceUrl} target="_blank" rel="noreferrer">GeoNames</a> · CC BY 4.0</p>}
        <div className="share-row">
          <button type="button" className="share-button" onClick={onCopy}>{copyStatus === 'Copied to clipboard' ? 'Copied' : 'Copy result'}</button>
          <span role="status" aria-live="polite">{copyStatus}</span>
        </div>
      </div>
    </section>
  );
}
