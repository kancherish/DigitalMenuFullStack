import { apiFetch } from "../api/apiFetch";
import type { ApiResponse,Category } from "../types";

export const categoryService = {
  getByRestaurant: async (restaurantId: string, includeItems = false): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (includeItems) params.set('incItem', 'true');

    const res = await apiFetch(`/category/get/${restaurantId}/${params.toString()}`);
    const data: ApiResponse<Category[]> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch categories');
    return data.data;
  },

  add: async (name: string, icon?: string): Promise<Category> => {
    const res = await apiFetch('/category/add', {
      method: 'POST',
      body: JSON.stringify({ para: { name, icon } }),
    });
    const data: ApiResponse<Category> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create category');
    return data.data;
  },

  update: async (categoryId: string, updates: { name?: string; icon?: string }): Promise<Category> => {
    const res = await apiFetch('/category/update', {
      method: 'PATCH',
      body: JSON.stringify({ para: { category_id: categoryId, ...updates } }),
    });
    const data: ApiResponse<Category> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update category');
    return data.data;
  },

  delete: async (categoryId: string): Promise<void> => {
    const res = await apiFetch(`/category/delete/${categoryId}`, { method: 'DELETE' });
    const data: ApiResponse<null> = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete category');
  },
};