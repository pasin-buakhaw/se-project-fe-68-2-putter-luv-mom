import { MenuItem } from './getMenus'

export type SortField = 'name' | 'price' | 'category'
export type SortDirection = 'asc' | 'desc'

export function sortMenuItems(
  items: MenuItem[],
  field: SortField,
  direction: SortDirection,
): MenuItem[] {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const cmp = aStr.localeCompare(bStr)
    return direction === 'asc' ? cmp : -cmp
  })
}

export function toggleDirection(current: SortDirection): SortDirection {
  return current === 'asc' ? 'desc' : 'asc'
}
