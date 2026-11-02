import { test, expect, type Page } from '@playwright/test';
import http from 'node:http';
import { cp, mkdtemp, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { letters } from '../src/lib/letters';
import { storyPhotos } from '../src/lib/storyPhotos';
import photos from '../src/data/photos.json' with { type: 'json' };

const chapterButton = (page: Page, name: string) => page.getByRole('navigation').getByRole('button', { name, exact: true });
const greetings: Record<string, string> = {
  '2021-03-07': 'Dearest Nikku😇,', '2021-04-05': 'To meri Nikku❤️,', '2021-05-20': 'To my love Nikku❤️,', '2021-06-19': 'To my love Nikku❤️,', '2021-07-15': 'To my love Nikku❤️,',
  '2021-08-28': 'To my love Nikku❤️,', '2021-09-17': 'To my love Nikku❤️,', '2021-10-15': 'To my love Nikku❤️,', '2021-11-30': 'To my love Nikku❤️,', '2021-12-22': 'To my love Nikku❤️,',
};

test.describe('authentic greetings', () => {
  test('all ten greetings match the screenshots and note windows include them', async ({ page }) => {
    expect(Object.fromEntries(letters.map(letter => [letter.date, letter.greeting]))).toEqual(greetings);
    for (const letter of letters) expect(letter.readingWindow.top).toBe(520);
    await page.goto('/'); await chapterButton(page, 'Where It All Began').click();
    await page.getByRole('button', { name: 'Explore all 10 letters' }).click();
    for (const date of ['2021-08-28', '2021-10-15']) {
      await page.locator(`[data-letter-index="${letters.findIndex(letter => letter.date === date)}"]`).click();
      await expect(page.locator('.archive-paper .capsule-greeting')).toHaveText(greetings[date]);
      await page.getByRole('button', { name: 'Back to all letters' }).click();
    }
  });
});

for (const size of [{ width: 320, height: 568 }, { width: 375, height: 667 }, { width: 390, height: 664 }, { width: 390, height: 844 }, { width: 430, height: 932 }]) {
  test(`her name stays clear of the opening seal at ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size); await page.goto('/');
    const [seal, name] = await Promise.all([page.locator('.wax-seal').boundingBox(), page.locator('.envelope-address').boundingBox()]);
    expect(seal!.y + seal!.height).toBeLessThanOrEqual(name!.y + 2);
  });
}

for (const size of [{ width: 320, height: 568 }, { width: 375, height: 553 }, { width: 390, height: 664 }, { width: 393, height: 659 }, { width: 430, height: 739 }]) {
  test(`opening button is in the first view at Safari's ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size); await page.goto('/');
    const button = await page.getByRole('button', { name: 'Open our little world', exact: true }).boundingBox();
    expect(button!.y + button!.height).toBeLessThanOrEqual(size.height);
    expect((await page.locator('.envelope-front').boundingBox())!.y + 10).toBeLessThan((await page.locator('.opening-subtitle').boundingBox())!.y);
  });
}

test('welcome wording separates this session from a genuine return', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Welcome back|Continue our story/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
  await page.getByRole('button', { name: 'Previous chapter' }).click();
  await expect(page.getByRole('button', { name: /Continue our story/ })).toBeVisible();
  await expect(page.getByText(/Welcome back/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: /Welcome back/ })).toBeVisible();
  await page.getByRole('button', { name: /Welcome back/ }).click();
  await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  await page.getByRole('button', { name: 'Previous chapter' }).click();
  await expect(page.getByRole('button', { name: /Continue our story/ })).toBeVisible();
});

test('promise shortcut goes straight to the letter and keeps progress', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
  await expect(page.locator('.letter-paper')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go straight to my promise', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await page.getByRole('button', { name: 'Read my promise again' }).click();
  await expect(page.locator('.letter-paper')).toBeVisible();
});

