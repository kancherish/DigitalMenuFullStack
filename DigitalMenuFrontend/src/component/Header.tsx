interface HeaderProps {
  name: string;
  tagline?: string;
  logoUrl?: string;
  backgroundImage?: string;
  color: string;
  accent: string;
  textColor: string;
  align?: "center" | "left";
  size?: "compact" | "default" | "large";
  showDivider: boolean;
}

const sizeStyles = {
  compact: { padding: "py-8 px-6", title: "text-2xl md:text-3xl", tagline: "text-sm md:text-base" },
  default: { padding: "py-16 px-6", title: "text-4xl md:text-5xl", tagline: "text-base md:text-lg" },
  large: { padding: "py-24 px-6", title: "text-5xl md:text-6xl", tagline: "text-lg md:text-xl" },
} as const;

export function Header({
  name,
  tagline,
  logoUrl,
  backgroundImage,
  color,
  accent,
  textColor,
  align = "center",
  size = "default",
  showDivider = true,
}: HeaderProps) {
  const isLeft = align === "left";
  const { padding, title, tagline: taglineSize } = sizeStyles[size];

  return (
    <header
      className={`relative overflow-hidden ${padding} ${isLeft ? "text-left" : "text-center"}`}
      style={{ backgroundColor: color, color: textColor }}
    >
      {/* cover photo, tinted with the restaurant's own color so it never feels bolted-on */}
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${color}cc 0%, ${color}f2 100%)`,
            }}
          />
        </>
      )}

      {/* ambient glow — quieter when a photo is already carrying the visual weight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: backgroundImage ? 0.15 : 0.3,
          background: `radial-gradient(circle at 50% -20%, ${accent}, transparent 60%)`,
        }}
      />

      <div className={`relative flex flex-col ${isLeft ? "items-start" : "items-center"}`}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-14 w-14 rounded-full object-cover mb-4 ring-2"
            style={{ "--tw-ring-color": accent } as React.CSSProperties}
          />
        )}

        <h1 className={`font-serif font-semibold tracking-tight leading-tight ${title}`}>
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
          <p className={`max-w-md ${taglineSize} ${isLeft ? "" : "mx-auto"}`} style={{ opacity: 0.8 }}>
            {tagline}
          </p>
        )}
      </div>
    </header>
  );
}