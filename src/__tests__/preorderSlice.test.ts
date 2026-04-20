import preorderReducer, {
  addToPreorder,
  removeFromPreorder,
  updateQuantity,
  clearPreorder,
} from '../redux/features/preorderSlice'

const mockItem = {
  id: 'item-1',
  name: 'Pad Thai',
  price: 120,
  category: 'Main',
  venueId: 'venue-1',
}

describe('preorderSlice', () => {
  const empty = { items: [] }

  it('adds a new item with quantity 1', () => {
    const state = preorderReducer(empty, addToPreorder(mockItem))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(1)
  })

  it('increments quantity when adding existing item', () => {
    const first = preorderReducer(empty, addToPreorder(mockItem))
    const second = preorderReducer(first, addToPreorder(mockItem))
    expect(second.items).toHaveLength(1)
    expect(second.items[0].quantity).toBe(2)
  })

  it('removes item by id', () => {
    const withItem = preorderReducer(empty, addToPreorder(mockItem))
    const removed = preorderReducer(withItem, removeFromPreorder('item-1'))
    expect(removed.items).toHaveLength(0)
  })

  it('does not remove other items when removing one', () => {
    const item2 = { ...mockItem, id: 'item-2', name: 'Tom Yum' }
    let state = preorderReducer(empty, addToPreorder(mockItem))
    state = preorderReducer(state, addToPreorder(item2))
    state = preorderReducer(state, removeFromPreorder('item-1'))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe('item-2')
  })

  it('updates quantity of existing item', () => {
    const withItem = preorderReducer(empty, addToPreorder(mockItem))
    const updated = preorderReducer(withItem, updateQuantity({ id: 'item-1', quantity: 5 }))
    expect(updated.items[0].quantity).toBe(5)
  })

  it('enforces minimum quantity of 1 on update', () => {
    const withItem = preorderReducer(empty, addToPreorder(mockItem))
    const updated = preorderReducer(withItem, updateQuantity({ id: 'item-1', quantity: 0 }))
    expect(updated.items[0].quantity).toBe(1)
  })

  it('clears all items', () => {
    let state = preorderReducer(empty, addToPreorder(mockItem))
    state = preorderReducer(state, addToPreorder({ ...mockItem, id: 'item-2', name: 'Tom Yum' }))
    state = preorderReducer(state, clearPreorder())
    expect(state.items).toHaveLength(0)
  })

  it('correctly calculates total for multiple items', () => {
    let state = preorderReducer(empty, addToPreorder(mockItem))
    state = preorderReducer(state, addToPreorder({ ...mockItem, id: 'item-2', name: 'Tom Yum', price: 80 }))
    state = preorderReducer(state, updateQuantity({ id: 'item-1', quantity: 2 }))
    const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    expect(total).toBe(320) // 120*2 + 80*1
  })
})

describe('preorderSlice — extended actions', () => {
  const empty = { items: [] }
  const item1 = { id: 'a', name: 'X', price: 100, category: 'C', venueId: 'v1' }
  const item2 = { id: 'b', name: 'Y', price: 50, category: 'C', venueId: 'v2' }

  it('removeAllByVenue removes only items from that venue', () => {
    let state = preorderReducer(empty, addToPreorder(item1))
    state = preorderReducer(state, addToPreorder(item2))
    state = preorderReducer(state, { type: 'preorder/removeAllByVenue', payload: 'v1' })
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe('b')
  })

  it('setQuantityBounded clamps quantity between min and max', () => {
    let state = preorderReducer(empty, addToPreorder(item1))
    state = preorderReducer(state, { type: 'preorder/setQuantityBounded', payload: { id: 'a', quantity: 200, max: 99 } })
    expect(state.items[0].quantity).toBe(99)
  })
})

describe('preorderSlice — quantity bounds', () => {
  const empty = { items: [] }
  const item = { id: 'x', name: 'Test', price: 50, category: 'C', venueId: 'v1' }

  it('updateQuantity enforces minimum of 1 (boundary test)', () => {
    let state = preorderReducer(empty, addToPreorder(item))
    state = preorderReducer(state, updateQuantity({ id: 'x', quantity: -5 }))
    expect(state.items[0].quantity).toBe(1)
  })

  it('setQuantityBounded enforces min of 1 by default', () => {
    let state = preorderReducer(empty, addToPreorder(item))
    state = preorderReducer(state, { type: 'preorder/setQuantityBounded', payload: { id: 'x', quantity: 0 } })
    expect(state.items[0].quantity).toBe(1)
  })
})
