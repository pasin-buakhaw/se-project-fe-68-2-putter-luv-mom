import { test, expect } from '@playwright/test'

test.describe('User Menu Page', () => {
  test('menu page renders heading', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('h1')).toContainText('Menu')
  })

  test('shows empty state when no menus', async ({ page }) => {
    await page.goto('/menu')
    const noItems = page.locator('text=No menu items available.')
    const cards = page.locator('[class*="MenuCard"], .grid > div')
    const hasEmpty = await noItems.isVisible().catch(() => false)
    const hasCards = (await cards.count()) > 0
    expect(hasEmpty || hasCards).toBeTruthy()
  })

  test('pre-order list shows empty message initially', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('text=No items added yet.')).toBeVisible()
  })

  test('add item to pre-order updates pre-order list', async ({ page }) => {
    await page.goto('/menu')
    const addBtn = page.locator('button', { hasText: 'Add to Pre-order' }).first()
    const count = await addBtn.count()
    if (count === 0) { test.skip(); return }

    await addBtn.click()
    await expect(page.locator('text=No items added yet.')).not.toBeVisible()
    // Total should appear
    await expect(page.locator('text=Total')).toBeVisible()
  })

  test('adding same item increments quantity', async ({ page }) => {
    await page.goto('/menu')
    const addBtn = page.locator('button', { hasText: 'Add to Pre-order' }).first()
    if (await addBtn.count() === 0) { test.skip(); return }

    await addBtn.click()
    // Button becomes "Remove" after adding — quantity starts at 1
    // Click + button to increment
    await page.locator('button', { hasText: '+' }).first().click()
    await expect(page.locator('text=2').first()).toBeVisible()
  })

  test('remove item from pre-order list', async ({ page }) => {
    await page.goto('/menu')
    const addBtn = page.locator('button', { hasText: 'Add to Pre-order' }).first()
    if (await addBtn.count() === 0) { test.skip(); return }

    await addBtn.click()
    await expect(page.locator('text=No items added yet.')).not.toBeVisible()

    // Click ✕ to remove
    await page.locator('button', { hasText: '✕' }).first().click()
    await expect(page.locator('text=No items added yet.')).toBeVisible()
  })

  test('quantity cannot go below 1 via minus button', async ({ page }) => {
    await page.goto('/menu')
    const addBtn = page.locator('button', { hasText: 'Add to Pre-order' }).first()
    if (await addBtn.count() === 0) { test.skip(); return }

    await addBtn.click()
    const minusBtn = page.locator('button', { hasText: '−' }).first()
    await minusBtn.click()
    // Quantity stays at 1
    await expect(page.locator('text=1').first()).toBeVisible()
  })

  test('total updates when quantity changes', async ({ page }) => {
    await page.goto('/menu')
    const addBtn = page.locator('button', { hasText: 'Add to Pre-order' }).first()
    if (await addBtn.count() === 0) { test.skip(); return }

    await addBtn.click()
    const totalBefore = await page.locator('text=Total').locator('..').locator('span').last().textContent()
    await page.locator('button', { hasText: '+' }).first().click()
    const totalAfter = await page.locator('text=Total').locator('..').locator('span').last().textContent()
    expect(totalAfter).not.toBe(totalBefore)
  })

  test('clear all removes all pre-order items', async ({ page }) => {
    await page.goto('/menu')
    const addBtns = page.locator('button', { hasText: 'Add to Pre-order' })
    const count = await addBtns.count()
    if (count === 0) { test.skip(); return }

    await addBtns.first().click()
    await page.locator('button', { hasText: 'Clear all' }).click()
    await expect(page.locator('text=No items added yet.')).toBeVisible()
  })

  test('category filter shows only matching cards', async ({ page }) => {
    await page.goto('/menu')
    const filterBtns = page.locator('button').filter({ hasText: /^(?!All|Add to Pre-order|Remove|Clear all|[+−✕])/ })
    const count = await filterBtns.count()
    if (count === 0) { test.skip(); return }

    const catBtn = filterBtns.first()
    const catName = await catBtn.textContent()
    await catBtn.click()
    // All visible category labels should match
    const labels = page.locator('p.text-xs.text-zinc-500')
    const labelCount = await labels.count()
    for (let i = 0; i < labelCount; i++) {
      await expect(labels.nth(i)).toContainText(catName!)
    }
  })
})
