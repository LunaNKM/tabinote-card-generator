import type { Slide } from "@/types/slide";
import { getMergedPreset } from "@/lib/layout/cardPresets";
import { autoFitText } from "@/lib/layout/autoFitText";

function renderLines(text?: string | null) {
  if (!text) return null;
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split("\n").length - 1 && <br />}
    </span>
  ));
}

export function CardTextBlock({ slide, exportMode = false }: { slide: Slide; exportMode?: boolean }) {
  const base = getMergedPreset(slide.type, slide.layoutSettings);
  const fit = autoFitText(slide);
  const settings = { ...base, ...fit, ...slide.layoutSettings };
  const scale = exportMode ? 1 : 0.25;

  return (
    <div
      className="absolute z-20 text-white"
      style={{
        left: settings.textLeft * scale,
        bottom: settings.textBottom * scale,
        width: settings.textMaxWidth * scale
      }}
    >
      {slide.hook && (
        <div style={{ fontSize: 30 * scale, lineHeight: 1.4, fontWeight: 700, marginBottom: 18 * scale }}>
          {renderLines(slide.hook)}
        </div>
      )}
      <div
        style={{
          fontSize: settings.titleSize * scale,
          lineHeight: settings.lineHeightTitle,
          fontWeight: settings.titleWeight,
          letterSpacing: "-0.035em",
          marginBottom: 26 * scale,
          whiteSpace: "pre-wrap"
        }}
      >
        {renderLines(slide.title)}
      </div>
      {slide.type !== "cover" && slide.body && (
        <div
          style={{
            fontSize: settings.bodySize * scale,
            lineHeight: settings.lineHeightBody,
            fontWeight: settings.bodyWeight,
            letterSpacing: "-0.025em",
            whiteSpace: "pre-wrap"
          }}
        >
          {renderLines(slide.body)}
        </div>
      )}
    </div>
  );
}
