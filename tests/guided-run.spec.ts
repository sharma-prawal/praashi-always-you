import { test, expect, type Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

const main = (page: Page) => page.getByRole('main');
const next = (page: Page, name: string) => main(page).getByRole('button', { name, exact: true });
const gallery = (page: Page) => page.getByRole('button', { name: 'Open our photos', exact: true });
const promise = (page: Page) => page.getByRole('button', { name: 'Go straight to my promise', exact: true });
const dot = (page: Page, name: string) => page.getByRole('navigation').getByRole('button', { name, exact: true });

async function memories(page: Page) {
  await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
  await expect(next(page, 'A sky full of us')).toBeDisabled();
  for (let i = 0; i < 7; i++) await page.getByRole('button', { name: 'Next memory' }).click();
  await expect(next(page, 'A sky full of us')).toBeEnabled();
  await next(page, 'A sky full of us').click();
}
async function stars(page: Page) {
  await expect(next(page, 'Through every kind of day')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Browse our photos' })).toHaveCount(0);
  for (let i = 0; i < 7; i++) {
    await expect(next(page, 'Through every kind of day')).toBeDisabled();
    await expect(gallery(page)).toBeDisabled();
    await page.locator('.memory-star').nth(i).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    if (i < 6) {
      await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Back to all photos' })).toHaveCount(0);
    }
    await page.getByRole('button', { name: 'Close gallery' }).click();
  }
  await expect(next(page, 'Through every kind of day')).toBeEnabled();
  await expect(gallery(page)).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Browse our photos' })).toBeVisible();
  await expect(promise(page)).toBeDisabled();
  await next(page, 'Through every kind of day').click();
}
async function weather(page: Page) {
  await expect(next(page, 'Where it all began')).toBeDisabled();
  await page.getByRole('slider').fill('50');
  await expect(next(page, 'Where it all began')).toBeDisabled();
  await page.getByRole('button', { name: 'Read the next thought' }).click();
  await expect(next(page, 'Where it all began')).toBeEnabled();
  await next(page, 'Where it all began').click();
}
async function letters(page: Page) {
  const onward = next(page, 'From then to always');
  await expect(onward).toBeDisabled();
  for (const date of ['5 April 2021', '17 September 2021', '30 November 2021']) {
    await expect(onward).toBeDisabled();
    await page.getByRole('button', { name: `Open letter from ${date}` }).click();
    await expect(page.locator('.capsule-paper')).toBeVisible();
    await page.getByRole('button', { name: 'Fold it away' }).click();
    await page.getByRole('button', { name: 'Next featured letter' }).click();
  }
  await expect(onward).toBeEnabled();
  await onward.click();
  await next(page, 'Open my promise').click();
}

test('a first visit is guided and locked until the story is complete', async ({ page }) => {
  await page.goto('/');
  await expect(gallery(page)).toBeDisabled();
  await expect(promise(page)).toBeDisabled();
  await expect(dot(page, 'Little things')).toBeDisabled();
  await expect(dot(page, 'Every tomorrow')).toBeDisabled();
  await memories(page);
  await expect(dot(page, 'Through it all')).toBeDisabled();
  await stars(page);
  await weather(page);
  await letters(page);
  await expect(gallery(page)).toBeEnabled();
  await expect(promise(page)).toBeDisabled();
  await expect(dot(page, 'Every tomorrow')).toBeDisabled();
  await page.getByRole('button', { name: 'Or tap to read my promise' }).click();
  await expect(page.locator('.letter-paper')).toBeVisible();
  await expect(promise(page)).toBeDisabled();
  await next(page, 'Every tomorrow').click();
  await expect(page.getByRole('heading', { name: "I'll choose you. Always." })).toBeVisible();
  await expect(gallery(page)).toBeEnabled(); await expect(promise(page)).toBeEnabled();
  await page.reload();
  await expect(gallery(page)).toBeEnabled(); await expect(promise(page)).toBeEnabled();
  await expect(dot(page, 'Every tomorrow')).toBeEnabled();
  await dot(page, 'Every tomorrow').click();
  await page.getByRole('button', { name: 'Experience again' }).click();
  await expect(gallery(page)).toBeEnabled(); await expect(promise(page)).toBeEnabled();
  await dot(page, 'Where It All Began').click();
  await expect(next(page, 'From then to always')).toBeEnabled();
});

test('going back keeps earlier chapters open and progress survives a reload', async ({ page }) => {
  await page.goto('/');
  await memories(page);
  await page.locator('.memory-star').nth(0).click();
  await page.getByRole('button', { name: 'Close gallery' }).click();
  await page.getByRole('button', { name: 'Previous chapter' }).click();
  await expect(next(page, 'A sky full of us')).toBeEnabled();
  await page.reload();
  await expect(gallery(page)).toBeDisabled();
  await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(next(page, 'A sky full of us')).toBeEnabled();
  await expect(dot(page, 'Our constellation')).toBeEnabled();
  await expect(dot(page, 'Through it all')).toBeDisabled();
  await next(page, 'A sky full of us').click();
  await expect(page.getByText('1 of 7 little moments revisited')).toBeVisible();
  await expect(next(page, 'Through every kind of day')).toBeDisabled();
});

for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 664 }, { width: 430, height: 932 }]) {
  test.describe(`touch run at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, hasTouch: true });
    test('first run completes with tappable controls and no overflow', async ({ page }) => {
      await page.goto('/');
      await memories(page); await stars(page); await weather(page); await letters(page);
      await expect(page.getByRole('heading', { name: 'My promise to you.' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  });
}
