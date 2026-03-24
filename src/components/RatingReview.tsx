"use client"

import { useState } from "react"
import { ReviewItem } from "../../interface"

const BASE = "https://project-bn-sorawat.vercel.app/api/v1"

interface Props {
    venueId: string
    token: string | null
    userId: string | null
    initialReviews: ReviewItem[]
}

export default function RatingReview({ venueId, token, userId, initialReviews }: Props) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
    const [hovered, setHovered] = useState(0)
    const [selected, setSelected] = useState(0)
    const [isEditing, setIsEditing] = useState(false)
    const [editSelected, setEditSelected] = useState(0)
    const [editHovered, setEditHovered] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const myReview = reviews.find(r => {
        const uid = typeof r.user === "string" ? r.user : r.user._id
        return uid === userId
    })

    const avg =
        reviews.length > 0
            ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
            : null

    async function handleSubmit() {
        if (!selected || !token) return
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${BASE}/restaurants/${venueId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: selected }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Failed to submit rating")
            }
            const json = await res.json()
            setReviews(prev => [...prev, json.data])
            setSelected(0)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdate() {
        if (!editSelected || !token || !myReview) return
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${BASE}/reviews/${myReview._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: editSelected }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || "Failed to update rating")
            }
            const json = await res.json()
            setReviews(prev => prev.map(r => (r._id === myReview._id ? json.data : r)))
            setIsEditing(false)
            setEditSelected(0)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-10 border-t border-yellow-600/20 pt-8">
            <h2 className="font-playfair text-xl text-yellow-500 mb-5">Ratings & Reviews</h2>

            {/* Overall summary */}
            <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl font-bold text-white">{avg ?? "—"}</span>
                <div>
                    <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <span
                                key={s}
                                className={`text-xl ${avg && parseFloat(avg) >= s ? "text-yellow-400" : "text-gray-700"}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="text-gray-500 text-xs tracking-widest uppercase">
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </span>
                </div>
            </div>

            {/* My existing review — view mode */}
            {myReview && !isEditing && (
                <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">
                        Your Rating
                    </span>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <span
                                    key={s}
                                    className={`text-2xl ${myReview.rating >= s ? "text-yellow-400" : "text-gray-700"}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setEditSelected(myReview.rating)
                                setIsEditing(true)
                            }}
                            className="text-xs text-yellow-500 border border-yellow-500 px-3 py-1
                                       hover:bg-yellow-500 hover:text-black transition-all duration-200"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            )}

            {/* My existing review — edit mode */}
            {myReview && isEditing && (
                <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">
                        Edit Your Rating
                    </span>
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                onMouseEnter={() => setEditHovered(s)}
                                onMouseLeave={() => setEditHovered(0)}
                                onClick={() => setEditSelected(s)}
                                className={`text-3xl transition-colors ${
                                    (editHovered || editSelected) >= s
                                        ? "text-yellow-400"
                                        : "text-gray-700"
                                }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdate}
                            disabled={loading || !editSelected}
                            className="text-xs px-5 py-1.5 bg-yellow-500 text-black font-medium
                                       hover:bg-yellow-400 transition disabled:opacity-40"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false)
                                setEditSelected(0)
                            }}
                            className="text-xs px-5 py-1.5 border border-gray-700 text-gray-400
                                       hover:border-gray-500 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* New review form */}
            {!myReview && token && (
                <div className="mb-6 p-4 border border-yellow-600/30 bg-yellow-500/5">
                    <span className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">
                        Leave a Rating
                    </span>
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                onMouseEnter={() => setHovered(s)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setSelected(s)}
                                className={`text-3xl transition-colors ${
                                    (hovered || selected) >= s ? "text-yellow-400" : "text-gray-700"
                                }`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selected}
                        className="text-xs px-5 py-1.5 bg-yellow-500 text-black font-medium
                                   hover:bg-yellow-400 transition disabled:opacity-40"
                    >
                        {loading ? "Submitting..." : "Submit Rating"}
                    </button>
                </div>
            )}

            {/* Not signed in */}
            {!token && (
                <p className="text-gray-600 text-sm">
                    <a href="/signin" className="text-yellow-500 hover:underline">
                        Sign in
                    </a>{" "}
                    to leave a rating.
                </p>
            )}

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </div>
    )
}
