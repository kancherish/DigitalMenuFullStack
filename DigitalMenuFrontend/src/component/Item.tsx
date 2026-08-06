import type { Item } from "../types";
import type { TagBadge, DietBadge } from "../types";
import { TAG_BADGE_CONFIG, isDietBadge, isTagBadge } from "../util/util";
import { useState } from "react";

const dietColors: Record<DietBadge, string> = {
  veg: "#0f8a3c",
  "non-veg": "#8b1d1d",
};

const sizeStyles = {
  sm: { card: "p-2.5 sm:p-3.5 gap-2.5 sm:gap-3", image: "w-14 h-14 sm:w-16 sm:h-16", title: "text-sm sm:text-base", price: "text-sm sm:text-base" },
  md: { card: "p-3.5 sm:p-5 gap-3 sm:gap-5", image: "w-20 h-20 sm:w-24 sm:h-24", title: "text-base sm:text-lg", price: "text-base sm:text-lg" },
  lg: { card: "p-4 sm:p-6 gap-4 sm:gap-6", image: "w-24 h-24 sm:w-28 sm:h-28", title: "text-lg sm:text-xl", price: "text-lg sm:text-xl" },
} as const;

const imageShapeStyles = {
  rounded: "",       // uses card's --radius derived value, set inline
  square: "rounded-none",
  circle: "rounded-full",
} as const;

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
  const { label, icon: Icon, color } = TAG_BADGE_CONFIG[type];
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
  defaultImage?: string;
  showImage: boolean;
  size: keyof typeof sizeStyles;
  imagePosition: "left" | "right";
  imageShape: "rounded" | "square" | "circle";
  currencySymbol: string;
};

const ItemCard = ({
  itemStructure,
  primaryColor,
  accentColor,
  defaultImage,
  showImage,
  size,
  imagePosition,
  imageShape,
  currencySymbol,
}: ItemProps) => {
  const initialSrc = itemStructure.imageURL || defaultImage;
  const [imgError, setImgError] = useState(false);
  const finalSrc = imgError && defaultImage ? defaultImage : initialSrc;

  const hasVariants = itemStructure.variants.length > 0;
  const { card, image, title, price } = sizeStyles[size];

  const thumbnail = (showImage && (initialSrc || defaultImage)) && (
    <div
      className={`relative shrink-0 overflow-hidden bg-slate-100 ring-1 ring-black/5 ${image} ${imageShapeStyles[imageShape]}`}
      style={{
        borderRadius:
          imageShape === "rounded" ? "calc(var(--radius, 1rem) - 0.375rem)" : undefined,
      }}
    >
      <img
        src={finalSrc}
        alt={itemStructure.name}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          itemStructure.available ? "group-hover:scale-110" : "grayscale"
        }`}
        onError={() => {
          if (!imgError && defaultImage) setImgError(true);
        }}
      />
      {!itemStructure.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-white">
            Sold out
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`group flex items-start rounded-2xl border shadow-sm transition-all duration-200 ${card} ${
        itemStructure.available ? "hover:shadow-md hover:-translate-y-0.5" : "opacity-60"
      } ${imagePosition === "right" ? "flex-row-reverse" : "flex-row"}`}
      style={{
        backgroundColor: "var(--surface, #fff)",
        borderRadius: "var(--radius, 1rem)",
        borderColor: `${accentColor}26`, // ~15% opacity — visible enough to separate card from page, subtle enough not to compete with badges/price
      }}
    >
      {thumbnail}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {itemStructure.badges?.length > 0 && (
          <div className="mb-1.5">
            <BadgeRow badges={itemStructure.badges} />
          </div>
        )}

        <div className="flex justify-between items-start gap-2 sm:gap-3">
          <h3 className={`font-semibold leading-snug tracking-tight ${title}`} style={{ color: primaryColor }}>
            {itemStructure.name}
          </h3>

          {itemStructure.price && !hasVariants && (
            <span className={`font-bold whitespace-nowrap tabular-nums ${price}`} style={{ color: accentColor }}>
              {currencySymbol}
              {itemStructure.price}
            </span>
          )}
        </div>

        {itemStructure.description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
            {itemStructure.description}
          </p>
        )}

        {hasVariants && (
          <div className="flex flex-wrap gap-2 mt-3">
            {itemStructure.variants.map((variant, vIndex) => (
              <div
                key={vIndex}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm leading-none transition-colors"
                style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}0d` }}
              >
                <span className="font-medium" style={{ color: primaryColor }}>
                  {variant.name}
                </span>
                <span className="font-bold tabular-nums" style={{ color: accentColor }}>
                  {currencySymbol}
                  {variant.price}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;