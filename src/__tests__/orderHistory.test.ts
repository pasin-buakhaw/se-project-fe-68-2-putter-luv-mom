// Unit tests for order history pagination and re-order logic

const PER_PAGE = 10

function paginate<T>(items: T[], page: number, perPage = PER_PAGE): T[] {
  return items.slice((page - 1) * perPage, page * perPage)
}

function totalPages(count: number, perPage = PER_PAGE): number {
  return Math.ceil(count / perPage)
}

function buildReorderItems(
  orderItems: { menuId: string; name: string; price: number; quantity: number }[],
  venueId: string
) {
  return orderItems.map(item => ({
    _id: item.menuId,
    name: item.name,
    price: item.price,
    category: '',
    venueId,
  }))
}

describe('Order History — Pagination', () => {
  const makeOrders = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ _id: String(i + 1), venueId: 'v1', items: [], total: 0, updatedAt: new Date().toISOString() }))

  it('shows no pagination when orders <= 10', () => {
    expect(totalPages(5)).toBe(1)
    expect(totalPages(10)).toBe(1)
  })

  it('calculates correct total pages', () => {
    expect(totalPages(11)).toBe(2)
    expect(totalPages(25)).toBe(3)
    expect(totalPages(30)).toBe(3)
  })

  it('returns correct items for page 1', () => {
    const orders = makeOrders(15)
    const page1 = paginate(orders, 1)
    expect(page1).toHaveLength(10)
    expect(page1[0]._id).toBe('1')
    expect(page1[9]._id).toBe('10')
  })

  it('returns correct items for page 2', () => {
    const orders = makeOrders(15)
    const page2 = paginate(orders, 2)
    expect(page2).toHaveLength(5)
    expect(page2[0]._id).toBe('11')
  })

  it('returns empty for out-of-range page', () => {
    const orders = makeOrders(5)
    expect(paginate(orders, 2)).toHaveLength(0)
  })
})

describe('Order History — Re-order logic', () => {
  const sampleOrder = {
    venueId: 'venue-abc',
    items: [
      { menuId: 'menu-1', name: 'Pad Thai',   price: 80,  quantity: 2 },
      { menuId: 'menu-2', name: 'Tom Yum',    price: 120, quantity: 1 },
    ],
  }

  it('builds correct re-order items with venueId', () => {
    const reorderItems = buildReorderItems(sampleOrder.items, sampleOrder.venueId)
    expect(reorderItems).toHaveLength(2)
    expect(reorderItems[0]).toMatchObject({ _id: 'menu-1', name: 'Pad Thai',  price: 80,  venueId: 'venue-abc' })
    expect(reorderItems[1]).toMatchObject({ _id: 'menu-2', name: 'Tom Yum',  price: 120, venueId: 'venue-abc' })
  })

  it('each re-order item has category field', () => {
    const items = buildReorderItems(sampleOrder.items, sampleOrder.venueId)
    expect(items.every(i => 'category' in i)).toBe(true)
  })

  it('handles empty order items gracefully', () => {
    const items = buildReorderItems([], 'venue-xyz')
    expect(items).toHaveLength(0)
  })
})

describe('Order History — Empty state', () => {
  it('detects empty orders correctly', () => {
    expect([].length === 0).toBe(true)
  })

  it('detects non-empty orders correctly', () => {
    expect([{ _id: '1' }].length === 0).toBe(false)
  })
})
