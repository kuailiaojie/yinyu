import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, Slider, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import LyricsView, { type LyricLine } from '../components/LyricsView';
import { useMediaSession } from '../hooks/useMediaSession';
import { fetchLyrics, fetchSong } from '../features/player/api/tuneProxyPlayer';
import PlayerControls from '../features/player/PlayerControls';
import { usePlayerStore } from '../features/player/PlayerStore';

function parseLrc(lyrics: string): LyricLine[] {
  return lyrics
    .split(/\r?\n/)
    .map((line, idx) => {
      const matched = line.match(/^\[(\d{2}):(\d{2})(?:\.(\d{1,3}))?\](.*)$/);
      if (!matched) return null;
      const minute = Number(matched[1]);
      const second = Number(matched[2]);
      const msRaw = matched[3] ?? '0';
      const ms = Number(msRaw.padEnd(3, '0'));
      const text = matched[4].trim();
      return { id: `${minute}-${second}-${idx}`, t: minute * 60_000 + second * 1_000 + ms, text };
    })
    .filter((line): line is LyricLine => Boolean(line))
    .sort((a, b) => a.t - b.t);
}

export default function PlayerPage() {
  const { id } = useParams();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const {
    queue,
    currentTrack,
    currentMs,
    durationMs,
    buffered,
    loading,
    error,
    playing,
    volume,
    playTrack,
    next,
    prev,
    setVolume,
    setPlaying,
    setDurationMs,
    setCurrentMs,
    setBuffered,
    setLoading,
    setError,
  } = usePlayerStore();

  useEffect(() => {
    if (id && id !== currentTrack?.id && queue.some((track) => track.id === id)) {
      playTrack(id);
    }
  }, [id, queue, currentTrack?.id, playTrack]);

  useEffect(() => {
    if (!currentTrack) return;

    let alive = true;
    setLoading(true);
    setError(undefined);
    setAudioUrl(undefined);
    setLyrics([]);

    Promise.allSettled([
      fetchSong(currentTrack.platform, currentTrack.id),
      fetchLyrics(currentTrack.platform, currentTrack.id),
    ]).then((result) => {
      if (!alive) return;
      const [songResult, lyricsResult] = result;

      if (songResult.status === 'fulfilled' && songResult.value.url) {
        setAudioUrl(songResult.value.url);
      } else {
        setError('无版权或链接失效，无法播放此歌曲。');
      }

      if (lyricsResult.status === 'fulfilled' && lyricsResult.value.lyrics) {
        const parsed = parseLrc(lyricsResult.value.lyrics);
        setLyrics(parsed);
      } else {
        setLyrics([]);
      }

      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [currentTrack, setError, setLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing, audioUrl, setPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const progress = useMemo(() => (durationMs > 0 ? currentMs / durationMs : 0), [currentMs, durationMs]);

  useMediaSession({
    title: currentTrack?.title ?? '未选择歌曲',
    artist: currentTrack?.artist ?? '',
    artwork: currentTrack?.coverUrl,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onNext: next,
    onPrev: prev,
    onSeekTo: (seekTimeSec) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = seekTimeSec;
      setCurrentMs(seekTimeSec * 1000);
    },
    onSeekBy: (offsetSec) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = Math.max(0, audio.currentTime + offsetSec);
      setCurrentMs(audio.currentTime * 1000);
    },
  });

  if (!currentTrack) {
    return (
      <Box p={2}>
        <Alert severity="info">请先在搜索页选择一首歌开始播放。</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={(e) => setDurationMs(e.currentTarget.duration * 1000)}
        onTimeUpdate={(e) => setCurrentMs(e.currentTarget.currentTime * 1000)}
        onProgress={(e) => {
          const audio = e.currentTarget;
          const last = audio.buffered.length - 1;
          if (last >= 0 && audio.duration > 0) {
            setBuffered(audio.buffered.end(last) / audio.duration);
          }
        }}
        onEnded={next}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError('播放失败：音频链接失效或暂时不可用。');
        }}
      />

      <Typography variant="h5">{currentTrack.title}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
        {currentTrack.artist}
      </Typography>

      {loading && (
        <Stack direction="row" spacing={1} alignItems="center" my={1}>
          <CircularProgress size={16} />
          <Typography variant="body2">加载中…</Typography>
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!error && !audioUrl && <Alert severity="warning">暂无可播放链接。</Alert>}

      <Box sx={{ my: 2 }}>
        <PlayerControls
          onSeek={(nextProgress) => {
            const audio = audioRef.current;
            if (!audio || durationMs <= 0) return;
            const nextMs = nextProgress * durationMs;
            audio.currentTime = nextMs / 1000;
            setCurrentMs(nextMs);
          }}
        />
        <Typography variant="caption" display="block" sx={{ opacity: 0.6 }}>
          进度 {Math.round(progress * 100)}% · 缓冲 {Math.round(buffered * 100)}%
        </Typography>
      </Box>

      <Box sx={{ px: 1, py: 1 }}>
        <Typography variant="caption">音量</Typography>
        <Slider value={volume * 100} onChange={(_, value) => setVolume((value as number) / 100)} min={0} max={100} />
      </Box>

      {lyrics.length ? (
        <LyricsView lines={lyrics} currentMs={currentMs} />
      ) : (
        <Alert severity="info">歌词缺失或暂不支持该歌曲歌词。</Alert>
      )}
    </Box>
  );
}
