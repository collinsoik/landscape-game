// Sprite loader — generates placeholder sprites using Canvas 2D API and caches them

import { getCategoryColor, getInitials } from './catalog';

const spriteCache = new Map<string, HTMLImageElement>();

/**
 * Generates a placeholder sprite for an element type.
 * Draws a colored rectangle (based on category) with white text initials.
 * Returns an HTMLImageElement loaded from a data URL.
 */
function generatePlaceholderSprite(
  type: string,
  category: string,
  width: number,
  height: number,
): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Disable smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;

  // Background fill with category color
  const bgColor = getCategoryColor(category);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Darker border
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  // Inner highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  // Text initials
  const initials = getInitials(type);
  const fontSize = Math.min(width, height) * 0.4;
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, width / 2, height / 2);

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

/**
 * Gets or creates a cached placeholder sprite for the given element.
 * Returns a Promise that resolves once the image is loaded.
 */
export function getSprite(
  type: string,
  category: string,
  width: number,
  height: number,
): Promise<HTMLImageElement> {
  const key = `${type}_${width}_${height}`;
  const cached = spriteCache.get(key);
  if (cached) {
    return Promise.resolve(cached);
  }

  const img = generatePlaceholderSprite(type, category, width, height);

  return new Promise((resolve) => {
    if (img.complete) {
      spriteCache.set(key, img);
      resolve(img);
    } else {
      img.onload = () => {
        spriteCache.set(key, img);
        resolve(img);
      };
    }
  });
}

/**
 * Synchronously gets a cached sprite, or null if not yet loaded.
 * Call getSprite first to ensure it's cached.
 */
export function getSpriteSync(
  type: string,
  width: number,
  height: number,
): HTMLImageElement | null {
  return spriteCache.get(`${type}_${width}_${height}`) ?? null;
}

/**
 * Preloads all sprites from the element catalog.
 */
export async function preloadAllSprites(
  elements: { type: string; category: string; width: number; height: number }[],
): Promise<void> {
  await Promise.all(
    elements.map((el) => getSprite(el.type, el.category, el.width, el.height)),
  );
}
