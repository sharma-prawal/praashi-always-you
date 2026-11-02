import { test, expect, type Page } from '@playwright/test';
import photos from '../src/data/photos.json' with { type: 'json' };
import originalLetter from './fixtures/original-letter.json' with { type: 'json' };
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

async function chapter(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}
async function openViewer(page: Page) {
  await page.getByRole('button', { name: 'Open our photos', exact: true }).click();
  await page.locator('.gallery-grid button').first().click();
  await expect(page.locator('.lightbox img')).toHaveCSS('opacity', '1');
}

test('collection uses natural photograph ratios and distinct close/back actions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open our photos', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close gallery', exact: true })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Back to all photos' })).toHaveCount(0);
  for (let i = 0; i < photos.length; i++) {
    const button = page.locator('.gallery-grid button').nth(i);
    const photoIndex = Number(await button.getAttribute('data-photo-index'));
    const frame = button.locator('picture');
    const box = await frame.boundingBox();
    expect(Math.abs(box!.width / box!.height - photos[photoIndex].width / photos[photoIndex].height)).toBeLessThan(0.015);
    await expect(frame.locator('img')).toHaveCSS('object-fit', 'contain');
  }
  await page.locator('.gallery-grid button').first().click();
  await expect(page.getByRole('button', { name: 'Back to all photos' })).toBeVisible();
  const bounds = await page.getByRole('dialog').boundingBox();
  expect(bounds).toEqual({ x: 0, y: 0, width: 390, height: 844 });
  await page.getByRole('button', { name: 'Back to all photos' }).click();
  await expect(page.locator('.gallery-grid button').first()).toBeFocused();
});

for (const model of [
  { name: 'expanded Safari-style chrome', height: 640, top: 47, bottom: 34 },
  { name: 'standalone PWA safe areas', height: 844, top: 47, bottom: 34 },
]) {
  test(`modeled ${model.name} keeps viewer controls clear and resizes safely`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: model.height });
    await page.goto('/');
    // Explicit safe-area proxies: this is a layout model, not physical Safari chrome.
    await page.addStyleTag({ content: `:root { --safe-top: ${model.top}px; --safe-bottom: ${model.bottom}px; }` });
    await openViewer(page);
    const close = await page.getByRole('button', { name: 'Close gallery' }).boundingBox();
    const next = await page.getByRole('button', { name: 'Next photo' }).boundingBox();
    expect(close!.y).toBeGreaterThanOrEqual(model.top);
    expect(next!.y + next!.height).toBeLessThanOrEqual(model.height - model.bottom);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await page.screenshot({ path: `test-results/${model.height}-safe-viewer-${test.info().project.name}.png` });
    await page.setViewportSize({ width: 390, height: model.height === 640 ? 844 : 640 });
    await expect.poll(async () => (await page.getByRole('dialog').boundingBox())!.height).toBe(model.height === 640 ? 844 : 640);
    await page.getByRole('button', { name: 'Close gallery' }).click();
    await expect.poll(() => page.locator('body').evaluate(el => el.style.position)).toBe('');
    await page.locator('.promise-shortcut').click();
    await expect(page.getByRole('heading', { name: originalLetter.title })).toBeFocused();
    await page.getByRole('main').getByRole('button', { name: 'Every tomorrow', exact: true }).click();
    await expect(page.getByRole('heading', { name: "I'll choose you. Always." })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
}

