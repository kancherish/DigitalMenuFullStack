import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Header } from './component/Header';
import LoadingScreen from './component/Loader';
import Footer from './component/Footer';
import type { Category, Item, RestaurantConfig } from './types';
import { getCategoriesAndItems, getRestaurantInfo } from './db/db';
import ItemCard from './component/Item';
import { CategoryTabs } from './component/CatgoriesNavs';
import { CategoryDropdown } from './component/CatgoriesNavs';
import { useThemeVars } from './util/util';

export default function DigitalMenu() {
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [categoriesAndItems, setCategoriesAndItems] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [categoryConfigRetryCount, setCategoryConfigRetryCount] = useState(0);
  const [configError, setConfigError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategoryData = activeCategory !== null ? categoriesAndItems[activeCategory] : null;
  useEffect(() => {
    const controller = new AbortController();

    const fetchRestaurantConfig = async () => {
      try {
        const res = await getRestaurantInfo(controller.signal);
        if (!res) {
          setConfigError(true);
          return;
        }
        setRestaurantConfig(res as RestaurantConfig);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;   // ✅ just ignore aborts – no error
        console.error(error);
        setConfigError(true);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await getCategoriesAndItems(controller.signal);
        if (!res) {
          setConfigError(true);
          return;
        }
        const categories = res as Category[];
        setCategoriesAndItems(categories);
        if (categories.length > 0) setActiveCategory(0);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;   // ✅ ignore aborts
        console.error(error);
        setConfigError(true);
      }
    };

    // Timeout: abort both fetches after 8 seconds
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetchRestaurantConfig();
    fetchCategories();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();   // cleanup on unmount or dependency change
    };
  }, [categoryConfigRetryCount]);
  // Items for the active category, filtered by search query.
  // Falls back gracefully if Item doesn't have a `name` field at runtime.
  const items: Item[] = useMemo(() => {
    const base = activeCategoryData?.items ?? [];
    if (!searchQuery.trim()) return base;
    const q = searchQuery.trim().toLowerCase();
    return base.filter((item: Item) => (item.name ?? '').toLowerCase().includes(q));
  }, [activeCategoryData, searchQuery]);

  const itemCounts = useMemo(
    () => categoriesAndItems.map((c) => c.items?.length ?? 0),
    [categoriesAndItems]
  );

  const navStyle = restaurantConfig?.tabStyle ?? 'tabs';

  const themeVars = useThemeVars(
    restaurantConfig?.primaryColor ?? '#1e293b',
    restaurantConfig?.accentColor ?? '#0ea5e9',
    restaurantConfig?.cardRadius ?? '1rem'
  );

  // LOADING SCREEN
  if (!configError && (!restaurantConfig)) {
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
            setCategoriesAndItems([]);
            setCategoryConfigRetryCount((c) => c + 1);
          }}
          className="px-6 py-2 rounded-lg bg-slate-700 text-white font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 font-sans"
      style={themeVars}
    >
      <Header
        color={restaurantConfig!.primaryColor}
        accent={restaurantConfig!.accentColor}
        name={restaurantConfig!.name}
        logoUrl={restaurantConfig!.logoUrl || undefined}
        backgroundImage={restaurantConfig!.backgroundUrl || undefined}
        tagline={restaurantConfig!.tagline || ''}
        textColor={restaurantConfig!.headerText ?? 'white'}
        showDivider={restaurantConfig!.showDivider}
      />

      {categoriesAndItems.length === 0 ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500">No Categories Added By Restaurant Yet</p>
        </div>
      ) : (
        <>
          <div
            className={`${restaurantConfig!.stickyNav ? 'sticky top-0 z-20' : ''} shadow-md`}
            style={{ backgroundColor: 'var(--surface, #fff)' }}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
              {navStyle === 'tabs' ? (
                <CategoryTabs
                  categories={categoriesAndItems}
                  showItemCount={restaurantConfig!.showItemCount}
                  activeIndex={activeCategory ?? 0}
                  onSelect={(idx: number) => {
                    setActiveCategory(idx)
                    setSearchQuery("");
                  }}
                  itemCounts={itemCounts}
                />
              ) : (
                <CategoryDropdown
                  categories={categoriesAndItems}
                  activeIndex={activeCategory ?? 0}
                  itemCounts={itemCounts}
                  showItemCount={restaurantConfig!.showItemCount}
                  onSelect={(idx: number) => {
                    setActiveCategory(idx)
                    setSearchQuery("");
                  }}
                />
              )}

              {restaurantConfig!.showSearch && (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${activeCategoryData?.name ?? 'menu'}...`}
                    className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 focus:outline-none transition-shadow"
                    style={{
                      borderRadius: 'var(--radius)',
                      boxShadow: 'none',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 2px var(--accent-soft-strong, var(--accent))`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            <h2
              className="font-serif text-3xl font-semibold mb-6"
              style={{ color: 'var(--primary)' }}
            >
              {activeCategoryData?.name}
            </h2>

            <div
              key={activeCategory} // remounts on category change → quick fade-in instead of an abrupt swap
              className="space-y-6 animate-[fadein_0.25s_ease]"
            >
              <style>{`@keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <p className="text-slate-500">
                    {searchQuery ? `No items match "${searchQuery}".` : 'No items in this category yet.'}
                  </p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <ItemCard
                    key={item.publicId}
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
        </>
      )}


    </div>
  );
}