test.describe('music', () => {
  const instrument = (page: Page, options: { reject?: boolean } = {}) => page.addInitScript(({ reject }) => {
    const state = { created: 0, plays: 0 };
    Object.assign(window, { musicAudit: state });
    const Original = window.Audio;
    window.Audio = function (src?: string) { state.created++; return new Original(src); } as unknown as typeof Audio;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { state.plays++; return reject ? Promise.reject(new DOMException('blocked', 'NotAllowedError')) : play.call(this); };
    const audio: HTMLMediaElement[] = [];
    Object.assign(window, { musicElements: audio });
    const add = HTMLMediaElement.prototype.addEventListener;
    HTMLMediaElement.prototype.addEventListener = function (...args: Parameters<typeof add>) { if (!audio.includes(this)) audio.push(this); return add.apply(this, args); };
  }, options);
  const audit = (page: Page) => page.evaluate(() => {
    const w = window as unknown as { musicAudit: { created: number; plays: number }; musicElements: HTMLMediaElement[] };
    return { ...w.musicAudit, playing: w.musicElements.filter(item => !item.paused).length, time: w.musicElements[0]?.currentTime ?? 0, count: w.musicElements.length };
  });
  const musicOn = (page: Page) => page.getByRole('button', { name: 'Music on', exact: true });

  test('nothing loads or plays until chosen, and opening without music stays silent', async ({ page }) => {
    await instrument(page);
    const requests: string[] = [];
    page.on('request', request => { if (request.url().includes('/audio/')) requests.push(request.url()); });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Music off', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
    expect(requests).toEqual([]);
    expect((await audit(page)).created).toBe(0);
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('one soundtrack plays continuously across chapters, mute and replay', async ({ page }) => {
    await instrument(page);
    await page.goto('/');
    await musicOn(page).click();
    await expect(page.getByRole('button', { name: 'Turn music off' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await audit(page)).time).toBeGreaterThan(0.2);
    await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
    let last = (await audit(page)).time;
    for (const name of ['Our constellation', 'Through it all', 'Where It All Began', 'My promise', 'Every tomorrow']) {
      await chapterButton(page, name).click();
      await page.waitForTimeout(250);
      const now = await audit(page);
      expect(now.time).toBeGreaterThan(last); expect(now.playing).toBe(1); expect(now.count).toBe(1);
      last = now.time;
    }
    await page.getByRole('button', { name: 'Experience again' }).click();
    expect((await audit(page)).time).toBeGreaterThanOrEqual(last);
    await page.getByRole('button', { name: 'Turn music off' }).click();
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(async () => (await audit(page)).playing).toBe(0);
    expect((await audit(page)).created).toBe(1);
    await page.getByRole('button', { name: 'Turn music on' }).click();
    await expect.poll(async () => (await audit(page)).playing).toBe(1);
    expect((await audit(page)).count).toBe(1);
  });

  test('real sound reaches the output and follows the chapter levels', async ({ page }) => {
    await page.addInitScript(() => {
      const connect = GainNode.prototype.connect as (...args: unknown[]) => unknown;
      GainNode.prototype.connect = function (this: GainNode, ...args: unknown[]) {
        if (args[0] === this.context.destination) {
          const analyser = this.context.createAnalyser(); analyser.fftSize = 2048; connect.call(this, analyser);
          Object.assign(window, { musicTap: analyser, musicGain: this });
        }
        return connect.apply(this, args);
      } as typeof GainNode.prototype.connect;
    });
    await page.goto('/'); await page.getByRole('button', { name: 'Music on', exact: true }).click();
    const loudness = () => page.evaluate(() => { const analyser = (window as unknown as { musicTap: AnalyserNode }).musicTap; const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data); return Math.max(...data.map(Math.abs)); });
    const gain = () => page.evaluate(() => (window as unknown as { musicGain: GainNode }).musicGain.gain.value);
    await expect.poll(loudness, { timeout: 12000 }).toBeGreaterThan(0.002);
    await chapterButton(page, 'Every tomorrow').click();
    await expect.poll(gain, { timeout: 12000 }).toBeGreaterThan(0.62);
    await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
    await expect.poll(gain, { timeout: 12000 }).toBeLessThan(0.3);
    expect(await gain()).toBeGreaterThan(0.1);
  });

  for (const [control, from] of [['Turn music off', 'the header icon'], ['Music off', 'the opening choice']] as const) {
    test(`muting from ${from} fades smoothly with no surge`, async ({ page }) => {
      await page.addInitScript(() => {
        const connect = GainNode.prototype.connect as (...args: unknown[]) => unknown;
        GainNode.prototype.connect = function (this: GainNode, ...args: unknown[]) {
          if (args[0] === this.context.destination) Object.assign(window, { musicGain: this });
          return connect.apply(this, args);
        } as typeof GainNode.prototype.connect;
      });
      await page.goto('/'); await musicOn(page).click();
      const gain = () => page.evaluate(() => (window as unknown as { musicGain: GainNode }).musicGain.gain.value);
      await expect.poll(gain, { timeout: 12000 }).toBeGreaterThan(0.45);
      const start = await gain();
      const trace = page.evaluate(() => new Promise<number[]>(resolve => {
        const values: number[] = [], begun = performance.now();
        const sample = () => { values.push((window as unknown as { musicGain: GainNode }).musicGain.gain.value); if (performance.now() - begun < 520) setTimeout(sample, 30); else resolve(values); };
        sample();
      }));
      await page.getByRole('button', { name: control, exact: true }).click();
      const values = await trace;
      expect(Math.max(...values)).toBeLessThan(start + 0.05);
      expect(values[values.length - 1]).toBeLessThan(start * 0.2);
      await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    });
  }

  test('a saved preference waits for the tap that opens the story', async ({ page }) => {
    await instrument(page);
    await page.goto('/'); await musicOn(page).click();
    await expect(page.getByRole('button', { name: 'Turn music off' })).toBeVisible();
    await page.reload();
    expect((await audit(page)).plays).toBe(0);
    await expect(musicOn(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Turn music off' })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(async () => (await audit(page)).playing).toBe(1);
  });

  test('hiding the page pauses and returning resumes', async ({ page }) => {
    await instrument(page);
    await page.goto('/'); await musicOn(page).click();
    await expect.poll(async () => (await audit(page)).playing).toBe(1);
    const visibility = (hidden: boolean) => page.evaluate(value => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => value }); document.dispatchEvent(new Event('visibilitychange')); }, hidden);
    await visibility(true);
    await expect.poll(async () => (await audit(page)).playing).toBe(0);
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    await visibility(false);
    await expect.poll(async () => (await audit(page)).playing).toBe(1);
    await expect(page.getByRole('button', { name: 'Turn music off' })).toHaveAttribute('aria-pressed', 'true');
    expect((await audit(page)).count).toBe(1);
  });

  test('a refused start never pretends to play and never blocks the story', async ({ page }) => {
    await instrument(page, { reject: true });
    await page.goto('/'); await musicOn(page).click();
    await expect(page.getByText("The music couldn't start. You can try again.")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn music on' })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Open our little world', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'All the little things.' })).toBeVisible();
  });

  test('the soundtrack is local, valid and credited', async ({ page }) => {
    const info = await stat('public/audio/always-you-soft-piano.mp3');
    expect(info.size).toBeGreaterThan(1_000_000); expect(info.size).toBeLessThan(6_000_000);
    expect((await readFile('assets/licenses/MUSIC.md', 'utf8'))).toContain('CC BY-NC 4.0');
    await page.goto('/'); await chapterButton(page, 'Every tomorrow').click();
    await page.getByText('Music', { exact: true }).click();
    await expect(page.getByRole('link', { name: 'CC BY-NC 4.0' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Echoes of Embrace' })).toBeVisible();
  });
});

test.describe('2021 envelope', () => {
  test.use({ viewport: { width: 390, height: 664 } });
  async function enter(page: Page) {
    await page.goto('/'); await chapterButton(page, 'Where It All Began').click();
    await expect(page.locator('.time-envelope')).toBeVisible();
  }

  test('opens once through its sequence, keeps layout steady, and folds away', async ({ page }) => {
    await enter(page);
    const envelope = page.getByRole('button', { name: 'Open letter from 5 April 2021' });
    await envelope.scrollIntoViewIfNeeded();
    const scroll = await page.evaluate(() => scrollY);
    await envelope.click();
    await expect(page.locator('.time-envelope')).toHaveAttribute('data-phase', 'opening');
    await page.locator('.env-body').click({ force: true, timeout: 1000 }).catch(() => undefined);
    await expect(page.locator('.capsule-paper blockquote')).toHaveText(letters[1].excerpt);
    await expect(page.locator('.capsule-paper')).toHaveCount(1);
    await expect(page.locator('.time-envelope')).toHaveCount(0);
    await expect(page.locator('.capsule-paper')).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(scroll);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('praashi-keepsake-v1')!).capsule.opened)).toEqual([1]);
    await page.getByRole('button', { name: 'Fold it away' }).click();
    await expect(page.getByRole('button', { name: 'Open letter from 5 April 2021' })).toBeFocused();
  });

  test('changing letters during the animation cancels it cleanly', async ({ page }) => {
    await enter(page);
    await page.locator('.time-envelope').click();
    await page.getByRole('button', { name: 'Next featured letter' }).click();
    await expect(page.getByRole('button', { name: 'Open letter from 17 September 2021' })).toHaveAttribute('data-phase', 'closed');
    await page.waitForTimeout(1300);
    await expect(page.locator('.capsule-paper')).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('praashi-keepsake-v1')!).capsule.opened)).toEqual([]);
  });

  test('reduced motion opens immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await enter(page);
    await page.locator('.time-envelope').click();
    await expect(page.locator('.capsule-paper')).toBeVisible({ timeout: 300 });
    await expect(page.locator('.time-envelope')).toHaveCount(0);
  });
});

