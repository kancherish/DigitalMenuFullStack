// src/types/index.ts
export interface RestaurantConfig {
  publicId: string;
  name: string;
  tagline: string | null;
  primaryColor: string;
  accentColor: string;
  tabStyle : string;
  cardRadius : string;
}

export interface Category {
  publicId: string;
  name: string;
  restaurant_id: string;
  items?: Item[];
}

export interface Item {
  publicId: string;
  name: string;
  description: string | null;
  price: number | null;
  category_id: string;
  variants: Variant[];
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

export interface RequestOptions {
  method?: HttpMethod;
  params?: Record<string, string>;
  body?: unknown;
}
