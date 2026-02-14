import { useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export type LyricWord = { t: number; word: string };
export type LyricLine = { id: string; t: number; text: string; words?: LyricWord[] };

export default function LyricsView({ lines, currentMs }: { lines: LyricLine[]; currentMs: number }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(
    () => Math.max(0, lines.findIndex((l, i) => currentMs >= l.t && currentMs < (lines[i + 1]?.t ?? Infinity))),
    [lines, currentMs]
  );

  useEffect(() => {
    const node = ref.current?.querySelector<HTMLElement>(`[data-line='${activeIndex}']`);
    node?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }, [activeIndex, reduced]);

  return (
    <Box ref={ref} sx={{ maxHeight: 420, overflow: 'auto', px: 2, py: 8, backdropFilter: 'blur(24px)' }}>
      {lines.map((line, i) => {
        const active = i === activeIndex;
        return (
          <Typography
            key={line.id}
            data-line={i}
            sx={{ textAlign: 'center', my: 2, fontSize: active ? '1.4rem' : '1rem', opacity: active ? 1 : 0.5 }}
          >
            {line.words?.length
              ? line.words.map((w, idx) => (
                  <span key={idx} style={{ color: currentMs >= w.t ? 'var(--md-sys-color-primary)' : undefined }}>
                    {w.word}
                  </span>
                ))
              : line.text}
          </Typography>
        );
      })}
    </Box>
  );
}
