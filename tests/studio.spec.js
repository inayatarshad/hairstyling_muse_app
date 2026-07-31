import { expect, test } from '@playwright/test';

/**
 * End to end coverage for the Musè studio workflow:
 * upload, choose, generate, compare, keep.
 *
 * These run against `npm run dev` or `npm run preview` on port 3000.
 */

const isNarrow = (page) => (page.viewportSize()?.width || 0) < 1080;

/** Opens the studio with a clean slate. */
async function openStudio(page) {
  await page.goto('/studio');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Upload your portrait' })).toBeVisible();
}

/** Loads a demo model and waits for on-device segmentation to finish. */
async function loadDemoModel(page, index = 0) {
  await page.locator('.demo-card').nth(index).click();
  await expect(page.locator('.stepper li').nth(1)).toHaveClass(/is-active/);
  await expect(page.locator('.portrait__pill--ready')).toBeVisible({ timeout: 40000 });
}

/** Opens the style panel, which is collapsed into a sheet on narrow viewports. */
async function openPanel(page) {
  if (isNarrow(page)) {
    const grab = page.locator('.panel__grab');
    if (await grab.isVisible()) await grab.click();
  }
  await expect(page.locator('.browser__grid')).toBeVisible();
}

async function chooseCategory(page, label) {
  const tab = page.locator('.catrail__tab', { hasText: label });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
}

/**
 * Segmented controls contain labels that are substrings of each other
 * ("Female" contains "male", "Women" contains "men"), so these must match
 * exactly rather than by substring.
 */
function segmentButton(page, scope, label) {
  return page.locator(`${scope} .segment button`).filter({ hasText: new RegExp(`^${label}$`) });
}

/* -------------------------------------------------------------------------- */

test('landing page presents every premium section', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Musè/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('See your next look');

  for (const id of ['process', 'styles', 'why', 'results', 'faq']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  // The timeline, the collection and the FAQ all carry real content.
  await expect(page.locator('.timeline__item')).toHaveCount(6);
  await expect(page.locator('.photo-card')).toHaveCount(6);
  await expect(page.locator('.acc')).toHaveCount(8);
  await expect(page.locator('.adv-card')).toHaveCount(8);
});

test('landing stats count up once in view', async ({ page }) => {
  await page.goto('/');
  await page.locator('.why__stats').scrollIntoViewIfNeeded();
  const first = page.locator('.stat strong').first();
  await expect(first).toHaveText(/^60\+$/, { timeout: 8000 });
});

test('landing FAQ opens and closes', async ({ page }) => {
  await page.goto('/');
  const second = page.locator('.acc').nth(1);
  const button = second.getByRole('button');

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(second).toHaveClass(/is-open/);
});

test('landing style tabs switch collections', async ({ page }) => {
  await page.goto('/');
  await page.locator('#styles').scrollIntoViewIfNeeded();

  await segmentButton(page, '.categories__aside', 'Beards').click();
  await expect(page.locator('.photo-card').first()).toContainText('Clean Shaven');

  await segmentButton(page, '.categories__aside', 'Men').click();
  await expect(page.locator('.photo-card').first()).toContainText('Textured Crop');
});

test('studio blocks generation until a photo and consent exist', async ({ page }) => {
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);

  const generate = page.getByRole('button', { name: /Generate look/ });
  await expect(generate).toBeDisabled();
  await expect(page.locator('.panel__blocked')).toContainText('Confirm consent');

  await page.locator('.guard--consent input').check();
  await expect(generate).toBeEnabled();
});

test('every category exposes styles for the selected model', async ({ page }) => {
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);

  for (const label of ['New', 'Trending', "Women's cuts", 'Wavy', 'Hair colour']) {
    await chooseCategory(page, label);
    await expect(page.locator('.stylecard').first()).toBeVisible();
  }

  // Switching to the male model swaps in the men's and beard collections.
  await segmentButton(page, '.browser__top', 'Male').click();
  await chooseCategory(page, 'Beard');
  await expect(page.locator('.stylecard')).toHaveCount(13);
  await expect(page.locator('.stylecard', { hasText: 'Van Dyke' })).toBeVisible();
});

test('switching model swaps the portrait and hides the other collection', async ({ page }) => {
  await openStudio(page);
  await loadDemoModel(page, 0);
  await openPanel(page);

  // Female: women's cuts offered, no men's or beard tabs.
  await expect(page.locator('.catrail__tab', { hasText: "Women's cuts" })).toHaveCount(1);
  await expect(page.locator('.catrail__tab', { hasText: "Men's cuts" })).toHaveCount(0);
  await expect(page.locator('.catrail__tab', { hasText: 'Beard' })).toHaveCount(0);

  await segmentButton(page, '.browser__top', 'Male').click();

  // Male: the collections flip over entirely.
  await expect(page.locator('.catrail__tab', { hasText: "Men's cuts" })).toHaveCount(1);
  await expect(page.locator('.catrail__tab', { hasText: 'Beard' })).toHaveCount(1);
  await expect(page.locator('.catrail__tab', { hasText: "Women's cuts" })).toHaveCount(0);
  await expect(page.locator('.catrail__tab', { hasText: 'Wavy' })).toHaveCount(0);

  // And the portrait on the stage becomes the male model, re-segmented.
  await expect(page.locator('.portrait__pill--ready')).toBeVisible({ timeout: 40000 });
  const src = await page.evaluate(() => {
    const raw = localStorage.getItem('muse-studio-v3');
    return raw ? JSON.parse(raw).photo : '';
  });
  expect(src).toContain('before-boy');
});

