import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LocaleProvider } from '../src/i18n/LocaleProvider';
import { usePlayerStore } from '../src/features/player/PlayerStore';
import SearchPage from '../src/features/search/SearchPage';
import type { MusicItem } from '../src/features/search/types';

vi.mock('../src/features/search/api/tuneProxy', () => ({
  searchMusic: vi.fn(),
}));

import { searchMusic } from '../src/features/search/api/tuneProxy';

const mockedSearchMusic = vi.mocked(searchMusic);

function renderSearchPage() {
  return render(
    <LocaleProvider>
      <MemoryRouter initialEntries={['/search']}>
        <Routes>
          <Route path="/search" element={<SearchPage />} />
          <Route path="/player/:id" element={<div data-testid="player-page">player page</div>} />
        </Routes>
      </MemoryRouter>
    </LocaleProvider>
  );
}

describe('SearchPage integration', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [],
      currentIndex: 0,
      trackId: undefined,
      playing: false,
      progress: 0,
      mode: 'off',
      favorites: [],
    });
    mockedSearchMusic.mockReset();
  });

  test('renders grouped deduplicated search results and writes selected track into PlayerStore', async () => {
    const user = userEvent.setup();
    const mockedItems: MusicItem[] = [
      { id: 'n1', platform: 'netease', title: '夜曲', artist: '周杰伦', durationSec: 223 },
      { id: 'q1', platform: 'qq', title: '夜曲', artist: '周杰伦', durationSec: 224 },
      { id: 'k2', platform: 'kuwo', title: '稻香', artist: '周杰伦', durationSec: 221 },
    ];

    mockedSearchMusic.mockResolvedValue(mockedItems);
    renderSearchPage();

    await user.type(screen.getByRole('textbox', { name: /搜索歌曲|Search music/i }), '周杰伦{Enter}');

    expect(await screen.findByText('夜曲')).toBeInTheDocument();
    expect(screen.getByText('稻香')).toBeInTheDocument();

    const yequRow = screen.getByRole('button', { name: /夜曲 周杰伦 netease qq/i });
    expect(within(yequRow).getByText('netease')).toBeInTheDocument();
    expect(within(yequRow).getByText('qq')).toBeInTheDocument();

    await user.click(yequRow);

    expect(await screen.findByTestId('player-page')).toBeInTheDocument();
    const state = usePlayerStore.getState();
    expect(state.trackId).toBe('n1');
    expect(state.currentIndex).toBe(0);
    expect(state.queue).toHaveLength(2);
    expect(state.queue.map((item) => item.id)).toEqual(['n1', 'k2']);
  });
});
