import { VITE_SERVER_ADDRESS } from "../env";
import type { ApiResponse, Category, RequestOptions, RestaurantConfig } from "../types";

const MENU_CACHE_TTL = 60_000;
const menuCache = new Map<string, { value: unknown; expiresAt: number }>();

function readMenuCache<T>(key: string): T | null {
    const entry = menuCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        menuCache.delete(key);
        return null;
    }
    return entry.value as T;
}

function writeMenuCache(key: string, value: unknown): void {
    menuCache.set(key, { value, expiresAt: Date.now() + MENU_CACHE_TTL });
}

function assertActive(signal?: AbortSignal): void {
    if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");
}

export function clearMenuCache(restaurantId?: string): void {
    if (!restaurantId) {
        menuCache.clear();
        return;
    }
    menuCache.delete(`restaurant:${restaurantId}`);
    menuCache.delete(`categories:${restaurantId}`);
}

async function apiRequest<T>(endpoint:string,
    {method = 'GET',params,body}:RequestOptions={},signal?:AbortSignal
    ):Promise<T> {
    let url = `${VITE_SERVER_ADDRESS}${endpoint}`
    
    if (params) {
        const query = new URLSearchParams(params).toString()
        url +=  `?${query}`
    }

    const res = await fetch(url,{
        method,
        headers:{'Content-Type':'application/json'},
        body:body ? JSON.stringify(body) : undefined,signal,
    });

    const json : ApiResponse<T> = await res.json()


    if (!res.ok || !json.success) {
        throw new Error(json.message || "Unkwon Error Occured During Fetching Data")
    }

    return json.data;
}

export async function getRestaurantInfo(RestaurantId:string,signal?:AbortSignal):Promise<RestaurantConfig | null>{
        assertActive(signal);
        const key = `restaurant:${RestaurantId}`;
        const cached = readMenuCache<RestaurantConfig>(key);
        if (cached) return cached;

        try {
            const restaurantInfo: RestaurantConfig = await apiRequest(`/restaurant/get/${RestaurantId}`,{},signal)
            if (!restaurantInfo) {
                throw new Error("Restaurant Info is Null")
            }
            writeMenuCache(key, restaurantInfo);
            return restaurantInfo
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            return null
        }
}

export async function getCategoriesAndItems(RestaurantId:string,signal?:AbortSignal):Promise<Category[] | null>{
assertActive(signal);
const key = `categories:${RestaurantId}`;
const cached = readMenuCache<Category[]>(key);
if (cached) return cached;

try {
    const categories = await apiRequest<Category[]>(`/category/get/${RestaurantId}`, {
      params: {
        incItem: String(true), // URLSearchParams needs strings, not booleans
      },
    },signal);

    writeMenuCache(key, categories);
    return categories;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return null;
  }
}
