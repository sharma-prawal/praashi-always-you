# Mobile experience audit and polish

Verified on 2 November 2026. The existing React/Vite application was refined in place. Its six scenes, palette, real photographs, original letter and local-only architecture were preserved.

## The ten highest-impact issues fixed

| Rank | Verified issue and impact | Implemented correction |
| --- | --- | --- |
| 1 | Navigation reset scroll while the outgoing long scene was still mounted. WebKit also retained an identity transform after scene motion. | SceneSurface resets scroll and heading focus after the incoming scene mounts. Scene transitions use a short opacity crossfade, leaving no full-scene transform behind. |
| 2 | Resume stored the furthest chapter and used a stale initial snapshot. Going home during a first visit did not offer the current bookmark; replay retained old progress. | Persist the last chapter visited, offer resume immediately, restore an already-read letter when resuming it, and clear the bookmark on replay. |
| 3 | The hold's window-blur handler only cancelled if the document was also hidden. Unrelated pointer releases could cancel the active hold. | Cancel on actual focus loss, visibility loss, matching-pointer release/cancel and lost capture. Keep the tap alternative and focus the revealed letter heading. |
| 4 | Clicking empty dialog padding closed the gallery. Returning from a late photo lost the grid position; CSS-only background locking was fragile for iOS. | Dismiss only outside the dialog bounds, preserve grid scroll and selected-thumbnail focus, lock the underlying document, and restore its exact reading position and trigger focus on close. |
| 5 | Delayed audio startup could race with mute or backgrounding; abrupt suspension could produce a click. | Track the latest audio intent and operation, invalidate stale starts, fade user-initiated mute briefly, suspend immediately when hidden and reuse a single AudioContext. Returning foreground never autoplays sound. |
| 6 | Failed images stayed failed when a reused slot changed or connectivity returned. Width descriptors assumed a 480/960px width even for portrait assets resized by their long side. Crop-only print slots discarded parts of original compositions. | Key image state by photo identity, retry failed images on reconnect, describe actual rendition widths, add a stable decode fade/placeholder, and fit full compositions into warm mattes in main prints and gallery thumbnails. |
| 7 | Reduced motion disabled direct photo swiping and globally shortened every animation, rather than selectively preserving useful feedback. | Retain user-driven swiping, target decorative animations explicitly, keep hold progress and brief state fades, and retain static rain artwork. A Chromium touch swipe is tested with reduced motion enabled. |
| 8 | Letter body text dropped to 14px at 320px. Navigation scrolled away, and the entire long sheet was animated as a 3D plane. | Use 16px text at every phone width, keep an opaque safe-area-aware header reachable, dim and pause surrounding stars, and reveal the paper with a short opacity transition. The original title, paragraphs and sign-off are independently fixture-checked. |
| 9 | The ending measured 1,005px at 390×844, with replay and gallery actions below the first viewport. | Build a compact closing tableau within the existing scene, gather the six prints in a single bounded entrance and give “Always” a restrained arrival. Keep primary, replay and gallery actions visible. Small phones retain natural scrolling. |
| 10 | Offline installation downloaded unused WOFF fallback files, decorative animations continued when hidden, and rapid photo swaps reused animation keys. | Use self-hosted WOFF2 only and preload the first reading faces, removing 132,116 bytes of redundant cache downloads. Pause hidden/reading decoration, uniquely key photo swaps, and bound outgoing photo transitions so a rapid wraparound settles on one fully visible frame. |

## Measured ending layout

WebKit, touch-enabled mobile contexts at 2× device scale; values are CSS pixels. Baseline captures were taken before source edits. Final values were measured against the rebuilt production app.

| Viewport | Before document height | After document height | After primary-action bottom | After replay/gallery bottom |
| --- | ---: | ---: | ---: | ---: |
| 320×568 | 911 | 666 | 515 | 564 |
| 375×667 | — | 667 | 515 | 564 |
| 390×844 | 1,005 | 844 | 594 | 643 |
| 430×932 | 1,015 | 932 | 623 | 672 |
| 1440×900 | 1,087 | 900 | 641 | 690 |

The smallest 320px phone scrolls to its final chapter rail; its main actions still fit in the initial viewport. Larger measured viewports fit the entire ending. The display remains an intimate centered stage on desktop.

## Verification

- `npm run build`: passed, including TypeScript and the regenerated offline shell.
- `npm run typecheck`: passed.
- `npm run lint`: passed with zero warnings.
- `npm test`: **41 passed, 1 capability-specific skip** across Chromium and WebKit.
- The original complete journey still passes at 320×568, 375×667, 390×844, 412×915 and 1440×900 in both engines. The 430×932 ending was also inspected and measured in WebKit.
- New regression coverage includes long-scene scroll/focus recovery, current-chapter resume and replay reset, visible-window hold cancellation, exact original letter text and 16px reading size, sticky reading controls, gallery padding/grid/document recovery, delayed audio mute/background races, network recovery and frame identity, touch taps, reduced-motion touch swiping and rapid photo wraparound.
- Existing coverage retains reduced motion, manifest and icons, offline letter/artwork access, photo metadata stripping, touch-target dimensions, audio consent, storage failure, no document overflow, no unexpected console errors and no runtime third-party requests.
- Mobile and desktop screenshots were reviewed before and after the changes. Final screenshots in `test-results/` show the keepsake print, quiet promise heart, scrolling letter, gallery interactions and compact ending. Baseline and measured-layout evidence is retained locally in ignored `.cache/qa-before/` and `.cache/qa-after/`.
- Source letter data exactly matches `tests/fixtures/original-letter.json`; browser text assertions independently verify its title, every paragraph and signature. No original photo was edited or face altered.

## Genuine limitations

This is browser automation, not a physical-device certification. Real iPhone Safari chrome, notches, Home Screen installation, physical gesture feel, older-device GPU/memory behavior and speaker quality still need a device pass. Installed Playwright exposes touch taps for both engines, but touch movement through CDP only for Chromium; the duplicate WebKit swipe case is explicitly skipped. WebKit touch taps, pointer-hold behavior, scrolling and layout pass. No quantified frame-rate or physical-device heap claim is made.

Offline photographs remain cached as viewed; unvisited photographs require a connection. The audit preceded publication; the subsequent Vercel deployment is recorded in DEPLOYMENT.md. The workspace is not a Git repository (`git rev-parse --show-toplevel` reports “not a git repository”), so no commit was created and no repository was initialized solely to manufacture one.
