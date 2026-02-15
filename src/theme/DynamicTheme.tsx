import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { buildPalette } from '../utils/colorUtils';
import { designTokens } from './designTokens';

type DynamicThemeContextType = {
  seed: string;
  setSeed: (hex: string) => void;
};

const DynamicThemeContext = createContext<DynamicThemeContextType | undefined>(undefined);

export function DynamicThemeProvider({ children }: PropsWithChildren) {
  const [seed, setSeed] = useState('#6750A4');
  const tokens = useMemo(() => buildPalette(seed), [seed]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: tokens['--md-sys-color-primary'] },
          background: {
            default: tokens['--md-sys-color-surface'],
            paper: tokens['--md-sys-color-surface-container'],
          },
          text: {
            primary: tokens['--md-sys-color-on-surface'],
            secondary: tokens['--md-sys-color-on-surface-variant'],
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", Inter, Roboto, Helvetica, Arial, sans-serif',
          h3: designTokens.typographyScale.display,
          h4: designTokens.typographyScale.title,
          h5: designTokens.typographyScale.title,
          h6: designTokens.typographyScale.section,
          body1: designTokens.typographyScale.body,
          body2: designTokens.typographyScale.caption,
        },
        transitions: {
          duration: {
            shortest: 120,
            shorter: 180,
            short: 220,
            standard: 260,
            complex: 320,
            enteringScreen: 220,
            leavingScreen: 180,
          },
          easing: {
            easeInOut: designTokens.motion.easing.standard,
            easeOut: designTokens.motion.easing.emphasized,
            easeIn: designTokens.motion.easing.standard,
            sharp: designTokens.motion.easing.standard,
          },
        },
      }),
    [tokens]
  );

  return (
    <DynamicThemeContext.Provider value={{ seed, setSeed }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div style={tokens as React.CSSProperties}>{children}</div>
      </ThemeProvider>
    </DynamicThemeContext.Provider>
  );
}

export function useDynamicTheme() {
  const ctx = useContext(DynamicThemeContext);
  if (!ctx) throw new Error('useDynamicTheme must be used within DynamicThemeProvider');
  return ctx;
}
