import type { TripleDay } from './types';

// Complete days only. The local generator stages unfinished rounds outside this manifest.
// Day 1 uses a freshly generated three-image set; later legacy clues remain unchanged.
export const tripleDays: TripleDay[] = [
  {
    "id": "joshle-triple-0001",
    "number": 1,
    "date": "2026-09-23",
    "rounds": [
      {
        "id": "joshle-triple-0001-easy",
        "number": 1,
        "date": "2026-09-23",
        "difficulty": "easy",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0001_easy.webp",
          "alt": "Josh points through a travel scene with architecture and landscape clues.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": -23.5475,
          "lng": -46.63611,
          "label": "Sao Paulo, Brazil",
          "countryCode": "BR"
        },
        "fact": "Sao Paulo is in Brazil. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 3448439,
          "coordinateSourceUrl": "https://www.geonames.org/3448439/",
          "difficulty": "easy",
          "sizeTier": "very-large"
        }
      },
      {
        "id": "joshle-triple-0001-medium",
        "number": 1,
        "date": "2026-09-23",
        "difficulty": "medium",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0001_medium.webp",
          "alt": "Josh points through a travel scene with architecture and landscape clues.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": 42.24115,
          "lng": -83.61299,
          "label": "Ypsilanti, United States",
          "countryCode": "US"
        },
        "fact": "Ypsilanti is in United States. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 5015688,
          "coordinateSourceUrl": "https://www.geonames.org/5015688/",
          "difficulty": "medium",
          "sizeTier": "very-large"
        }
      },
      {
        "id": "joshle-triple-0001-hard",
        "number": 1,
        "date": "2026-09-23",
        "difficulty": "hard",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0001_hard.webp",
          "alt": "Josh points through a travel scene with architecture and landscape clues.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": 45.92972,
          "lng": 3.1131,
          "label": "Saint-Bonnet-pres-Riom, France",
          "countryCode": "FR"
        },
        "fact": "Saint-Bonnet-pres-Riom is in France. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 2981315,
          "coordinateSourceUrl": "https://www.geonames.org/2981315/",
          "difficulty": "hard",
          "sizeTier": "enormous"
        }
      }
    ]
  },
  {
    "id": "joshle-triple-0002",
    "number": 2,
    "date": "2026-09-24",
    "rounds": [
      {
        "id": "joshle-triple-0002-easy",
        "number": 2,
        "date": "2026-09-24",
        "image": {
          "src": "/images/puzzles/p_0002.webp",
          "alt": "Josh points down a leafy street beside mid-rise apartment buildings.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": -34.61315,
          "lng": -58.37723,
          "label": "Buenos Aires, Argentina",
          "countryCode": "AR"
        },
        "fact": "Buenos Aires is Argentina’s capital. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 3435910,
          "coordinateSourceUrl": "https://www.geonames.org/3435910/",
          "difficulty": "easy",
          "sizeTier": "very-large"
        },
        "difficulty": "easy",
        "maxScore": 5000
      },
      {
        "id": "joshle-triple-0002-medium",
        "number": 2,
        "date": "2026-09-24",
        "image": {
          "src": "/images/puzzles/p_0006.webp",
          "alt": "Josh points across a dense street with scooters, utility lines, and narrow buildings.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": 22.61626,
          "lng": 120.31333,
          "label": "Kaohsiung, Taiwan",
          "countryCode": "TW"
        },
        "fact": "Kaohsiung is a major port city in southern Taiwan. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 1673820,
          "coordinateSourceUrl": "https://www.geonames.org/1673820/",
          "difficulty": "medium",
          "sizeTier": "very-large"
        },
        "difficulty": "medium",
        "maxScore": 5000
      },
      {
        "id": "joshle-triple-0002-hard",
        "number": 2,
        "date": "2026-09-24",
        "image": {
          "src": "/images/puzzles/p_0009.webp",
          "alt": "Josh points down an unpaved road between low houses and dry hills.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": -29.31667,
          "lng": 27.48333,
          "label": "Maseru, Lesotho",
          "countryCode": "LS"
        },
        "fact": "Maseru is Lesotho’s capital. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 932505,
          "coordinateSourceUrl": "https://www.geonames.org/932505/",
          "difficulty": "hard",
          "sizeTier": "enormous"
        },
        "difficulty": "hard",
        "maxScore": 5000
      }
    ]
  },
  {
    "id": "joshle-triple-0003",
    "number": 3,
    "date": "2026-09-25",
    "rounds": [
      {
        "id": "joshle-triple-0003-easy",
        "number": 3,
        "date": "2026-09-25",
        "image": {
          "src": "/images/puzzles/p_0004.webp",
          "alt": "Josh points along a sunlit street with colorful low buildings and dry hills.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": 17.06025,
          "lng": -96.72544,
          "label": "Oaxaca City, Mexico",
          "countryCode": "MX"
        },
        "fact": "Oaxaca City is the capital of Mexico’s Oaxaca state. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 3522507,
          "coordinateSourceUrl": "https://www.geonames.org/3522507/",
          "difficulty": "easy",
          "sizeTier": "very-large"
        },
        "difficulty": "easy",
        "maxScore": 5000
      },
      {
        "id": "joshle-triple-0003-medium",
        "number": 3,
        "date": "2026-09-25",
        "image": {
          "src": "/images/puzzles/p_0005.webp",
          "alt": "Josh points down a steep residential street with red roofs and hills beyond.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": 43.84864,
          "lng": 18.35644,
          "label": "Sarajevo, Bosnia and Herzegovina",
          "countryCode": "BA"
        },
        "fact": "Sarajevo is Bosnia and Herzegovina’s capital. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 3191281,
          "coordinateSourceUrl": "https://www.geonames.org/3191281/",
          "difficulty": "medium",
          "sizeTier": "very-large"
        },
        "difficulty": "medium",
        "maxScore": 5000
      },
      {
        "id": "joshle-triple-0003-hard",
        "number": 3,
        "date": "2026-09-25",
        "image": {
          "src": "/images/puzzles/p_0007.webp",
          "alt": "Josh points along a reddish street with brick houses and a hillside neighborhood.",
          "author": "Joshle",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle",
          "includesJosh": true,
          "orientation": "portrait"
        },
        "answer": {
          "lat": -18.91368,
          "lng": 47.53613,
          "label": "Antananarivo, Madagascar",
          "countryCode": "MG"
        },
        "fact": "Antananarivo is Madagascar’s capital. This puzzle uses a representative city-center coordinate.",
        "generation": {
          "geonameId": 1070940,
          "coordinateSourceUrl": "https://www.geonames.org/1070940/",
          "difficulty": "hard",
          "sizeTier": "enormous"
        },
        "difficulty": "hard",
        "maxScore": 5000
      }
    ]
  },
  {
    "id": "joshle-triple-0004",
    "number": 4,
    "date": "2026-09-26",
    "rounds": [
      {
        "id": "joshle-triple-0004-easy",
        "number": 4,
        "date": "2026-09-26",
        "difficulty": "easy",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0004_easy.webp",
          "alt": "Josh points toward a clock tower beside a red double-decker bus on a busy city street.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": 51.50853,
          "lng": -0.12574,
          "label": "London, United Kingdom",
          "countryCode": "GB"
        },
        "fact": "London is in United Kingdom. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 2643743,
          "coordinateSourceUrl": "https://www.geonames.org/2643743/",
          "difficulty": "easy",
          "sizeTier": "very-large"
        }
      },
      {
        "id": "joshle-triple-0004-medium",
        "number": 4,
        "date": "2026-09-26",
        "difficulty": "medium",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0004_medium.webp",
          "alt": "Josh points along a warm street with a market cart, motorbikes, an auto rickshaw, and palm trees.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": 10.90141,
          "lng": 79.17984,
          "label": "Ayyampettai, India",
          "countryCode": "IN"
        },
        "fact": "Ayyampettai is in India. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 1278090,
          "coordinateSourceUrl": "https://www.geonames.org/1278090/",
          "difficulty": "medium",
          "sizeTier": "very-large"
        }
      },
      {
        "id": "joshle-triple-0004-hard",
        "number": 4,
        "date": "2026-09-26",
        "difficulty": "hard",
        "maxScore": 5000,
        "image": {
          "src": "/images/puzzles/t_0004_hard.webp",
          "alt": "Josh points down a quiet brick-lined town road with eucalyptus trees and red soil.",
          "author": "Joshle with Google Gemini",
          "license": "GENERATED",
          "attributionText": "AI-generated for Joshle with Google Gemini",
          "includesJosh": true
        },
        "answer": {
          "lat": -32.84323,
          "lng": 115.92201,
          "label": "Waroona, Australia",
          "countryCode": "AU"
        },
        "fact": "Waroona is in Australia. The generated scene represents the area rather than the exact coordinate.",
        "generation": {
          "geonameId": 2059047,
          "coordinateSourceUrl": "https://www.geonames.org/2059047/",
          "difficulty": "hard",
          "sizeTier": "enormous"
        }
      }
    ]
  },
];
