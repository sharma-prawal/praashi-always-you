import { test, expect, type Page } from '@playwright/test';
import content from '../src/data/content.json' with { type: 'json' };
import sharp from 'sharp';

const viewports = [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 393, height: 852 }, { width: 412, height: 915 }, { width: 430, height: 932 }, { width: 1440, height: 900 }];
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function artworkLoaded(page: Page) {
  await expect.poll(() => page.locator('img.decorative-art').evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
}
async function nextChapter(page: Page, label: string) {
  await page.getByRole('navigation', { name: 'Our seven chapters' }).getByRole('button', { name: label, exact: true }).click();
}
for (const viewport of viewports) {
  test(`complete experience at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const remoteRequests: string[] = [];
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('data:')) remoteRequests.push(request.url()); });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Nikki, I made you something.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    await artworkLoaded(page);
    await page.screenshot({ path: `test-results/cover-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await noOverflow(page);
    await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
    await page.getByRole('button', { name: 'Next memory', exact: true }).click();
    await expect(page.locator('.memory-frame figcaption').last()).toHaveText(content.moments[1]);
    for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Next memory', exact: true }).click();
    await expect(page.locator('.memory-frame figcaption').last()).toHaveText(content.moments[0]);
    await expect(page.locator('.memory-frame').last()).toHaveCSS('opacity', '1');
    await expect(page.locator('.memory-frame .photo-picture').last()).toHaveAttribute('data-loaded', 'true');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `test-results/memories-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await noOverflow(page);
    await page.getByRole('button', { name: 'A sky full of us' }).click();
    await expect(page.getByRole('heading', { name: "The moments I'd choose again." })).toBeVisible();
    await page.getByRole('button', { name: /Reveal star 1:/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.lightbox img')).toBeVisible();
    await page.getByRole('button', { name: 'Close gallery', exact: true }).click();
    await expect(page.getByText('1 of 7 little moments revisited')).toBeVisible();
    await page.screenshot({ path: `test-results/stars-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Through every kind of day' }).click();
    await expect(page.getByText(content.weather[0], { exact: true })).toBeVisible();
    await page.getByRole('slider').fill('50');
    await expect(page.getByText(content.weather[1], { exact: true })).toBeVisible();
    await page.getByRole('slider').fill('95');
    await expect(page.getByText(content.weather[2], { exact: true })).toBeVisible();
    await expect(page.locator('.weather-words > p')).toHaveCSS('opacity', '1');
    await artworkLoaded(page);
    await page.screenshot({ path: `test-results/weather-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await noOverflow(page);
    await page.getByRole('button', { name: 'Where it all began', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Where It All Began', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'From then to always' }).click();
    await page.getByRole('button', { name: 'Open my promise', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My promise to you.' })).toBeVisible();
    await expect(page.locator('.scene')).toHaveCSS('opacity', '1');
    await artworkLoaded(page);
    await page.screenshot({ path: `test-results/heart-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Or tap to read my promise' }).click();
    await expect(page.getByRole('heading', { name: content.letter.title })).toBeVisible();
    for (const paragraph of content.letter.paragraphs) await expect(page.getByText(paragraph, { exact: true })).toBeVisible();
    await expect(page.locator('.letter-paper')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/letter-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await noOverflow(page);
    await page.getByRole('main').getByRole('button', { name: 'Every tomorrow', exact: true }).click();
    await expect(page.getByRole('heading', { name: "I'll choose you. Always." })).toBeVisible();
    await page.getByRole('button', { name: 'Send a little love into our sky' }).click();
    await expect(page.locator('.love-burst > span')).toHaveCount(12);
    await expect(page.locator('.finale-photo').last()).toHaveCSS('opacity', '1');
    await expect(page.locator('.final-promise')).toHaveText(content.finalPromise);
    await artworkLoaded(page);
    await expect(page.locator('.final-promise > span').last()).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/finale-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Our photos', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.gallery-grid button')).toHaveCount(20);
    await expect(page.locator('.gallery-grid button').first().locator('img')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/collection-${viewport.width}-${test.info().project.name}.png` });
    await page.locator('.gallery-grid button').first().click();
    await expect(page.locator('.lightbox img')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/viewer-${viewport.width}-${test.info().project.name}.png` });
    await page.getByRole('button', { name: 'Next photo', exact: true }).click();
    await expect(page.locator('.lightbox-controls > span')).toHaveText('2 / 20');
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(page.getByRole('button', { name: /Welcome back/ })).toBeVisible();
    await page.getByRole('button', { name: /Welcome back/ }).click();
    await expect(page.getByRole('heading', { name: "I'll choose you. Always." })).toBeVisible();
    await page.getByRole('button', { name: 'Experience again' }).click();
    await expect(page.getByRole('button', { name: 'Open our little world', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    expect(remoteRequests).toEqual([]);
  });
}

test('hold cancellation, completion, keyboard access, and silent repeat visits', async ({ page }) => {
  await page.goto('/');
  await nextChapter(page, 'My promise');
  const heart = page.getByRole('button', { name: 'Hold for two seconds to open my promise' });
  await heart.hover(); await page.mouse.down(); await page.waitForTimeout(600); await page.mouse.up();
  await expect(page.getByRole('heading', { name: content.letter.title })).toHaveCount(0);
  await heart.hover(); await page.mouse.down();
  await expect(page.getByRole('heading', { name: content.letter.title })).toBeVisible({ timeout: 4000 });
  await page.mouse.up();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: content.letter.title })).toBeVisible();
});

