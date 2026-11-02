# Verification — 2 November 2026

Verified locally with Node.js 24.13.1. No original photograph was modified. [DEPLOYMENT.md](DEPLOYMENT.md) records the current Vercel production deployment, including the 2021 letter extension published at the user's explicit request.

## Final release — approved and deployed

[RELEASE-READY.md](RELEASE-READY.md) records the final focused refinement. Build, lint and typecheck pass; the complete Chromium/WebKit suite reports **103 passed, 3 capability-specific skips**. Additional checks confirm the final invitation/promise heading presentation after a CSS-only focus adjustment. All seven chapters and modals pass four expanded-toolbar models as well as the existing normal mobile/desktop journeys. Note-focused source viewing preserves access to byte-identical original PNGs; authentic copy and the final promise remain unchanged. The user approved publication, all rebuilt assets matched the approved checksums, and the current Vercel deployment passed live mobile WebKit and build-equality checks recorded in DEPLOYMENT.md.

## Local 2021 letter extension

The new “Where It All Began” chapter preserves the six original scenes, photographs, exact final letter and final promise. [LETTERS-INTEGRATION.md](LETTERS-INTEGRATION.md) records the source checks, browser coverage, screenshot review and final suite results. The original PNGs and supplied manifest remain untouched; local full-resolution lossless WebP copies total 1,897,162 bytes versus 5,748,516 bytes for the PNGs, a 67% reduction. Screenshot assets load and cache only when viewed; the offline shell includes the excerpt text.

Lint, the separate typecheck and the production build pass without new dependencies. After the envelope-to-excerpt keyboard focus correction, production JavaScript is 130.64 KB gzipped and CSS is 12.44 KB gzipped. The archive supports native dialog dismissal, return focus, reading-position restoration, image retry and original screenshot views. Saved promise/finale bookmarks migrate past the inserted chapter, and the header promise shortcut still opens the original promise directly.

The published extension also passed a live mobile WebKit smoke check: featured excerpt, ten-letter archive, original screenshot, bridge to the heart, exact final promise, photo gallery, ending and offline letter access. The screenshot copies and excerpt text are publicly accessible. Browser viewport and safe-area proxies do not certify physical iPhone Safari, installed PWA behavior, pinch-zoom feel or VoiceOver; those remain device checks. Unviewed screenshots still need connectivity.

## Latest mobile refinement

The subsequent in-place refinement is documented in [MOBILE-REFINEMENT.md](MOBILE-REFINEMENT.md). Lint, a separate typecheck and the production build pass. The full Chromium/WebKit suite reports **64 passed, 2 capability-specific skips**. Complete journeys and screenshots cover 320×568, 375×667, 390×844, 412×915, 430×932 and 1440×900. Additional tests model expanded browser chrome and standalone safe areas with explicit inset proxies; these do not certify physical Safari or Home Screen installation. Original letter data matches the independent fixture and the 20-photo manifest matches the pre-refinement snapshot. Production JavaScript is 127.00 KB gzipped, CSS 10.50 KB gzipped; no new dependencies were added.

## Previous mobile QA polish

The in-place audit and ten fixes are documented in [QA-POLISH.md](QA-POLISH.md). The latest production build, separate typecheck and zero-warning lint pass. The expanded Chromium/WebKit suite reports **41 passed and 1 capability-specific WebKit touch-swipe skip**. WebKit touch taps and the full journey pass. At 390×844, the ending's document height is now 844px versus 1,005px before the polish. Independent original-letter fixture checks pass. Redundant WOFF cache downloads were reduced by 132,116 bytes. Physical-device and Git-workflow limits are recorded in the audit.

## Creative-direction refinement verification

After integrating the guide's local SVG artwork and exact final promise, the production build (including TypeScript checks), lint and all **22 Chromium/WebKit Playwright tests passed again**. JavaScript remains approximately 125 KB gzipped. All five requested viewport sizes passed the complete journey with no console errors, external runtime requests or horizontal overflow.

The browser suite now also verifies that decorative images actually decode, the exact finale promise appears, and all seven decorative SVG files are present in the offline cache. Initial touch targets are checked for both 44px minimum width and height. Screenshots of the monogram/header, layered heart, weather portal, textured full letter and finale were reviewed together on mobile and desktop. A before/after SHA-256 comparison of the full letter data confirms that the title, every paragraph and sign-off remain unchanged. No new dependencies were needed.

## Baseline checks retained

- `npm run photos:contact -- ./Photos`: passed; 121 supplied photographs inspected.
- `npm run photos:import`: passed; 20 curated photographs, 60 optimized assets, original source paths retained.
- Manifest consistency check: 20 unique original files and all WebP/JPEG outputs exist.
- `npm run lint`: passed with zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed. Production JavaScript is approximately 125 KB gzipped. Generated service worker includes the hashed app shell and small cover photograph.
- `npm test`: **22 passed**, Chromium and WebKit.
- Dependency installation/audit after applying the patched minimatch override: **0 vulnerabilities**.
- Impeccable mechanical detector: no findings.

The complete journey passed in both engines at 320×568, 375×667, 390×844, 412×915 and 1440×900. Tests exercise memory controls, constellation reveal, weather states, exact letter paragraphs, finale burst, gallery, replay and saved progress. They assert no console/page errors, no runtime third-party requests and no document horizontal overflow. Additional checks cover hold release/cancellation/completion, keyboard navigation, reduced motion, audio consent and silent reload, storage failure, native dialog focus restoration, touch-control height, removed EXIF/XMP metadata, install icons, service-worker control and offline letter access.

Full-page screenshots were reviewed for mobile and desktop: invitation, memory stack, constellation, symbolic weather, holding heart, complete letter and finale. The small-screen invitation spacing and WebKit gallery focus restoration were corrected. Screenshots wait for the letter to finish unfolding so its paper contrast can be assessed accurately.

## Limits

Real iPhone/Android hardware, actual Home Screen installation, physical safe areas, touch feel and device speaker quality were not available for verification. Browser emulation and desktop WebKit are not substitutes for that final device pass. Offline photographs are cached as viewed, so unvisited photographs require a connection. The Vercel production URL is recorded in DEPLOYMENT.md; physical iPhone installation still needs a device check.
