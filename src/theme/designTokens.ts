export const spacing = {
  xs: 0.5,
  sm: 1,
  md: 1.5,
  lg: 2,
  xl: 3,
  xxl: 4,
} as const;

export const radius = {
  sm: 1.5,
  md: 2,
  lg: 3,
  xl: 4,
  pill: 999,
} as const;

export const elevation = {
  surface: '0 10px 30px rgba(138, 149, 173, 0.16)',
  floating: '0 16px 34px rgba(138, 149, 173, 0.2)',
  overlay: '0 26px 56px rgba(118, 130, 160, 0.24)',
} as const;

export const glass = {
  border: '1px solid rgba(255,255,255,0.62)',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5))',
  backdropFilter: 'blur(16px) saturate(130%)',
  darkBackground: 'linear-gradient(145deg, rgba(48,54,80,0.72), rgba(28,30,42,0.66))',
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    standard: '220ms',
    slow: '320ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasized: 'cubic-bezier(0.15, 0.8, 0.25, 1.15)',
  },
} as const;

export const typographyScale = {
  display: { fontSize: '2.15rem', fontWeight: 800, lineHeight: 1.2 },
  title: { fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.35 },
  section: { fontSize: '1.04rem', fontWeight: 700, lineHeight: 1.45 },
  body: { fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.55 },
  caption: { fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.5 },
} as const;

export const designTokens = {
  spacing,
  radius,
  elevation,
  glass,
  motion,
  typographyScale,
} as const;
