const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

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

// Admin → GET /preorders (all). Regular user → GET /preorders/mine (own across venues).
export async function getAllPreorders(token: string, role?: string): Promise<{ success: boolean; data: PreorderData[] }> {
  const headers = { Authorization: `Bearer ${token}` }
  const path = role === 'admin' ? '/api/v1/preorders' : '/api/v1/preorders/mine'

  const res = await fetch(`${API_URL}${path}`, { headers, cache: 'no-store' })
  if (res.status === 404) return { success: true, data: [] }
  if (!res.ok) throw new Error(`Failed to fetch preorders (${res.status})`)
  const json = await res.json()
  const list = (Array.isArray(json.data) ? json.data : []) as Array<{ _id?: string; venueId?: string; items?: PreorderItemData[]; total?: number; updatedAt?: string }>
  const data: PreorderData[] = list
    .filter(o => Array.isArray(o.items) && o.items.length > 0 && typeof o.venueId === 'string')
    .map(o => ({
      _id: o._id ?? '',
      venueId: o.venueId as string,
      items: o.items as PreorderItemData[],
      total: o.total ?? 0,
      updatedAt: o.updatedAt ?? '',
    }))
  return { success: true, data }
}

export async function updatePreorderItemQty(venueId: string, menuId: string, quantity: number, token?: string): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}/api/v1/preorders/${venueId}/items/${menuId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) throw new Error('Failed to update item')
}

export async function removePreorderItem(venueId: string, menuId: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}/api/v1/preorders/${venueId}/items/${menuId}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) throw new Error('Failed to remove item')
}

export async function confirmPreorder(
  venueId: string,
  items: { menuId: string; name: string; price: number; quantity: number }[],
  token?: string
): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}/api/v1/preorders/${venueId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error('Failed to confirm preorder')
}