test('warm captions replace archival wording everywhere in the letters', async ({ page }) => {
  await page.goto('/'); await chapterButton(page, 'Where It All Began').click();
  await page.getByRole('button', { name: 'Explore all 10 letters' }).click();
  await page.locator('[data-letter-index="0"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'View original', exact: true }).click();
  await expect(page.locator('.original-letter')).toHaveAttribute('aria-busy', 'false');
  const text = await page.locator('body').innerText();
  for (const clinical of ['reconstructed', 'visible message', 'unmodified', 'phone controls', 'saved fragments', 'screenshot']) expect(text.toLowerCase()).not.toContain(clinical);
});

test('gold focus rings appear only for the Tab key, never after touch, mouse or other keys', async ({ page, browserName }) => {
  await page.goto('/'); await chapterButton(page, 'Our constellation').click();
  const star = page.locator('.memory-star').nth(3);
  const ring = () => page.evaluate(() => { const style = getComputedStyle(document.activeElement!); return style.outlineStyle; });
  await star.click();
  await expect(page.getByRole('button', { name: 'Close gallery' })).toBeFocused();
  expect(await ring()).toBe('none');
  await page.getByRole('button', { name: 'Close gallery' }).click();
  await expect(star).toBeFocused();
  expect(await ring()).toBe('none');
  for (const key of ['Meta', 'Shift', 'Control']) { await page.keyboard.press(key); expect(await ring()).toBe('none'); }
  // WebKit follows Safari's default setting: Option-Tab includes native buttons.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect.poll(ring).toBe('solid');
  await page.mouse.click(5, 5);
  await star.focus();
  expect(await ring()).toBe('none');
});

test('chapter light stays behind content and never takes a touch', async ({ page }) => {
  await page.goto('/');
  for (const [name, selector, pseudo] of [['A little world', '.keepsake', '::before'], ['Little things', '.memory-stack', '::before'], ['Through it all', '.weather-scene', '::before'], ['Through it all', '.weather-scene', '::after'], ['My promise', '.hold-heart', '::before'], ['Every tomorrow', '.finale-constellation', '::before']] as const) {
    await chapterButton(page, name).click();
    await expect(page.locator(selector)).toBeVisible();
    const style = await page.locator(selector).evaluate((element, which) => { const s = getComputedStyle(element, which); return { events: s.pointerEvents, z: s.zIndex }; }, pseudo);
    expect(style).toEqual({ events: 'none', z: '-1' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test.describe('photo swipe', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  const name = (selector: string) => `(() => document.querySelector('${selector} img')?.getAttribute('src')?.match(/photo-(\\d+)/)?.[1])()`;
  async function ready(page: Page) {
    await page.goto('/'); await chapterButton(page, 'Little things').click();
    await page.getByRole('button', { name: 'Next memory' }).click(); // Now on photo 03, with 02 and 04 either side.
    await page.waitForTimeout(800);
    const box = (await page.locator('.memory-frame').boundingBox())!;
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, left: box.x };
  }
  // Samples what is on screen from the release until the new card has landed.
  const record = (page: Page) => page.evaluate(([top, under]) => new Promise<Array<{ top: string; under: string; x: number }>>(resolve => {
    const frames: Array<{ top: string; under: string; x: number }> = [], begun = performance.now();
    const sample = () => {
      const card = document.querySelector('.memory-frame')!;
      frames.push({ top: eval(top) as string, under: eval(under) as string, x: card.getBoundingClientRect().x });
      if (performance.now() - begun < 500) requestAnimationFrame(sample); else resolve(frames);
    };
    sample();
  }), [name('.memory-frame'), name('.back-one')]);

  for (const [direction, sign, incoming] of [['left', -1, '04'], ['right', 1, '02']] as const) {
    test(`swiping ${direction} follows the finger, keeps the incoming photo underneath and leaves that way`, async ({ page }) => {
      const { x, y, left } = await ready(page);
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x + sign * 120, y, { steps: 10 }); await page.waitForTimeout(80);
      const dragged = (await page.locator('.memory-frame').boundingBox())!.x - left;
      expect(dragged * sign).toBeGreaterThan(60);
      expect(await page.evaluate(name('.back-one'))).toBe(incoming);
      expect(await page.locator('.memory-stack > .memory-back').last().getAttribute('class')).toContain('back-one');
      const frames = record(page);
      await page.mouse.up();
      const seen = await frames;
      const leaving = seen.filter(frame => frame.top === '03');
      expect(leaving.length).toBeGreaterThan(0);
      for (const frame of leaving) expect(frame.under).toBe(incoming);
      expect(Math.max(...leaving.map(frame => (frame.x - left) * sign))).toBeGreaterThan(100);
      await expect(page.locator('.memory-frame')).toHaveCount(1);
      await expect.poll(() => page.evaluate(name('.memory-frame'))).toBe(incoming);
      await expect(page.locator('.memory-frame')).toHaveCSS('opacity', '1');
    });
  }

  test('a short drag springs back without changing photo', async ({ page }) => {
    const { x, y, left } = await ready(page);
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 8, y, { steps: 2 }); await page.waitForTimeout(400); await page.mouse.up();
    await page.waitForTimeout(700);
    expect(await page.evaluate(name('.memory-frame'))).toBe('03');
    expect(await page.evaluate(name('.back-one'))).toBe('04');
    expect(Math.abs((await page.locator('.memory-frame').boundingBox())!.x - left)).toBeLessThan(2);
  });

  test('arrows use the same photo underneath and leave the matching way', async ({ page }) => {
    const { left } = await ready(page);
    const frames = record(page);
    await page.getByRole('button', { name: 'Previous memory' }).click();
    // Frames from before the tap are at rest, so only count the card once it has started leaving.
    const leaving = (await frames).filter(frame => frame.top === '03' && frame.x - left > 2);
    expect(leaving.length).toBeGreaterThan(0);
    for (const frame of leaving) expect(frame.under).toBe('02');
    expect(Math.max(...leaving.map(frame => frame.x - left))).toBeGreaterThan(30);
    await expect.poll(() => page.evaluate(name('.memory-frame'))).toBe('02');
  });
});

test('no photograph repeats between the opening, chapters and ending', async ({ page }) => {
  const planned = [storyPhotos.opening, ...storyPhotos.memories, ...storyPhotos.stars, storyPhotos.weather, ...storyPhotos.finale];
  expect(new Set(planned).size).toBe(planned.length);
  expect([...planned].sort((a, b) => a - b)).toEqual(photos.map((_, index) => index));

  // Confirm the rendered pages too, including every photo in the swipeable stack and behind each star.
  const seen = new Map<string, string>();
  const note = (place: string, id: string | undefined) => {
    expect(id, `${place} has a photo`).toBeTruthy();
    expect(seen.has(id!), `${id} in ${place} already used in ${seen.get(id!)}`).toBe(false);
    seen.set(id!, place);
  };
  const ids = (selector: string) => page.locator(`${selector} img`).evaluateAll(images => images.map(image => image.getAttribute('src')?.match(/photo-\d+/)?.[0] ?? ''));
  await page.goto('/');
  for (const id of await ids('.opening-photo')) note('opening', id);
  await chapterButton(page, 'Little things').click();
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('.memory-dots > .current')).toHaveCount(1);
    await expect(page.locator('.memory-frame')).toHaveCount(1);
    note('little things', (await ids('.memory-frame'))[0]);
    await page.getByRole('button', { name: 'Next memory' }).click();
    await page.waitForTimeout(420);
  }
  await chapterButton(page, 'Our constellation').click();
  await expect(page.locator('.memory-star')).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await page.locator('.memory-star').nth(i).click();
    await expect(page.locator('.lightbox img')).toHaveCount(1);
    note('constellation', (await ids('.lightbox'))[0]);
    await page.getByRole('button', { name: 'Close gallery' }).click();
  }
  await chapterButton(page, 'Through it all').click();
  await expect(page.locator('.weather-couple img')).toHaveCount(1);
  for (const id of await ids('.weather-couple')) note('weather', id);
  await chapterButton(page, 'Every tomorrow').click();
  await expect(page.locator('.finale-photo img')).toHaveCount(6);
  for (const id of await ids('.finale-photo')) note('ending', id);
  expect(seen.size).toBe(23);
});

