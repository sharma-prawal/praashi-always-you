# Where It All Began — 2021 time capsule

Implemented in the existing application on 2 November 2026. This adds one chapter between “Through it all” and “My promise”; it does not replace the existing scenes or final promise.

## Reading experience

- Title: **Where It All Began**. Subtitle: **It started with a good morning.**
- Three featured envelopes: 5 April, 17 September and 30 November 2021. Each opens into an ivory paper excerpt with its verified greeting. Touch swipes and previous/next buttons move between envelopes. Opened text remains selectable; swipe is disabled while reading or zoomed.
- “Explore all 10 letters” opens a chronological timeline of the supplied fragments. Each dated entry opens a typeset excerpt. “View original” displays the corresponding complete saved screenshot, with native page zoom available.
- Native dialogs keep focus within the archive. The list position, selected entry, excerpt position, underlying story scroll and opening control are restored on return. Opening an envelope focuses its excerpt; Tab reaches “View original” (Option-Tab with Safari's default keyboard-navigation setting), while arrow navigation retains the control's focus. Featured selections and opened envelopes survive chapter revisits within the current session; replay resets them.
- “From then to always” presents all five user-supplied transition lines, then “Open my promise” enters the existing heart interaction. The header promise shortcut remains directly available. No animation delay gates navigation.

## Authenticity and source handling

Read the package README, manifest and all ten source screenshots. The supplied PNGs and manifest remain unchanged. Dates follow the manifest; the year 2021 was supplied by the author. These are explicitly presented as fragments, never full transcriptions. No missing paragraphs were reconstructed.

App data is generated in `src/data/letters.json` by `npm run letters:import`. Excerpts come from the manifest, with one screenshot-verified punctuation correction: 15 July reads **“I love loving you, and nothing can change that.”** The manifest omitted the visible comma after “you”. Greetings were separately verified against the screenshots; no greeting is inferred for the August or October fragments, which begin mid-message. Visible nicknames and emoji in those greetings are preserved.

Local Sharp conversion produces full-resolution, lossless WebP copies, without cropping or retouching. All ten decoded copies match the source pixels exactly. Original PNG SHA-256 hashes are independently recorded in `tests/fixtures/original-letters.json` and checked in the browser suite.

- Original screenshots: **5,748,516 bytes**.
- Optimized screenshots: **1,897,162 bytes**, a **67% reduction**.
- Images load only when “View original” opens; the offline shell does not eagerly cache them. Viewed screenshots are cached locally for offline reopening. All excerpt text is available with the offline app shell.
- No new library, tracker, remote processing request, font service or backend was added.

## Verification

- `npm run lint`: passed, zero warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed, including regenerated service worker. JavaScript **130.64 KB gzipped**; CSS **12.44 KB gzipped**.
- `npm test`: **87 passed, 3 skipped** in Chromium/WebKit. Skips are trusted touch-movement cases requiring Chromium CDP; WebKit touch opening, pointer gestures and mobile layout pass.
- Complete original-story journeys pass at 320×568, 375×667, 390×844, 412×915, 430×932 and 1440×900.
- The new chapter/archive/original/transition path passes at all five requested sizes: 320×568, 375×667, 390×844, 430×932 and 1440×900.
- Tests cover ordered dates, all image pixels and source hashes, featured excerpts, original image decoding, retry after missing assets, collection/story scroll restoration, trigger focus, chapter revisits, all seven Back steps, replay, bookmark migration, reduced motion, offline text and viewed screenshot access, no overflow, no console/page errors and no third-party runtime requests.
- Explicit 47px/34px inset proxies and a 390×640 viewport model expanded Safari chrome, with resizing to 390×844. This is a layout model, not physical iPhone certification.
- Source comparisons confirm the original final letter, final promise text, Promise component, photographs and existing photo/constellation components are unchanged.
- Settled WebKit screenshots in `test-results/` were inspected for the closed/open envelope, chronological archive, excerpt, original screenshot and bridge on mobile and desktop. Mechanical design detector: no findings.
- Independent finish review inspected all 30 captures across the five requested sizes and found one keyboard-focus handoff issue. The subsequent verdict pass marked that finding **resolved** and returned **ship** at that scope. The final complete browser run reports 87 passed and 3 capability-specific skips.

## Privacy and release status

**Deployed to the existing Vercel project on 2 November 2026 at the user's explicit request.** The production URL is https://praashi-custom.vercel.app; deployment and live mobile WebKit verification are recorded in DEPLOYMENT.md.

This public Vercel deployment exposes the optimized screenshots **and excerpt text** to anyone who can access its URLs. Noindex headers, an unshared URL and Safari Private Browsing do not provide authentication. No client-only password or change to hosting access settings was introduced. Original PNGs, the package manifest, contact sheets and QA screenshots were excluded from the static upload; the app serves optimized screenshot copies.

Physical iPhone Safari chrome, installed PWA behavior, actual pinch-zoom feel and VoiceOver still require a device check. Unviewed screenshots need connectivity. The workspace has no Git repository, so no commit was created.
