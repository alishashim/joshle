import type { GoogleGenAI } from '@google/genai';

export type FactTarget = { id: string; label: string; lat: number; lng: number };
export type CityFact = { id: string; fact: string; sourceUrl: string };

const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'] as const;

function parseFact(text: string, target: FactTarget): CityFact {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error(`Gemini did not return a city fact for ${target.label}.`);
  const item = JSON.parse(text.slice(start, end + 1)) as CityFact;
  if (item.id !== target.id || typeof item.fact !== 'string' || item.fact.length < 35 || item.fact.length > 240
    || typeof item.sourceUrl !== 'string' || !/^https:\/\/[^\s]+$/i.test(item.sourceUrl)
    || new URL(item.sourceUrl).hostname.endsWith('vertexaisearch.cloud.google.com'))
    throw new Error(`Gemini returned an invalid fact or source for ${target.label}.`);
  if (/generated scene|exact coordinate/i.test(item.fact))
    throw new Error(`Gemini returned a generic fact for ${target.label}.`);
  return item;
}

async function generateOne(ai: GoogleGenAI, target: FactTarget): Promise<CityFact> {
  const contents = `Use Google Search to verify one short, family-friendly fun fact about ${target.label} (GeoNames location at ${target.lat}, ${target.lng}) for a daily geography game. Search for this exact place before writing. Prefer a distinctive local history, landmark, geography, or tradition fact in 15–32 words. For an obscure town, a nearby regional fact is acceptable only if you name the region and do not attribute it to the town. Avoid generic country facts, population counts, unverified superlatives, adult themes, and claims about a generated image. Return only JSON: {"id":${JSON.stringify(target.id)},"fact":"one sourced sentence","sourceUrl":"direct HTTPS URL of the page supporting the fact"}. Prefer an official city, tourism, museum, university, or reputable encyclopedia source. Never use a Google Search grounding redirect URL as sourceUrl.`;
  for (let attempt = 0; attempt < models.length; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: models[attempt], contents, config: { tools: [{ googleSearch: {} }] },
      });
      return parseFact(response.text ?? '', target);
    } catch (error) {
      if (attempt === models.length - 1) throw error;
      const status = error && typeof error === 'object' && 'status' in error ? Number(error.status) : undefined;
      if (status && status !== 429 && status !== 404 && status < 500) throw error;
      if (status !== 404) await new Promise((done) => setTimeout(done, 5000 * 2 ** attempt));
    }
  }
  throw new Error('City fact generation failed.');
}

export async function generateCityFacts(ai: GoogleGenAI, targets: readonly FactTarget[]): Promise<CityFact[]> {
  return Promise.all(targets.map((target) => generateOne(ai, target)));
}
