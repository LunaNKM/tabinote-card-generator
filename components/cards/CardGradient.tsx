export function CardGradient({ strength = 0.95 }: { strength?: number }) {
  return (
    <div
      className="absolute inset-0 z-10"
      style={{
        background: `linear-gradient(to bottom,
          rgba(0,0,0,0) 28%,
          rgba(0,0,0,0.18) 48%,
          rgba(0,0,0,${0.72 * strength}) 72%,
          rgba(0,0,0,${0.98 * strength}) 100%)`
      }}
    />
  );
}
