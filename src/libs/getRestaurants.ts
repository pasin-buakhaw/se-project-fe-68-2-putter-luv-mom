const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface RestaurantItem {
  _id: string
  name: string
  address: string
  tel: string
  opentime: string
  closetime: string
  averageRating: string | number
  reviewCount: number
  category?: string
  imageUrl?: string
}

export async function getRestaurants(params?: {
  search?: string
  category?: string
  sort?: string
  limit?: number
}): Promise<{ success: boolean; count: number; data: RestaurantItem[] }> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.category) query.set('category', params.category)
  if (params?.sort) query.set('sort', params.sort)
  if (params?.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const url = `${API_URL}/api/v1/restaurants${qs ? '?' + qs : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch restaurants')
  return res.json()
}
