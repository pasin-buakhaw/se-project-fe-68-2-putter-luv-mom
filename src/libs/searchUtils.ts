import { RestaurantItem } from './getRestaurants'

export type SortOption = 'rating_desc' | 'rating_asc' | 'name_asc' | 'name_desc' | ''

export interface FilterParams {
  query?: string
  category?: string
  minRating?: string
  sort?: SortOption
}

export function filterByKeyword(list: RestaurantItem[], query: string): RestaurantItem[] {
  if (!query.trim()) return list
  const q = query.toLowerCase()
  return list.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.address ?? '').toLowerCase().includes(q)
  )
}

export function filterByCategory(list: RestaurantItem[], category: string): RestaurantItem[] {
  if (!category) return list
  return list.filter((r) => r.category === category)
}

export function filterByRating(list: RestaurantItem[], minRating: string): RestaurantItem[] {
  if (!minRating) return list
  const min = parseFloat(minRating)
  return list.filter((r) => {
    const avg = parseFloat(String(r.averageRating))
    return !isNaN(avg) && avg >= min
  })
}

export function sortRestaurants(list: RestaurantItem[], sort: SortOption): RestaurantItem[] {
  if (!sort) return list
  const sorted = [...list]
  sorted.sort((a, b) => {
    const rA = parseFloat(String(a.averageRating)) || 0
    const rB = parseFloat(String(b.averageRating)) || 0
    switch (sort) {
      case 'rating_desc': return rB - rA
      case 'rating_asc':  return rA - rB
      case 'name_asc':    return a.name.localeCompare(b.name)
      case 'name_desc':   return b.name.localeCompare(a.name)
      default:            return 0
    }
  })
  return sorted
}

export function applyFilters(list: RestaurantItem[], params: FilterParams): RestaurantItem[] {
  let result = filterByKeyword(list, params.query ?? '')
  result = filterByCategory(result, params.category ?? '')
  result = filterByRating(result, params.minRating ?? '')
  result = sortRestaurants(result, params.sort ?? '')
  return result
}

export function extractCategories(list: RestaurantItem[]): string[] {
  return Array.from(new Set(list.map((r) => r.category).filter(Boolean))) as string[]
}
