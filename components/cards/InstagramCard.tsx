import type { Slide } from "@/types/slide";
import { CardBackground } from "./CardBackground";
import { CardGradient } from "./CardGradient";
import { CardLogo } from "./CardLogo";
import { CardTextBlock } from "./CardTextBlock";
import { CardSource } from "./CardSource";
import { getMergedPreset } from "@/lib/layout/cardPresets";
import { cn } from "@/lib/utils/cn";

export function InstagramCard({
  slide,
  renderMode = "preview",
  isActive,
  onClick,
  domId
}: {
  slide: Slide;
  renderMode?: "preview" | "export";
  isActive?: boolean;
  onClick?: () => void;
  domId?: string;
}) {
  const exportMode = renderMode === "export";
  const settings = getMergedPreset(slide.type, slide.layoutSettings);

  return (
    <div
      id={domId ?? `card-${slide.id}`}
      onClick={onClick}
      className={cn(
        "relative shrink-0 overflow-hidden bg-black font-pretendard",
        exportMode ? "ig-card-export" : "ig-card-preview rounded-[10px] cursor-pointer",
        isActive && !exportMode ? "outline outline-2 outline-[#6b5340] shadow-xl" : ""
      )}
    >
      <CardBackground slide={slide} />
      <CardGradient strength={settings.gradientStrength} />
      <CardLogo exportMode={exportMode} opacity={settings.logoOpacity} />
      <CardTextBlock slide={slide} exportMode={exportMode} />
      <CardSource source={slide.sourceLabel} exportMode={exportMode} opacity={settings.sourceOpacity} />
    </div>
  );
}
