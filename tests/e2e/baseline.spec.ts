import { expect, test } from '@playwright/test';

const routes = ['/', '/write', '/flights', '/inbox', '/contacts', '/settings'] as const;
const viewports = [
  { name: 'narrow-320', width: 320, height: 720 },
  { name: 'mobile-360', width: 360, height: 780 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 900 },
] as const;

function runOnceInDesktopProject(projectName: string) {
  test.skip(projectName !== 'desktop-chromium', 'Baseline matrix runs once with explicit viewports.');
}

for (const viewport of viewports) {
  test(`application shell fits ${viewport.name}`, async ({ page }, testInfo) => {
    runOnceInDesktopProject(testInfo.project.name);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(await page.title()).not.toBe('');
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('.app-header')).toBeVisible();
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        offenders: Array.from(document.body.querySelectorAll<HTMLElement>('*'))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.right > window.innerWidth + 1 || rect.left < -1);
          })
          .map((element) => element.className || element.tagName)
          .slice(0, 5),
      }));
      expect(overflow.scrollWidth, `horizontal overflow on ${route}: ${overflow.offenders.join(', ')}`).toBeLessThanOrEqual(overflow.clientWidth);

      const unnamedControls = await page.locator('a, button, summary, input, select, [contenteditable="true"]').evaluateAll((elements) =>
        elements.filter((element) => {
          const html = element as HTMLElement;
          const labelledBy = element.getAttribute('aria-labelledby');
          const labelledText = labelledBy ? document.getElementById(labelledBy)?.textContent?.trim() : '';
          const label = element.getAttribute('aria-label') || labelledText || html.textContent?.trim() || element.getAttribute('title') || element.getAttribute('placeholder');
          return !label;
        }).map((element) => element.outerHTML.slice(0, 120)),
      );
      expect(unnamedControls).toEqual([]);

      const invalidImages = await page.locator('img').evaluateAll((images) => images.filter((image) =>
        !image.hasAttribute('alt') || !image.getAttribute('width') || !image.getAttribute('height'),
      ).map((image) => image.outerHTML.slice(0, 120)));
      expect(invalidImages).toEqual([]);
    }

    await page.goto('/');
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-rookery.png`), fullPage: true });
    await page.goto('/write');
    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}-composer.png`), fullPage: true });
  });
}

test('keyboard focus, skip link, high text zoom and reduced motion baseline', async ({ page }, testInfo) => {
  runOnceInDesktopProject(testInfo.project.name);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/write');

  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  expect(await skipLink.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator('#main-content')).toBeFocused();

  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const zoomOverflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(zoomOverflow.scrollWidth).toBeLessThanOrEqual(zoomOverflow.clientWidth);

  for (let index = 0; index < 7; index++) {
    await page.keyboard.press('Tab');
    const focusState = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null;
      if (!active || active === document.body) return { visible: false, element: 'body' };
      const style = getComputedStyle(active);
      return {
        visible: style.outlineStyle !== 'none' || style.boxShadow !== 'none',
        element: `${active.tagName.toLowerCase()}.${active.className}`,
      };
    });
    expect(focusState.visible, `focus indicator missing after tab ${index + 1} on ${focusState.element}`).toBe(true);
  }
});
