import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';

import PlayerControls from '../src/features/player/PlayerControls';
import { usePlayerStore } from '../src/features/player/PlayerStore';

describe('PlayerControls', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [
        { id: 'track-1', title: 'Track 1', artist: 'Artist 1' },
        { id: 'track-2', title: 'Track 2', artist: 'Artist 2' },
      ],
      currentIndex: 0,
      trackId: 'track-1',
      playing: false,
      progress: 0.2,
      mode: 'off',
      favorites: [],
    });
  });

  test('handles next/prev/mode/favorite and seek progress sync', async () => {
    const user = userEvent.setup();
    render(<PlayerControls />);

    expect(screen.getByText('Play')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next track/i }));
    expect(usePlayerStore.getState().trackId).toBe('track-2');

    await user.click(screen.getByRole('button', { name: /previous track/i }));
    expect(usePlayerStore.getState().trackId).toBe('track-1');

    const modeButton = screen.getByRole('button', { name: /repeat mode/i });
    await user.click(modeButton);
    expect(usePlayerStore.getState().mode).toBe('all');

    await user.click(screen.getByRole('button', { name: /favorite track/i }));
    expect(usePlayerStore.getState().favorites).toContain('track-1');

    const slider = screen.getByRole('slider', { name: /playback progress/i });
    await user.click(slider);
    await user.keyboard('{ArrowRight}');
    expect(usePlayerStore.getState().progress).not.toBe(0.2);
  });
});
