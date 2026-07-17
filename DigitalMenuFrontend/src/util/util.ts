import { Utensils, Coffee, IceCream, Pizza, Soup, Wine, Salad, Sandwich, Fish, Beef, type LucideIcon , ChefHat, Flame, TrendingUp} from 'lucide-react';
import type { DietBadge, TagBadge } from '../types';

export const ICONS: Record<string, LucideIcon> = {
  Utensils,
  Coffee,
  IceCream,
  Pizza,
  Soup,
  Wine,
  Salad,
  Sandwich,
  Fish,
  Beef,
};


export const ICON_NAMES = Object.keys(ICONS);

export const DEFAULT_ICON = Utensils;
export const DEFAULT_ICON_string  = "Utensils";

export function getCategoryIcon(name: string): LucideIcon {
  return ICONS[name?.toLowerCase()] || DEFAULT_ICON;
}

// ============================================================
// CUSTOMIZATION — tweak these without touching the JSX below
// ============================================================
export const LAYOUT = {
  showSearch: true,                         // search box for filtering items within a category
  showItemCount: true,                      // small count badge on each tab
  stickyNav: true,                          // keep category nav pinned while scrolling
};

export function useThemeVars(primary: string, accent: string, radius: string) {
  return {
    '--primary': primary,
    '--accent': accent,
    '--accent-soft': `${accent}1A`, // ~10% opacity wash, used for active states
    '--accent-soft-strong': `${accent}33`,
    '--radius': radius,
  } as React.CSSProperties;
}

// utils/diffChanged.ts

/**
 * Returns only the keys in `updated` whose values differ from `original`.
 * Shallow comparison — fine for flat fields (strings, numbers, booleans).
 * Arrays/objects (e.g. variants, badges) are compared by reference OR
 * JSON-stringified if you pass `deepKeys` for those specific fields.
 */
export function diffChanged<T extends object>(
  original: T,
  updated: T,
  deepKeys: (keyof T)[] = []
): Partial<T> {
  const changes: Partial<T> = {};

  for (const key of Object.keys(updated) as (keyof T)[]) {
    const origVal = original[key];
    const newVal = updated[key];

    const isDeep = deepKeys.includes(key);
    const changed = isDeep
      ? JSON.stringify(origVal) !== JSON.stringify(newVal)
      : origVal !== newVal;

    if (changed) {
      changes[key] = newVal;
    }
  }

  return changes;
}


export const TAG_BADGE_CONFIG: Record<TagBadge, { label: string; icon: LucideIcon; color: string }> = {
  'chef-special': { label: "Chef's Special", icon: ChefHat, color: '#b45309' },
  spicy: { label: 'Spicy', icon: Flame, color: '#dc2626' },
  bestseller: { label: 'Bestseller', icon: TrendingUp, color: '#0f766e' },
};

export const TAG_BADGE_NAMES = Object.keys(TAG_BADGE_CONFIG) as TagBadge[];

export const DIET_BADGE_LABELS: Record<DietBadge, string> = {
  veg: 'Vegetarian',
  'non-veg': 'Non-Vegetarian',
};

export function isDietBadge(value: string): value is DietBadge {
  return value === 'veg' || value === 'non-veg';
}

export function isTagBadge(value: string): value is TagBadge {
  return value in TAG_BADGE_CONFIG;
}
