# Sound Match 🎵

An educational two-player web game for practicing Hebrew vocabulary by matching
an image to a spoken word, while ignoring distractors. Blue player = **A** key,
Red player = **L** key.

## Local development
```bash
npm install
npm run dev        # dev server (Vite)
npm run build      # production build (dist/)
npm run preview    # preview the build
```

## Assets

### Images + vocabulary
Images live in `img/` (filenames = Hebrew words with niqqud).
The script normalizes them and generates a manifest:
```bash
npm run manifest   # img/ -> public/images/<cat>/<id>.webp + src/data/vocabulary.generated.ts
```

### Arabic translations
```bash
npm run arabic     # generates src/data/arabic.ts (auto-translated — can be fixed in the script's dictionary)
```

### Narration (Google TTS) — pre-generated
The vocabulary is fixed, so narration is generated **once** at build time and
saved as static files. **No secret key is needed at runtime.**
```bash
GOOGLE_TTS_KEY=xxx npm run tts          # generates public/audio/tts/{he,ar}/<id>.mp3
GOOGLE_TTS_KEY=xxx npm run tts -- --force   # regenerate everything
```
Create the key in Google Cloud Console (with the Text-to-Speech API enabled).
Keep it in a local `.env` (see `.env.example`) — it is not needed in production.

Swapping the TTS provider in the future only touches `src/audio/TtsManager.ts`
(runtime) and `scripts/build-tts.mjs` (generation).

### Music and sound effects
See `public/audio/README.md`. The site also runs without these files (silent,
no errors).
- Music: uniform-length loops (`MUSIC_LOOP_SECONDS`), configured in `src/config/music.config.ts`.
- Effects: configured in `src/config/sfx.config.ts`.

```bash
npm run assets     # manifest + arabic + tts together
```

## Deployment (Render)
Deployed as a Static Site per `render.yaml` (build: `npm ci && npm run build`,
publish: `dist`, with SPA fallback). Since TTS is pre-generated, no secret
environment variables are needed in production.

## Structure
- `src/config/` — all constants and settings (categories, music, effects, timings).
- `src/audio/` — Web Audio engine: music (phase-synced crossfade), effects, TTS, preloading.
- `src/store/` — Zustand: navigation, settings (persisted), item selection, game state.
- `src/screens/` + `src/components/` — UI.
- `scripts/` — asset-generation scripts.
</content>
</invoke>
