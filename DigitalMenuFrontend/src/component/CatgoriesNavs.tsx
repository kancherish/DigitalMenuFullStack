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
  size: keyof typeof tabSizeStyles;
  showItemCount: boolean;
  variant: "pill" | "underline"; // pill: filled background per tab (current look). underline: minimal, indicator bar under active tab
}

export function CategoryTabs({
  categories,
  activeIndex,
  onSelect,
  itemCounts,
  size,
  showItemCount,
  variant,
}: CategoryTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const { padding, text, icon } = tabSizeStyles[size];
  
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
      className={"flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide snap-x justify-left"}
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
            className={`shrink-0 snap-start flex items-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${padding} ${text} ${
              variant === "underline" ? "border-b-2" : ""
            }`}
            style={{
              borderRadius: variant === "pill" ? "var(--radius)" : "0",
              backgroundColor:
                variant === "pill" ? (active ? "var(--accent)" : "var(--accent-soft)") : "transparent",
              borderColor: variant === "underline" ? (active ? "var(--accent)" : "transparent") : undefined,
              color: variant === "pill" ? (active ? "#fff" : "var(--primary)") : "var(--primary)",
              opacity: variant === "underline" && !active ? 0.6 : 1,
              "--tw-ring-color": "var(--accent)",
            } as React.CSSProperties}
          >
            <Icon size={icon} />
            <span>{category.name}</span>
            {showItemCount && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor:
                    variant === "pill" && active
                      ? "rgba(255,255,255,0.25)"
                      : "var(--accent-soft-strong)",
                  color: variant === "pill" && active ? "#fff" : "var(--primary)",
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
  showItemCount?: boolean;
  itemCounts: number[];
  size: keyof typeof tabSizeStyles; // reuse the same size scale as tabs, since restaurants pick one nav style not both
}

export function CategoryDropdown({
  categories,
  activeIndex,
  itemCounts,
  showItemCount,
  onSelect,
  size,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = categories[activeIndex];
  const { padding, text, icon } = tabSizeStyles[size];

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
        className={`w-full flex items-center justify-between border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${padding} ${text}`}
        style={{
          backgroundColor: "var(--surface, #fff)",
          borderColor: "var(--accent)",
          color: "var(--primary)",
          borderRadius: "var(--radius)",
          "--tw-ring-color": "var(--accent)",
        } as React.CSSProperties}
      >
        <span className="flex items-center gap-3 font-semibold">
          {active &&
            (() => {
              const Icon = getCategoryIcon(active.icon);
              return <Icon size={icon} />;
            })()}
          <span className="flex items-center gap-2">
            {active?.name ?? "Select a category"}
            {showItemCount && (
              <span
                className="text-xs rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: "var(--accent-soft-strong)" }}
              >
                {itemCounts[activeIndex] ?? 0}
              </span>
            )}
          </span>
        </span>
        <ChevronDown size={icon + 4} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 border-2 shadow-lg overflow-hidden z-30 max-h-72 overflow-y-auto"
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
                className={`w-full flex items-center justify-between gap-3 px-6 py-4 transition-all hover:brightness-95 focus-visible:outline-none focus-visible:bg-black/5 ${
                  isActive ? "font-semibold" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                  color: "var(--primary)",
                }}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{category.name}</span>
                </span>
                {showItemCount && (
                  <span
                    className="text-xs rounded-full px-1.5 py-0.5"
                    style={{ backgroundColor: "var(--accent-soft-strong)" }}
                  >
                    {itemCounts[idx] ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}