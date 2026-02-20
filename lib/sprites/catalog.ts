// Sprite catalog — maps element types to visual properties for placeholder rendering

import { ELEMENT_CATEGORIES } from '@/config/elements';

/** Category color lookup for placeholder sprites. */
const categoryColorMap: Record<string, string> = {};
for (const cat of ELEMENT_CATEGORIES) {
  categoryColorMap[cat.key] = cat.color;
}

/** Returns the background color for a placeholder sprite based on category. */
export function getCategoryColor(category: string): string {
  return categoryColorMap[category] ?? '#666666';
}

/**
 * Returns a 1-2 character initial label for an element type.
 * e.g. "oak_tree" -> "OT", "rain_garden" -> "RG"
 */
export function getInitials(type: string): string {
  const parts = type.split('_');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return type.slice(0, 2).toUpperCase();
}
