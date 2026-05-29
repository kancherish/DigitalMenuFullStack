import { useEffect, useState } from 'react';
import { Coffee, Utensils, IceCream, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getRestaurantConfig,
  getCategories,
  getItems
} from './db/db';
import type {
  restaurantConfigT,
  categoryT,
  itemT
} from "./types";
import LoadingScreen from './component/Loader';
import Footer from './component/Footer';
import Item from './component/Item';



// ICON MAPPING
const ICONS: Record<string, LucideIcon> = {
  starters: Utensils,
  mains: Utensils,
  drinks: Coffee,
  desserts: IceCream,
};


function Header({
  color,
  name,
  tagline
}: {
  color: string,
  name: string,
  tagline: string
}) {
  return (
    <div
      className="text-center py-12 px-6"
      style={{ backgroundColor: color }}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
        {name}
      </h1>

      <p className="text-lg text-white opacity-90">
        {tagline}
      </p>
    </div>
  );
}


export default function DigitalMenu() {

  const [restaurantConfig, setRestaurantConfig] =
    useState<restaurantConfigT | null>(null);

  const [categories, setCategories] =
    useState<categoryT[]>([]);

  const [items, setItems] =
    useState<itemT[]>([]);

  const [activeCategory, setActiveCategory] =
    useState<string>("");

  const [isDropdownOpen, setIsDropdownOpen] =
    useState(false);

  const activeCategoryData =
    categories.find(cat => cat.$id === activeCategory);

  const ActiveIcon =
    ICONS[activeCategory] || Utensils;

  const [itemsLoading, setItemsLoading] =
    useState(false);

  const [itemsError, setItemsError] =
    useState<string | null>(null);

  const [categoryConfigRetryCount, setCategoryConfigRetryCount] =
    useState(0);

  const [itemRetryCount, setItemRetryCount] =
    useState(0);

  const [configError, setConfigError] =
    useState(false);


  // LOAD RESTAURANT CONFIG
  useEffect(() => {

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    Promise.race([getRestaurantConfig(), timeout])
      .then((res) => {
        const config = res as unknown as restaurantConfigT;
        setRestaurantConfig(config);
      })
      .catch((error) => {
        console.log(error);
        setConfigError(true);
      });

  }, [categoryConfigRetryCount]);


  // LOAD CATEGORIES
  useEffect(() => {

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 8000)
    );

    Promise.race([getCategories(), timeout])
      .then((res) => {
        const categories = res as unknown as categoryT[];
        setCategories(categories);
        if (categories.length > 0) setActiveCategory(categories[0].$id);
      })
      .catch((error) => {
        console.log(error);
        setConfigError(true);
      });

  }, [categoryConfigRetryCount]);


  // LOAD ITEMS WHEN CATEGORY CHANGES
  useEffect(() => {

    if (!activeCategory) return;

    setItemsLoading(true);
    setItemsError(null);

    getItems(activeCategory)
      .then((res) => {
        setItems(res);
      })
      .catch((error) => {
        console.log(error);
        setItemsError("Failed to load menu items. Please try again.");
        setItems([]);
      })
      .finally(() => {
        setItemsLoading(false);
      });

  }, [activeCategory, itemRetryCount]);


  // LOADING SCREEN
  if (!configError && (!restaurantConfig || categories.length === 0)) {
    return <LoadingScreen />;
  }

  // ERROR SCREEN
  if (configError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500">Failed to load restaurant data.</p>
        <button
          onClick={() => {
            setConfigError(false);
            setRestaurantConfig(null);
            setCategories([]);
            setCategoryConfigRetryCount(c => c + 1);
          }}
          className="px-6 py-2 rounded-lg bg-slate-700 text-white font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  // MAIN UI
  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* HEADER */}
      <Header
        color={restaurantConfig!.primaryColor}
        name={restaurantConfig!.name}
        tagline={restaurantConfig!.tagline}
      />


      {/* CATEGORY DROPDOWN */}
      <div className="sticky top-0 bg-white shadow-md z-20">

        <div className="max-w-4xl mx-auto px-6 py-4">

          <div className="relative">

            <button
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }

              className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 rounded-lg hover:bg-slate-50 transition-all"

              style={{
                borderColor: restaurantConfig!.accentColor,
                color: restaurantConfig!.primaryColor
              }}
            >

              <div className="flex items-center gap-3">

                <ActiveIcon />

                <span className="text-lg font-semibold">
                  {activeCategoryData?.name}
                </span>

              </div>

              <ChevronDown
                size={24}
                className={`transition-transform ${isDropdownOpen
                  ? 'rotate-180'
                  : ''
                  }`}
              />

            </button>


            {/* DROPDOWN */}
            {isDropdownOpen && (

              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 rounded-lg shadow-lg overflow-hidden"

                style={{
                  borderColor:
                    restaurantConfig!.accentColor
                }}
              >

                {categories.map((category) => {

                  const Icon =
                    ICONS[category.$id] || Utensils;

                  return (

                    <button
                      key={category.$id}

                      onClick={() => {
                        setActiveCategory(category.$id);
                        setIsDropdownOpen(false);
                      }}

                      className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-all ${activeCategory === category.$id
                        ? 'font-semibold'
                        : ''
                        }`}

                      style={{
                        backgroundColor:
                          activeCategory === category.$id
                            ? `${restaurantConfig!.accentColor}20`
                            : 'transparent',

                        color:
                          restaurantConfig!.primaryColor
                      }}
                    >

                      <Icon size={20} />

                      <span>
                        {category.name}
                      </span>

                    </button>

                  );

                })}

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ITEMS */}
      <div className="max-w-4xl mx-auto px-6 py-8">

        <h2
          className="text-3xl font-bold mb-6"
          style={{
            color: restaurantConfig!.primaryColor
          }}
        >
          {activeCategoryData?.name}
        </h2>


        <div className="space-y-6">

          {itemsLoading ? (

            <div className="flex justify-center py-20">
              <div className="text-lg font-semibold text-slate-500">
                Loading menu...
              </div>
            </div>

          ) : itemsError ? (

            <div className="flex flex-col items-center py-20 gap-4">
              <p className="text-slate-500">{itemsError}</p>
              <button
                onClick={() => setItemRetryCount(c => c + 1)}
                className="px-6 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: restaurantConfig!.accentColor }}
              >
                Try again
              </button>
            </div>

          ) : (

            items.map((item, idx) => (
              <Item
                key={item.$id}
                itemStructure={item}
                index={idx}
                primaryColor={restaurantConfig!.primaryColor}
                accentColor={restaurantConfig!.accentColor}
              />
            ))

          )}

        </div>

      </div>


      <Footer />

    </div>

  );

}