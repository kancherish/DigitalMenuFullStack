import type { Category } from "../types";
import { getCategoryIcon } from "../util/util";
import { LAYOUT } from "../util/util";
import { useState } from "react";
import { ChevronDown } from "lucide-react";


export function CategoryTabs({
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
        const Icon = getCategoryIcon(category.icon);
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

export function CategoryDropdown({
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

