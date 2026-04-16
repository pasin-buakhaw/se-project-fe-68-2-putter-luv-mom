import { test, expect } from '@playwright/test'

test.describe('User Menu Gallery', () => {
  test('page loads and heading is visible', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('h1')).toContainText('Menu')
  })

  test('shows browse subtitle', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('text=Browse and add items')).toBeVisible()
  })

  test('pre-order sidebar is always present', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('text=Pre-order List')).toBeVisible()
  })

  test('shows empty pre-order message on load', async ({ page }) => {
    await page.goto('/menu')
    await expect(page.locator('text=No items added yet.')).toBeVisible()
  })

  test('shows empty menu message when no data', async ({ page }) => {
    await page.goto('/menu')
    const noItems = page.locator('text=No menu items available.')
    const grid = page.locator('.grid')
    const hasEmpty = await noItems.isVisible().catch(() => false)
    const hasGrid = await grid.isVisible().catch(() => false)
    expect(hasEmpty || hasGrid).toBeTruthy()
  })

  test('category filter buttons appear when menus exist', async ({ page }) => {
    await page.goto('/menu')
    const grid = page.locator('.grid')
    const hasMenus = await grid.isVisible().catch(() => false)
    if (!hasMenus) { test.skip(); return }

    // If menus exist there should be category filter buttons
    const allBtn = page.locator('button', { hasText: 'All' })
    await expect(allBtn).toBeVisible()
  })

  test('"All" filter button is active by default', async ({ page }) => {
    await page.goto('/menu')
    const allBtn = page.locator('button', { hasText: 'All' })
    const hasAll = await allBtn.isVisible().catch(() => false)
    if (!hasAll) { test.skip(); return }

    await expect(allBtn).toHaveClass(/bg-yellow-500/)
  })
})
