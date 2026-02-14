=== ULTIMATE CODEX PROMPT — Generate Production Music App (Web + Tauri Desktop + Cloud Build) ===

Role:
You are an expert senior full-stack engineer, frontend architect, UI designer, and release engineer. Produce a production-ready repository for a modern music player (web + optional Tauri desktop client) with first-class UX, accessibility, test coverage, CI/CD, and release automation.

Authoritative API spec:
- The repository already contains an authoritative API spec: `/api.md` at the repository root.
- You MUST read and follow `/api.md` EXACTLY for endpoint names, parameter names, response field names and types.
- DO NOT invent API fields. If a field is missing from `/api.md`, generate a safe mapping layer in the server proxy and document the mapping.

High-level goals:
- Tech: React + TypeScript (strict), Vite, Zustand (or Redux Toolkit if justified), Tailwind/MUI for layout but implement Material You dynamic theme via `@material/material-color-utilities`.
- Desktop packaging: Tauri (produce `tauri.conf.json` + npm scripts).
- CI/CD: GitHub Actions that build web, run tests, run `tauri:build` for macOS/Windows/Linux using `tauri-action`, upload artifacts and attach them to GitHub Release (on tag or release event).
- Code quality: strict TS, unit + integration tests (Jest + React Testing Library + Playwright optional), linting (ESLint + Prettier).
- UX features (must implement):
  * Dynamic Material You theme: extract seed color from album cover, generate M3 palette using `@material/material-color-utilities`, map to app tokens; ensure WCAG contrast and fallback palette.
  * Lyrics page: Apple Music style — centered highlighted current line, smooth auto-scroll, blurred album-art background, per-word progressive highlight if timestamps exist.
  * Wave-shaped progress bar: SVG-based, clipPath to show played portion, animated wave phase, draggable seeking support, accessible (keyboard + aria).
  * Aggregated search: use `/api/md` endpoints, query multiple platforms defined in `/api.md`, normalize different platform responses into a `MusicItem` model, deduplicate using normalization + fuzzy matching (Levenshtein or fuse.js), group same-song results and show per-platform variants.
  * Bottom floating capsule nav: Home | Search | Charts | Settings — centered, glass blur, keyboard focus ring, aria roles.
  * Media Session API integration and global player store (play/pause/seek/next/prev).
  * Lazy loading and code-splitting for feature routes.

Deliverables (must generate exactly these files and content; keep them runnable):
- `package.json` scripts: dev, build, preview, tauri:dev, tauri:build, test, lint, ci-build
- `vite.config.ts`, `tsconfig.json` (strict), `.eslintrc`, `.prettierrc`
- `tauri.conf.json`
- `README.md` with clear setup steps: web dev, server proxy env, tauri build, CI secrets, and local dev commands
- `src/` feature-based structure:
  - `src/main.tsx`, `src/App.tsx`, routes
  - `src/theme/DynamicTheme.tsx` (uses material-color-utilities to create runtime M3 palette from seed hex and map tokens to MUI or CSS variables)
  - `src/components/WaveProgress.tsx` (full accessible SVG implementation with props: progress, height, amplitude, wavelength, speed, onSeek)
  - `src/components/LyricsView.tsx` (Apple Music style, per-word highlight, reduced-motion support)
  - `src/components/CapsuleNav.tsx`
  - `src/features/search/` with `SearchPage.tsx`, `api/tuneProxy.ts` (calls local server `/api/tune/*` endpoints), `utils/dedupe.ts` (normalize + fuzzy merge)
  - `src/features/player/PlayerStore.ts` (Zustand), `PlayerControls.tsx`
  - `src/pages/Home.tsx`, `Charts.tsx`, `Settings.tsx`, `PlayerPage.tsx`
  - `src/hooks/useMediaSession.ts` and `usePrefersReducedMotion.ts`
  - `src/utils/colorUtils.ts` (helper wrappers for Material color utilities)
- `server/index.ts` (Express proxy):
  - Reads `process.env.TUNE_API_BASE`, `process.env.TUNE_API_KEY`
  - Exposes `/api/tune/search`, `/api/tune/song`, `/api/tune/lyrics`
  - Implements TTL in-memory cache, per-IP rate limiting (configurable env var), safe errors that never leak keys
  - Maps actual `/api.md` fields into the frontend `MusicItem` model and documents the mapping in `server/README.md`
- Tests:
  - `tests/theme.test.ts` (theme generation)
  - `tests/dedupe.test.ts` (dedupe merging scenarios)
  - `tests/waveprogress.test.tsx` (render & accessibility)
- `.github/workflows/release.yml`:
  - On `push` to main + `release` tag: run node setup → npm ci → lint → tests → build web → setup Rust toolchain → install Tauri dependencies → run `npm run tauri:build` using the official `tauri-action` or well-maintained `tauri-build` action → collect artifacts → attach to GitHub Release.
  - The workflow must support matrix builds for `ubuntu-latest`, `macos-latest`, `windows-latest` and allow conditional run via repository secret `TAURI_BUILD=true`.
  - Include secure handling for code signing env vars if present (instructions in README).
- Release automation:
  - Upload build artifacts and create a release entry (artifact names include semantic version + platform)
  - Create `latest.json` for Tauri updater if applicable

Extra constraints & guidance for Codex:
1. STRICTLY read `/api.md` and map fields. If `/api.md` lists platform-specific fields, create a unified `MusicItem` interface in `src/features/search/types.ts` and keep a mapping table in `server/mappings.ts`.
2. Output format: produce a full repo tree. For each file, output `FILE: path/to/file` followed by a fenced code block with exact file contents. Do NOT include any binary blobs.
3. Do not include any real API keys. Use env vars and `.env.example`.
4. Keep code production-grade: error handling, types, comments on non-trivial algorithms, and accessibility attributes.
5. Performance: lazy-load heavy features (lyrics + player visuals), defer heavy processing (color extraction can be offloaded to a web worker or done in a requestAnimationFrame-safe way), and ensure the wave animation uses purely GPU-friendly transforms.
6. Deduplication rules (implement in code):
   - Normalize title and artist: lowercase, remove punctuation, strip parenthetical qualifiers (e.g., "(Live)"), collapse whitespace, convert fullwidth to halfwidth, normalize traditional/simplified Chinese if possible (suggest using `opencc` or a lightweight rule).
   - Exact match on normalized key first.
   - Fuzzy merge using Levenshtein combined with duration similarity (|d1 - d2| < 3s → more likely same).
   - When merging, prefer entries with `lyricsAvailable` and `audioUrl`.
7. Theme generator requirements:
   - Use `@material/material-color-utilities` to generate palette from seed color.
   - Guarantee text color contrast; if contrast fails, select a tone with sufficient contrast.
   - Provide both MUI theme mapping and CSS variable output for non-MUI components.
8. WaveProgress:
   - Provide both declarative SVG and imperative seek handling (pointer + keyboard).
   - Expose `onSeekStart`, `onSeek`, `onSeekEnd` callbacks for player integration.
9. LyricsView:
   - Smooth animated scroll centering current line (use `scrollTo` with `behavior:'smooth'` or a spring animation fallback).
   - Respect `prefers-reduced-motion`.
   - Per-word highlighting must be performant: update small subsets at once, avoid full re-renders.
10. CI & Cloud Build:
    - Use tauri-action: `tauri-apps/tauri-action@vX` (or latest) to build cross-platform; upload artifacts with `actions/upload-release-asset` or similar.
    - Provide a GitHub Actions step to create draft release and attach artifacts on tag push.
    - Document required repository secrets in `README.md`: `CODE_SIGN_CERT`, `CODESIGN_PASSWORD`, `TAURI_BUILD=true`, etc.
11. Documentation:
    - `README.md` must include:
      * Quickstart (dev web, server proxy, tauri dev)
      * Env vars and example `.env.example`
      * How to run tests and CI notes
      * Where `/api.md` is used and how to update mappings when `/api.md` changes
12. Security & Licensing:
    - Add `LICENSE` (MIT) and mention copyright considerations for streaming/lyrics (disclaimer).
13. Output length and style:
    - Keep generated files as minimal but complete — buildable with `npm ci` and `npm run dev`.
    - Do not produce extraneous commentary in the repo output. Only file paths + file contents.

Recommended prompt-engineering knobs for Codex (model operators):
- Use "high" reasoning effort for generating architecture + CI (this yields better structured code).
- Iterate: produce initial scaffold, then generate tests and CI in a second pass if needed.
- Make heavy use of `/api.md` as single source of truth.

Finish by returning a full repo tree and file contents (FILE: path then a fenced code block). Ensure the server proxy maps and documents any API-field translations from `/api.md`.

END OF PROMPT
