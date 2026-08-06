interface HeaderProps {
  name: string;
  tagline?: string;
  logoUrl?: string;
  backgroundImage?: string;
  color: string;
  accent: string;
  textColor: string;

  align: "center" | "left";
  size: "compact" | "default" | "large";
  layout: "banner" | "minimal" | "split"; // minimal: no bg image even if provided; split: logo beside text on desktop
  showDivider: boolean;

  logoShape: "circle" | "rounded" | "square";
  overlayStyle: "gradient" | "solid" | "none";
  overlayIntensity: number; // 0–1, default 1 — lets a restaurant dial down a busy photo

  headingFont: "serif" | "sans" | "display"; // maps to font-serif / font-sans / a custom display stack
  radius: string; // px/rem value for logo + badge corners, falls back to accent-derived default

  statusBadge?: { label: string; tone: "open" | "closed" | "busy" }; // e.g. "Open now"
  cta?: { label: string; onClick: () => void };
}

const sizeStyles = {
  compact: { padding: "py-8 px-6", title: "text-2xl md:text-3xl", tagline: "text-sm md:text-base" },
  default: { padding: "py-16 px-6", title: "text-4xl md:text-5xl", tagline: "text-base md:text-lg" },
  large: { padding: "py-24 px-6", title: "text-5xl md:text-6xl", tagline: "text-lg md:text-xl" },
} as const;

const fontStyles = {
  serif: "font-serif",
  sans: "font-sans",
  display: "font-display", // add a `font-display` utility in tailwind.config for restaurants that supply a custom webfont
} as const;

const logoShapeStyles = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-none",
} as const;

const statusToneStyles = {
  open: "bg-emerald-500/15 text-emerald-50 ring-emerald-300/40",
  closed: "bg-red-500/15 text-red-50 ring-red-300/40",
  busy: "bg-amber-500/15 text-amber-50 ring-amber-300/40",
} as const;

export function Header({
  name,
  tagline,
  logoUrl,
  backgroundImage,
  color,
  accent,
  textColor,
  align,
  size,
  layout,
  showDivider,
  logoShape,
  overlayStyle,
  overlayIntensity,
  headingFont,
  radius,
  statusBadge,
  cta,
}: HeaderProps) {
  const isLeft = align === "left";
  const isSplit = layout === "split";
  const showImage = layout !== "minimal" && !!backgroundImage;
  const { padding, title, tagline: taglineSize } = sizeStyles[size];

  return (
    <header
      className={`relative overflow-hidden ${padding} ${isLeft ? "text-left" : "text-center"}`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {/* cover photo, tinted with the restaurant's own color so it never feels bolted-on */}
      {showImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          {overlayStyle !== "none" && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  overlayStyle === "solid"
                    ? color
                    : `linear-gradient(180deg, ${color}cc 0%, ${color}f2 100%)`,
                opacity: overlayIntensity,
              }}
            />
          )}
        </>
      )}

      {/* ambient glow — quieter when a photo is already carrying the visual weight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: (showImage ? 0.15 : 0.3) * overlayIntensity,
          background: `radial-gradient(circle at 50% -20%, ${accent}, transparent 60%)`,
        }}
      />

      {statusBadge && (
        <span
          className={`absolute top-4 ${isLeft ? "left-6" : "right-6"} inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 backdrop-blur-sm ${statusToneStyles[statusBadge.tone]}`}
        >
          {statusBadge.label}
        </span>
      )}

      <div
        className={`relative flex ${isSplit ? "flex-row items-center gap-6" : "flex-col"
          } ${isLeft ? "items-start" : "items-center"} ${isSplit && !isLeft ? "md:justify-center" : ""
          }`}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className={`h-14 w-14 object-cover mb-4 md:mb-0 ring-2 shrink-0 ${logoShapeStyles[logoShape]}`}
            style={{ "--tw-ring-color": accent, ...(radius && { borderRadius: radius }) } as React.CSSProperties}
          />
        )}

        <div
          className={`flex flex-col ${isLeft ? "items-start" : "items-center"} ${isSplit ? "md:items-start" : ""
            }`}
        >
          <h1 className={`${fontStyles[headingFont]} font-semibold tracking-tight leading-tight ${title}`}>
            {name}
          </h1>

          {showDivider && (
            <div
              className={`flex items-center gap-2 mt-4 mb-4 ${isLeft ? "justify-start" : "justify-center"}`}
              aria-hidden="true"
            >
              <span className="h-px w-10" style={{ backgroundColor: accent, opacity: 0.7 }} />
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <span className="h-px w-10" style={{ backgroundColor: accent, opacity: 0.7 }} />
            </div>
          )}

          {tagline && (
            <p className={`max-w-md ${taglineSize} ${isLeft ? "px-auto" : "mx-auto"}`} style={{ opacity: 0.8 }}>
              {tagline}
            </p>
          )}

          {cta && (
            <button
              onClick={cta.onClick}
              className="mt-5 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-[0.98]"
              style={{ backgroundColor: accent, color: color }}
            >
              {cta.label}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}