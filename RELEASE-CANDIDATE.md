# Release candidate — 2 November 2026

**Deployed on the owner's approval, 2 November 2026,** after the owner listened to the soundtrack. See [DEPLOYMENT.md](DEPLOYMENT.md). Physical iPhone verification is still outstanding.

## What changed

- **Music:** real licensed piano soundtrack, one shared player, off until chosen. Licence record: [assets/licenses/MUSIC.md](assets/licenses/MUSIC.md).
- **2021 envelope:** redrawn as layered paper with a real flap, seal and note. Opens in about 1.1 s; reduced motion opens at once.
- **Greetings:** 28 August and 15 October restored from the screenshots, and their note views now include them. The 7 March view keeps "Yours 🤓".
- **Service worker:** page navigations are network-first with a 4 s fallback to the saved page. New workers take over without waiting. Open pages get a quiet "update is ready" note, never while reading, and never reload by themselves.
- **Opening:** seal clear of her name, Music on/off choice, opening button in the first view on small iPhones.
- **Wording:** "Welcome back" only on genuine return visits. Clinical letter captions replaced with warm ones.
- **Type:** readable text raised to at least 11 px; decorative marks remain smaller.
- **Layout:** compact phone layout is chosen from the smallest viewport, so Safari's toolbar cannot flip it mid-scroll.
- **Failure:** a kind retry message appears if the app cannot download.
- **Emotional light:** static scene-scoped gradients carry the mood from intimate to warm, leaving text, layout, photographs and modals unchanged. Comparison evidence is in `.cache/visual-qa/`.
- **Guided first run:** the header gallery and "Browse our photos" open once all seven stars are touched; the promise shortcut and unreached chapter dots stay disabled until the final chapter is reached. Next buttons wait for all 8 memories, 7 stars, 3 thoughts and 3 featured letters. Until the seventh star, stars open only their own photo. One complete run unlocks everything permanently, including after "Experience again".

The final promise, final letter, photographs, excerpts, dates and images are unchanged. Compare with the `baseline-audit` git tag.

## Verification

Lint, typecheck and build pass. `npm test`: **183 passed, 3 skipped, 0 failed** (Chromium 93 passed; WebKit 90 passed, 3 skipped). The skips are the same Chromium-only touch-injection tests as before.

No physical iPhone has been used. The owner has listened to the soundtrack; the implementer only measured its levels, loop edges and output signal.

## Redeploy, once approved

```sh
npm run build
node scripts/prepare-vercel.mjs
vercel deploy --prebuilt --prod --yes --scope prawal-sharma-s-projects
```

Devices that already visited the earlier build get one more stale open, because the old worker is still in control until the new one installs. Test on cleared website data.
