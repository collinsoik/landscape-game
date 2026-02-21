// Pixel-art sprite registry — aggregates all category sprite maps

import type { DrawFn } from './helpers';
import { treeSprites } from './trees';
import { shrubSprites } from './shrubs';
import { flowerSprites } from './flowers';
import { groundCoverSprites } from './ground-cover';
import { waterSprites } from './water';
import { structureSprites } from './structures';
import { habitatSprites } from './habitat';
import { invasiveSprites } from './invasive';

/** Combined registry of all pixel-art drawing functions, keyed by element type. */
export const pixelArtRegistry: Record<string, DrawFn> = {
  ...treeSprites,
  ...shrubSprites,
  ...flowerSprites,
  ...groundCoverSprites,
  ...waterSprites,
  ...structureSprites,
  ...habitatSprites,
  ...invasiveSprites,
};

/**
 * Returns the pixel-art draw function for a given element type,
 * or undefined if no pixel art exists for that type.
 */
export function getPixelArtDrawFn(type: string): DrawFn | undefined {
  return pixelArtRegistry[type];
}
