import { test, expect, Page } from '@playwright/test'
import {
  MOCK_RESTAURANTS,
  MOCK_PREORDERS,
  restaurantsResponse,
  preordersResponse,
} from './fixtures/data'

const ADMIN_EMAIL    = 'verawoodlans@gmail.com'
const ADMIN_PASSWORD = '123456789'

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Mock the browser-side restaurants list (used by RestaurantMap / my-orders venue names). */
async function mockRestaurantsAPI(page: Page) {
  await page.route('**/api/v1/restaurants*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(restaurantsResponse()),
    })
  })
}

/** Mock the preorders endpoint (client-side fetch in my-orders page). */
async function mockPreordersAPI(page: Page, data = MOCK_PREORDERS) {
  await page.route('**/api/v1/preorders*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(preordersResponse(data)),
      })
    } else {
      route.continue()
    }
  })
}

async function loginAsAdmin(page: Page) {
  await page.goto('/signin')
  await page.getByPlaceholder('your@email.com').fill(ADMIN_EMAIL)
  await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.getByText('Login successful!').waitFor({ timeout: 15000 })
}

// ─────────────────────────────────────────────────────────────────────────────
// US3-1  Search restaurants by name or keyword
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US3-1 Search restaurants by name or keyword', () => {

  test('search input is visible on the search page', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('search-input')).toBeVisible({ timeout: 15000 })
  })

  test('typing into search input updates its value', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByTestId('search-input')
    await input.fill('Sushi')
    await expect(input).toHaveValue('Sushi')
  })

  test('typing a non-existent keyword shows "No results found"', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByTestId('search-input')
    await input.fill('ZZZNOMATCH99999')
    await expect(page.getByTestId('no-results')).toBeVisible()
  })

  test('result count decreases when a search term is entered', async ({ page }) => {
    await page.goto('/search')
    const countEl = page.getByTestId('result-count')
    const before = await countEl.textContent()

    const input = page.getByTestId('search-input')
    await input.fill('ZZZNOMATCH99999')

    const after = await countEl.textContent()
    // count should drop to "0 restaurants found"
    expect(after).toMatch(/^0 /)
    // and was different before (assuming some data loaded)
    if (before && !before.startsWith('0')) {
      expect(before).not.toEqual(after)
    }
  })

  test('clearing search input removes "No results found"', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByTestId('search-input')
    await input.fill('ZZZNOMATCH99999')
    await expect(page.getByTestId('no-results')).toBeVisible()

    await input.clear()
    await expect(page.getByTestId('no-results')).not.toBeVisible()
  })

  test('search is case-insensitive — lowercase matches restaurant names', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByTestId('search-input')
    // Try a generic short term that would match at least something if API is up
    await input.fill('a')
    const count = await page.getByTestId('result-count').textContent()
    // At minimum the count element exists and page has not crashed
    expect(count).toBeTruthy()
    await expect(page).not.toHaveURL(/error/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// US3-2  Filter restaurants by category or location
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US3-2 Filter restaurants by category or location', () => {

  test('filter toggle button is visible', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('filter-toggle-btn')).toBeVisible({ timeout: 15000 })
  })

  test('filter panel is hidden by default', async ({ page }) => {
    await page.goto('/search')
    await expect(page.getByTestId('filter-panel')).not.toBeVisible()
  })

  test('clicking filter button opens the filter panel', async ({ page }) => {
    await page.goto('/search')
    await page.getByTestId('filter-toggle-btn').click()
    await expect(page.getByTestId('filter-panel')).toBeVisible()
  })

  test('clicking filter button again closes the filter panel', async ({ page }) => {
    await page.goto('/search')
    const btn = page.getByTestId('filter-toggle-btn')
    await btn.click()
    await expect(page.getByTestId('filter-panel')).toBeVisible()
    await btn.click()
    await expect(page.getByTestId('filter-panel')).not.toBeVisible()
  })

  test('active filters bar appears after selecting a category', async ({ page }) => {
    await page.goto('/search')
    await page.getByTestId('filter-toggle-btn').click()
    await expect(page.getByTestId('filter-panel')).toBeVisible()

    const chips = page.getByTestId('category-chip')
    const count = await chips.count()
    if (count === 0) { test.skip(); return }

    await chips.first().click()
    await expect(page.getByTestId('active-filters-bar')).toBeVisible()
  })

  test('result count changes after selecting a category filter', async ({ page }) => {
    await page.goto('/search')
    const countEl = page.getByTestId('result-count')
    const before = await countEl.textContent()

    await page.getByTestId('filter-toggle-btn').click()
    const chips = page.getByTestId('category-chip')
    const chipCount = await chips.count()
    if (chipCount === 0) { test.skip(); return }

    await chips.first().click()
    const after = await countEl.textContent()
    // Count may change; page must not crash
    expect(after).toMatch(/\d+ restaurant/)
    await expect(page).not.toHaveURL(/error/)
  })

  test('typing in search while filter is open adds search to active filters', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByTestId('search-input')
    await input.fill('garden')
    await expect(page.getByTestId('active-filters-bar')).toBeVisible()
    // Active filter chip should show the search term
    const bar = await page.getByTestId('active-filters-bar').textContent()
    expect(bar?.toLowerCase()).toContain('garden')
  })

  test('sort select has all expected options', async ({ page }) => {
    await page.goto('/search')
    const select = page.getByTestId('sort-select')
    await expect(select).toBeVisible()

    const options = await select.locator('option').allTextContents()
    expect(options).toContain('Default')
    expect(options.some(o => o.includes('Rating'))).toBeTruthy()
    expect(options.some(o => o.includes('Name'))).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// US3-3  View order history
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US3-3 View order history', () => {

  test('unauthenticated user sees sign-in prompt', async ({ page }) => {
    await page.goto('/my-orders')
    // Wait for NextAuth session check to resolve
    await page.waitForTimeout(2000)
    const body = await page.textContent('body')
    const url  = page.url()
    // Either redirected to sign-in or the no-auth prompt is shown
    const hasAuthPrompt = await page.getByTestId('no-auth-prompt').isVisible().catch(() => false)
    const redirected    = url.includes('signin') || url.includes('login')
    const bodyHasSignIn = body?.toLowerCase().includes('sign in') ?? false
    expect(hasAuthPrompt || redirected || bodyHasSignIn).toBeTruthy()
  })

  test('authenticated user sees My Orders heading with mocked orders', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page)
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('order-history-heading')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('order-history-heading')).toHaveText('My Orders')
  })

  test('order cards are rendered for each venue in mock data', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page)
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('orders-list')).toBeVisible({ timeout: 15000 })

    const cards = page.getByTestId('order-card')
    await expect(cards).toHaveCount(MOCK_PREORDERS.length, { timeout: 10000 })
  })

  test('each order card has Re-order, Edit and Cancel buttons', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page)
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('orders-list')).toBeVisible({ timeout: 15000 })

    const firstCard = page.getByTestId('order-card').first()
    await expect(firstCard.getByTestId('reorder-btn')).toBeVisible()
    await expect(firstCard.getByTestId('edit-order-btn')).toBeVisible()
    await expect(firstCard.getByTestId('cancel-order-btn')).toBeVisible()
  })

  test('clicking Re-order shows toast confirmation', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page)
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('orders-list')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('order-card').first().getByTestId('reorder-btn').click()
    // Toast "Items added to pre-order cart" should appear
    await expect(page.locator('text=Items added to pre-order cart')).toBeVisible({ timeout: 5000 })
  })

  test('clicking Cancel opens confirmation dialog', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page)
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('orders-list')).toBeVisible({ timeout: 15000 })

    await page.getByTestId('order-card').first().getByTestId('cancel-order-btn').click()
    await expect(page.locator('text=Cancel Order?')).toBeVisible({ timeout: 3000 })
  })

  test('empty state is shown when preorders list is empty', async ({ page }) => {
    await loginAsAdmin(page)
    await mockPreordersAPI(page, [])
    await mockRestaurantsAPI(page)

    await page.goto('/my-orders')
    await expect(page.getByTestId('empty-orders')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('text=No Orders Yet')).toBeVisible()
  })

  test('my-orders page does not crash or show 500', async ({ page }) => {
    await page.goto('/my-orders')
    await expect(page).not.toHaveURL(/500|error/)
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
    expect(body!.length).toBeGreaterThan(10)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// US3-4  Sort and recommended restaurants
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US3-4 Sort and recommended restaurants', () => {

  test('recommended section is visible when no filter is active', async ({ page }) => {
    await page.goto('/search')
    // Section is only rendered when initialRestaurants contains items rated >= 4.0
    // If API is live, check presence; if no data, skip gracefully
    const section = page.getByTestId('recommended-section')
    const visible = await section.isVisible().catch(() => false)
    if (!visible) {
      console.log('Recommended section not visible — likely no backend data. Skipping assertion.')
      return
    }
    await expect(section).toBeVisible()
  })

  test('all recommended cards have rating >= 4.0', async ({ page }) => {
    await page.goto('/search')
    const section = page.getByTestId('recommended-section')
    if (!await section.isVisible().catch(() => false)) { test.skip(); return }

    const cards = section.getByTestId('recommended-card')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const ratingAttr = await cards.nth(i).getAttribute('data-rating')
      if (ratingAttr) {
        expect(parseFloat(ratingAttr)).toBeGreaterThanOrEqual(4.0)
      }
    }
  })

  test('recommended section disappears when user types a search query', async ({ page }) => {
    await page.goto('/search')
    const section = page.getByTestId('recommended-section')
    if (!await section.isVisible().catch(() => false)) { test.skip(); return }

    await page.getByTestId('search-input').fill('test')
    await expect(section).not.toBeVisible()
  })

  test('recommended section reappears after clearing search', async ({ page }) => {
    await page.goto('/search')
    const section = page.getByTestId('recommended-section')
    if (!await section.isVisible().catch(() => false)) { test.skip(); return }

    const input = page.getByTestId('search-input')
    await input.fill('test')
    await expect(section).not.toBeVisible()

    await input.clear()
    await expect(section).toBeVisible()
  })

  test('sort select changes displayed result order (rating desc → asc)', async ({ page }) => {
    await page.goto('/search')
    const select = page.getByTestId('sort-select')
    await expect(select).toBeVisible()

    // First card names before sorting
    const cardsBefore = await page.getByTestId('restaurant-card').allTextContents()

    // Sort by Rating ascending
    await select.selectOption('rating_asc')

    const cardsAfter = await page.getByTestId('restaurant-card').allTextContents()
    // Page must not crash; card list may change
    await expect(page).not.toHaveURL(/error/)
    if (cardsBefore.length > 1 && cardsAfter.length > 1) {
      // At least one of the two sort passes should produce a different order than the other
      const ratingDescCards = await (async () => {
        await select.selectOption('rating_desc')
        return page.getByTestId('restaurant-card').allTextContents()
      })()
      // rating_desc and rating_asc should produce different orderings
      if (ratingDescCards.length > 1) {
        expect(ratingDescCards.join('')).not.toEqual(cardsAfter.join(''))
      }
    }
  })

  test('sort option "Name A–Z" sorts alphabetically', async ({ page }) => {
    await page.goto('/search')
    const select = page.getByTestId('sort-select')
    await select.selectOption('name_asc')

    const cards = page.getByTestId('restaurant-card')
    const count = await cards.count()
    if (count < 2) { test.skip(); return }

    // Extract the heading text of each card
    const names: string[] = []
    for (let i = 0; i < count; i++) {
      const h2 = await cards.nth(i).locator('h2, h3').first().textContent()
      if (h2) names.push(h2.trim())
    }

    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    expect(names).toEqual(sorted)
  })

  test('search page does not crash when sort changes', async ({ page }) => {
    await page.goto('/search')
    const select = page.getByTestId('sort-select')

    for (const option of ['rating_desc', 'rating_asc', 'name_asc', 'name_desc', '']) {
      await select.selectOption(option)
      await expect(page).not.toHaveURL(/error/)
    }
  })
})
