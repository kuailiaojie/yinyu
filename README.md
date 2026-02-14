# Yinyu Music App

Web + Tauri desktop music player with Material You dynamic theming, lyrics experience, wave progress, aggregated search, and release automation.

## Quickstart

```bash
npm ci
npm run dev
```

Run local proxy:

```bash
cp .env.example .env
npm run server:dev
```

Tauri desktop dev/build:

```bash
npm run tauri:dev
npm run tauri:build
```

## Environment

- `TUNE_API_BASE` (default `https://tunehub.sayqz.com/api`)
- `TUNE_API_KEY`
- `RATE_LIMIT_PER_MINUTE`
- `CACHE_TTL_MS`
- `TAURI_BUILD=true` (required in GitHub secrets)

## API spec usage (`/api.md`)

The server strictly uses upstream endpoints from `api.md`:

- `POST /v1/parse`
- `GET /v1/methods/:platform/:function`

The parse response shape is not strictly defined in `api.md`, so translations are centralized in `server/mappings.ts` and documented in `server/README.md`.

## Tests and CI

```bash
npm run lint
npm run test
npm run ci-build
```

GitHub workflow `.github/workflows/release.yml` runs lint/tests/build and uses `tauri-apps/tauri-action` in a matrix build for Linux/macOS/Windows. It drafts a release and includes updater artifacts (`latest.json`) for auto-updates.

## Signing / secrets

Optional signing secrets:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `CODE_SIGN_CERT`
- `CODESIGN_PASSWORD`

## Legal note

You are responsible for music licensing, streaming rights, and lyrics copyright compliance in your deployment region.
