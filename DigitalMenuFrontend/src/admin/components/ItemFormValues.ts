import { type ItemFormValues } from "../types";

export const emptyItemForm: ItemFormValues = {
  name: '',
  description: '',
  pricingMode: 'price',
  price: '',
  variants: [{ name: '', price: '' }],
  badges: [],
};