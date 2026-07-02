import { Coffee, Utensils, IceCream} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  starters: Utensils,
  mains: Utensils,
  drinks: Coffee,
  desserts: IceCream,
};

const DEFAULT_ICON = Utensils;

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

