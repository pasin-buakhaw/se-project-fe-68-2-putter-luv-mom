import { test, expect } from '@playwright/test'

test.describe('Admin Menu Update', () => {
  test('edit page renders with back link', async ({ page }) => {
    await page.goto('/admin/menu')
    const editBtn = page.locator('a', { hasText: 'Edit' }).first()
    const count = await editBtn.count()
    if (count === 0) { test.skip(); return }

    await editBtn.click()
    await expect(page.locator('text=Edit Menu Item')).toBeVisible()
    await expect(page.locator('a', { hasText: '← Back to Menu List' })).toBeVisible()
  })

  test('edit form is pre-filled with existing values', async ({ page }) => {
    await page.goto('/admin/menu')
    const editBtn = page.locator('a', { hasText: 'Edit' }).first()
    if (await editBtn.count() === 0) { test.skip(); return }

    await editBtn.click()
    // Name field should not be empty
    const nameInput = page.locator('input[placeholder*="Grilled Salmon"]')
    await expect(nameInput).toBeVisible()
    const value = await nameInput.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('submit button is present on edit page', async ({ page }) => {
    await page.goto('/admin/menu')
    const editBtn = page.locator('a', { hasText: 'Edit' }).first()
    if (await editBtn.count() === 0) { test.skip(); return }

    await editBtn.click()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('validation fires on edit form with empty name', async ({ page }) => {
    await page.goto('/admin/menu')
    const editBtn = page.locator('a', { hasText: 'Edit' }).first()
    if (await editBtn.count() === 0) { test.skip(); return }

    await editBtn.click()
    await page.fill('input[placeholder*="Grilled Salmon"]', '')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('text=Name is required')).toBeVisible()
  })

  test('updated data is visible after navigating back', async ({ page }) => {
    await page.goto('/admin/menu')
    const editBtn = page.locator('a', { hasText: 'Edit' }).first()
    if (await editBtn.count() === 0) { test.skip(); return }

    const originalName = await page.locator('tbody tr td').first().textContent()
    await editBtn.click()
    const newName = `${originalName} Updated`
    await page.fill('input[placeholder*="Grilled Salmon"]', newName)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL('/admin/menu')
    await expect(page.locator(`text=${newName}`)).toBeVisible()
  })
})
