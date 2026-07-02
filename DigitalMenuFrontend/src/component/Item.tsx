import type { Item } from "../types";
import { Flame, ChefHat, TrendingUp } from "lucide-react";
import type { TagBadge, DietBadge } from "../types";

const tagBadgeConfig: Record<TagBadge, { label: string; icon: typeof Flame; color: string }> = {
  "chef-special": { label: "Chef's Special", icon: ChefHat, color: "#b45309" },
  spicy: { label: "Spicy", icon: Flame, color: "#dc2626" },
  bestseller: { label: "Bestseller", icon: TrendingUp, color: "#0f766e" },
};

const dietColors: Record<DietBadge, string> = {
  veg: "#0f8a3c",
  "non-veg": "#8b1d1d",
};

// Type guards to safely narrow raw strings coming from the backend.
// Anything that doesn't match a known key is silently dropped —
// this keeps the UI resilient to typos or future badge values
// the frontend doesn't know how to render yet.
function isDietBadge(value: string): value is DietBadge {
  return value === "veg" || value === "non-veg";
}

function isTagBadge(value: string): value is TagBadge {
  return value in tagBadgeConfig;
}

// the familiar FSSAI-style mark — a green dot for veg, a brown triangle for
// non-veg — carries real dietary meaning, so it keeps its own fixed colors
// regardless of the restaurant's theme, the same way a stop sign stays red.
function DietMark({ type }: { type: DietBadge }) {
  const color = dietColors[type];
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 border-2 shrink-0"
      style={{ borderColor: color, borderRadius: 2 }}
      role="img"
      aria-label={type === "veg" ? "Vegetarian" : "Non-vegetarian"}
    >
      {type === "veg" ? (
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      ) : (
        <span
          style={{
            width: 0,
            height: 0,
            borderLeft: "3px solid transparent",
            borderRight: "3px solid transparent",
            borderBottom: `5px solid ${color}`,
          }}
        />
      )}
    </span>
  );
}

function TagMark({ type }: { type: TagBadge }) {
  const { label, icon: Icon, color } = tagBadgeConfig[type];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color, backgroundColor: `${color}14` }}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function BadgeRow({ badges }: { badges: string[] }) {
  if (!badges.length) return null;

  const diet = badges.filter(isDietBadge);
  const tags = badges.filter(isTagBadge);

  if (!diet.length && !tags.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-2">
      {diet.map((d) => (
        <DietMark key={d} type={d} />
      ))}
      {tags.map((t) => (
        <TagMark key={t} type={t} />
      ))}
    </div>
  );
}

type ItemProps = {
  itemStructure: Item;
  index: number;
  primaryColor: string;
  accentColor: string;
};

const ItemCard = ({ itemStructure, primaryColor, accentColor }: ItemProps) => {
  return (
    <div
      className="rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
      style={{ backgroundColor: "var(--surface, #fff)" }}
    >
      {itemStructure.badges && itemStructure.badges.length > 0 && (
        <BadgeRow badges={itemStructure.badges} />
      )}

      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>
          {itemStructure.name}
        </h3>

        {itemStructure.price && itemStructure.variants.length === 0 && (
          <span
            className="text-xl font-bold ml-4 whitespace-nowrap"
            style={{ color: accentColor }}
          >
            ₹{itemStructure.price}
          </span>
        )}
      </div>

      <p className="text-slate-600 mb-3">{itemStructure.description}</p>

      {/* VARIANTS */}
      {itemStructure.variants.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {itemStructure.variants.map((variant, vIndex) => (
            <div
              key={vIndex}
              className="flex items-center gap-2 px-4 py-2 rounded-full border-2"
              style={{
                borderColor: accentColor,
                backgroundColor: `${accentColor}10`,
              }}
            >
              <span className="text-sm font-medium" style={{ color: primaryColor }}>
                {variant.name}
              </span>
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                ₹{variant.price}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemCard;