# Server proxy mapping notes

## Environment variables

- `TUNE_API_BASE` (optional, default `https://tunehub.sayqz.com/api`)
- `TUNE_API_KEY` (required for protected TuneHub endpoints)
- `PORT` (optional, default `3000`)
- `CACHE_TTL_MS` (optional, default `60000`)
- `RATE_LIMIT_MAX` (optional, default `80`)
- `RATE_LIMIT_WINDOW_MS` (optional, default `60000`)

## Mapping from `/api.md` to frontend `MusicItem`

Source in `/api.md` parse/search payloads is platform-specific and not fully unified. Proxy normalization is:

| Upstream candidate fields | Frontend field |
| --- | --- |
| `id` / `songid` / `songId` / `rid` / `mid` | `id` |
| `title` / `name` / `songname` / `songName` | `title` |
| `artist` / `singer` / `artistName` / `ar[].name` | `artist` |
| requested platform | `platform` |

For `/api/tune/song`, response is normalized to `{ id, title, artist, url }`.
For `/api/tune/lyrics`, response is normalized to `{ id, lyrics }`.
