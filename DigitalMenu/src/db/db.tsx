import { tablesdb } from "../backend/appwrite";
import { VITE_DB_ID, VITE_TABLE_ID, VITE_TABLE_ID_CAT } from "../env";
import type {
  restaurantConfigT,
  categoryT,
  itemT
} from "../types";

const itemCache = new Map<string, itemT[]>();
const itemInflight = new Map<string, Promise<itemT[]>>();


const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function connectToDB() {
  await wait(1000);

  return true;
}

export async function getRestaurantConfig(): Promise<restaurantConfigT> {

  try {
    const rows = await tablesdb.listRows({
      databaseId: VITE_DB_ID,
      tableId: VITE_TABLE_ID,
      queries: []
    })

    return rows.rows[0] as unknown as restaurantConfigT
  } catch (error) {
      console.log(error)
      throw new Error(error as string)
  }

}

export async function getCategories(): Promise<categoryT[]> {

  const rows = await tablesdb.listRows({
    databaseId: VITE_DB_ID,
    tableId: VITE_TABLE_ID_CAT,
    queries: []
  })



  return rows.rows as unknown as categoryT[]
}

export async function fetchItemsFromDB(category: string): Promise<itemT[]> {

  await wait(1000);

  if (category === "momos") {
    return [
      {
        name: "Veg Steam Momos",
        description: "Fresh handmade momos",
        price: "120",
      },
      {
        name: "Paneer Fried Momos",
        description: "Crispy fried paneer momos",
        variants: [
          {
            name: "Half",
            price: "100",
          },
          {
            name: "Full",
            price: "180",
          },
        ],
      },
    ];
  }

  return [];
}


export async function getItems(categoryId: string): Promise<itemT[]> {
  if (itemCache.has(categoryId)) {
    return itemCache.get(categoryId)!;
  }

  // If a request is already in-flight for this key, reuse it
  if (itemInflight.has(categoryId)) {
    return itemInflight.get(categoryId)!;
  }

  const promise = fetchItemsFromDB(categoryId).then((result) => {
    itemCache.set(categoryId, result);
    itemInflight.delete(categoryId);  // clean up after settling
    return result;
  });

  itemInflight.set(categoryId, promise);
  return promise;
}