for (const width of [320, 390, 430]) {
  test(`constellation targets and labels remain separate at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/'); await chapter(page, 'Our constellation');
    await expect(page.getByRole('heading', { name: "The moments I'd choose again." })).toBeVisible();
    const buttons = page.locator('.memory-star');
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(56);
      expect(box!.height).toBeGreaterThanOrEqual(56);
    }
    const labels = await page.locator('.star-label').evaluateAll(elements => elements.map(el => {
      const box = el.getBoundingClientRect();
      return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
    }));
    for (let i = 0; i < labels.length; i++) {
      expect(labels[i].x).toBeGreaterThanOrEqual(0);
      expect(labels[i].right).toBeLessThanOrEqual(width);
      for (let j = i + 1; j < labels.length; j++) {
        const a = labels[i], b = labels[j];
        expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y).toBe(true);
      }
    }
    await buttons.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close gallery', exact: true }).click();
    await expect(buttons.first()).toBeFocused();
    await buttons.first().click();
    await expect(page.locator('.lightbox-controls > span')).toHaveText('9 / 23');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Browse our photos' }).click();
    await expect(page.locator('.gallery-grid button')).toHaveCount(23);
  });
}

test('Back follows all seven scenes and keyboard heart access preserves the letter', async ({ page }) => {
  await page.goto('/'); await chapter(page, 'Every tomorrow');
  const expected = ['My promise to you.', 'Where It All Began', 'Through it all.', "The moments I'd choose again.", 'All the little things.', 'Nikki, I made you something.'];
  for (const name of expected) {
    await page.getByRole('button', { name: 'Previous chapter' }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeFocused();
  }
  await expect(page.getByRole('button', { name: 'Previous chapter' })).toBeDisabled();
  await chapter(page, 'My promise');
  await page.getByRole('button', { name: 'Hold for two seconds to open my promise' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: originalLetter.title })).toBeFocused();
  expect((await page.locator('.letter-paper > p').allTextContents()).slice(0, -1)).toEqual(originalLetter.paragraphs);
  await expect(page.locator('.letter-emphasis')).toHaveCount(2);
});

test('reduced motion shows the settled ending and static constellation without hiding content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await chapter(page, 'Our constellation');
  await expect(page.locator('.memory-star').first()).toBeVisible();
  await expect(page.locator('.memory-star > svg').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.constellation-lines path')).toHaveCSS('animation-name', 'none');
  await chapter(page, 'Every tomorrow');
  await expect(page.locator('.final-promise > span').last()).toHaveCSS('opacity', '1');
  await expect(page.locator('.final-promise > span').last()).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Experience again' }).click();
  await expect(page.getByRole('button', { name: 'Open our little world', exact: true })).toBeVisible();
});

test('photo aspect metadata matches every existing optimized asset', async () => {
  for (const photo of photos) {
    const metadata = await sharp(await readFile(`public/${photo.small}`)).metadata();
    expect(Math.abs(metadata.width! / metadata.height! - photo.width / photo.height)).toBeLessThan(0.01);
  }
});

test.describe('viewer touch gestures', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  test('touch arrows and pointer swipes move in both directions with a bounded viewer', async ({ page }) => {
    await page.goto('/'); await openViewer(page);
    await page.getByRole('button', { name: 'Next photo' }).tap();
    await expect(page.locator('.lightbox-controls > span')).toHaveText('2 / 23');
    await expect(page.locator('.viewer-photo img')).toHaveAttribute('src', /photo-02/);
    await expect(page.locator('.photo-reveal')).toHaveCSS('opacity', '1');
    const box = await page.locator('.photo-viewport').boundingBox();
    await page.mouse.move(box!.x + box!.width * 0.35, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(page.locator('.lightbox-controls > span')).toHaveText('1 / 23');
    await expect(page.locator('.viewer-photo')).toHaveCount(1);
    await expect(page.locator('.viewer-photo')).toHaveCSS('opacity', '1');
    await expect(page.locator('.viewer-photo')).toHaveCSS('touch-action', 'pan-y pinch-zoom');
  });

  test('trusted gallery touch swipes work with reduced motion', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'CDP touch movement is Chromium-only; WebKit tap and pointer swipe paths are tested separately.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/'); await openViewer(page);
    const box = await page.locator('.photo-viewport').boundingBox();
    const x = box!.x + box!.width * 0.75, y = box!.y + box!.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 17, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.lightbox-controls > span')).toHaveText('2 / 23');
    await expect(page.locator('.viewer-photo img')).toHaveAttribute('src', /photo-02/);
    await cdp.detach();
  });
});
