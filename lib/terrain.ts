import { getElementDef } from '@/config/elements';
import { GAME_DEFAULTS } from '@/config/game-defaults';
import type { LandscapeId } from '@/config/landscapes';
import { getBackgroundRenderer } from '@/lib/backgrounds';

const masks = new Map<string, Uint8ClampedArray>();
const plantCategories = new Set(['trees', 'shrubs', 'flowers', 'ground_cover', 'invasive']);

export function isPlant(elementType: string): boolean {
  const def = getElementDef(elementType);
  return !!def && (plantCategories.has(def.category) || elementType === 'rain_garden');
}

// Inspect the whole object footprint, so an edge cannot hang over blocked terrain.
// Red mask pixels block everything; green pixels represent sand and block plants.
export function checkTerrainFootprint(
  pixels: Uint8ClampedArray, width: number, height: number,
  x: number, y: number, objectWidth: number, objectHeight: number, plant: boolean,
): string | null {
  if (![x, y, objectWidth, objectHeight].every(Number.isFinite) ||
      x < 0 || y < 0 || x + objectWidth > width || y + objectHeight > height) {
    return 'Keep the whole object inside your landscape.';
  }
  let onSand = false;
  for (let py = Math.floor(y); py < Math.ceil(y + objectHeight); py++) {
    for (let px = Math.floor(x); px < Math.ceil(x + objectWidth); px++) {
      const i = (py * width + px) * 4;
      if (!pixels[i + 3]) continue;
      if (pixels[i] > 0) return 'Choose a spot clear of water and rocks.';
      if (plant && pixels[i + 1] > 0) onSand = true;
    }
  }
  return onSand ? 'Plants need grass. Try a grassy spot instead of sand.' : null;
}

export function getPlacementError(
  landscapeId: LandscapeId, elementType: string, x: number, y: number,
  width: number, height: number,
): string | null {
  const def = getElementDef(elementType);
  if (!def) return 'Choose an object first.';
  const key = `${landscapeId}:${width}:${height}`;
  let pixels = masks.get(key);
  if (!pixels) {
    const artwork = document.createElement('canvas');
    const terrain = document.createElement('canvas');
    artwork.width = terrain.width = width;
    artwork.height = terrain.height = height;
    const ctx = artwork.getContext('2d');
    const mask = terrain.getContext('2d', { willReadFrequently: true });
    if (!ctx || !mask) return 'Your landscape is still loading. Please try again.';
    getBackgroundRenderer(landscapeId)(ctx, width, height, mask);
    pixels = mask.getImageData(0, 0, width, height).data;
    masks.set(key, pixels);
  }
  const scale = GAME_DEFAULTS.canvas.spriteScale;
  return checkTerrainFootprint(pixels, width, height, x, y, def.width * scale, def.height * scale, isPlant(elementType));
}
