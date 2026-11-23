import { expect, test } from '@playwright/test';

const destinations = [
  ['Rookery', '/'],
  ['Write', '/write'],
  ['Flights', '/flights'],
  ['Inbox', '/inbox'],
  ['Contacts', '/contacts'],
] as const;

function visiblePrimaryNavigation(page: import('@playwright/test').Page) {
  const width = page.viewportSize()?.width ?? 1280;
  return page.getByRole('navigation', { name: width < 700 ? 'Mobile primary navigation' : 'Desktop primary navigation' });
}

test('primary navigation reaches every destination from the letter editor', async ({ page }) => {
  await page.goto('/write');

  for (const [label, path] of destinations) {
    await visiblePrimaryNavigation(page).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path === '/' ? '/$' : `${path}/?$`}`));
    const currentLinks = page.locator('a[aria-current="page"]');
    const count = await currentLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      expect(await currentLinks.nth(index).getAttribute('href')).toBe(path);
    }
  }
});

test('Rookery navigation works from every application route', async ({ page }) => {
  for (const route of ['/', '/write', '/flights', '/inbox', '/contacts', '/settings']) {
    await page.goto(route);
    await visiblePrimaryNavigation(page).getByRole('link', { name: 'Rookery', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  }
});

test('Settings is available from the header menu and account seal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('navigation', { name: 'Menu navigation' }).getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/?$/);

  await page.goto('/write');
  await page.getByRole('link', { name: 'Account settings' }).click();
  await expect(page).toHaveURL(/\/settings\/?$/);
});

test('fixed mobile navigation leaves content reachable', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 700, 'Mobile navigation only');
  await page.goto('/write');
  const note = page.locator('.dispatch-note');
  await note.scrollIntoViewIfNeeded();
  const noteBox = await note.boundingBox();
  const navBox = await page.getByRole('navigation', { name: 'Mobile primary navigation' }).boundingBox();
  expect(noteBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  if (noteBox && navBox) expect(noteBox.y + noteBox.height).toBeLessThanOrEqual(navBox.y);
});