test('readable text stays at or above 11px through the story', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/');
  const small = () => page.evaluate(() => {
    const found: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const element = walker.currentNode.parentElement!, text = walker.currentNode.textContent!.trim();
      if (!text || element.closest('[aria-hidden="true"], .brand-wordmark, script, style')) continue;
      if (parseFloat(getComputedStyle(element).fontSize) < 11) found.push(text);
    }
    return found;
  });
  expect(await small()).toEqual([]);
  for (const name of ['Little things', 'Our constellation', 'Through it all', 'Where It All Began', 'My promise', 'Every tomorrow']) {
    await chapterButton(page, name).click(); await page.waitForTimeout(350);
    expect(await small()).toEqual([]);
  }
});

test('Safari toolbar height changes do not flip the phone layout mid-scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 664 }); await page.goto('/');
  for (const name of ['Our constellation', 'Through it all', 'Every tomorrow']) {
    await chapterButton(page, name).click(); await page.waitForTimeout(350);
    const position = () => page.evaluate(() => { const box = document.querySelector('main button')!.getBoundingClientRect(); return { top: Math.round(box.top + scrollY), size: getComputedStyle(document.querySelector('main h1')!).fontSize }; });
    const before = await position();
    await page.setViewportSize({ width: 390, height: 745 }); await page.waitForTimeout(150);
    expect(await position()).toEqual(before);
    await page.setViewportSize({ width: 390, height: 664 }); await page.waitForTimeout(100);
  }
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.documentElement.dataset.compact)).toBeUndefined();
});

