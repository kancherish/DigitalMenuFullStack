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
  layout: "banner" | "minimal" | "split";
  showDivider: boolean;

  logoShape: "circle" | "rounded" | "square";
  overlayStyle: "gradient" | "solid" | "none";
  overlayIntensity: number; // 0–1

  headingFont: "serif" | "sans" | "display";
  radius: string;

  statusBadge?: {
    label: string;
    tone: "open" | "closed" | "busy";
  };

  cta?: {
    label: string;
    onClick: () => void;
  };

  accentPanel?: boolean;
  panelIntensity?: number; // 0–1
  nameGradient?: boolean;
  uppercaseTagline?: boolean;
  shimmer?: boolean;

  nameColor?: string;
  taglineColor?: string;
  showLogo?: boolean;
  logoSize?: "auto" | "sm" | "md" | "lg";
  backgroundPosition?: "top" | "center" | "bottom" | "left" | "right";
  backgroundZoom?: number; // 1–2
  dividerStyle?: "line" | "dots" | "diamond" | "none";
  spacing?: "tight" | "default" | "loose";
  maxWidth?: "sm" | "md" | "lg" | "full";
}

const sizeStyles = {
  compact: {
    padding: "py-8 px-6",

    title: "text-2xl md:text-3xl",
    tagline: "text-sm md:text-base",

    logo: "h-12 w-12",

    divider: "w-10 md:w-14",
    dividerGap: "gap-2",
    dividerMargin: "mt-3.5 mb-3",

    contentGap: "gap-3",
    splitColGap: "gap-x-3",
  },

  default: {
    padding: "py-16 px-6",

    title: "text-4xl md:text-5xl",
    tagline: "text-base md:text-lg",

    logo: "h-14 w-14",

    divider: "w-14 md:w-20",
    dividerGap: "gap-2.5",
    dividerMargin: "mt-4 mb-3.5",

    contentGap: "gap-4",
    splitColGap: "gap-x-4",
  },

  large: {
    padding: "py-24 px-6",

    title: "text-5xl md:text-6xl",
    tagline: "text-lg md:text-xl",

    logo: "h-16 w-16",

    divider: "w-16 md:w-24",
    dividerGap: "gap-3",
    dividerMargin: "mt-5 mb-4",

    contentGap: "gap-5",
    splitColGap: "gap-x-5",
  },
} as const;

const fontStyles = {
  serif: "font-serif",
  sans: "font-sans",
  display: "font-display",
} as const;

const logoShapeStyles = {
  circle: "rounded-full",
  rounded: "rounded-xl",
  square: "rounded-none",
} as const;

const logoSizeStyles = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
} as const;

const spacingStyles = {
  tight: "py-6 px-6",
  loose: "py-24 px-6",
} as const;

