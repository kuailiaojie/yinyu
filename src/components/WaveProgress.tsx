import { useMemo, useRef } from 'react';

type WaveProgressProps = {
  progress: number;
  height?: number;
  amplitude?: number;
  wavelength?: number;
  speed?: number;
  onSeek?: (progress: number) => void;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
};

export default function WaveProgress({
  progress,
  height = 48,
  amplitude = 8,
  wavelength = 36,
  speed = 1,
  onSeek,
  onSeekStart,
  onSeekEnd
}: WaveProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const width = 1000;

  const d = useMemo(() => {
    const y0 = height / 2;
    let path = `M0 ${y0}`;
    for (let x = 0; x <= width; x += 8) {
      const y = y0 + Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
      path += ` L${x} ${y.toFixed(2)}`;
    }
    return path;
  }, [height, amplitude, wavelength]);

  const seekByX = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !onSeek) return;
    onSeek(Math.max(0, Math.min(1, (clientX - box.left) / box.width)));
  };

  return (
    <svg
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Playback progress"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      width="100%"
      height={height}
      onPointerDown={(e) => {
        onSeekStart?.();
        seekByX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekByX(e.clientX);
      }}
      onPointerUp={() => onSeekEnd?.()}
      onKeyDown={(e) => {
        if (!onSeek) return;
        if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.02));
        if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.02));
      }}
      style={{ outline: 'none' }}
    >
      <defs>
        <clipPath id="played"><rect x="0" y="0" width={`${progress * 100}%`} height={height} /></clipPath>
      </defs>
      <path d={d} stroke="#9e9e9e" fill="none" strokeWidth="4" />
      <g clipPath="url(#played)" style={{ transform: `translateX(${speed}px)` }}>
        <path d={d} stroke="var(--md-sys-color-primary)" fill="none" strokeWidth="4" />
      </g>
    </svg>
  );
}
