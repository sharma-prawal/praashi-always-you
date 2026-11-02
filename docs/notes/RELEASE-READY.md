> **Superseded by RELEASE-CANDIDATE.md.** This file describes the earlier deployed build.


# Final release candidate — 2 November 2026

**Approved and deployed to Vercel on 2 November 2026.** Production: https://praashi-custom.vercel.app. The fresh production build matched all approved release checksums before publication. The tested build is in `dist/`; deployment details and live verification are recorded in DEPLOYMENT.md.

## Focused changes

- Safari layouts use the visible viewport in addition to dynamic CSS units. Photo collection, full-screen photo view and letter archive stay within the available height; safe-area padding is retained at phone and landscape breakpoints. Native pinch zoom does not trigger a content reflow. Viewport writes occur only when values change, with event work coalesced into one frame.
- “The original” defaults to a closer view of the actual note pixels, hiding embedded status bars and screenshot controls. This is a CSS display window, without rewriting or retouching the image. Its lower edge ends in an inter-line gap. “View complete screenshot” loads the full, byte-identical source PNG, and “Back to note content” returns to the reading view. Both views preserve the accurate external date and native page zoom.
- Updated the requested caption to **“A little piece of my heart, from 2021.”**
- Reopening the archive retains its collection scroll position. Returning from an excerpt still restores the selected entry and focus; selecting another date through the arrow controls keeps its return target visible.
- Selected/opened featured envelopes and the transition state now survive reloads. Legacy promise/finale bookmarks remain compatible. Replay clears the capsule progress and archive position.
- Programmatically focused invitation and reading headings no longer acquire an unrelated browser outline; keyboard focus still reaches their content, and controls keep their existing visible focus treatment.

The seven chapters, theme, photographs, authentic excerpts, greetings, dates, exact final letter and final promise remain intact. The final scene retains three visible promise clauses: “I love you, and I'll always choose you,” / “through every high and low,” / “through all the thick and thin.” No extra Then/Now transition was added: the existing bridge already connects 2021 to the present promise, so another passage would repeat it.

## Verification

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, including the regenerated offline shell.
- `npm test`: **103 passed, 3 skipped**, Chromium and WebKit. The skips require Chromium CDP touch-movement injection; WebKit taps, pointer gestures, focus and mobile layouts pass.
- Existing complete journeys: 320×568, 375×667, 390×844, 412×915, 430×932 and 1440×900 in both engines.
- All seven chapters plus photo and letter modals: 320×460, 375×560, 390×640 and 430×740, with explicit 47px top / 34px bottom inset proxies. Controls remain reachable above the modeled bottom inset, with natural document scrolling at small sizes.
- A separate visible-viewport model verifies modal resizing when layout and visible heights differ, including a top offset, and verifies that magnified viewport changes do not reflow the app.
- All ten complete PNG routes decode and match their source SHA-256 hashes and bytes. Existing lossless WebP copies still match source pixels. Missing-image retry, offline viewed-image access, exact letter content, modal return/focus, progress migration, reload, replay and reduced motion pass.
- Fresh storage at the canonical root and a QR-style tracking URL always shows the invitation, no returning-visitor message and no autoplay. No QR image was supplied in the workspace, so the encoded QR destination itself was not decoded.
- No unexpected console/page errors, missing asset responses, third-party runtime requests or horizontal overflow in complete journeys and the expanded-toolbar models.
- Source comparisons confirm all authentic excerpts, greetings and dates, the final letter data, final promise and Promise component remain unchanged.
- Final rendered review covered all ten note windows, all seven chapter compositions, the new caption, expanded-toolbar ending and desktop finale. A last CSS-only heading-outline adjustment was rebuilt and smoke-checked in both engines; fresh invitations and focused promise headings pass.
- Mechanical design detector: no findings. No new dependencies or continuous animation loops were introduced. Existing rapid-navigation tests still settle on a single visible photograph; physical-device frame rate and heap usage are not claimed.

## Build and assets

JavaScript: **131.57 KB gzipped**. CSS: **12.65 KB gzipped**. The build contains 102 files totaling **14,814,082 bytes**. Its ignored local checksum manifest is `.cache/release-ready/build-manifest.json`.

The byte-identical PNGs add 5,748,516 bytes to the complete static package, but they load only after “View complete screenshot”. The normal note view uses the existing optimized lossless WebP. Neither set is downloaded by the offline shell; images cache as viewed. Originals in the input package were never edited.

## Remaining device checks

Desktop WebKit and inset/viewport models do not certify actual iPhone Safari toolbar transitions, physical notches, installed PWA behavior, native pinch-zoom feel, VoiceOver or older-device GPU/memory behavior. Unviewed images still need connectivity. Short phone layouts intentionally scroll; they do not hide content to force every chapter into one screen.

The user subsequently approved deployment, and this exact release is now published on the existing public Vercel project. Live mobile WebKit checks passed for the first-visit opening, updated caption, note-focused viewer, complete PNG, exact promise, gallery, three-clause ending and offline letter. Complete PNGs are publicly accessible alongside the existing content. Hosting access settings were retained; no fake client-side access control was added.
