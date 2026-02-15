import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import LyricsView from '../src/components/LyricsView';

const prefersReducedMotion = vi.fn(() => false);

vi.mock('../src/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => prefersReducedMotion(),
}));

describe('LyricsView', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    scrollIntoView.mockReset();
    prefersReducedMotion.mockReset();
    prefersReducedMotion.mockReturnValue(false);
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
  });

  test('locates active line and highlights words progressively', () => {
    const { container } = render(
      <LyricsView
        currentMs={1200}
        lines={[
          { id: 'a', t: 0, text: 'line-a', words: [{ t: 0, word: 'Hello ' }, { t: 1500, word: 'World' }] },
          { id: 'b', t: 2000, text: 'line-b' },
        ]}
      />
    );

    const activeLine = container.querySelector("[data-line='0']");
    expect(activeLine).toBeTruthy();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

    const words = activeLine?.querySelectorAll('span') ?? [];
    expect(words[0]).toHaveStyle({ color: 'var(--md-sys-color-primary)' });
    expect(words[1].getAttribute('style') ?? '').not.toContain('var(--md-sys-color-primary)');
  });

  test('uses auto scroll behavior in reduced-motion mode', () => {
    prefersReducedMotion.mockReturnValue(true);

    render(
      <LyricsView
        currentMs={3000}
        lines={[
          { id: 'a', t: 0, text: 'line-a' },
          { id: 'b', t: 2000, text: 'line-b' },
        ]}
      />
    );

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'center' });
  });
});