test('a failed app download explains itself', async ({ browser }) => {
  test.setTimeout(30000);
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.route('**/assets/index-*.js', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Tap to try again' })).toBeVisible({ timeout: 15000 });
  await context.close();
});

test.describe('service worker updates', () => {
  const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg' };
  async function deployment() {
    const root = await mkdtemp(join(tmpdir(), 'praashi-sw-'));
    await cp('dist', root, { recursive: true });
    const server = http.createServer(async (request, response) => {
      const path = new URL(request.url!, 'http://x').pathname;
      try {
        const body = await readFile(join(root, path === '/' ? 'index.html' : path));
        response.writeHead(200, { 'content-type': types[extname(path === '/' ? 'a.html' : path)] ?? 'application/octet-stream', 'cache-control': path === '/sw.js' ? 'no-store' : 'public, max-age=0, must-revalidate' });
        response.end(body);
      } catch { response.writeHead(404); response.end(); }
    });
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}/`;
    return {
      url,
      async release() {
        const html = (await readFile(join(root, 'index.html'), 'utf8')).replace('A little world made', 'New build world');
        await writeFile(join(root, 'index.html'), html);
        const worker = (await readFile(join(root, 'sw.js'), 'utf8')).replace(/praashi-[0-9a-f]{12}/, 'praashi-000000000b2d');
        await writeFile(join(root, 'sw.js'), worker);
      },
      async close() { server.close(); await rm(root, { recursive: true, force: true }); },
    };
  }
  const build = (page: Page) => page.evaluate(() => document.querySelector('meta[name="description"]')!.getAttribute('content')!.slice(0, 9));

  test('a controlled page gets the new build on its very next load, with progress kept and no reload loop', async ({ page }) => {
    const site = await deployment();
    try {
      await page.addInitScript(() => { if (!localStorage.getItem('praashi-keepsake-v1')) localStorage.setItem('praashi-keepsake-v1', JSON.stringify({ scene: 0, reached: 6, completed: true, narrativeVersion: 2 })); });
      await page.goto(site.url);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload();
      await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
      await chapterButton(page, 'Through it all').click();
      await site.release();
      let loads = 0; page.on('load', () => loads++);
      await page.reload();
      expect(await build(page)).toBe('New build');
      await expect(page.getByRole('button', { name: /Welcome back/ })).toBeVisible();
      await page.waitForTimeout(1200);
      expect(loads).toBe(1);
    } finally { await site.close(); }
  });

  test('an open page offers the update quietly, never while reading, and never reloads by itself', async ({ page }) => {
    const site = await deployment();
    try {
      await page.addInitScript(() => { if (!localStorage.getItem('praashi-keepsake-v1')) localStorage.setItem('praashi-keepsake-v1', JSON.stringify({ scene: 0, reached: 6, completed: true, narrativeVersion: 2 })); });
      await page.goto(site.url);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload();
      await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
      await expect(page.locator('.update-note')).toHaveCount(0);
      await page.getByRole('button', { name: 'Go straight to my promise', exact: true }).click();
      await expect(page.locator('.letter-paper')).toBeVisible();
      await site.release();
      let loads = 0; page.on('load', () => loads++);
      await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration!.update(); });
      await page.waitForTimeout(1500);
      await expect(page.locator('.update-note')).toHaveCount(0);
      expect(loads).toBe(0);
      await chapterButton(page, 'Through it all').click();
      await expect(page.locator('.update-note')).toBeVisible();
      await page.getByRole('button', { name: 'Refresh', exact: true }).click();
      await expect(page.getByRole('button', { name: /Welcome back/ })).toBeVisible();
      expect(await build(page)).toBe('New build');
    } finally { await site.close(); }
  });

  test('music is never intercepted or cached by the worker', async () => {
    const worker = await readFile('dist/sw.js', 'utf8');
    expect(worker).toContain("url.pathname.includes('/audio/')");
    expect(worker).not.toMatch(/SHELL=.*\.mp3/);
  });
});
