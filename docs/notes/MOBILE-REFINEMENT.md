# Mobile refinement — 2 November 2026

The existing six scenes were audited in source and in mobile WebKit before focused changes. The opening, memory sequence, weather scene, identity, palette, supplied photographs and exact letter were preserved. Before screenshots are retained locally in `.cache/refinement-before/`; final browser screenshots are in `test-results/`.

## Ten improvements implemented

| Issue | Implemented improvement |
| --- | --- |
| Collection frames imposed a common ratio and left inconsistent mattes. | Naturally proportioned prints in two balanced columns preserve the complete image without face cropping. |
| The bounded photo view lacked direct swipe navigation. | A full-screen dynamic-height viewer supports swipes, arrows and keyboard navigation, with distinct collection Back and chapter Close actions. |
| Closing relied on an asynchronous native close event, allowing a scroll-restoration race. | A single idempotent restoration function releases body locking, restores reading position and focuses the original trigger synchronously. Collection scroll and selected-thumbnail focus are retained. |
| Replacing a drag surface during photo transitions could lose the next gesture. | Keep the swipe surface mounted, fade only the image, disable browser image dragging and yield to native page zoom. Preload only one adjacent photo at low priority. |
| Browser-height changes and safe areas needed explicit coverage. | Dynamic viewport sizing and env-backed inset variables protect the header, viewer and navigation; resized layouts are covered by automated inset models. |
| Dot navigation alone made returning to a chapter less discoverable. | Add visible Back navigation and a six-chapter count while keeping all direct chapter shortcuts. |
| Constellation targets and labels competed with ornamentation. | Use 56px targets, larger stationary labels, quieter surroundings, circular focus rings, subtle twinkle, a finite connection trace and an accessible collection alternative. |
| The heart needed clearer progress and keyboard activation. | Add live hold feedback, a quicker heartbeat while holding, pressed state, and direct keyboard/assistive activation. Cancellation and the tap alternative remain intact. |
| The long letter needed emphasis without animating its whole reading surface. | Animate only a small decorative paper fold and emphasize the three supplied promise passages typographically. Every original character and the sign-off remain unchanged. |
| The closing promise arrived as one block. | Soften the background, gather six prints around the heart, then reveal the heading and three original promise clauses in sequence. All actions stay usable, and reduced motion shows the settled state immediately. |

## Verification

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed; regenerated offline shell, 127.00 KB gzipped JavaScript and 10.50 KB gzipped CSS. No new libraries.
- `npm test`: **64 passed, 2 skipped** across Chromium and WebKit. The skips are Chromium-CDP touch-movement tests that cannot run through WebKit's installed automation API. WebKit touch taps and pointer swipes pass.
- Complete journeys at 320×568, 375×667, 390×844, 412×915, 430×932 and 1440×900, with no horizontal overflow, console/page errors or third-party runtime requests.
- Regression coverage includes full-screen viewer bounds, all 20 image ratios, both swipe directions, reduced-motion touch movement, dialog scroll/focus restoration, every Back step, replay, heart cancellation/keyboard access, original letter content, network-failure recovery, silent audio consent, offline shell and PWA assets.
- Expanded Safari-style chrome and standalone PWA layouts were modeled at 390px using reduced viewport height and explicit 47px/34px inset proxies; controls remain clear through viewport resizing.
- Reviewed rendered WebKit screenshots of the balanced collection, 320px viewer, constellation, complete letter, compact 375px ending and modeled safe-area viewer. The ending remains an intimate photographic tableau with its actions visible at 375×667; the smallest phone can scroll naturally.
- Independent fixture comparison confirms the original letter is unchanged; the 20-photo manifest matches the pre-refinement snapshot. Originals and facial appearance were not edited.

## Privacy and remaining limits

The current Vercel site is publicly accessible. `noindex` headers discourage indexing; they do not protect photos. Safari Private Browsing also does not restrict access to the hosted files. No client-only password or change to hosting access settings was introduced. Only optimized photographs and the static application are packaged; original photos, source, contact sheets and QA files are excluded.

Physical iPhone Safari toolbar behavior, actual notches, installed Home Screen mode, VoiceOver, pinch-zoom gesture feel and older-device memory/frame rate still require device verification. No physical-device performance claim is made. Offline photographs are available after viewing; unvisited photographs need connectivity. The workspace has no Git repository, so no commit was manufactured.
