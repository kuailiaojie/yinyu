import { describe, expect, test } from 'vitest';
import { buildPalette, ensureContrast } from '../src/utils/colorUtils';

describe('theme generation', () => {
  test('builds required tokens', () => {
    const tokens = buildPalette('#6750A4');
    expect(tokens['--md-sys-color-primary']).toMatch(/^#/);
    expect(tokens['--md-sys-color-on-surface']).toMatch(/^#/);
  });

  test('ensures minimum contrast fallback', () => {
    expect(ensureContrast('#ffffff', '#ffffff')).toBe('#000000');
  });
});
