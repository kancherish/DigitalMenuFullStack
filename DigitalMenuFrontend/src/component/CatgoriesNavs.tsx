import type { Category } from "../types";
import { getCategoryIcon } from "../util/util";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const tabSizeStyles = {
  sm: { padding: "px-3 py-2", text: "text-xs", icon: 14 },
  md: { padding: "px-4 py-2.5", text: "text-sm", icon: 16 },
  lg: { padding: "px-5 py-3", text: "text-base", icon: 18 },
} as const;

interface CategoryTabsProps {
  categories: Category[];
  activeIndex: number;
  onSelect: (i: number) => void;
  itemCounts: number[];
  size?: keyof typeof tabSizeStyles;
  showItemCount?: boolean;
}

export function CategoryTabs({
  categories,
  activeIndex,
  onSelect,
  itemCounts,
  size = "md",
  showItemCount ,
}: CategoryTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const { padding, text, icon } = tabSizeStyles[size];

  // keep the active pill in view when selection changes programmatically
  // (e.g. tapping a category from a search result, not just clicking the tab itself)
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide snap-x"
    >
      {categories.map((category, idx) => {
        const Icon = getCategoryIcon(category.icon);
        const active = activeIndex === idx;
        return (
          <button
            key={category.publicId}
            ref={active ? activeRef : undefined}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(idx)}
            className={`shrink-0 snap-start flex items-center gap-2 font-medium transition-all duration-200 ${padding} ${text}`}
            style={{
              borderRadius: "var(--radius)",
              backgroundColor: active ? "var(--accent)" : "var(--accent-soft)",
              color: active ? "#fff" : "var(--primary)",
            }}
          >
            <Icon size={icon} />
            <span>{category.name}</span>
            {showItemCount && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: active
                    ? "rgba(255,255,255,0.25)"
                    : "var(--accent-soft-strong)",
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

interface CategoryDropdownProps {
  categories: Category[];
  activeIndex: number;
  onSelect: (i: number) => void;
}

export function CategoryDropdown({
  categories,
  activeIndex,
  onSelect,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = categories[activeIndex];

  // close on outside click, and on Escape — a dropdown that only closes
  // via its own button feels stuck to anyone used to native selects
  useEffect(() => {
    if (!open) return;

    function handlePointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 py-4 border-2 transition-all"
        style={{
          backgroundColor: "var(--surface, #fff)",
          borderColor: "var(--accent)",
          color: "var(--primary)",
          borderRadius: "var(--radius)",
        }}
      >
        <span className="flex items-center gap-3 font-semibold">
          {active &&
            (() => {
              const Icon = getCategoryIcon(active.icon);
              return <Icon size={20} />;
            })()}
          {active?.name ?? "Select a category"}
        </span>
        <ChevronDown
          size={24}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 border-2 shadow-lg overflow-hidden z-30"
          style={{
            backgroundColor: "var(--surface, #fff)",
            borderColor: "var(--accent)",
            borderRadius: "var(--radius)",
          }}
        >
          {categories.map((category, idx) => {
            const Icon = getCategoryIcon(category.icon);
            const isActive = activeIndex === idx;
            return (
              <button
                key={category.publicId}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(idx);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-all hover:brightness-95 ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                  color: "var(--primary)",
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