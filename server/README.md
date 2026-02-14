# Server mapping notes

This proxy follows `api.md` exactly for upstream endpoints:

- `POST /v1/parse` with fields: `platform`, `ids`, `quality`
- `GET /v1/methods/:platform/:function` used to discover dispatch methods

Because `api.md` does not specify a strict parse response schema, we maintain a safe mapping layer in `server/mappings.ts` and expose a stable frontend model (`MusicItem`).

## Mapping table

| Frontend `MusicItem` | Upstream source |
|---|---|
| `id` | `id` |
| `platform` | request platform |
| `title` | `name` |
| `artist` | `artist` |
| `album` | `album` |
| `durationSec` | `duration / 1000` |
| `coverUrl` | `pic` |
| `audioUrl` | `url` |
| `lyricsAvailable` | `Boolean(lyric)` |

If `api.md` changes, update `server/mappings.ts` first and keep route output unchanged.
