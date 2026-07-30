import { apiFetch } from '../api/apiFetch';
import type { ApiResponse, Item, ItemPayload } from '../types';


export const itemService = {
  getByCategory: async (categoryId: string): Promise<Item[]> => {

    const res = await apiFetch(`/item/get/${categoryId}`);
    const data: ApiResponse<Item[]> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch items');
    return data.data;
  },

  add: async (payload: ItemPayload, imageFile?: File): Promise<Item> => {

    if (imageFile) {
      const formData = new FormData()
      formData.append("para", JSON.stringify(payload))
      formData.append("image", imageFile)
      const res = await apiFetch('/item/add', {
        method: 'POST',
        body: formData,
      });
      const data: ApiResponse<Item> = await res.json();

      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create item');
      return data.data;
    }

    const res = await apiFetch('/item/add', {
      method: 'POST',
      body: JSON.stringify({ para: payload }),
    });
    const data: ApiResponse<Item> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create item');
    return data.data;
  },
  
  update: async (itemId: string, payload: ItemPayload, imageFile?: File, removeImage?: boolean): Promise<Item> => {

    if (removeImage) payload.removeImage = removeImage

    payload.item_id = itemId;

    if (!removeImage && imageFile) {
      const formData = new FormData()
      formData.append("para", JSON.stringify(payload))
      formData.append("image", imageFile)
      const res = await apiFetch('/item/update', {
        method: 'PATCH',
        body: formData,
      }); 
      const data: ApiResponse<Item> = await res.json();
     console.log(data)
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update item');
      return data.data;
    }
   
    const res = await apiFetch('/item/update', {
      method: 'PATCH',
      body: JSON.stringify({ para: {  ...payload } }),
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