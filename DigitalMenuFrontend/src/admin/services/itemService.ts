import { apiFetch } from '../api/apiFetch';
import type { ApiResponse, Item,ItemPayload } from '../types';


export const itemService = {
  getByCategory: async (categoryId: string): Promise<Item[]> => {
 
    const res = await apiFetch(`/item/get/${categoryId}`);
    const data: ApiResponse<Item[]> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch items');
    return data.data;
  },

  add: async (payload: ItemPayload): Promise<Item> => {
    const res = await apiFetch('/item/add', {
      method: 'POST',
      body: JSON.stringify({ para: payload }),
    });
    const data: ApiResponse<Item> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create item');
    return data.data;
  },

  update: async (itemId: string, payload: ItemPayload): Promise<Item> => {
    const res = await apiFetch('/item/update', {
      method: 'PATCH',
      body: JSON.stringify({ para: { item_id: itemId, ...payload } }),
    });
    const data: ApiResponse<Item> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update item');
    return data.data;
  },

  delete: async (itemId: string): Promise<void> => {
    const res = await apiFetch(`/item/delete/${itemId}`, { method: 'DELETE' });
    const data: ApiResponse<null> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete item');
  },
};