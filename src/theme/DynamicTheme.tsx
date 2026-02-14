import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { buildPalette } from '../utils/colorUtils';

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
          primary: { main: tokens['--md-sys-color-primary'] },
          background: { default: tokens['--md-sys-color-surface'] },
          text: { primary: tokens['--md-sys-color-on-surface'] }
        }
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
