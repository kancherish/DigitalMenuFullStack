export type DietBadge = "veg" | "non-veg";
export type TagBadge = "chef-special" | "spicy" | "bestseller";
export type Badge = DietBadge | TagBadge;
// src/types/index.ts
export interface RestaurantConfig {
  publicId: string;
  name: string;
  tagline: string | null;
  primaryColor: string;
  logoUrl?: string;
  backgroundUrl?: string;
  accentColor: string;
  tabStyle: string;
  cardRadius: string;
  showSearch: boolean;
  showItemCount: boolean;
  stickyNav: boolean;
  showDivider: boolean;
  defaultImageUrl?: string;
  showItemImage: boolean;
  headerText: string;
  headerLayout?: 'banner' | 'minimal' | 'split';
  logoShape?: 'circle' | 'rounded' | 'square';
  overlayStyle?: 'gradient' | 'solid' | 'none';
  overlayIntensity?: number; // 0–1
  headingFont?: 'serif' | 'sans' | 'display';
  headerAlign?: 'center' | 'left';
  headerSize?: 'compact' | 'default' | 'large';
  categoryVariant?: 'pill' | 'underline'; // CategoryTabs only
  categorySize?: 'sm' | 'md' | 'lg';
  itemSize?: 'sm' | 'md' | 'lg';
  itemImagePosition?: 'left' | 'right';
  itemImageShape?: 'rounded' | 'square' | 'circle';
  currencySymbol?: string;
  surfaceColor?: string;
  boardEnabled?: boolean;
  boardText?: string | null;
}

export interface Category {
  publicId: string;
  name: string;
  icon: string;
  restaurant_id: string;
  items?: Item[];
}

export interface Item {
  publicId: string;
  name: string;
  description: string | null;
  imageURL?: string;
  price: number | null;
  badges: string[];
  category_id: string;
  variants: Variant[];
  available: boolean;
}

export interface Variant {
  publicId: string;
  name: string;
  price: number;
  item_id: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  success: boolean;
  message: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export type SearchResultItem = Item & { categoryName: string };
export interface RequestOptions {
  method?: HttpMethod;
  params?: Record<string, string>;
  body?: unknown;
}
