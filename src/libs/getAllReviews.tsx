import { getAllReviewsLocal } from '@/libs/reviewLocalDb'

export default async function getAllReviews(_token: string) {
  const data = getAllReviewsLocal()
  return { success: true, count: data.length, data }
}
