import { VITE_RESTAURANT_ID, VITE_SERVER_ADDRESS } from "../env";
import type { ApiResponse, Category, RequestOptions, RestaurantConfig } from "../types";

async function apiRequest<T>(endpoint:string,
    {method = 'GET',params,body}:RequestOptions={}
    ):Promise<T> {
    let url = `${VITE_SERVER_ADDRESS}${endpoint}`
    
    if (params) {
        const query = new URLSearchParams(params).toString()
        url +=  `?${query}`
    }

    const res = await fetch(url,{
        method,
        headers:{'Content-Type':'application/json'},
        body:body ? JSON.stringify(body) : undefined,
    });

    const json : ApiResponse<T> = await res.json()

    if (!res.ok || !json.success) {
        console.log(json);
        throw new Error(json.message || "Unkwon Error Occured During Fetching Data")
    }

    return json.data;
}

export async function getRestaurantInfo():Promise<RestaurantConfig | null>{

        try {
            const restaurantInfo: RestaurantConfig = await apiRequest('/restaurant/get',{params:{r_id : VITE_RESTAURANT_ID}})
            if (!restaurantInfo) {
                throw new Error("Restaurant Info is Null")
            }
            return restaurantInfo
        } catch (error) {
            console.log(error,"Erorr While Fetching Restuarant Info");
            return null
        }
}

export async function getCategoriesAndItems():Promise<Category[] | null>{
try {
    const categories = await apiRequest<Category[]>('/category/get', {
      params: {
        r_id: VITE_RESTAURANT_ID,
        incItem: String(true), // URLSearchParams needs strings, not booleans
      },
    });

    return categories;
  } catch (error) {
    console.log(error, "Error while fetching categories");
    return null;
  }
}
