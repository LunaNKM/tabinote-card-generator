export function CardLogo({ opacity = 1 }: { opacity?: number }) {
  return (
    <img
      src="/assets/tabinote-logo.png"
      alt="tabinote"
      className="absolute left-1/2 z-20 -translate-x-1/2 object-contain"
      style={{
        top: 86,
        width: 170,
        opacity,
        filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.22))"
      }}
      draggable={false}
    />
  );
}
