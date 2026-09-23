import type { Coordinates } from '../app/gameState';

export type Puzzle = {
  id: string;
  number: number;
  date: string;
  image: {
    src: string;
    alt: string;
    author?: string;
    sourceUrl?: string;
    license: 'PUBLIC_DOMAIN' | 'CC0' | 'CC_BY' | 'CC_BY_SA' | 'GENERATED';
    licenseUrl?: string;
    attributionText?: string;
    isPlaceholder?: boolean;
    includesJosh?: boolean;
    orientation?: 'portrait';
  };
  answer: Coordinates & {
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
  generation?: {
    geonameId: number;
    coordinateSourceUrl: string;
    difficulty: 'easy' | 'medium' | 'hard';
    sizeTier: 'very-large' | 'enormous';
  };
};
