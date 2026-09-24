import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { Coordinates } from './gameState';
import type { Puzzle } from '../content/types';
import { PhotoClue } from '../components/PhotoClue';
import { ResultSheet } from '../components/ResultSheet';
import { ACTIVE_DATASET, selectDay } from '../content/dataset';
import type { DailyContent } from '../content/dataset';
import { gameDate } from '../game/dailyPuzzle';
import { distanceKm } from '../game/distance';
import { scoreForDistance } from '../game/scoring';
import { shareResult, shareTripleResult } from '../game/share';
import { dailyScores, nextRoundIndex, recordRoundCompletion } from '../game/triple';
import { activeStreak, readSave, recordCompletion, TRIPLE_STORAGE_KEY, writeSave } from '../lib/storage';
import type { Completion, GameSave } from '../lib/storage';

const Globe = lazy(() => import('../components/Globe').then((module) => ({ default: module.Globe })));

function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(1)}° ${value >= 0 ? positive : negative}`;
}

export function App() {
  const [today, setToday] = useState(() => gameDate());
  const storageKey = ACTIVE_DATASET === 'triple' ? TRIPLE_STORAGE_KEY : undefined;
  const [save, setSave] = useState(() => readSave(storageKey));
  const { day, missingToday } = selectDay(today, ACTIVE_DATASET);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(gameDate()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const updateSave = (next: GameSave) => { setSave(next); writeSave(next, storageKey); };

  if (!day) return <main className="content-unavailable"><h1>No triple days published yet.</h1><p>Switch to the legacy dataset or generate a complete day before deploying triple mode.</p></main>;

  return (
    <DailyGame
      key={day.id}
      day={day}
      today={today}
      missingToday={missingToday}
      save={save}
      updateSave={updateSave}
    />
  );
}

function DailyGame({ day, today, missingToday, save, updateSave }: {
  day: DailyContent;
  today: string;
  missingToday: boolean;
  save: GameSave;
  updateSave: (next: GameSave) => void;
}) {
  const [roundIndex, setRoundIndex] = useState(() => nextRoundIndex(day, save));
  const puzzle: Puzzle = day.rounds[roundIndex];
  const completion = save.completed[puzzle.id] ?? null;
  const [guess, setGuess] = useState<Coordinates | null>(completion?.guess ?? null);
  const [copyStatus, setCopyStatus] = useState('');
  const handleGuess = useCallback((nextGuess: Coordinates | null) => setGuess(nextGuess), []);
  const streak = activeStreak(save, today);
  const scores = day.mode === 'triple' ? dailyScores(day, save) : null;
  const finalRound = roundIndex === day.rounds.length - 1;

  const submitGuess = () => {
    if (!guess || completion) return;
    const distance = distanceKm(guess, puzzle.answer);
    const nextCompletion: Completion = {
      date: puzzle.date, guess, distanceKm: distance, score: scoreForDistance(distance),
    };
    updateSave(day.mode === 'triple'
      ? recordRoundCompletion(save, day, roundIndex, nextCompletion)
      : recordCompletion({ ...save, tutorialDismissed: true }, puzzle.id, nextCompletion));
  };

  const dismissTutorial = () => updateSave({ ...save, tutorialDismissed: true });

  useEffect(() => {
    if (save.tutorialDismissed || completion) return;
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissTutorial();
    };
    window.addEventListener('keydown', dismissOnEscape);
    return () => window.removeEventListener('keydown', dismissOnEscape);
  }, [save, completion]);

  const copyResult = async () => {
    if (!completion) return;
    const text = day.mode === 'triple' && scores
      ? shareTripleResult(day.number, scores, streak)
      : shareResult(puzzle.number, completion.score, completion.distanceKm, streak);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Copied to clipboard');
    } catch {
      setCopyStatus('Copy unavailable in this browser');
    }
  };

  return (
    <main className={`game-shell${completion ? ' has-result' : ''}`}>
      <section className="clue-pane" aria-labelledby="game-title">
        <header className="brand-row">
          <span className="wordmark">joshle<span className="wordmark-dot">.</span></span>
          <span className="phase-tag">PHOTO JOSH / #{day.number}{day.mode === 'triple' ? ` · ${roundIndex + 1}/3 ${day.rounds[roundIndex].difficulty?.toUpperCase() ?? ''}` : ''}</span>
        </header>

        <div className="clue-content">
          <p className="eyebrow">One photo. One place.</p>
          <h1 id="game-title">Where in the world is Josh?</h1>
          <PhotoClue key={puzzle.id} puzzle={puzzle} />
          <p className="clue-note">Look for a place in the picture, then drop a pin on the globe.</p>
        </div>

        <footer className="clue-footer">
          <span>Daily puzzle · resets at midnight New York time</span>
          <strong>{streak} day streak · best {save.bestStreak}</strong>
          {import.meta.env.DEV && missingToday && <span className="content-warning">No puzzle for {today}; showing {puzzle.date}.</span>}
        </footer>
      </section>

      <section className="play-pane" aria-label="Guess on the globe">
        <div className="play-header">
          <div>
            <span className="step-number">{completion ? '02' : '01'}</span>
            <span className="step-title">{completion ? 'The reveal' : 'Find a place'}</span>
          </div>
          <span className="interaction-hint">{completion ? 'Your guess and the answer' : 'Drag to turn · scroll or pinch to zoom'}</span>
        </div>

        {!save.tutorialDismissed && !completion && (
          <div className="tutorial" role="note">
            <span><strong>First time?</strong> Turn the globe, tap to place a pin, then submit. Tap again to move it.</span>
            <button type="button" onClick={dismissTutorial} aria-label="Dismiss game instructions">Got it</button>
          </div>
        )}

        <Suspense fallback={<div className="globe-stage"><div className="map-message" role="status">Preparing the globe…</div></div>}>
          <Globe key={puzzle.id} guess={guess} answer={completion ? puzzle.answer : null} locked={Boolean(completion)} onGuess={handleGuess} />
        </Suspense>

        {completion ? (
          <ResultSheet puzzle={puzzle} distance={completion.distanceKm} score={completion.score}
            streak={streak} onCopy={copyResult} copyStatus={copyStatus}
            dailyScores={finalRound ? scores : null}
            nextRound={day.mode === 'triple' && !finalRound ? () => {
              setRoundIndex(roundIndex + 1);
              setGuess(null);
              setCopyStatus('');
            } : undefined}
            nextLabel={!finalRound ? `Continue to ${day.rounds[roundIndex + 1].difficulty}` : undefined} />
        ) : (
          <div className="action-bar">
            <div className="guess-readout" aria-live="polite">
              <span className="readout-label">Your pin</span>
              <strong>
                {guess
                  ? `${formatCoordinate(guess.lat, 'N', 'S')}  /  ${formatCoordinate(guess.lng, 'E', 'W')}`
                  : 'No place selected yet'}
              </strong>
            </div>
            <button className="submit-button" type="button" disabled={!guess} onClick={submitGuess}>
              Submit guess
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
