export function CardLogo({ exportMode = false, opacity = 1 }: { exportMode?: boolean; opacity?: number }) {
  return (
    <img
      src="/assets/tabinote-logo.png"
      alt="tabinote"
      className="absolute left-1/2 z-20 -translate-x-1/2 object-contain"
      style={{
        top: exportMode ? 86 : 21.5,
        width: exportMode ? 170 : 42.5,
        opacity,
        filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.22))"
      }}
    />
  );
}
