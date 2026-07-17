import { apiFetch } from '../api/apiFetch';
import type { ApiResponse, Restaurant } from '../types';

type RestaurantUpdatePayload = Partial<Omit<Restaurant, 'publicId'>>;

export const restaurantService = {
  getInfo: async (restaurantId: string): Promise<Restaurant> => {
 

    const res = await apiFetch(`/restaurant/get/${restaurantId}`);
    const data: ApiResponse<Restaurant> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch restaurant');
    return data.data;
  },

  update: async (restaurantId: string, updates: RestaurantUpdatePayload): Promise<Restaurant> => {
    const res = await apiFetch('/restaurant/update', {
      method: 'PATCH',
      body: JSON.stringify({ para: { restaurant_id: restaurantId, ...updates } }),
    });
    const data: ApiResponse<Restaurant> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update restaurant');
    return data.data;
  },
};