// api/types.ts
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  success: boolean;
  message: string;
}

export type NavStyle = 'tabs' | 'dropdown';

export interface Variant {
  id?: string;
  publicId?: string;
  name: string;
  price: number;
}

export interface Item {
  publicId: string;
  name: string;
  description: string | null;
  price: number | null;
  category_id: string;
  badges: string[];
  variants: Variant[];
}

export interface Category {
  publicId: string;
  name: string;
  icon: string | null;
  restaurant_id: string;
  items?: Item[]; // present only when fetched with incItem=true
}

export interface Restaurant {
  publicId: string;
  name: string;
  tagline: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  tabStyle: 'tabs' | 'dropdown' | null;
  logoUrl?: string | null;
  backgroundUrl?: string | null;
  roundness: string | null;
  showSearch: boolean;
  showItemCount: boolean;
  stickyNav: boolean;
  domain: string | null;
  showDivider : boolean;
   headerText  : string;
}

export interface AdminInfo {
  publicId: string;
  username: string;
  restaurant: Restaurant;
}


export interface ApiFetchOptions extends RequestInit {
  _retried?: boolean;
}

export interface ItemPayload {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  variants?: Pick<Variant, 'name' | 'price'>[];
  badges?: string[];
}

export type DietBadge = 'veg' | 'non-veg';
export type TagBadge = 'chef-special' | 'spicy' | 'bestseller';


export interface ItemFormValues {
  name: string;
  description: string;
  pricingMode: 'price' | 'variants';
  price: string;
  variants: { name: string; price: string }[];
  badges: string[];
}


export interface ItemFormProps {
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  submitting: boolean;
}
export type SearchResultItem = Item & { categoryName: string };