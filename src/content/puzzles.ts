import type { Puzzle } from './types';

// Published IDs and numbers are permanent, even if dates are later added between entries.
export const puzzles: Puzzle[] = [
  // Manual AI-generated clues use representative GeoNames city points.
  {
    id: 'joshle-0001', number: 1, date: '2026-09-23',
    image: {
      src: '/images/puzzles/p_0001.webp',
      alt: 'Josh points along a narrow street lined with pale apartment buildings and balconies.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 38.72509, lng: -9.1498, label: 'Lisbon, Portugal', countryCode: 'PT' },
    fact: 'Lisbon is Portugal’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 2267057, coordinateSourceUrl: 'https://www.geonames.org/2267057/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0002', number: 2, date: '2026-09-24',
    image: {
      src: '/images/puzzles/p_0002.webp',
      alt: 'Josh points down a leafy street beside mid-rise apartment buildings.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: -34.61315, lng: -58.37723, label: 'Buenos Aires, Argentina', countryCode: 'AR' },
    fact: 'Buenos Aires is Argentina’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 3435910, coordinateSourceUrl: 'https://www.geonames.org/3435910/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0003', number: 3, date: '2026-09-25',
    image: {
      src: '/images/puzzles/p_0003.webp',
      alt: 'Josh points along a sloped residential street with balconies and hills beyond.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 41.69143, lng: 44.83412, label: 'Tbilisi, Georgia', countryCode: 'GE' },
    fact: 'Tbilisi is Georgia’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 611717, coordinateSourceUrl: 'https://www.geonames.org/611717/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0004', number: 4, date: '2026-09-26',
    image: {
      src: '/images/puzzles/p_0004.webp',
      alt: 'Josh points along a sunlit street with colorful low buildings and dry hills.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 17.06025, lng: -96.72544, label: 'Oaxaca City, Mexico', countryCode: 'MX' },
    fact: 'Oaxaca City is the capital of Mexico’s Oaxaca state. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 3522507, coordinateSourceUrl: 'https://www.geonames.org/3522507/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0005', number: 5, date: '2026-09-27',
    image: {
      src: '/images/puzzles/p_0005.webp',
      alt: 'Josh points down a steep residential street with red roofs and hills beyond.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 43.84864, lng: 18.35644, label: 'Sarajevo, Bosnia and Herzegovina', countryCode: 'BA' },
    fact: 'Sarajevo is Bosnia and Herzegovina’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 3191281, coordinateSourceUrl: 'https://www.geonames.org/3191281/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0006', number: 6, date: '2026-09-28',
    image: {
      src: '/images/puzzles/p_0006.webp',
      alt: 'Josh points across a dense street with scooters, utility lines, and narrow buildings.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 22.61626, lng: 120.31333, label: 'Kaohsiung, Taiwan', countryCode: 'TW' },
    fact: 'Kaohsiung is a major port city in southern Taiwan. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 1673820, coordinateSourceUrl: 'https://www.geonames.org/1673820/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0007', number: 7, date: '2026-09-29',
    image: {
      src: '/images/puzzles/p_0007.webp',
      alt: 'Josh points along a reddish street with brick houses and a hillside neighborhood.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: -18.91368, lng: 47.53613, label: 'Antananarivo, Madagascar', countryCode: 'MG' },
    fact: 'Antananarivo is Madagascar’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 1070940, coordinateSourceUrl: 'https://www.geonames.org/1070940/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0008', number: 8, date: '2026-09-30',
    image: {
      src: '/images/puzzles/p_0008.webp',
      alt: 'Josh points along a broad road lined with trees beneath distant mountains.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: 42.87, lng: 74.59, label: 'Bishkek, Kyrgyzstan', countryCode: 'KG' },
    fact: 'Bishkek is Kyrgyzstan’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 1528675, coordinateSourceUrl: 'https://www.geonames.org/1528675/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0009', number: 9, date: '2026-10-01',
    image: {
      src: '/images/puzzles/p_0009.webp',
      alt: 'Josh points down an unpaved road between low houses and dry hills.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: -29.31667, lng: 27.48333, label: 'Maseru, Lesotho', countryCode: 'LS' },
    fact: 'Maseru is Lesotho’s capital. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 932505, coordinateSourceUrl: 'https://www.geonames.org/932505/', difficulty: 'medium', sizeTier: 'very-large' },
  },
  {
    id: 'joshle-0010', number: 10, date: '2026-10-02',
    image: {
      src: '/images/puzzles/p_0010.webp',
      alt: 'Josh points down a hillside street of brick buildings below rugged mountains.',
      author: 'Joshle', license: 'GENERATED', attributionText: 'AI-generated for Joshle',
      includesJosh: true, orientation: 'portrait',
    },
    answer: { lat: -17.38195, lng: -66.15995, label: 'Cochabamba, Bolivia', countryCode: 'BO' },
    fact: 'Cochabamba lies in a valley in central Bolivia. This puzzle uses a representative city-center coordinate.',
    generation: { geonameId: 3919968, coordinateSourceUrl: 'https://www.geonames.org/3919968/', difficulty: 'medium', sizeTier: 'very-large' },
  },
];