test('refinement controls are bars, not dropdowns', async ({ page }) => {
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);

  await page.locator('.refine__toggle').click();
  await expect(page.locator('.refine.is-open')).toBeVisible();

  // Bars, with a named value and no visible number.
  await expect(page.locator('.refine .bar').first()).toBeVisible();
  await expect(page.locator('.refine select')).toHaveCount(0);
  await expect(page.locator('.refine .bar__head em').first()).not.toHaveText(/^\d+$/);

  // Dragging the bar changes the value it reports.
  const bar = page.locator('.refine .bar').first();
  const before = await bar.locator('.bar__head em').innerText();
  await bar.locator('input[type="range"]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(bar.locator('.bar__head em')).not.toHaveText(before);
});

test('choosing a colour redraws the portrait on device', async ({ page }) => {
  test.setTimeout(60000);
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);
  await chooseCategory(page, 'Hair colour');

  const canvas = page.locator('.portrait canvas');
  const before = await canvas.evaluate((el) => el.toDataURL());

  await page.locator('.stylecard', { hasText: 'Copper' }).click();
  await expect(page.locator('.stage__style')).toContainText('Copper');
  await page.waitForTimeout(900);

  const after = await canvas.evaluate((el) => el.toDataURL());
  expect(after).not.toBe(before);
});

test('generation runs every stage and reaches the comparison', async ({ page }) => {
  test.setTimeout(90000);
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);
  await chooseCategory(page, 'Hair colour');
  await page.locator('.stylecard', { hasText: 'Copper' }).click();
  await page.locator('.guard--consent input').check();

  await page.getByRole('button', { name: /Generate look/ }).click();

  // The staged progress panel appears and every stage completes.
  await expect(page.locator('.genr__panel')).toBeVisible();
  await expect(page.locator('.genr__stages li')).toHaveCount(6);
  await expect(page.locator('.genr__stages li.is-done')).toHaveCount(6, { timeout: 45000 });

  // Then the result, with a working before and after.
  await expect(page.locator('.result')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.result__panel h2')).toContainText('Copper');
  await expect(page.locator('.compare__tag', { hasText: 'Original' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Download HD/ })).toBeVisible();

  // A credit was spent.
  await expect(page.locator('.credits')).toContainText('4');
});

test('kept looks appear in the lookbook and survive a reload', async ({ page }) => {
  test.setTimeout(90000);
  await openStudio(page);
  await loadDemoModel(page);
  await openPanel(page);
  await chooseCategory(page, 'Hair colour');
  await page.locator('.stylecard', { hasText: 'Burgundy' }).click();
  await page.locator('.guard--consent input').check();
  await page.getByRole('button', { name: /Generate look/ }).click();

  await expect(page.locator('.result')).toBeVisible({ timeout: 60000 });
  await page.getByRole('button', { name: /^Keep$/ }).click();
  await expect(page.getByRole('button', { name: /Kept/ })).toBeVisible();

  await page.goto('/lookbook');
  await expect(page.locator('.lookcard')).toHaveCount(1);
  await expect(page.locator('.lookcard h3')).toContainText('Burgundy');

  await page.reload();
  await expect(page.locator('.lookcard')).toHaveCount(1);
});

test('the comparison slider responds to the keyboard', async ({ page }) => {
  await page.goto('/');
  const range = page.locator('.hero__compare .compare__range');
  const start = await range.inputValue();

  await range.focus();
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('ArrowRight');

  expect(Number(await range.inputValue())).toBeGreaterThan(Number(start));
});

test('photo guidance modal opens and closes on Escape', async ({ page }) => {
  await openStudio(page);
  await page.getByRole('button', { name: /What makes a good photo/ }).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  await expect(modal).toContainText('Recommended');
  await expect(modal).toContainText('Avoid');

  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
});

test('settings list the providers and persist a change', async ({ page }) => {
  await page.goto('/settings');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Demo engine is the default and needs no key.
  await expect(page.locator('.provider.is-active')).toContainText('Demo engine');
  await expect(page.locator('.provider')).toHaveCount(5);

  await page.locator('.provider', { hasText: 'Replicate model' }).click();
  await expect(page.locator('.settings__warn')).toBeVisible();

  await page.reload();
  await expect(page.locator('.provider.is-active')).toContainText('Replicate model');
});

test('legacy consultation URLs redirect into the studio', async ({ page }) => {
  for (const path of ['/consultation/client', '/styles/hair', '/color', '/review', '/result']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/studio$/);
  }

  await page.goto('/saved');
  await expect(page).toHaveURL(/\/lookbook$/);
});

test('the generate endpoint reports that no model is attached', async ({ request }) => {
  const response = await request.post('/api/generate', { data: { image: 'x' } });
  expect(response.status()).toBe(501);
  expect((await response.json()).error.code).toBe('NOT_CONFIGURED');
});
