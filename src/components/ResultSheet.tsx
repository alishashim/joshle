import type { Puzzle } from '../content/types';

const licenses = {
  PUBLIC_DOMAIN: 'Public domain',
  CC0: 'CC0',
  CC_BY: 'CC BY',
  CC_BY_SA: 'CC BY-SA',
  GENERATED: 'AI-generated',
} as const;

export function ResultSheet({ puzzle, distance, score, streak, onCopy, copyStatus, dailyScores, nextRound, nextLabel }: {
  puzzle: Puzzle;
  distance: number;
  score: number;
  streak: number;
  onCopy: () => void;
  copyStatus: string;
  dailyScores?: number[] | null;
  nextRound?: () => void;
  nextLabel?: string;
}) {
  const attribution = puzzle.image.attributionText ?? puzzle.image.author ?? 'Image credit unavailable';
  const total = dailyScores?.reduce((sum, value) => sum + value, 0);

  return (
    <section className="result-sheet" aria-labelledby="result-title" aria-live="polite">
      <div className="result-score">
        <span className="readout-label">{dailyScores ? 'Daily total' : 'Your score'}</span>
        <strong>{(total ?? score).toLocaleString()}<small> / {dailyScores ? '15,000' : '5,000'}</small></strong>
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
        {dailyScores && <p className="daily-breakdown">Round 1 {dailyScores[0].toLocaleString()} · Round 2 {dailyScores[1].toLocaleString()} · Round 3 {dailyScores[2].toLocaleString()}</p>}
        <div className="share-row">
          {nextRound
            ? <button type="button" className="share-button" onClick={nextRound}>{nextLabel}</button>
            : <><button type="button" className="share-button" onClick={onCopy}>{copyStatus === 'Copied to clipboard' ? 'Copied' : 'Copy result'}</button>
              <span role="status" aria-live="polite">{copyStatus}</span></>}
        </div>
      </div>
    </section>
  );
}
