import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { letters } from '../src/lib/letters';
import content from '../src/data/content.json' with { type: 'json' };

async function chapter(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
  await expect(page.locator('.scene')).toHaveCSS('opacity', '1');
}
async function archive(page: Page) {
  await page.getByRole('button', { name: 'Explore all 10 letters' }).click();
  await expect(page.locator('.letters-dialog')).toBeVisible();
}

for (const size of [{ width: 320, height: 460 }, { width: 375, height: 560 }, { width: 390, height: 640 }, { width: 430, height: 740 }]) {
  test(`all seven chapters and modals clear expanded Safari model at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('/');
    await page.addStyleTag({ content: ':root { --safe-top: 47px; --safe-bottom: 34px; }' });
    for (const [index, name] of content.chapters.entries()) {
      await chapter(page, name);
      for (const button of await page.getByRole('navigation').getByRole('button').all()) {
        const bounds = await button.boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      const back = await page.getByRole('button', { name: 'Previous chapter' }).boundingBox();
      expect(back!.y + back!.height).toBeLessThanOrEqual(size.height - 34);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(size.width);
      await page.screenshot({ path: `test-results/release-${size.width}-chapter-${index}-${test.info().project.name}.png` });
    }
    await page.getByRole('button', { name: 'Open our photos', exact: true }).click();
    const collection = await page.getByRole('dialog').boundingBox();
    expect(collection!.y).toBeGreaterThanOrEqual(47);
    expect(collection!.y + collection!.height).toBeLessThanOrEqual(size.height - 34);
    await page.locator('.gallery-grid button').first().click();
    const next = await page.getByRole('button', { name: 'Next photo' }).boundingBox();
    expect(next!.y + next!.height).toBeLessThanOrEqual(size.height - 34);
    await page.getByRole('button', { name: 'Close gallery' }).click();
    await chapter(page, 'Where It All Began'); await archive(page);
    await page.locator('.letter-timeline button').last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    await page.screenshot({ path: `test-results/release-note-${size.width}-${test.info().project.name}.png` });
    await page.getByRole('dialog').evaluate(el => el.scrollTo(0, el.scrollHeight));
    await expect(page.getByRole('button', { name: 'Close letters and return to the story' })).toBeInViewport();
    const close = await page.getByRole('button', { name: 'Close letters and return to the story' }).boundingBox();
    expect(close!.y).toBeGreaterThanOrEqual(47);
    const exit = await page.getByRole('button', { name: 'Return to our story', exact: true }).boundingBox();
    expect(exit!.y + exit!.height).toBeLessThanOrEqual(size.height - 34);
    await page.getByRole('button', { name: 'Return to our story', exact: true }).click();
    await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
    await expect(page.locator('.letter-paper')).toHaveCSS('opacity', '1');
    await page.getByRole('main').getByRole('button', { name: 'Every tomorrow', exact: true }).click();
    await expect(page.locator('.final-promise > span').last()).toHaveCSS('opacity', '1');
    expect(await page.locator('.final-promise > span').allTextContents()).toEqual([
      "I love you, and I'll always choose you,", 'through every high and low,', 'through all the thick and thin.',
    ]);
    await page.screenshot({ path: `test-results/release-finale-${size.width}-${test.info().project.name}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('note-focused reading omits embedded chrome and complete originals remain byte-identical', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await chapter(page, 'Where It All Began'); await archive(page);
  for (const [index, letter] of letters.entries()) {
    await page.locator(`[data-letter-index="${index}"]`).click();
    await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    const window = page.locator('.note-content-window');
    await expect(window).toHaveCSS('overflow', 'hidden');
    const frame = await window.boundingBox(), image = await window.locator('img').boundingBox();
    expect(image!.y).toBeLessThan(frame!.y - 100);
    expect(image!.y + image!.height).toBeGreaterThan(frame!.y + frame!.height);
    await window.screenshot({ path: `test-results/release-note-${letter.date}-${test.info().project.name}.png` });
    await page.getByRole('button', { name: 'See the whole page', exact: true }).click();
    await expect(page.locator('.original-letter')).toHaveAttribute('data-complete', 'true');
    await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
    expect(await page.locator('.complete-screenshot img').evaluate((image: HTMLImageElement) => new URL(image.src).pathname)).toBe(`/${letter.originalImage}`);
    const response = await page.request.get(`/${letter.originalImage}`);
    expect(response.ok()).toBe(true);
    expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(letter.sourceSha256);
    // The input package is deliberately untracked, so a fresh clone checks the stored hash alone.
    if (existsSync(`letters/2021/${letter.date}.png`)) expect((await readFile(`public/${letter.originalImage}`)).equals(await readFile(`letters/2021/${letter.date}.png`))).toBe(true);
    await page.getByRole('button', { name: 'Back to the note', exact: true }).click();
    await expect(page.locator('.note-content-window')).toBeVisible();
    await page.getByRole('button', { name: 'Back to excerpt', exact: true }).click();
    await page.getByRole('button', { name: 'Back to all letters', exact: true }).click();
  }
});

test('letters restore across reload and archive reopening; replay clears the saved capsule', async ({ page }) => {
  await page.goto('/'); await chapter(page, 'Where It All Began');
  await page.getByRole('button', { name: 'Next featured letter' }).click();
  await page.getByRole('button', { name: 'Open letter from 17 September 2021' }).click();
  await expect(page.getByText('A little piece of my heart, from 2021.', { exact: true })).toBeVisible();
  await archive(page);
  await page.locator('.letter-timeline button').last().scrollIntoViewIfNeeded();
  const position = await page.getByRole('dialog').evaluate(el => el.scrollTop);
  await page.getByRole('button', { name: 'Close letters and return to the story' }).click();
  await archive(page);
  await expect.poll(() => page.getByRole('dialog').evaluate(el => el.scrollTop)).toBe(position);
  await page.keyboard.press('Escape');
  await page.reload(); await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.locator('.capsule-paper blockquote')).toHaveText(letters[6].excerpt);
  await page.getByRole('button', { name: 'From then to always' }).click();
  await page.reload(); await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.getByRole('button', { name: 'Open my promise', exact: true })).toBeVisible();
  await chapter(page, 'Every tomorrow'); await page.getByRole('button', { name: 'Experience again' }).click();
  await page.reload(); await chapter(page, 'Where It All Began');
  await expect(page.getByRole('button', { name: 'Open letter from 5 April 2021' })).toBeVisible();
});

