"use client"

import { useEffect, useMemo, useState } from "react"
import { ReviewItem } from "../../interface"
import { RATING_LABELS, MAX_DESCRIPTION } from "@/libs/reviewUtils"
import {
  getReviewsByVenueLocal,
  createReviewLocal,
  updateReviewLocal,
  deleteReviewLocal,
} from "@/libs/reviewLocalDb"

type SortBy = "newest" | "oldest" | "highest" | "lowest"

interface Props {
  venueId: string
  token: string | null
  userId: string | null
  initialReviews: ReviewItem[]
}

export default function RatingReview({ venueId, token, userId, initialReviews }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [sortBy, setSortBy] = useState<SortBy>("newest")
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [description, setDescription] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editSelected, setEditSelected] = useState(0)
  const [editHovered, setEditHovered] = useState(0)
  const [editDescription, setEditDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setReviews(getReviewsByVenueLocal(venueId))
  }, [venueId])

  const myReview = reviews.find((r) => {
    const uid = typeof r.user === "string" ? r.user : r.user._id
    return uid === userId
  })

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "highest") return b.rating - a.rating
      if (sortBy === "lowest") return a.rating - b.rating
      return 0
    })
  }, [reviews, sortBy])

  function handleSubmit() {
    if (!selected || !token || !userId) return
    setLoading(true)
    setError("")
    try {
      const userName = (typeof myReview?.user === "object" ? myReview?.user?.name : null) ?? "User"
      const review = createReviewLocal(venueId, selected, description, userId, userName)
      setReviews((prev) => [...prev, review])
      setSelected(0)
      setDescription("")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete() {
    if (!myReview) return
    setDeleting(true)
    setError("")
    try {
      deleteReviewLocal(myReview._id)
      setReviews((prev) => prev.filter((r) => r._id !== myReview._id))
      setConfirmDelete(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  function handleUpdate() {
    if (!editSelected || !myReview) return
    setLoading(true)
    setError("")
    try {
      const updated = updateReviewLocal(myReview._id, editSelected, editDescription)
      setReviews((prev) => prev.map((r) => (r._id === myReview._id ? updated : r)))
      setIsEditing(false)
      setEditSelected(0)
      setEditDescription("")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 border-t border-yellow-600/20 pt-8">
      <h2 className="font-playfair text-xl text-yellow-500 mb-5">Ratings & Reviews</h2>

      {/* Average */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl font-bold text-white">{avg ?? "—"}</span>
        <div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-xl ${avg && parseFloat(avg) >= s ? "text-yellow-400" : "text-gray-700"}`}>★</span>
            ))}
          </div>
          <span className="text-gray-500 text-xs tracking-widest uppercase">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* My review — view */}
      {myReview && !isEditing && (
        <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
          <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Your Review</span>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`text-2xl ${myReview.rating >= s ? "text-yellow-400" : "text-gray-700"}`}>★</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditSelected(myReview.rating); setEditDescription(myReview.description || ""); setIsEditing(true) }}
                className="text-xs text-yellow-500 border border-yellow-500 px-3 py-1 hover:bg-yellow-500 hover:text-black transition-all duration-200"
              >Edit</button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-red-400 border border-red-800 px-3 py-1 hover:bg-red-900/30 transition-all duration-200"
              >Delete</button>
            </div>
          </div>
          <p className="text-sm text-gray-300 whitespace-pre-line">{myReview.description?.trim() || "No description"}</p>
          {confirmDelete && (
            <div className="mt-3 p-3 border border-red-800/40 bg-red-900/10 rounded">
              <p className="text-red-400 text-xs mb-3">Are you sure you want to delete your review?</p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="text-xs px-4 py-1 bg-red-600 text-white hover:bg-red-500 transition disabled:opacity-50">
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="text-xs px-4 py-1 border border-gray-700 text-gray-400 hover:text-white transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My review — edit */}
      {myReview && isEditing && (
        <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
          <span className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">Edit Your Review</span>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onMouseEnter={() => setEditHovered(s)} onMouseLeave={() => setEditHovered(0)} onClick={() => setEditSelected(s)}
                  className={`text-3xl transition-all duration-150 ${(editHovered || editSelected) >= s ? "text-yellow-400 scale-110" : "text-gray-700 hover:text-gray-500"}`}>★</button>
              ))}
            </div>
            {(editHovered || editSelected) > 0 && (
              <span className="text-yellow-400 text-xs font-medium tracking-wide">{RATING_LABELS[editHovered || editSelected]}</span>
            )}
          </div>
          <div className="relative mb-4">
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
              rows={4} placeholder="Write your review description..."
              className="w-full bg-black/40 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none" />
            <span className="absolute bottom-2 right-2 text-xs text-gray-600">{editDescription.length}/{MAX_DESCRIPTION}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleUpdate} disabled={loading || !editSelected}
              className="text-xs px-5 py-1.5 bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-40">
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => { setIsEditing(false); setEditSelected(0); setEditDescription("") }}
              className="text-xs px-5 py-1.5 border border-gray-700 text-gray-400 hover:border-gray-500 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Leave a review */}
      {!myReview && token && (
        <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
          <span className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">Leave a Review</span>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setSelected(s)}
                  className={`text-3xl transition-all duration-150 ${(hovered || selected) >= s ? "text-yellow-400 scale-110" : "text-gray-700 hover:text-gray-500"}`}>★</button>
              ))}
            </div>
            {(hovered || selected) > 0 && (
              <span className="text-yellow-400 text-xs font-medium tracking-wide">{RATING_LABELS[hovered || selected]}</span>
            )}
          </div>
          <div className="relative mb-4">
            <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
              rows={4} placeholder="Write your review description..."
              className="w-full bg-black/40 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 resize-none" />
            <span className="absolute bottom-2 right-2 text-xs text-gray-600">{description.length}/{MAX_DESCRIPTION}</span>
          </div>
          {!selected && <p className="text-yellow-700 text-xs mb-3">Please select a star rating before submitting.</p>}
          <button onClick={handleSubmit} disabled={loading || !selected}
            className="text-xs px-5 py-1.5 bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {!token && (
        <p className="text-gray-600 text-sm">
          <a href="/signin" className="text-yellow-500 hover:underline">Sign in</a>{" "}to leave a review.
        </p>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      {/* Sort + review list */}
      <div className="mt-8">
        {reviews.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-xs uppercase tracking-widest">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-[#111] border border-gray-700 text-gray-300 text-xs px-3 py-1.5 outline-none focus:border-yellow-500 transition"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {reviews.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-6">No reviews yet. Be the first to share your experience!</p>
          )}
          {sortedReviews.map((review) => {
            const userName = typeof review.user === "string" ? "User" : review.user?.name || review.user?.email || "User"
            const initials = userName.slice(0, 2).toUpperCase()
            const formattedDate = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : ""
            return (
              <div key={review._id} className="border border-yellow-600/10 bg-[#111] p-4 flex gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-600/20 flex items-center justify-center shrink-0">
                  <span className="text-yellow-500 text-xs font-semibold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-300 font-medium">{userName}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-base ${review.rating >= s ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                        ))}
                      </div>
                      {formattedDate && <span className="text-gray-600 text-xs">{formattedDate}</span>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
                    {review.description?.trim() || <span className="italic text-gray-600">No description</span>}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
