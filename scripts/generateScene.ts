import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import type { Difficulty } from '../src/content/types';
import type { Location } from './dayPlanner';

const model = 'gemini-3.1-flash-image';

function prompt(place: Location, difficulty: Difficulty): string {
  const scene = difficulty === 'easy'
    ? 'Make this a genuinely easy round: show one large, unmistakable, real landmark or skyline feature strongly associated with this exact city, fully visible and geographically accurate. If there is no famous landmark, show its most recognizable real city feature plus several strong country clues. An ordinary player should be able to narrow the answer quickly.'
    : difficulty === 'medium'
      ? 'Make this a medium round: use several recognizable country or regional clues from architecture, transit, vegetation, terrain, and infrastructure, but no iconic city landmark or written answer giveaway.'
      : 'Use a less-famous neighborhood, smaller-city setting, or peripheral landscape. Make it difficult but fair with several real geographic signals.';
  const size = difficulty === 'easy' ? 'about 2 times' : difficulty === 'medium' ? 'about 2.5 times' : 'at least 3 times';
  const frameHeight = difficulty === 'easy' ? 'roughly 25%' : difficulty === 'medium' ? 'roughly 40%' : 'roughly 60%';
  return `Generate one realistic 3:2 casual smartphone travel photograph for a geography guessing game. Location: ${place.place}, ${place.country} (${place.continent}). Scene direction: ${place.scene}. ${scene} Include useful clues from architecture, terrain, vegetation, climate, roads, vehicles, infrastructure, and everyday local culture where appropriate. Avoid readable place names, flags, maps, airport signs, tourism signs, watermarks, and legible text that reveals the answer. Natural imperfect daylight snapshot; no illustration, studio lighting, surreal details, or glossy advertising look.

The first attached image (josh.jpg) is ONLY a pose and composition reference. The second (josh-cutout.jpg) is the identity and appearance reference for the same adult Josh. Preserve his recognizable face, hair, and pointing pose. Composite him with convincing perspective and shadows. Make Josh ${size} heavier and larger-bodied than in the references and occupy ${frameHeight} of the frame height, presented neutrally and respectfully. Keep at least three place clues visible around him. Never reproduce the White House or any background from the pose reference. Output one finished photograph with Josh already in it.`;
}

export function statusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const value = 'status' in error ? error.status : 'code' in error ? error.code : undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

export async function generateSceneImage(ai: GoogleGenAI, place: Location, references: [string, string]): Promise<Buffer> {
  const input = [
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[0] },
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[1] },
    { type: 'text' as const, text: prompt(place, place.difficulty) },
  ];
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await ai.interactions.create({
        model, input, response_format: { type: 'image', aspect_ratio: '3:2', image_size: '1K' },
      });
      if (!response.output_image?.data) throw new Error('No image returned');
      return await sharp(Buffer.from(response.output_image.data, 'base64'))
        .resize(1536, 1024, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 }).toBuffer();
    } catch (error) {
      const status = statusOf(error);
      const transient = status === 429 || (status !== undefined && status >= 500)
        || (error instanceof Error && /timeout|network|ECONNRESET|fetch failed/i.test(error.message));
      if (!transient || attempt === 4) throw error;
      const waitMs = 1000 * 4 ** (attempt - 1);
      console.log(`  Transient API error (${status ?? 'network'}); retrying in ${waitMs / 1000}s.`);
      await new Promise((done) => setTimeout(done, waitMs));
    }
  }
  throw new Error('Image generation failed.');
}
