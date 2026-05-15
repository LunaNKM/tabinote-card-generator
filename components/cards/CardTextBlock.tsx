import type { Slide } from "@/types/slide";
import { getMergedPreset } from "@/lib/layout/cardPresets";
import { autoFitText } from "@/lib/layout/autoFitText";

function renderLines(text?: string | null) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={`${line}-${i}`}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

export function CardTextBlock({ slide }: { slide: Slide }) {
  const base = getMergedPreset(slide.type, slide.layoutSettings);
  const fit = autoFitText(slide);
  const settings = { ...base, ...fit, ...slide.layoutSettings };

  return (
    <div
      className="absolute z-20 text-white"
      style={{
        left: settings.textLeft,
        bottom: settings.textBottom,
        width: settings.textMaxWidth
      }}
    >
      {slide.hook && (
        <div style={{ fontSize: 30, lineHeight: 1.4, fontWeight: 700, marginBottom: 18 }}>
          {renderLines(slide.hook)}
        </div>
      )}
      <div
        style={{
          fontSize: settings.titleSize,
          lineHeight: settings.lineHeightTitle,
          fontWeight: settings.titleWeight,
          letterSpacing: "-0.035em",
          marginBottom: 26,
          whiteSpace: "pre-wrap"
        }}
      >
        {renderLines(slide.title)}
      </div>
      {slide.bullets?.length ? (
        <div
          style={{
            fontSize: settings.bodySize,
            lineHeight: settings.lineHeightBody,
            fontWeight: settings.bodyWeight,
            letterSpacing: "-0.025em",
            marginBottom: 26
          }}
        >
          {slide.bullets.map((b, i) => (
            <div key={`${b}-${i}`}>・{b}</div>
          ))}
        </div>
      ) : null}
      {slide.body && (
        <div
          style={{
            fontSize: settings.bodySize,
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
