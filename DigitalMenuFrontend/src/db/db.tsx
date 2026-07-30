import { VITE_SERVER_ADDRESS } from "../env";
import type { ApiResponse, Category, RequestOptions, RestaurantConfig } from "../types";

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

        try {
            const restaurantInfo: RestaurantConfig = await apiRequest(`/restaurant/get/${RestaurantId}`,{},signal)
            if (!restaurantInfo) {
                throw new Error("Restaurant Info is Null")
            }
            return restaurantInfo
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') throw error;
            console.log(error,"Erorr While Fetching Restuarant Info");
            return null
        }
}

export async function getCategoriesAndItems(RestaurantId:string,signal?:AbortSignal):Promise<Category[] | null>{
try {
    const categories = await apiRequest<Category[]>(`/category/get/${RestaurantId}`, {
      params: {
        incItem: String(true), // URLSearchParams needs strings, not booleans
      },
    },signal);

    return categories;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    console.log(error, "Error while fetching categories");
    return null;
  }
}
