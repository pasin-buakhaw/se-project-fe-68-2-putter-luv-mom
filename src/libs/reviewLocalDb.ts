import { ReviewItem } from '../../interface'

const KEY = 'nw_reviews'

function read(): ReviewItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function write(reviews: ReviewItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(reviews))
}

export function getReviewsByVenueLocal(venueId: string): ReviewItem[] {
  return read().filter((r) => {
    const rid = typeof r.restaurant === 'string' ? r.restaurant : r.restaurant?._id
    return rid === venueId
  })
}

export function getAllReviewsLocal(): ReviewItem[] {
  return read()
}

export function createReviewLocal(
  venueId: string,
  rating: number,
  description: string,
  userId: string,
  userName: string
): ReviewItem {
  const all = read()
  const review: ReviewItem = {
    _id: `rev-${Date.now()}`,
    rating,
    description,
    user: { _id: userId, name: userName },
    restaurant: venueId,
    createdAt: new Date().toISOString(),
  }
  write([...all, review])
  return review
}

export function updateReviewLocal(id: string, rating: number, description: string): ReviewItem {
  const all = read()
  const idx = all.findIndex((r) => r._id === id)
  if (idx === -1) throw new Error('Review not found')
  all[idx] = { ...all[idx], rating, description }
  write(all)
  return all[idx]
}

export function deleteReviewLocal(id: string): void {
  write(read().filter((r) => r._id !== id))
}
