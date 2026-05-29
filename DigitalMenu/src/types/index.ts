// types.ts

export type restaurantConfigT = {
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  logo: string | null;
};

export type variantT = {
  name: string;
  price: string;
};

export type itemT = {
  name: string;
  description: string;
  price?: string;
  $id : string;
  variants?: variantT[];
};

export type categoryT = {
  $id: string;
  name: string;
  icon?: string;
  items: itemT[];
};