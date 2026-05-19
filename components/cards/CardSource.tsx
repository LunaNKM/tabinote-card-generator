export function CardSource({ source, exportMode = false, opacity = 0.68 }: { source?: string | null; exportMode?: boolean; opacity?: number }) {
  if (!source) return null;
  const scale = exportMode ? 1 : 0.25;
  return (
    <div
      className="absolute z-20 font-bold text-white"
      style={{
        right: 92 * scale,
        bottom: 74 * scale,
        fontSize: 28 * scale,
        opacity
      }}
    >
      {source}
    </div>
  );
}