test('reduced motion and keyboard weather', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('.star').first().evaluate(element => parseFloat(getComputedStyle(element).animationDuration))).toBeLessThan(0.01);
  await nextChapter(page, 'Through it all');
  const slider = page.getByRole('slider');
  await slider.focus(); await page.keyboard.press('End');
  await expect(slider).toHaveValue('100');
  await expect(page.getByText(content.weather[2], { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
  await expect(page.getByRole('heading', { name: content.letter.title })).toBeVisible();
});

test('photo loading, manifest, service worker and offline shell', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons) expect((await page.request.get(`/${icon.src}`)).ok()).toBe(true);
  expect(await page.locator('.opening-photo img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const cachedArtwork = await page.evaluate(async () => {
    const names = ['praashi-monogram', 'starfield', 'glowing-heart', 'light-trails', 'weather-sunlight', 'weather-rain', 'paper-texture'];
    return Promise.all(names.map(async name => Boolean((await caches.match(new URL(`assets/${name}.svg`, location.href).href))?.ok)));
  });
  expect(cachedArtwork).toEqual(Array(7).fill(true));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open our little world', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
  await expect(page.getByRole('heading', { name: content.letter.title })).toBeVisible();
  await context.setOffline(false);
});

test('touch targets, gallery focus, and no photograph metadata', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const controls = page.locator('button:visible');
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
  const opener = page.getByRole('button', { name: 'Open our photos', exact: true });
  await opener.click();
  await expect(page.getByRole('button', { name: 'Close gallery', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  const response = await page.request.get('/photos/photo-01-960.webp');
  expect(response.headers()['content-type']).toContain('image/webp');
  const metadata = await sharp(await response.body()).metadata();
  expect(metadata.exif).toBeUndefined();
  expect(metadata.xmp).toBeUndefined();
});

test('audio requires explicit consent and preference survives without autoplay', async ({ page }) => {
  await page.goto('/');
  const enable = page.getByRole('button', { name: 'Turn music on' });
  await expect(enable).toHaveAttribute('aria-pressed', 'false');
  await enable.click();
  await expect(page.getByRole('button', { name: 'Turn music off' })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('praashi-keepsake-v1') || '{}').soundPreference)).toBe(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('title', /resume/);
});

test('the story still opens when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage unavailable', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'SecurityError'); };
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  expect(errors).toEqual([]);
});
