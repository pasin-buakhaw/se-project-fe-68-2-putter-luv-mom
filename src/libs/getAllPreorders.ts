const PREORDERS_KEY = 'nw_preorders'

export interface PreorderItemData {
  menuId: string
  name: string
  price: number
  quantity: number
}

export interface PreorderData {
  _id: string
  venueId: string
  items: PreorderItemData[]
  total: number
  updatedAt: string
}

function readPreorders(): PreorderData[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PREORDERS_KEY) ?? '[]')
  } catch { return [] }
}

function writePreorders(orders: PreorderData[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREORDERS_KEY, JSON.stringify(orders))
}

export async function getAllPreorders(_token: string): Promise<{ success: boolean; data: PreorderData[] }> {
  return { success: true, data: readPreorders() }
}

export async function confirmPreorder(
  venueId: string,
  items: { menuId: string; name: string; price: number; quantity: number }[],
  _token?: string
): Promise<void> {
  const orders = readPreorders()
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const idx = orders.findIndex((o) => o.venueId === venueId)
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], items, total, updatedAt: new Date().toISOString() }
  } else {
    orders.push({ _id: `po-${Date.now()}`, venueId, items, total, updatedAt: new Date().toISOString() })
  }
  writePreorders(orders)
}

export async function updatePreorderItemQty(venueId: string, menuId: string, quantity: number, _token?: string): Promise<void> {
  const orders = readPreorders()
  const order = orders.find((o) => o.venueId === venueId)
  if (!order) return
  const item = order.items.find((i) => i.menuId === menuId)
  if (!item) return
  item.quantity = quantity
  order.total = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  writePreorders(orders)
}

export async function removePreorderItem(venueId: string, menuId: string, _token?: string): Promise<void> {
  const orders = readPreorders()
  const order = orders.find((o) => o.venueId === venueId)
  if (!order) return
  order.items = order.items.filter((i) => i.menuId !== menuId)
  if (order.items.length === 0) {
    writePreorders(orders.filter((o) => o.venueId !== venueId))
  } else {
    order.total = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
    writePreorders(orders)
  }
}
