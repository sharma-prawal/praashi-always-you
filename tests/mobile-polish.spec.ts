import { test, expect, type Page } from '@playwright/test';
import originalLetter from './fixtures/original-letter.json' with { type: 'json' };

async function chapter(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}

test('leaving a long letter resets scroll and focuses the incoming scene', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Read my promise', exact: true }).click();
  await expect(page.locator('.letter-paper')).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: 'Every tomorrow', exact: true }).click();
  const heading = page.getByRole('heading', { name: "I'll choose you. Always." });
  await expect(heading).toBeFocused();
  await expect(page.locator('.scene')).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.scene')).toHaveCount(1);
  await expect(page.locator('.scene')).toHaveCSS('transform', 'none');
  const replay = await page.getByRole('button', { name: 'Experience again' }).boundingBox();
  expect(replay!.y + replay!.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: `test-results/polished-ending-${test.info().project.name}.png`, fullPage: true });
});

test('resume remembers the last visited chapter and replay clears that bookmark', async ({ page }) => {
  await page.goto('/');
  await chapter(page, 'Through it all');
  await expect(page.getByRole('heading', { name: 'Through it all.' })).toBeVisible();
  await chapter(page, 'Little things');
  await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to our little world' }).click();
  await expect(page.getByRole('button', { name: /Welcome back/ })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  await chapter(page, 'Every tomorrow');
  await page.getByRole('button', { name: 'Experience again' }).click();
  await expect(page.getByRole('button', { name: 'Open our little world', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /Welcome back/ })).toHaveCount(0);
});

test('a visible-window blur cancels a hold without revealing the letter', async ({ page }) => {
  await page.goto('/');
  await chapter(page, 'My promise');
  const heart = page.getByRole('button', { name: 'Hold for two seconds to open my promise' });
  await heart.hover(); await page.mouse.down();
  await expect(page.locator('.hold-heart')).toHaveClass(/is-holding/);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.hold-heart')).not.toHaveClass(/is-holding/);
  await page.waitForTimeout(2100);
  await page.mouse.up();
  await expect(page.locator('.letter-paper')).toHaveCount(0);
});

test('the exact original letter is readable and its controls stay reachable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Read my promise', exact: true }).click();
  await expect(page.getByRole('heading', { name: originalLetter.title })).toBeFocused();
  await expect(page.locator('.letter-paper')).toHaveCSS('opacity', '1');
  expect((await page.locator('.letter-paper > p').allTextContents()).slice(0, -1)).toEqual(originalLetter.paragraphs);
  expect(await page.locator('.signature').innerText()).toBe(originalLetter.signoff.join('\n'));
  expect(await page.locator('.letter-paper > p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  await page.evaluate(() => window.scrollTo(0, 950));
  await expect(page.getByRole('button', { name: 'Open our photos', exact: true })).toBeInViewport();
  const header = await page.locator('.app-header').boundingBox();
  expect(header!.y).toBe(0);
  await expect(page.locator('.star').first()).toHaveCSS('animation-play-state', 'paused');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.screenshot({ path: `test-results/polished-letter-scroll-${test.info().project.name}.png` });
});

