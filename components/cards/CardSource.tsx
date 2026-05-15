export function CardSource({ source, opacity = 0.68 }: { source?: string | null; opacity?: number }) {
  if (!source) return null;
  return (
    <div
      className="absolute z-20 font-bold text-white"
      style={{
        right: 92,
        bottom: 74,
        fontSize: 28,
        opacity
      }}
    >
      {source}
    </div>
  );
}
