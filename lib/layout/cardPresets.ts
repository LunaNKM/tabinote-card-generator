import type { SlideType, SlideLayoutSettings } from "@/types/slide";

export const CARD_PRESETS: Record<SlideType, Required<SlideLayoutSettings>> = {
  cover: {
    titleSize: 70,
    bodySize: 34,
    titleWeight: 800,
    bodyWeight: 500,
    textLeft: 112,
    textBottom: 250,
    textMaxWidth: 860,
    lineHeightTitle: 1.22,
    lineHeightBody: 1.55,
    gradientStrength: 0.96,
    gradientStart: 0.34,
    imagePositionX: 50,
    imagePositionY: 50,
    logoOpacity: 1,
    sourceOpacity: 0.68
  },
  item: {
    titleSize: 58,
    bodySize: 34,
    titleWeight: 800,
    bodyWeight: 400,
    textLeft: 112,
    textBottom: 215,
    textMaxWidth: 860,
    lineHeightTitle: 1.25,
    lineHeightBody: 1.55,
    gradientStrength: 0.95,
    gradientStart: 0.40,
    imagePositionX: 50,
    imagePositionY: 50,
    logoOpacity: 1,
    sourceOpacity: 0.68
  },
  place: {
    titleSize: 58,
    bodySize: 32,
    titleWeight: 800,
    bodyWeight: 400,
    textLeft: 112,
    textBottom: 205,
    textMaxWidth: 860,
    lineHeightTitle: 1.25,
    lineHeightBody: 1.50,
    gradientStrength: 0.96,
    gradientStart: 0.36,
    imagePositionX: 50,
    imagePositionY: 50,
    logoOpacity: 1,
    sourceOpacity: 0.68
  },
  trend: {
    titleSize: 66,
    bodySize: 34,
    titleWeight: 800,
    bodyWeight: 400,
    textLeft: 112,
    textBottom: 225,
    textMaxWidth: 860,
    lineHeightTitle: 1.25,
    lineHeightBody: 1.55,
    gradientStrength: 0.95,
    gradientStart: 0.37,
    imagePositionX: 50,
    imagePositionY: 50,
    logoOpacity: 1,
    sourceOpacity: 0.68
  },
  cta: {
    titleSize: 56,
    bodySize: 34,
    titleWeight: 800,
    bodyWeight: 500,
    textLeft: 112,
    textBottom: 290,
    textMaxWidth: 850,
    lineHeightTitle: 1.28,
    lineHeightBody: 1.55,
    gradientStrength: 0.97,
    gradientStart: 0.40,
    imagePositionX: 50,
    imagePositionY: 50,
    logoOpacity: 1,
    sourceOpacity: 0.68
  }
};

export function getMergedPreset(type: SlideType, custom?: SlideLayoutSettings) {
  return { ...CARD_PRESETS[type], ...(custom ?? {}) };
}
