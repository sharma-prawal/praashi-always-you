import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import manifest from '../letters-manifest.json' with { type: 'json' };
import { bridgeLines, featuredLetters, letterDate, letters } from '../src/lib/letters';
import originalPromise from './fixtures/original-letter.json' with { type: 'json' };

async function enter(page: Page) {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Where It All Began', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Where It All Began', exact: true })).toBeFocused();
}
async function collection(page: Page) {
  await page.getByRole('button', { name: 'Explore all 10 letters', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 844 }, { width: 430, height: 932 }, { width: 1440, height: 900 }]) {
  test(`time capsule journey and original screenshots at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [], remote: string[] = [], screenshots: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => {
      if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('data:')) remote.push(request.url());
      if (request.url().includes('/letters/2021/')) screenshots.push(request.url());
    });
    await enter(page);
    await expect(page.getByText('It started with a good morning.', { exact: true })).toBeVisible();
    await expect(page.locator('.time-envelope')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/time-capsule-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    for (let i = 0; i < 3; i++) {
      const letter = letters[featuredLetters[i]];
      await page.getByRole('button', { name: `Open letter from ${letterDate(letter.date)}`, exact: true }).click();
      await expect(page.locator('.capsule-paper blockquote')).toHaveText(letter.excerpt);
      await expect(page.locator('.capsule-paper')).toHaveCSS('opacity', '1');
      if (i === 0) await page.screenshot({ path: `test-results/time-capsule-open-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
      await page.getByRole('button', { name: 'Next featured letter', exact: true }).click();
    }
    expect(screenshots).toHaveLength(0);
    const opener = page.getByRole('button', { name: 'Explore all 10 letters', exact: true });
    await opener.scrollIntoViewIfNeeded();
    const storyScroll = await page.evaluate(() => scrollY);
    await collection(page);
    await expect(page.locator('.letter-timeline button')).toHaveCount(10);
    expect(await page.locator('.letter-timeline time').evaluateAll(elements => elements.map(el => el.getAttribute('datetime')))).toEqual(letters.map(letter => letter.date));
    await page.screenshot({ path: `test-results/letters-collection-${viewport.width}-${test.info().project.name}.png` });
    const last = page.locator('.letter-timeline button').last();
    await last.click();
    await expect(page.locator('.archive-paper blockquote')).toHaveText(letters[9].excerpt);
    await expect(page.locator('.archive-paper')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/letter-excerpt-${viewport.width}-${test.info().project.name}.png` });
    await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.original-letter img')).toHaveAttribute('src', /2021-12-22.webp/);
    await page.screenshot({ path: `test-results/letter-original-${viewport.width}-${test.info().project.name}.png` });
    await page.getByRole('button', { name: 'Back to excerpt', exact: true }).click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Back to all letters', exact: true }).click();
    await expect(last).toBeFocused();
    expect(await page.getByRole('dialog').evaluate(el => el.scrollTop)).toBeGreaterThan(400);
    await page.keyboard.press('Escape');
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(storyScroll);
    await page.getByRole('button', { name: 'From then to always' }).click();
    for (const line of bridgeLines) await expect(page.getByText(line, { exact: true })).toBeVisible();
    await expect(page.locator('.bridge-words p').last()).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/letters-bridge-${viewport.width}-${test.info().project.name}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Open my promise', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My promise to you.' })).toBeFocused();
    await page.getByRole('button', { name: 'Or tap to read my promise' }).click();
    expect((await page.locator('.letter-paper > p').allTextContents()).slice(0, -1)).toEqual(originalPromise.paragraphs);
    expect(await page.locator('.signature').innerText()).toBe(originalPromise.signoff.join('\n'));
    await page.getByRole('main').getByRole('button', { name: 'Every tomorrow', exact: true }).click();
    await page.getByRole('button', { name: 'Experience again' }).click();
    await page.getByRole('navigation').getByRole('button', { name: 'Where It All Began', exact: true }).click();
    await expect(page.locator('.time-envelope')).toBeVisible();
    await expect(page.locator('.capsule-controls > span')).toHaveText('1 / 3 little beginnings');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]); expect(remote).toEqual([]);
  });
}

test('every dated excerpt is authentic and every lossless screenshot preserves source pixels', async () => {
  const audit = JSON.parse(await readFile('tests/fixtures/original-letters.json', 'utf8'));
  expect(letters).toHaveLength(10);
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i], source = manifest.letters[i];
    const png = await readFile(source.image);
    expect(createHash('sha256').update(png).digest('hex')).toBe(letter.sourceSha256);
    expect(letter.sourceSha256).toBe(audit[source.image]);
    expect(letter.isFullLetter).toBe(false);
    expect(letter.excerpt).toBe(letter.date === '2021-07-15' ? 'I love loving you, and nothing can change that.' : source.selectedExcerpt);
    const optimized = await readFile(`public/${letter.image}`);
    const [originalPixels, optimizedPixels] = await Promise.all([sharp(png).ensureAlpha().raw().toBuffer(), sharp(optimized).ensureAlpha().raw().toBuffer()]);
    expect(originalPixels.equals(optimizedPixels)).toBe(true);
    const metadata = await sharp(optimized).metadata();
    expect(metadata.exif).toBeUndefined(); expect(metadata.xmp).toBeUndefined();
  }
});

test('chapter revisits preserve opened envelopes and the optional collection returns to the same story', async ({ page, browserName }) => {
  await enter(page);
  await page.getByRole('button', { name: 'Next featured letter' }).click();
  await page.getByRole('button', { name: 'Open letter from 17 September 2021' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('article', { name: 'Excerpt from 17 September 2021', exact: true })).toBeFocused();
  // WebKit follows Safari's default setting: Option-Tab includes native buttons.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.locator('.capsule-paper').getByRole('button', { name: 'View original', exact: true })).toBeFocused();
  await collection(page);
  await page.getByRole('button', { name: 'Close letters and return to the story' }).click();
  await expect(page.locator('.capsule-paper blockquote')).toHaveText(letters[6].excerpt);
  await page.getByRole('navigation').getByRole('button', { name: 'Through it all', exact: true }).click();
  await page.getByRole('button', { name: 'Where it all began', exact: true }).click();
  await expect(page.locator('.capsule-paper blockquote')).toHaveText(letters[6].excerpt);
  await page.getByRole('button', { name: 'From then to always' }).click();
  await page.getByRole('button', { name: 'Back to the letters', exact: true }).click();
  await expect(page.locator('.capsule-paper blockquote')).toHaveText(letters[6].excerpt);
});

test.describe('legacy storage', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
test('legacy bookmarks migrate once and new seven-chapter bookmarks resume correctly', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('praashi-keepsake-v1')) localStorage.setItem('praashi-keepsake-v1', JSON.stringify({ scene: 4, letterRead: true, soundPreference: false }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.getByRole('heading', { name: originalPromise.title })).toBeFocused();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('praashi-keepsake-v1')!).scene)).toBe(5);
  await page.reload();
  await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.getByRole('heading', { name: originalPromise.title })).toBeFocused();
});
});

test('reduced motion keeps envelope, archive, exact bridge and promise immediately available offline', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await enter(page);
  await expect(page.locator('.time-envelope')).toHaveCSS('animation-name', 'none');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await page.getByRole('button', { name: /Welcome back/ }).click();
  await collection(page);
  await page.locator('.letter-timeline button').first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
  await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
  await expect.poll(() => page.evaluate(async () => Boolean(await caches.match(new URL('/letters/2021/2021-03-07.webp', location.href).href)))).toBe(true);
  expect(await page.evaluate(async () => Boolean(await caches.match(new URL('/letters/2021/2021-12-22.webp', location.href).href)))).toBe(false);
  await context.setOffline(true);
  await page.reload(); await page.getByRole('button', { name: /Welcome back/ }).click();
  await collection(page); await page.locator('.letter-timeline button').first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
  await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'From then to always' }).click();
  await expect(page.locator('.bridge-words p').last()).toHaveCSS('animation-name', 'none');
  await page.getByRole('button', { name: 'Open my promise' }).click();
  await expect(page.getByRole('button', { name: 'Hold for two seconds to open my promise' })).toBeVisible();
});

test.describe('letter screenshot failure', () => {
  test.use({ serviceWorkers: 'block' });
  test('an unavailable source image offers retry and preserves the excerpt', async ({ page }) => {
    await page.route('**/letters/2021/*.webp', route => route.abort());
    await enter(page); await collection(page); await page.locator('.letter-timeline button').first().click();
    await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
    await expect(page.getByText("This page couldn't open just now. My words are still here.")).toBeVisible();
    await page.unroute('**/letters/2021/*.webp'); await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    await page.getByRole('button', { name: 'Back to excerpt' }).click();
    await expect(page.locator('.archive-paper blockquote')).toHaveText(letters[0].excerpt);
  });
});

test.describe('mobile letters', () => {
  test.use({ viewport: { width: 390, height: 640 }, hasTouch: true, isMobile: true });
  test('touch opening and safe-area resizing preserve controls, scrolling and focus', async ({ page }) => {
    await enter(page);
    await page.addStyleTag({ content: ':root { --safe-top: 47px; --safe-bottom: 34px; }' });
    for (const button of await page.getByRole('navigation').getByRole('button').all()) {
      const box = await button.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Open letter from 5 April 2021' }).tap();
    await page.locator('.capsule-paper').getByRole('button', { name: 'View original', exact: true }).tap();
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    const close = page.getByRole('button', { name: 'Close letters and return to the story' });
    expect((await close.boundingBox())!.y).toBeGreaterThanOrEqual(47);
    await page.getByRole('dialog').evaluate(el => el.scrollTo(0, 450));
    await expect(close).toBeInViewport();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(async () => (await page.getByRole('dialog').boundingBox())!.height).toBe(844);
    await close.tap(); await expect(page.locator('.capsule-paper').getByRole('button', { name: 'View original', exact: true })).toBeFocused();
    expect(await page.locator('body').evaluate(el => el.style.position)).toBe('');
  });

  test('horizontal envelope swipes move between featured messages', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Trusted touch-move injection is available through Chromium CDP; WebKit touch opening is covered separately.');
    await page.emulateMedia({ reducedMotion: 'reduce' }); await enter(page);
    const box = await page.locator('.time-envelope').boundingBox();
    const x = box!.x + box!.width * 0.75, y = box!.y + box!.height / 2;
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - step * 16, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('button', { name: 'Open letter from 17 September 2021' })).toBeVisible();
    await expect(page.locator('.capsule-paper')).toHaveCount(0);
    await cdp.detach();
  });
});
