import { useEffect, useMemo, useState } from 'react';
import { Coffee, Utensils, IceCream, Search, X,ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import LoadingScreen from './component/Loader';
import Footer from './component/Footer';
import type { Category, Item, RestaurantConfig } from './types';
import { getCategoriesAndItems, getRestaurantInfo } from './db/db';
import ItemCard from './component/Item';

// ============================================================
// CUSTOMIZATION — tweak these without touching the JSX below
// ============================================================
const LAYOUT = {
  showSearch: true,                         // search box for filtering items within a category
  showItemCount: true,                      // small count badge on each tab
  stickyNav: true,                          // keep category nav pinned while scrolling
};

const ICONS: Record<string, LucideIcon> = {
  starters: Utensils,
  mains: Utensils,
  drinks: Coffee,
  desserts: IceCream,
};

const DEFAULT_ICON = Utensils;

function getCategoryIcon(name: string): LucideIcon {
  return ICONS[name.toLowerCase()] || DEFAULT_ICON;
}

// Builds a few derived shades from a single brand color so you only
// ever have to set primaryColor/accentColor in RestaurantConfig.
function useThemeVars(primary: string, accent: string, radius: string) {
  return {
    '--primary': primary,
    '--accent': accent,
    '--accent-soft': `${accent}1A`, // ~10% opacity wash, used for active states
    '--accent-soft-strong': `${accent}33`,
    '--radius': radius,
  } as React.CSSProperties;
}

function Header({
  color,
  accent,
  name,
  tagline,
}: {
  color: string;
  accent: string;
  name: string;
  tagline: string;
}) {
  return (
    <div
      className="relative text-center py-14 px-6 overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {/* subtle accent glow, purely decorative — keeps the header from being a flat block of color */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% -20%, ${accent}, transparent 60%)`,
        }}
      />
      <h1 className="relative font-serif text-4xl md:text-5xl font-semibold text-white mb-2 tracking-tight">
        {name}
      </h1>
      {tagline && (
        <p className="relative text-base md:text-lg text-white/80 max-w-md mx-auto">
          {tagline}
        </p>
      )}
    </div>
  );
}

function CategoryTabs({
  categories,
  activeIndex,
  onSelect,
  itemCounts,
}: {
  categories: Category[];
  activeIndex: number;
  onSelect: (i: number) => void;
  itemCounts: number[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide snap-x">
      {categories.map((category, idx) => {
        const Icon = getCategoryIcon(category.name);
        const active = activeIndex === idx;
        return (
          <button
            key={category.publicId}
            onClick={() => onSelect(idx)}
            className="shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 font-medium text-sm transition-all duration-200"
            style={{
              borderRadius: 'var(--radius)',
              backgroundColor: active ? 'var(--accent)' : 'var(--accent-soft)',
              color: active ? '#fff' : 'var(--primary)',
            }}
          >
            <Icon size={16} />
            <span>{category.name}</span>
            {LAYOUT.showItemCount && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.25)' : 'var(--accent-soft-strong)',
                }}
              >
                {itemCounts[idx] ?? 0}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CategoryDropdown({
  categories,
  activeIndex,
  onSelect,
}: {
  categories: Category[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = categories[activeIndex];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white border-2 transition-all"
        style={{ borderColor: 'var(--accent)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}
      >
        <span className="flex items-center gap-3 font-semibold">
          {active && (() => {
            const Icon = getCategoryIcon(active.name);
            return <Icon size={20} />;
          })()}
          {active?.name ?? 'Select a category'}
        </span>
          <ChevronDown
          size={24}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        /> 
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white border-2 shadow-lg overflow-hidden z-30"
          style={{ borderColor: 'var(--accent)', borderRadius: 'var(--radius)' }}
        >
          {categories.map((category, idx) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <button
                key={category.publicId}
                onClick={() => {
                  onSelect(idx);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-all ${activeIndex === idx ? 'font-semibold' : ''
                  }`}
                style={{
                  backgroundColor: activeIndex === idx ? 'var(--accent-soft)' : 'transparent',
                  color: 'var(--primary)',
                }}
              >
                <Icon size={20} />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DigitalMenu() {
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [categoriesAndItems, setCategoriesAndItems] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [categoryConfigRetryCount, setCategoryConfigRetryCount] = useState(0);
  const [configError, setConfigError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategoryData = activeCategory !== null ? categoriesAndItems[activeCategory] : null;

  // LOAD RESTAURANT CONFIG
  useEffect(() => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
    Promise.race([getRestaurantInfo(), timeout])
      .then((res) => setRestaurantConfig(res as unknown as RestaurantConfig))
      .catch((error) => {
        console.log(error);
        setConfigError(true);
      });
  }, [categoryConfigRetryCount]);

  // LOAD CATEGORIES
  useEffect(() => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000));
    Promise.race([getCategoriesAndItems(), timeout])
      .then((res) => {
        const categories = res as unknown as Category[];
        setCategoriesAndItems(categories);
        if (categories.length > 0) setActiveCategory(0);
      })
      .catch((error) => {
        console.log(error);
        setConfigError(true);
      });
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
  if (!configError && (!restaurantConfig || categoriesAndItems.length === 0)) {
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Header
        color={restaurantConfig!.primaryColor}
        accent={restaurantConfig!.accentColor}
        name={restaurantConfig!.name}
        tagline={restaurantConfig!.tagline || ''}
      />

      <div className={`${LAYOUT.stickyNav ? 'sticky top-0 z-20' : ''} bg-white shadow-md`}>
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          {navStyle === 'tabs' ? (
            <CategoryTabs
              categories={categoriesAndItems}
              activeIndex={activeCategory ?? 0}
              onSelect={setActiveCategory}
              itemCounts={itemCounts}
            />
          ) : (
            <CategoryDropdown
              categories={categoriesAndItems}
              activeIndex={activeCategory ?? 0}
              onSelect={setActiveCategory}
            />
          )}

          {LAYOUT.showSearch && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${activeCategoryData?.name ?? 'menu'}...`}
                className="w-full pl-9 pr-9 py-2 text-sm border border-slate-200 focus:outline-none focus:ring-2 transition-shadow"
                style={{ borderRadius: 'var(--radius)' }}
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
    </div>
  );
}