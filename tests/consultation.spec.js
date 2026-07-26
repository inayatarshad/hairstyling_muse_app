import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/consultation/client');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('female consultation excludes beard and completes the journey', async ({ page }) => {
  await expect(page.getByText('Female styling')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Beard selection' })).toHaveCount(0);
  await page.getByRole('button', { name: /Continue to portrait/ }).click();
  await page.getByRole('button', { name: /Continue with a demo model/ }).click();
  await expect(page).toHaveURL(/styles\/hair/);
  await page.getByRole('button', { name: /Long undone waves/ }).click();
  await page.getByRole('button', { name: /Continue to colour/ }).click();
  await expect(page).toHaveURL(/color/);
  await page.getByRole('button', { name: /Copper/ }).click();
  await page.getByRole('button', { name: /Review complete look/ }).click();
  await expect(page.getByText('Long undone waves', { exact: true })).toBeVisible();
  await expect(page.getByText('Copper · Solid')).toBeVisible();
});

test('male consultation includes beard photographs and controls', async ({ page }) => {
  await page.getByRole('button', { name: /Male styling/ }).click();
  const mobileMenu = page.locator('.mobile-menu');
  if (await mobileMenu.isVisible()) await mobileMenu.click();
  await expect(page.getByRole('link', { name: 'Beard selection' })).toBeVisible();
  await page.goto('http://localhost:3000/styles/beard');
  await expect(page.getByRole('button', { name: /Short boxed beard/ })).toBeVisible();
  await page.getByRole('button', { name: /Full sculpted beard/ }).click();
  await expect(page.getByText('Full sculpted beard selected')).toBeVisible();
  await page.getByRole('button', { name: /Continue to colour/ }).click();
  await expect(page).toHaveURL(/color/);
});

test('generation timeline resolves to the result page', async ({ page }) => {
  test.setTimeout(15000);
  await page.goto('http://localhost:3000/generate');
  await expect(page.getByText('Creating the consultation preview')).toBeVisible();
  await expect(page).toHaveURL(/result/, { timeout: 10000 });
  await expect(page.getByText('Your finished direction')).toBeVisible();
});

test('settings persist after reload', async ({ page }) => {
  await page.goto('http://localhost:3000/settings');
  await page.getByRole('button', { name: /Private browser storage/ }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /Private browser storage/ })).not.toHaveClass(/on/);
});
