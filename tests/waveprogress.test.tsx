import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import WaveProgress from '../src/components/WaveProgress';

describe('WaveProgress', () => {
  test('renders with slider semantics and keyboard seek', async () => {
    const onSeek = vi.fn();
    render(<WaveProgress progress={0.5} onSeek={onSeek} />);
    const slider = screen.getByRole('slider', { name: /playback progress/i });
    expect(slider).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(slider);
    await user.keyboard('{ArrowRight}');
    expect(onSeek).toHaveBeenCalled();
  });
});
