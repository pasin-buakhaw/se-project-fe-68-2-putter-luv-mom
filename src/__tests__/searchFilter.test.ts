import {
  filterByKeyword,
  filterByCategory,
  filterByRating,
  sortRestaurants,
  applyFilters,
  extractCategories,
} from '../libs/searchUtils'
import { RestaurantItem } from '../libs/getRestaurants'

const mockRestaurants: RestaurantItem[] = [
  { _id: '1', name: 'Sushi Zen',    address: 'Bangkok',    tel: '0811111111', opentime: '11:00', closetime: '22:00', averageRating: '4.8', reviewCount: 12, category: 'Japanese' },
  { _id: '2', name: 'Thai Garden',  address: 'Chiang Mai', tel: '0822222222', opentime: '10:00', closetime: '21:00', averageRating: '3.5', reviewCount: 5,  category: 'Thai' },
  { _id: '3', name: 'Pizza House',  address: 'Bangkok',    tel: '0833333333', opentime: '12:00', closetime: '23:00', averageRating: '4.2', reviewCount: 8,  category: 'Italian' },
  { _id: '4', name: 'Noodle Place', address: 'Bangkok',    tel: '0844444444', opentime: '08:00', closetime: '20:00', averageRating: 'No Review', reviewCount: 0, category: 'Thai' },
]

// ── US3-1: Search ──────────────────────────────────────────────────────────

describe('filterByKeyword', () => {
  it('returns all restaurants when query is empty', () => {
    expect(filterByKeyword(mockRestaurants, '')).toHaveLength(4)
  })

  it('filters by name (case-insensitive)', () => {
    const result = filterByKeyword(mockRestaurants, 'sushi')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Sushi Zen')
  })

  it('filters by address', () => {
    const result = filterByKeyword(mockRestaurants, 'Chiang Mai')
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('2')
  })

  it('returns empty array for no matches', () => {
    expect(filterByKeyword(mockRestaurants, 'xyz_no_match')).toHaveLength(0)
  })

  it('matches partial keyword', () => {
    const result = filterByKeyword(mockRestaurants, 'hou')
    expect(result.map(r => r._id)).toContain('3')
  })
})

// ── US3-2: Filter ──────────────────────────────────────────────────────────

describe('filterByCategory', () => {
  it('returns all when category is empty', () => {
    expect(filterByCategory(mockRestaurants, '')).toHaveLength(4)
  })

  it('filters by exact category', () => {
    const thai = filterByCategory(mockRestaurants, 'Thai')
    expect(thai).toHaveLength(2)
    expect(thai.every(r => r.category === 'Thai')).toBe(true)
  })

  it('returns empty for unknown category', () => {
    expect(filterByCategory(mockRestaurants, 'Korean')).toHaveLength(0)
  })
})

describe('filterByRating', () => {
  it('returns all when minRating is empty', () => {
    expect(filterByRating(mockRestaurants, '')).toHaveLength(4)
  })

  it('filters restaurants at or above minimum rating', () => {
    const result = filterByRating(mockRestaurants, '4')
    expect(result).toHaveLength(2)
    expect(result.map(r => r._id)).toEqual(expect.arrayContaining(['1', '3']))
  })

  it('excludes restaurants with "No Review" rating', () => {
    const result = filterByRating(mockRestaurants, '1')
    expect(result.map(r => r._id)).not.toContain('4')
  })
})

describe('applyFilters (combined)', () => {
  it('applies keyword + category together', () => {
    const result = applyFilters(mockRestaurants, { query: 'Bangkok', category: 'Thai' })
    expect(result).toHaveLength(1)
    expect(result[0]._id).toBe('4')
  })

  it('returns empty when combined filters match nothing', () => {
    const result = applyFilters(mockRestaurants, { query: 'Chiang Mai', category: 'Italian' })
    expect(result).toHaveLength(0)
  })
})

describe('extractCategories', () => {
  it('returns unique categories', () => {
    const cats = extractCategories(mockRestaurants)
    expect(cats).toHaveLength(3)
    expect(cats).toContain('Thai')
    expect(cats).toContain('Japanese')
    expect(cats).toContain('Italian')
  })
})

// ── US3-4: Sort ────────────────────────────────────────────────────────────

describe('sortRestaurants', () => {
  it('does not mutate original array', () => {
    const copy = [...mockRestaurants]
    sortRestaurants(mockRestaurants, 'rating_desc')
    expect(mockRestaurants).toEqual(copy)
  })

  it('sorts by rating descending', () => {
    const sorted = sortRestaurants(mockRestaurants, 'rating_desc')
    expect(sorted[0]._id).toBe('1') // 4.8
    expect(sorted[1]._id).toBe('3') // 4.2
    expect(sorted[2]._id).toBe('2') // 3.5
  })

  it('sorts by rating ascending', () => {
    const sorted = sortRestaurants(mockRestaurants, 'rating_asc')
    expect(sorted[0]._id).toBe('4') // No Review → 0
    expect(sorted[1]._id).toBe('2') // 3.5
  })

  it('sorts by name A–Z', () => {
    const sorted = sortRestaurants(mockRestaurants, 'name_asc')
    expect(sorted[0].name).toBe('Noodle Place')
    expect(sorted[sorted.length - 1].name).toBe('Thai Garden')
  })

  it('sorts by name Z–A', () => {
    const sorted = sortRestaurants(mockRestaurants, 'name_desc')
    expect(sorted[0].name).toBe('Thai Garden')
  })

  it('returns original order when sort is empty', () => {
    const result = sortRestaurants(mockRestaurants, '')
    expect(result.map(r => r._id)).toEqual(mockRestaurants.map(r => r._id))
  })
})
