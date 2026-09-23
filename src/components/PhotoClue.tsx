import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Puzzle } from '../content/types';

export function PhotoClue({ puzzle }: { puzzle: Puzzle }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageStatus, setImageStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) setImageStatus('ready');
  }, [puzzle.image.src]);
  const placement = puzzle.joshPlacement ?? { xPct: 75, yPct: 80, scale: 1 };
  const joshStyle = {
    left: `${placement.xPct}%`,
    top: `${placement.yPct}%`,
    transform: `translate(-50%, -100%) scale(${placement.flipX ? -placement.scale : placement.scale}, ${placement.scale})`,
  } satisfies CSSProperties;

  return (
    <figure className="photo-clue">
      <div className={`photo-frame photo-${imageStatus}${puzzle.image.orientation === 'portrait' ? ' photo-portrait' : ''}`} aria-busy={imageStatus === 'loading'}>
        <img ref={imageRef} className="clue-image" src={puzzle.image.src} alt={puzzle.image.alt} width={puzzle.image.orientation === 'portrait' ? 896 : 1200} height={puzzle.image.orientation === 'portrait' ? 1200 : 800} fetchPriority="high" decoding="async"
          onLoad={() => setImageStatus('ready')} onError={() => setImageStatus('error')} />
        {imageStatus === 'ready' && !puzzle.image.includesJosh && <img className="josh-overlay" src="/mascot/josh.svg" alt="" aria-hidden="true" style={joshStyle} />}
        {imageStatus !== 'ready' && <span className="photo-message" role={imageStatus === 'error' ? 'alert' : 'status'}>
          {imageStatus === 'error' ? 'Clue image unavailable. Refresh to try again.' : 'Loading today’s clue…'}
        </span>}
      </div>
      {puzzle.image.isPlaceholder && <figcaption>Illustrated sample clue · photo to be curated</figcaption>}
      {puzzle.image.license === 'GENERATED' && <figcaption>AI-generated travel scene</figcaption>}
    </figure>
  );
}
