// Background renderer registry — maps LandscapeId to draw functions

import type { LandscapeId } from '@/config/landscapes';
import { drawMeadow } from './meadow';
import { drawRiverside } from './riverside';
import { drawRockyHills } from './rocky-hills';
import { drawLakeside } from './lakeside';
import { drawCoastal } from './coastal';

export type BackgroundDrawFn = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const renderers: Record<LandscapeId, BackgroundDrawFn> = {
  meadow: drawMeadow,
  riverside: drawRiverside,
  'rocky-hills': drawRockyHills,
  lakeside: drawLakeside,
  coastal: drawCoastal,
};

export function getBackgroundRenderer(id: LandscapeId): BackgroundDrawFn {
  return renderers[id] ?? renderers.meadow;
}
