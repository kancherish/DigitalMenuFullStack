
export function Header({
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
