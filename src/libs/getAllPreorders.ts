const API_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')

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

export async function getAllPreorders(token: string): Promise<{ success: boolean; data: PreorderData[] }> {
  const res = await fetch(`${API_URL}/api/v1/preorders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  // treat any "no data" status as empty list
  if (!res.ok) return { success: true, data: [] }
  try {
    const json = await res.json()
    return { ...json, data: json.data ?? [] }
  } catch {
    return { success: true, data: [] }
  }
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