test('gallery preserves the grid position, original reading position and focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Read my promise', exact: true }).click();
  await expect(page.locator('.letter-paper')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 700));
  const scrollBefore = await page.evaluate(() => scrollY);
  const opener = page.getByRole('button', { name: 'Open our photos', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog');
  const box = await dialog.boundingBox();
  await page.mouse.click(box!.x + 4, box!.y + 90);
  await expect(dialog).toBeVisible();
  await page.locator('.gallery-grid button').last().click();
  await expect(page.locator('.lightbox')).toBeVisible();
  expect(await dialog.evaluate(el => el.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Back to all photos' }).click();
  await expect(page.locator('.gallery-grid button').last()).toBeFocused();
  expect(await dialog.evaluate(el => el.scrollTop)).toBeGreaterThan(300);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  expect(await page.locator('body').evaluate(el => el.style.position)).toBe('');
});

test('muting while audio startup is pending cannot leave sound running', async ({ page }) => {
  await page.addInitScript(() => {
    const Original = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.assign(window, { auditContexts: contexts });
    window.AudioContext = class extends Original {
      constructor() { super(); contexts.push(this); }
      async resume() { await super.resume(); await new Promise(resolve => setTimeout(resolve, 160)); }
    };
  });
  await page.goto('/');
  const audio = page.locator('.audio-button');
  await audio.click();
  await expect(audio).toHaveAttribute('aria-busy', 'true');
  await audio.click();
  await expect(audio).toHaveAttribute('aria-busy', 'false');
  await expect(audio).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => (window as unknown as { auditContexts: AudioContext[] }).auditContexts[0]?.state)).toBe('suspended');
  expect(await page.evaluate(() => (window as unknown as { auditContexts: AudioContext[] }).auditContexts.length)).toBe(1);
  await audio.click();
  await expect(audio).toHaveAttribute('aria-busy', 'true');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as { auditContexts: AudioContext[] }).auditContexts[0]?.state)).toBe('suspended');
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(audio).toHaveAttribute('aria-pressed', 'false');
});

test.describe('image network recovery', () => {
  test.use({ serviceWorkers: 'block' });
  test('failed photographs recover after reconnecting and do not poison a new frame', async ({ page }) => {
    await page.route('**/photos/photo-02*', route => route.abort());
    await page.goto('/');
    await chapter(page, 'Little things');
    await expect(page.locator('.back-one .photo-unavailable')).toBeVisible();
    await page.getByRole('button', { name: 'Next memory', exact: true }).click();
    await expect.poll(() => page.locator('.back-one img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.memory-frame .photo-unavailable')).toBeVisible();
    await page.unroute('**/photos/photo-02*');
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect.poll(() => page.locator('.memory-frame img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.memory-frame img')).toHaveCSS('object-fit', 'contain');
  });
});

test.describe('touch-enabled mobile rendering', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  test('browser touch taps navigate, a short heart tap cancels, and the tap alternative works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open our little world', exact: true }).tap();
    await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
    await page.getByRole('button', { name: 'Next memory', exact: true }).tap();
    await expect(page.locator('.memory-frame figcaption').last()).toHaveText('Some people become home.');
    await page.getByRole('navigation').getByRole('button', { name: 'My promise', exact: true }).tap();
    await page.getByRole('button', { name: 'Hold for two seconds to open my promise' }).tap();
    await expect(page.locator('.hold-heart')).not.toHaveClass(/is-holding/);
    await page.getByRole('button', { name: 'Or tap to read my promise' }).tap();
    await expect(page.getByRole('heading', { name: originalLetter.title })).toBeFocused();
  });

  test('a synthesized touch swipe still works with reduced motion', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Playwright exposes touch movement through CDP only; WebKit touch taps are tested separately.');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await chapter(page, 'Little things');
    await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
    const frame = page.locator('.memory-frame').last();
    const box = await frame.boundingBox();
    const x = box!.x + box!.width * 0.7;
    const y = box!.y + box!.height * 0.5;
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 14, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.memory-frame figcaption').last()).toHaveText('Some people become home.');
    await cdp.detach();
  });
});


test('rapid photo navigation settles on one fully visible photograph', async ({ page }) => {
  await page.goto('/');
  await chapter(page, 'Little things');
  await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  for (let i = 0; i < 16; i++) await page.getByRole('button', { name: 'Next memory', exact: true }).click();
  await expect(page.locator('.memory-frame')).toHaveCount(1);
  await expect(page.locator('.memory-frame')).toHaveCSS('opacity', '1');
  await expect(page.locator('.memory-frame figcaption')).toHaveText('Some moments become memories.');
});
