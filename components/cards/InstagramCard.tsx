import type { Slide } from "@/types/slide";
import { CardBackground } from "./CardBackground";
import { CardGradient } from "./CardGradient";
import { CardLogo } from "./CardLogo";
import { CardTextBlock } from "./CardTextBlock";
import { CardSource } from "./CardSource";
import { getMergedPreset } from "@/lib/layout/cardPresets";
import { cn } from "@/lib/utils/cn";

function CardFrame({ slide }: { slide: Slide }) {
  const settings = getMergedPreset(slide.type, slide.layoutSettings);

  return (
    <div
      id={`card-${slide.id}`}
      className="relative overflow-hidden bg-black font-pretendard"
      style={{ width: 1080, height: 1440 }}
    >
      <CardBackground slide={slide} />
      <CardGradient strength={settings.gradientStrength} />
      <CardLogo opacity={settings.logoOpacity} />
      <CardTextBlock slide={slide} />
      <CardSource source={slide.sourceLabel} opacity={settings.sourceOpacity} />
    </div>
  );
}

export function InstagramCard({
  slide,
  renderMode = "preview",
  isActive,
  onClick
}: {
  slide: Slide;
  renderMode?: "preview" | "export";
  isActive?: boolean;
  onClick?: () => void;
}) {
  if (renderMode === "export") {
    return <CardFrame slide={slide} />;
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[10px] bg-black cursor-pointer",
        isActive ? "outline outline-2 outline-[#6b5340] shadow-xl" : ""
      )}
      style={{ width: 270, height: 360 }}
    >
      <div style={{ width: 1080, height: 1440, transform: "scale(0.25)", transformOrigin: "top left" }}>
        <CardFrame slide={slide} />
      </div>
    </div>
  );
}
