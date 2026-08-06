import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { Megaphone, Search, X } from 'lucide-react';
import { Header } from './component/Header';
import LoadingScreen from './component/Loader';
import Footer from './component/Footer';
import type { Category, RestaurantConfig, SearchResultItem } from './types';
import { getCategoriesAndItems, getRestaurantInfo } from './db/db';
import ItemCard from './component/Item';
import { CategoryTabs, CategoryDropdown } from './component/CatgoriesNavs';
import { useThemeVars } from './util/util';
import { useParams } from 'react-router-dom';

export default function DigitalMenu() {
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [categoriesAndItems, setCategoriesAndItems] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [categoryConfigRetryCount, setCategoryConfigRetryCount] = useState(0);
  const [configError, setConfigError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategoryData = activeCategory !== null ? categoriesAndItems[activeCategory] : null;

  const { RestaurantId } = useParams();

  useEffect(() => {
    const controller = new AbortController();

    const fetchRestaurantConfig = async () => {
      try {
        const res = await getRestaurantInfo(RestaurantId || "", controller.signal);
        if (!res) {
          setConfigError(true);
          return;
        }
        setRestaurantConfig(res as RestaurantConfig);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error(error);
        setConfigError(true);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await getCategoriesAndItems(RestaurantId || "", controller.signal);
        if (!res) {
          setConfigError(true);
          return;
        }
        const categories = res as Category[];
        setCategoriesAndItems(categories);
        if (categories.length > 0) setActiveCategory(0);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error(error);
        setConfigError(true);
      }
    };

    const timeoutId = setTimeout(() => controller.abort(), 8000);
    fetchRestaurantConfig();
    fetchCategories();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [categoryConfigRetryCount, RestaurantId]);

  // Global search across all categories
  const globalSearchResults = useMemo<SearchResultItem[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return categoriesAndItems.flatMap((cat) =>
      (cat.items ?? [])
        .filter((item) => (item.name ?? '').toLowerCase().includes(q))
        .map((item) => ({ ...item, categoryName: cat.name }))
    );
  }, [categoriesAndItems, searchQuery]);

  const itemCounts = useMemo(
    () => categoriesAndItems.map((c) => c.items?.length ?? 0),
    [categoriesAndItems]
  );

  const navStyle = restaurantConfig?.tabStyle ?? 'tabs';
  const isSearching = searchQuery.trim().length > 0;

  const themeVars = useThemeVars(
    restaurantConfig?.primaryColor ?? '#1e293b',
    restaurantConfig?.accentColor ?? '#0ea5e9',
    restaurantConfig?.cardRadius ?? '1rem',
    restaurantConfig?.surfaceColor ?? '#ffffff'
  );

  // LOADING SCREEN
  if (!configError && !restaurantConfig) {
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
    <div className="min-h-screen font-sans" style={themeVars}>
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: 'var(--surface, #f8fafc)' }}
      />

      <Header
        color={restaurantConfig!.primaryColor}
        accent={restaurantConfig!.accentColor}
        name={restaurantConfig!.name}
        logoUrl={restaurantConfig!.logoUrl || undefined}
        backgroundImage={restaurantConfig!.backgroundUrl || undefined}
        tagline={restaurantConfig!.tagline || ''}
        textColor={restaurantConfig!.headerText ?? 'white'}
        showDivider={restaurantConfig!.showDivider}
        headingFont={restaurantConfig!.headingFont || "sans"}
        logoShape={restaurantConfig!.logoShape || "circle"}
        overlayStyle={restaurantConfig!.overlayStyle || "gradient"}
        overlayIntensity={restaurantConfig!.overlayIntensity ?? 1}
        radius={restaurantConfig!.cardRadius}
        align={restaurantConfig!.headerAlign || "center"}
        size={restaurantConfig!.headerSize || "compact"}
        layout={restaurantConfig!.headerLayout || "banner"}
      />

      {categoriesAndItems.length === 0 ? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500">No Categories Added By Restaurant Yet</p>
        </div>
      ) : (
        <>

          {restaurantConfig!.boardEnabled && restaurantConfig!.boardText && !isSearching && (
            <div className="max-w-4xl mx-auto px-6 pt-8">
              <div
                className="flex items-start gap-3 rounded-2xl p-4 sm:p-5 shadow-sm border"
                style={{
                  backgroundColor: 'var(--accent-soft, #f1f5f9)',
                  borderColor: 'var(--accent)',
                  borderRadius: 'var(--radius, 1.25rem)',
                }}
              >
                <Megaphone size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line" style={{ color: 'var(--primary)' }}>
                  {restaurantConfig!.boardText}
                </p>
              </div>
            </div>
          )}
          {/* Sticky nav bar with search */}
          <div
            className={`${restaurantConfig!.stickyNav ? 'sticky top-0 z-20' : ''} shadow-md`}
            style={{ backgroundColor: 'var(--surface, #fff)' }}
          >
            <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
              {/* Show category nav ONLY when NOT searching */}

              {restaurantConfig!.showSearch && (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={"Search Across All Categories "}
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

              {!isSearching && (
                navStyle === 'tabs' ? (
                  <CategoryTabs
                    categories={categoriesAndItems}
                    showItemCount={restaurantConfig!.showItemCount}
                    activeIndex={activeCategory ?? 0}
                    size={restaurantConfig!.categorySize || "md"}
                    variant={restaurantConfig!.categoryVariant || "pill"}
                    onSelect={(idx: number) => {
                      setActiveCategory(idx);
                      setSearchQuery('');
                    }}
                    itemCounts={itemCounts}
                  />
                ) : (
                  <CategoryDropdown
                    categories={categoriesAndItems}
                    activeIndex={activeCategory ?? 0}
                    itemCounts={itemCounts}
                    size={restaurantConfig!.categorySize || "md"}
                    showItemCount={restaurantConfig!.showItemCount}
                    onSelect={(idx: number) => {
                      setActiveCategory(idx);
                      setSearchQuery('');
                    }}
                  />
                )
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            {isSearching ? (
              // SEARCH RESULTS VIEW
              <>
                <h2
                  className="font-serif text-3xl font-semibold mb-6"
                  style={{ color: 'var(--primary)' }}
                >
                  Search results for "{searchQuery}"
                </h2>
                {globalSearchResults.length === 0 ? (
                  <p className="text-slate-500 text-center py-20">
                    No items match "{searchQuery}".
                  </p>
                ) : (
                  <div
                    key="search-results" // remount on each search to trigger fade-in
                    className="space-y-6 animate-[fadein_0.25s_ease]"
                  >
                    <style>{`@keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                    {globalSearchResults.map((result, idx, arr) => {
                      const prevCategory = idx > 0 ? arr[idx - 1].categoryName : null;
                      return (
                        <React.Fragment key={result.publicId}>
                          {result.categoryName !== prevCategory && (
                            <h3
                              className="text-xl font-semibold text-slate-600 mt-8 mb-4 first:mt-0"
                              style={{ color: 'var(--primary)' }}
                            >
                              {result.categoryName}
                            </h3>
                          )}
                          <ItemCard
                            itemStructure={result}
                            index={idx}
                            primaryColor={restaurantConfig!.primaryColor}
                            accentColor={restaurantConfig!.accentColor}
                            showImage={restaurantConfig!.showItemImage}
                            defaultImage={restaurantConfig!.defaultImageUrl}
                            size={restaurantConfig!.itemSize || "sm"}
                            imagePosition={restaurantConfig!.itemImagePosition || "left"}
                            imageShape={restaurantConfig!.itemImageShape || "square"}
                            currencySymbol={restaurantConfig!.currencySymbol || "₹"}
                          />
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // NORMAL CATEGORY VIEW
              <>
                <h2
                  className="font-serif text-3xl font-semibold mb-6"
                  style={{ color: 'var(--primary)' }}
                >
                  {activeCategoryData?.name}
                </h2>
                <div
                  key={activeCategory}
                  className="space-y-6 animate-[fadein_0.25s_ease]"
                >
                  <style>{`@keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                  {(activeCategoryData?.items ?? []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                      <p className="text-slate-500">
                        {searchQuery
                          ? `No items match "${searchQuery}".`
                          : 'No items in this category yet.'}
                      </p>
                    </div>
                  ) : (
                    (activeCategoryData?.items ?? []).map((item, idx) => (
                      <ItemCard
                        key={item.publicId}
                        itemStructure={item}
                        showImage={restaurantConfig!.showItemImage}
                        index={idx}
                        primaryColor={restaurantConfig!.primaryColor}
                        accentColor={restaurantConfig!.accentColor}
                        defaultImage={restaurantConfig!.defaultImageUrl}
                        size={restaurantConfig!.itemSize || "sm"}
                        imagePosition={restaurantConfig!.itemImagePosition || "left"}
                        imageShape={restaurantConfig!.itemImageShape || "square"}
                        currencySymbol={restaurantConfig!.currencySymbol || "₹"}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <Footer />
        </>
      )}
    </div>
  );
}