test('fresh QR-style arrivals always begin with the invitation and no returning-visitor message', async ({ page, context }) => {
  for (const path of ['/', '/?utm_source=qr']) {
    await context.clearCookies(); await page.goto(path);
    await page.evaluate(() => localStorage.clear()); await page.reload();
    await expect(page.getByRole('heading', { name: 'Nikki, I made you something.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Welcome back/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open our little world', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
  }
});

test('visible viewport resizing drives modals without reflowing a native pinch zoom', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const dimensions = { height: 640, offsetTop: 0, scale: 1 };
    Object.assign(window, { auditViewport: dimensions });
    for (const key of ['height', 'offsetTop', 'scale'] as const) Object.defineProperty(visualViewport, key, { configurable: true, get: () => dimensions[key] });
  });
  await page.goto('/'); await chapter(page, 'Where It All Began'); await archive(page);
  expect((await page.getByRole('dialog').boundingBox())!.height).toBe(640);
  await page.evaluate(() => {
    Object.assign((window as unknown as { auditViewport: object }).auditViewport, { height: 320, scale: 2 });
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByRole('dialog')).toHaveCSS('height', '640px');
  await page.evaluate(() => {
    Object.assign((window as unknown as { auditViewport: object }).auditViewport, { height: 530, offsetTop: 12, scale: 1 });
    visualViewport!.dispatchEvent(new Event('resize'));
  });
  await expect(page.getByRole('dialog')).toHaveCSS('height', '530px');
  expect((await page.getByRole('dialog').boundingBox())!.y).toBe(12);
});
