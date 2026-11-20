// api/types.ts
export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  success: boolean;
  message: string;
}

export type NavStyle = 'tabs' | 'dropdown' | 'continuous';

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
  available: boolean;
  imageURL?: string | null;
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
  bodyTextColor?: string | null;
  accentColor: string | null;
  tabStyle: 'tabs' | 'dropdown' | 'continuous' | null;
  logoUrl?: string | null;
  backgroundUrl?: string | null;
  BodyTextColor?: string | null;
  roundness: string | null;
  showSearch: boolean;
  showItemCount: boolean;
  stickyNav: boolean;
  continuousCollapsible?: boolean;
  domain: string | null;
  showDivider: boolean;
  headerText: string;
  defaultImageUrl: string | null;
  showItemImage: boolean;
  headerLayout?: 'banner' | 'minimal' | 'split';
  logoShape?: 'circle' | 'rounded' | 'square';
  overlayStyle?: 'gradient' | 'solid' | 'none';
  overlayIntensity?: number; // 0–1
  headingFont?: 'serif' | 'sans' | 'display' | 'inter' | 'poppins' | 'montserrat' | 'nunito' | 'playfair' | 'lora' | 'merriweather';
  bodyFont?: 'serif' | 'sans' | 'display' | 'inter' | 'poppins' | 'montserrat' | 'nunito' | 'playfair' | 'lora' | 'merriweather';
  headerAlign?: 'center' | 'left';
  headerSize?: 'compact' | 'default' | 'large';
  headerAccentPanel?: boolean;
  headerPanelIntensity?: number;
  headerNameGradient?: boolean;
  headerUppercaseTagline?: boolean;
  headerShimmer?: boolean;
  headerNameColor?: string | null;
  headerTaglineColor?: string | null;
  headerNameGradientFrom?: string | null;
  headerNameGradientTo?: string | null;
  headerNameGradientAngle?: number;
  showLogo?: boolean;
  logoSize?: 'auto' | 'sm' | 'md' | 'lg';
  headerBackgroundPositionX?: number;
  headerBackgroundPositionY?: number;
  headerBackgroundZoom?: number;
  headerDividerStyle?: 'line' | 'dots' | 'diamond' | 'none';
  headerSpacing?: 'tight' | 'default' | 'loose';
  headerMaxWidth?: 'sm' | 'md' | 'lg' | 'full';
  categoryVariant?: 'pill' | 'underline'; // CategoryTabs only
  categorySize?: 'sm' | 'md' | 'lg';
  itemSize?: 'sm' | 'md' | 'lg';
  itemImagePosition?: 'left' | 'right';
  itemImageShape?: 'rounded' | 'square' | 'circle';
  currencySymbol?: string;
  pageBackground?: 'gradient' | 'solid' | 'image';
  itemOfTheDayId?: string | null;
  surfaceColor?: string | null;
  boardEnabled?: boolean;
  boardText?: string | null;
  showPdfDownload?: boolean;
  pdfDownloadPlacement?: 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left';
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
  item_id?: string;
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  variants?: Pick<Variant, 'name' | 'price'>[];
  badges?: string[];
  imageURL?: string | null;
  removeImage?: boolean;
  available?: boolean;
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
  removeImage?: boolean;
  imageMode: 'upload' | 'url';
  imageUrl?: string;
  imageFile: File | null;
  available: boolean;
}


export interface ItemFormProps {
  values: ItemFormValues;
  onChange: (values: ItemFormValues) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel: string;
  submitting: boolean;
}