const maxWidthStyles = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  full: "max-w-none",
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
  accentPanel = true,
  panelIntensity = 1,
  nameGradient = true,
  uppercaseTagline = true,
  shimmer = true,
  nameColor,
  taglineColor,
  showLogo = true,
  logoSize = "auto",
  backgroundPosition = "center",
  backgroundZoom = 1,
  dividerStyle = "line",
  spacing = "default",
  maxWidth = "full",
}: HeaderProps) {
  const isLeft = align === "left";
  const isSplit = layout === "split";
  const showImage = layout !== "minimal" && !!backgroundImage;

  const {
    padding,
    title,
    tagline: taglineSize,
    logo: logoSizePreset,
    divider,
    dividerGap,
    dividerMargin,
    contentGap,
    splitColGap,
  } = sizeStyles[size];

  const paddingClass = spacing === "default" ? padding : spacingStyles[spacing];
  const resolvedLogoSize =
    logoSize === "auto" ? logoSizePreset : logoSizeStyles[logoSize];

  const logoClass = `
    ${resolvedLogoSize}
    shrink-0
    object-cover
    ring-2
    ${logoShapeStyles[logoShape]}
  `;

  const logoStyle = {
    "--tw-ring-color": accent,
    ...(radius ? { borderRadius: radius } : {}),
  } as React.CSSProperties;

  const nameStyle: React.CSSProperties = nameGradient
    ? {
        backgroundImage: `linear-gradient(
          120deg,
          ${nameColor || textColor} 0%,
          ${nameColor || textColor} 45%,
          ${accent} 100%
        )`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: showImage ? `drop-shadow(0 2px 14px ${color}99)` : undefined,
      }
    : {
        color: nameColor || undefined,
        textShadow: showImage ? `0 2px 18px ${color}99` : undefined,
      };

  const dividerLineStyle = (): React.CSSProperties => ({
    background: `linear-gradient(
      90deg,
      transparent,
      ${accent},
      transparent
    )`,
    backgroundSize: shimmer ? "200% 100%" : undefined,
    animation: shimmer ? "header-sheen 4s linear infinite" : undefined,
    opacity: 0.8,
  });

  const logoEl = logoUrl && showLogo ? (
    <div className="relative shrink-0">
      {accentPanel && (
        <div
          className="pointer-events-none absolute -inset-2 rotate-3 rounded-2xl blur-[2px]"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${color})`,
            opacity: 0.8 * panelIntensity,
            animation: shimmer
              ? "header-pulse 5s ease-in-out infinite"
              : undefined,
          }}
          data-header-shimmer="true"
          aria-hidden="true"
        />
      )}
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`relative ${logoClass} ${
          shimmer ? "transition-transform duration-300 hover:scale-105" : ""
        }`}
        style={logoStyle}
      />
    </div>
  ) : null;

  const titleEl = (
    <h1
      className={`
        ${fontStyles[headingFont]}
        ${title}
        font-semibold
        tracking-[-0.025em]
        leading-[0.95]
      `}
      style={nameStyle}
    >
      {name}
    </h1>
  );

  const dividerEl =
    showDivider && dividerStyle !== "none" ? (
      dividerStyle === "dots" ? (
        <div
          className={`flex items-center justify-center ${dividerGap} ${dividerMargin}`}
          aria-hidden="true"
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
          ))}
        </div>
      ) : dividerStyle === "diamond" ? (
        <div
          className={`flex items-center justify-center ${dividerMargin}`}
          aria-hidden="true"
        >
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span
              className="absolute h-3 w-3 rotate-45 rounded-[2px]"
              style={{
                backgroundColor: accent,
              }}
            />

            <span
              className="absolute h-1 w-1 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </span>
        </div>
      ) : (
        <div
          className={`
            flex
            items-center
            ${dividerGap}
            ${dividerMargin}
          `}
          aria-hidden="true"
        >
          <span
            className={`h-px ${divider}`}
            style={dividerLineStyle()}
            data-header-shimmer="true"
          />

          <span className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span
              className="absolute h-2 w-2 rotate-45 rounded-[2px]"
              style={{
                backgroundColor: accent,
              }}
            />

            <span
              className="absolute h-1 w-1 rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </span>

          <span
            className={`h-px ${divider}`}
            style={dividerLineStyle()}
            data-header-shimmer="true"
          />
        </div>
      )
    ) : null;

  const taglineEl = tagline ? (
    <p
      className={`
        max-w-md
        ${taglineSize}
        font-normal
        leading-relaxed
        ${
          uppercaseTagline
            ? "uppercase tracking-[0.18em]"
            : "tracking-[0.08em]"
        }
      `}
      style={{
        color: taglineColor || undefined,
        opacity: taglineColor ? 0.9 : 0.78,
        textShadow: showImage ? `0 1px 10px ${color}66` : undefined,
      }}
    >
      {tagline}
    </p>
  ) : null;

  const ctaEl = cta ? (
    <button
      onClick={cta.onClick}
      className="
        relative
        mt-5
        overflow-hidden
        rounded-full
        px-5
        py-2.5
        text-sm
        font-semibold
        transition-transform
        hover:scale-[1.03]
        active:scale-[0.98]
      "
      style={{
        backgroundColor: accent,
        color: color,
      }}
    >
      <span className="relative z-10">{cta.label}</span>
      {shimmer && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(
              120deg,
              transparent 30%,
              rgba(255, 255, 255, 0.45) 50%,
              transparent 70%
            )`,
            backgroundSize: "200% 100%",
            animation: "header-sheen 3.2s linear infinite",
          }}
          data-header-shimmer="true"
          aria-hidden="true"
        />
      )}
    </button>
  ) : null;

  return (
    <header
      className={`
        relative
        overflow-hidden
        ${paddingClass}
      `}
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {shimmer && (
        <style>{`
          @keyframes header-sheen {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @keyframes header-pulse {
            0%, 100% { transform: rotate(3deg) scale(1); }
            50% { transform: rotate(3deg) scale(1.06); }
          }

          @media (prefers-reduced-motion: reduce) {
            [data-header-shimmer] { animation: none !important; }
          }
        `}</style>
      )}

      {showImage && (
        <>
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundPosition,
              transform:
                backgroundZoom !== 1 ? `scale(${backgroundZoom})` : undefined,
            }}
          />

          {overlayStyle !== "none" && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  overlayStyle === "solid"
                    ? color
                    : `linear-gradient(
                        180deg,
                        ${color}cc 0%,
                        ${color}f2 100%
                      )`,
                opacity: overlayIntensity,
              }}
            />
          )}
        </>
      )}

      {isSplit && accentPanel && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -left-32 top-1/2 h-[150%] w-80 -translate-y-1/2 rotate-12 rounded-[4rem] blur-3xl"
            style={{
              background: `linear-gradient(
                135deg,
                ${accent},
                transparent 70%
              )`,
              opacity: 0.28 * panelIntensity,
            }}
          />
          <div
            className="absolute -right-32 top-1/2 h-[150%] w-80 -translate-y-1/2 -rotate-12 rounded-[4rem] blur-3xl"
            style={{
              background: `linear-gradient(
                225deg,
                ${accent},
                transparent 70%
              )`,
              opacity: 0.18 * panelIntensity,
            }}
          />
        </div>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: (showImage ? 0.15 : 0.3) * overlayIntensity,
          background: `
            radial-gradient(
              circle at 50% -20%,
              ${accent},
              transparent 60%
            )
          `,
        }}
      />

      {statusBadge && (
        <span
          className={`
            absolute
            top-4
            ${isLeft ? "left-6" : "right-6"}
            inline-flex
            items-center
            rounded-full
            px-3
            py-1
            text-xs
            font-medium
            ring-1
            backdrop-blur-sm
            ${statusToneStyles[statusBadge.tone]}
          `}
        >
          {statusBadge.label}
        </span>
      )}

      {isSplit ? (
        <div
          className={`
            relative
            z-10
            mx-auto
            ${maxWidthStyles[maxWidth]}
            flex
            flex-col
            items-center
          `}
        >
          <div className={`flex items-center ${splitColGap}`}>
            {logoEl}

            <div className="flex flex-col items-center text-center">
              {titleEl}
              {dividerEl}
              {taglineEl}
              {ctaEl}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`
            relative
            z-10
            mx-auto
            ${maxWidthStyles[maxWidth]}
            flex
            flex-col
            ${contentGap}
            ${
              isLeft
                ? "items-start text-left"
                : "items-center text-center"
            }
          `}
        >
          {logoEl}

          <div
            className={`
              flex
              flex-col
              ${
                isLeft
                  ? "items-start text-left"
                  : "items-center text-center"
              }
            `}
          >
            {titleEl}
            {dividerEl}
            {taglineEl}
            {ctaEl}
          </div>
        </div>
      )}
    </header>
  );
}
