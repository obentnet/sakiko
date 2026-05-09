export type ThemePair = {
  primary: string;
  background: string;
};

export const themePairs: ThemePair[] = [
  { primary: "#FF978A", background: "#F9F9F9" },
  { primary: "#0B3954", background: "#D4F1F4" },
  { primary: "#95C194", background: "#E8E3DF" },
  { primary: "#81D8CF", background: "#F8F5D6" },
  { primary: "#492D22", background: "#D8C7B5" },
  { primary: "#175E3D", background: "#ECD17A" },
  { primary: "#57687C", background: "#8ACAC0" },
  { primary: "#A4ABD6", background: "#EEEAD9" },
  { primary: "#F29A76", background: "#EDF1BB" },
  { primary: "#8BA3C7", background: "#EAECF1" },
  { primary: "#5AA4AE", background: "#F5F2E9" },
  { primary: "#F0C2A2", background: "#F5F3F2" },
];

const lightText = "#FBF6EC";
const darkText = "#1F1A16";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;

  const parsed = Number.parseInt(value, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function channelToHex(value: number) {
  return Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

export function mixHexColors(first: string, second: string, firstWeight = 0.5) {
  const start = hexToRgb(first);
  const end = hexToRgb(second);
  const clampedWeight = Math.max(0, Math.min(1, firstWeight));
  const secondWeight = 1 - clampedWeight;

  return rgbToHex(
    start.r * clampedWeight + end.r * secondWeight,
    start.g * clampedWeight + end.g * secondWeight,
    start.b * clampedWeight + end.b * secondWeight,
  );
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastText(hex: string) {
  return relativeLuminance(hex) > 0.45 ? darkText : lightText;
}

export function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

export function buildThemeVars(pair: ThemePair) {
  const pageBg = pair.background;
  const primary = pair.primary;
  const panelBg = mixHexColors(primary, pageBg, 0.76);
  const surfaceBg = mixHexColors(pageBg, primary, 0.9);
  const chipBg = mixHexColors(panelBg, pageBg, 0.62);
  const pageText = getContrastText(pageBg);
  const primaryText = getContrastText(primary);
  const panelText = getContrastText(panelBg);
  const surfaceText = getContrastText(surfaceBg);
  const panelIcon = mixHexColors(panelText, panelBg, 0.74);
  const surfaceMuted = mixHexColors(surfaceText, surfaceBg, 0.58);
  const chipText = getContrastText(chipBg);

  return {
    "--theme-primary": primary,
    "--theme-page-bg": pageBg,
    "--theme-page-text": pageText,
    "--theme-primary-text": primaryText,
    "--theme-panel-bg": panelBg,
    "--theme-panel-text": panelText,
    "--theme-panel-icon": panelIcon,
    "--theme-panel-shadow": withAlpha(panelBg, 0.28),
    "--theme-primary-shadow": withAlpha(primary, 0.34),
    "--theme-surface-bg": surfaceBg,
    "--theme-surface-text": surfaceText,
    "--theme-surface-muted": surfaceMuted,
    "--theme-chip-bg": chipBg,
    "--theme-chip-text": chipText,
    "--theme-ornament-1": mixHexColors(primary, pageBg, 0.18),
    "--theme-ornament-2": mixHexColors(primary, pageBg, 0.32),
    "--theme-ornament-3": mixHexColors(primary, pageBg, 0.46),
    "--theme-ornament-4": mixHexColors(primary, pageBg, 0.6),
    "--theme-ornament-5": mixHexColors(primary, pageBg, 0.74),
  } as const;
}

export function getThemeInitScript() {
  return `
    (() => {
      const themes = ${JSON.stringify(themePairs)};
      const lightText = "${lightText}";
      const darkText = "${darkText}";

      const hexToRgb = (hex) => {
        const normalized = hex.replace("#", "");
        const value = normalized.length === 3
          ? normalized.split("").map((part) => part + part).join("")
          : normalized;
        const parsed = Number.parseInt(value, 16);
        return {
          r: (parsed >> 16) & 255,
          g: (parsed >> 8) & 255,
          b: parsed & 255,
        };
      };

      const channelToHex = (value) =>
        Math.round(Math.max(0, Math.min(255, value))).toString(16).padStart(2, "0");

      const rgbToHex = (r, g, b) =>
        "#" + channelToHex(r) + channelToHex(g) + channelToHex(b);

      const mixHexColors = (first, second, firstWeight = 0.5) => {
        const start = hexToRgb(first);
        const end = hexToRgb(second);
        const clampedWeight = Math.max(0, Math.min(1, firstWeight));
        const secondWeight = 1 - clampedWeight;

        return rgbToHex(
          start.r * clampedWeight + end.r * secondWeight,
          start.g * clampedWeight + end.g * secondWeight,
          start.b * clampedWeight + end.b * secondWeight,
        );
      };

      const relativeLuminance = (hex) => {
        const { r, g, b } = hexToRgb(hex);
        const channels = [r, g, b].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });

        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };

      const getContrastText = (hex) =>
        relativeLuminance(hex) > 0.45 ? darkText : lightText;

      const withAlpha = (hex, alpha) => {
        const { r, g, b } = hexToRgb(hex);
        const safeAlpha = Math.max(0, Math.min(1, alpha));
        return "rgba(" + r + ", " + g + ", " + b + ", " + safeAlpha + ")";
      };

      const buildThemeVars = (pair) => {
        const pageBg = pair.background;
        const primary = pair.primary;
        const panelBg = mixHexColors(primary, pageBg, 0.76);
        const surfaceBg = mixHexColors(pageBg, primary, 0.9);
        const chipBg = mixHexColors(panelBg, pageBg, 0.62);
        const pageText = getContrastText(pageBg);
        const primaryText = getContrastText(primary);
        const panelText = getContrastText(panelBg);
        const surfaceText = getContrastText(surfaceBg);
        const panelIcon = mixHexColors(panelText, panelBg, 0.74);
        const surfaceMuted = mixHexColors(surfaceText, surfaceBg, 0.58);
        const chipText = getContrastText(chipBg);

        return {
          "--theme-primary": primary,
          "--theme-page-bg": pageBg,
          "--theme-page-text": pageText,
          "--theme-primary-text": primaryText,
          "--theme-panel-bg": panelBg,
          "--theme-panel-text": panelText,
          "--theme-panel-icon": panelIcon,
          "--theme-panel-shadow": withAlpha(panelBg, 0.28),
          "--theme-primary-shadow": withAlpha(primary, 0.34),
          "--theme-surface-bg": surfaceBg,
          "--theme-surface-text": surfaceText,
          "--theme-surface-muted": surfaceMuted,
          "--theme-chip-bg": chipBg,
          "--theme-chip-text": chipText,
          "--theme-ornament-1": mixHexColors(primary, pageBg, 0.18),
          "--theme-ornament-2": mixHexColors(primary, pageBg, 0.32),
          "--theme-ornament-3": mixHexColors(primary, pageBg, 0.46),
          "--theme-ornament-4": mixHexColors(primary, pageBg, 0.6),
          "--theme-ornament-5": mixHexColors(primary, pageBg, 0.74),
        };
      };

      const pair = themes[Math.floor(Math.random() * themes.length)] || themes[0];
      const root = document.documentElement;
      const themeVars = buildThemeVars(pair);

      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    })();
  `;
}
