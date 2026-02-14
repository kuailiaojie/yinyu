import {
  argbFromHex,
  hexFromArgb,
  Hct,
  themeFromSourceColor
} from '@material/material-color-utilities';

export type ThemeTokens = Record<string, string>;

export function buildPalette(seedHex: string): ThemeTokens {
  const argb = argbFromHex(seedHex);
  const theme = themeFromSourceColor(argb);
  return {
    '--md-sys-color-primary': hexFromArgb(theme.schemes.light.primary),
    '--md-sys-color-on-primary': ensureContrast(
      hexFromArgb(theme.schemes.light.onPrimary),
      hexFromArgb(theme.schemes.light.primary)
    ),
    '--md-sys-color-surface': hexFromArgb(theme.schemes.light.surface),
    '--md-sys-color-on-surface': ensureContrast(
      hexFromArgb(theme.schemes.light.onSurface),
      hexFromArgb(theme.schemes.light.surface)
    )
  };
}

function luminance(hex: string): number {
  const [, r, g, b] = /^#(..)(..)(..)$/.exec(hex) ?? [];
  const vals = [r, g, b].map((v) => parseInt(v ?? '00', 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function ensureContrast(text: string, bg: string, min = 4.5): string {
  if (contrast(text, bg) >= min) return text;
  const tone = contrast('#000000', bg) > contrast('#ffffff', bg) ? 0 : 100;
  const adjusted = Hct.fromInt(argbFromHex(text));
  adjusted.tone = tone;
  return hexFromArgb(adjusted.toInt());
}
