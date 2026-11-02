# Development instructions

Read and follow `@/Users/prawalsharma/.codex/RTK.md` when that local file is available. Prefix shell commands with `rtk` in this environment.

## Product and design
- This is a private gift from Pawi (Prawal) to his wife Nikki. Preserve #PrAashi — Always You and the supplied letter verbatim in `src/data/content.json`.
- Read PRODUCT.md and DESIGN.md before UI changes. Keep the six original scenes plus the inserted 2021 letter chapter, plum/blush/champagne/ivory palette, self-hosted typography and intimate mobile composition.
- Never invent relationship memories, conversations, locations, dates or events. Caption feeling, not unsupported biography.
- Never generate or retouch faces. Never modify originals in Photos/ or photos/. Change only optimized copies through the import tooling.
- No accounts, backend, analytics, trackers, external font CDNs, third-party audio or runtime third-party requests. The owner has accepted public access to this deployment; do not add authentication. Do not deploy without explicit approval.
- Music stays off until an explicit tap: the opening's Music on, the header sound button, or, once the owner's saved preference is on, the tap that opens or resumes the story. Hide/background pauses it. The soundtrack is self-hosted; its licence record is in assets/licenses/MUSIC.md and the on-page credit must remain.

## Implementation
- React + TypeScript + Vite, Tailwind CSS and Motion. Static JSON and localStorage only. Keep library versions compatible and lockfile current.
- The first run is guided: the header gallery opens once all seven stars are touched; the promise shortcut, later chapters and next-chapter buttons stay disabled until reached or their items are seen. Reaching the final chapter once unlocks everything permanently. The heart's tap alternative must always work. Preserve native dialog focus handling, Escape dismissal and focus restoration.
- Design 320–430px first. At least 44px touch targets, safe-area padding, dynamic viewport units, zoom enabled, no horizontal overflow. Letter uses natural document scrolling.
- Animate transform and opacity where possible, use the shared easing tokens, gate hover by input capability, and honor reduced motion. Keep particles bounded.
- Service worker caches the app shell and viewed photographs, never sends private assets anywhere. Generate it after the production build so hashed assets remain correct.
- Each photograph appears in only one place in the story (src/lib/storyPhotos.ts); the gallery alone shows them all.
- Photo curation source is scripts/curation.json; src/data/photos.json is generated and checked against the Photo interface. Original filenames are provenance, never assumed memories.

## Checks
- `npm run lint`, `npm run typecheck`, `npm run build`, then `npm test`.
- Playwright covers Chromium and WebKit at 320×568, 375×667, 390×844, 412×915 and 1440×900, as well as keyboard, reduced motion, hold cancellation, repeat visits, metadata removal and offline shell.
- Review generated screenshots in test-results. Be candid that emulation cannot verify physical iPhone safe areas, haptics, Safari chrome or installation.
- Bind local previews to 127.0.0.1. Keep originals and local contact sheets out of version control and deployment output.
