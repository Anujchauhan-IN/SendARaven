import { expect, test } from '@playwright/test';

test('rookery presents five selectable ravens without horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My Rookery/);
  await expect(page.getByRole('heading', { name: 'My Rookery' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Select .* Raven/ })).toHaveCount(5);
  await expect(page.locator('.raven-art')).toHaveCount(4);
  await expect(page.locator('.raven-art[data-raven="phantom"]')).toBeVisible();
  await expect(page.locator('.raven-art[data-raven="courier"]')).toBeVisible();
  await expect(page.locator('.raven-art[data-raven="wanderer"]')).toBeVisible();
  await expect(page.locator('.raven-art[data-raven="old"]')).toBeVisible();
  await expect(page.locator('.raven-art[data-raven="swift"]')).toHaveCount(0);
  await expect.poll(() => page.locator('.raven-art').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await expect(page.getByRole('link', { name: 'Write a Letter' })).toBeVisible();
  await page.getByRole('button', { name: /Select Swift Raven/ }).click();
  await expect(page.getByLabel('Selected raven details')).toContainText('Returning in 2h 17m');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.locator('body').evaluate((node) => node.clientWidth));
  await page.screenshot({ path: testInfo.outputPath('rookery.png'), fullPage: true });
});

test('composer fits the viewport and keeps text while drawing', async ({ page }, testInfo) => {
  await page.goto('/write');
  await expect(page.locator('astro-island:not([ssr])')).toBeAttached();
  await expect(page).toHaveTitle(/Write a letter/);
  const editor = page.getByRole('textbox', { name: /Typed letter/ });
  await editor.pressSequentially('Dear friend,');
  await expect(editor).toHaveText('Dear friend,');
  await page.getByRole('button', { name: 'Pen', exact: true }).click();
  const canvas = page.getByLabel('Handwritten ink layer');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.move(box.x + box.width * .3, box.y + box.height * .72);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .65, box.y + box.height * .76, { steps: 8 });
    await page.mouse.up();
  }
  await expect(editor).toContainText('Dear friend,');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', await page.locator('body').evaluate((node) => node.clientWidth));
  await expect(page.getByRole('button', { name: 'Seal & dispatch' })).toBeDisabled();
  await page.screenshot({ path: testInfo.outputPath('composer.png'), fullPage: true });
});

test('page navigation preserves page content', async ({ page }) => {
  await page.goto('/write');
  await expect(page.locator('astro-island:not([ssr])')).toBeAttached();
  const editor = page.getByRole('textbox', { name: /Typed letter/ });
  await editor.fill('First page');
  await page.getByRole('button', { name: 'Add page' }).click();
  await page.getByRole('textbox', { name: /Typed letter/ }).fill('Second page');
  await page.getByRole('button', { name: 'Previous page' }).click();
  await expect(page.getByRole('textbox', { name: /Typed letter/ })).toContainText('First page');
});
