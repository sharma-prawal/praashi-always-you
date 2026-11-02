# Vercel production deployment

- Project: **praashi-custom**
- Production URL: **https://praashi-custom.vercel.app**
- Vercel scope: `prawal-sharma-s-projects`
- Status: **READY**, verified 2 November 2026.
- Deployment ID: `dpl_6GxdqWryc4i51Wkq1ALSpzqdXirC` (commit `d0b7343`)
- Dashboard: https://vercel.com/prawal-sharma-s-projects/praashi-custom

Hosted on Vercel only. The deployment uses the prebuilt static output from the locally verified, approved production build. All 103 static files match the local build of commit `d0b7343`, including the self-hosted soundtrack, 60 optimized photo renditions, 10 lossless note screenshot copies and 10 byte-identical complete PNG copies. Original `Photos/` files, input-package directories, package manifest, source files, contact sheets and QA documents were excluded. Complete PNGs are intentionally served under `letters/2021/originals/` on explicit viewer request. Project linkage is stored in ignored `.vercel/project.json`.

## Redeploy

With the Vercel CLI signed into the same account and this directory linked:

```sh
npm run build
node scripts/prepare-vercel.mjs
vercel deploy --prebuilt --prod --yes --scope prawal-sharma-s-projects
```

For a fresh checkout, link it first with:

```sh
vercel link --yes --scope prawal-sharma-s-projects --project praashi-custom
```

The packaging script copies only `dist/` into `.vercel/output/static` and generates the Build Output API configuration. Root `vercel.json` also records the Vite build settings. The service worker is served with `no-cache, no-store, must-revalidate`; all static responses include `X-Robots-Tag: noindex, nofollow`. These headers do not add authentication to the static site.

## Live verification

- Root, manifest, service worker, sample WebP, Apple icon and monogram: HTTP 200 with correct content types.
- Original-photo path and application source path: HTTP 404.
- Touch-enabled mobile WebKit at 390×844: opening photo decoded, original letter text verified, 20-photo gallery, full-screen viewer, photo navigation and collection focus restoration passed; the staged ending fit the viewport with no console/page errors.
- “Where It All Began”, its featured excerpt, the chronological ten-letter archive, original screenshot decoding and the bridge to the existing heart interaction passed on the live deployment.
- The final release's updated caption, note-focused view, complete-original PNG toggle, fresh opening without returning-visitor messaging and all three finale promise clauses passed. A live original PNG matches the source bytes and SHA-256 hash.
- Production service worker registered; the app and letter remained usable after switching the browser offline.
- Local production build, typecheck and lint passed. The complete browser suite reports 103 passed and 3 WebKit capability-specific skips, recorded in RELEASE-READY.md. Live HTML, service-worker and sample WebP/PNG contents match the approved build.

This is a public static deployment, including the letter excerpts, optimized screenshot copies and complete original PNGs. Publication was explicitly requested after the privacy notice. Noindex headers and Safari Private Browsing are not access controls. Existing hosting access settings were retained; no client-only password was introduced.

On an iPhone, open the production URL in Safari and choose **Share → Add to Home Screen → Open as Web App → Add**. Physical-device verification is still distinct from the automated WebKit check.

## Latest release, 2 November 2026

Commit `d0b7343` (swipe fix) followed `df625f3` (smooth mute fade) and `f45cb37`, each deployed on the owner's approval. All 103 live files match the local build byte for byte. Live checks in WebKit and Chromium (390×664, emulated): a fresh visitor's full guided run through all seven chapters, music on, restored greetings, unlocks, three-clause ending, service worker control, no errors or third-party requests. The soundtrack answers range requests (HTTP 206) and hashed assets are served immutable.

Previous production deployment for rollback: `praashi-custom-5msusisox-prawal-sharma-s-projects.vercel.app`. Devices that opened the earlier build get one more stale open before updating. Physical iPhone verification is still outstanding.
