'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { sortRestaurants, SortOption } from '@/libs/searchUtils'
import VenueCatalog from '@/components/VenueCatalog'
import { VenueJson } from '@/../interface'
import { getAllReviewsLocal } from '@/libs/reviewLocalDb'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Default',   value: '' },
  { label: 'Rating ↓',  value: 'rating_desc' },
  { label: 'Rating ↑',  value: 'rating_asc' },
  { label: 'Name A–Z',  value: 'name_asc' },
  { label: 'Name Z–A',  value: 'name_desc' },
]

export default function VenueSortClient({ venuesJson }: { venuesJson: VenueJson }) {
  const [sort, setSort] = useState<SortOption>('')
  const [query, setQuery] = useState('')
  const [liveVenuesJson, setLiveVenuesJson] = useState(venuesJson)

  // Merge localStorage reviews into venue rating/count on mount
  useEffect(() => {
    const reviews = getAllReviewsLocal()
    const data = venuesJson.data.map((v) => {
      const vr = reviews.filter((r) => {
        const rid = typeof r.restaurant === 'string' ? r.restaurant : (r.restaurant as any)?._id
        return rid === v._id
      })
      if (vr.length === 0) return v
      const avg = (vr.reduce((s, r) => s + r.rating, 0) / vr.length).toFixed(1)
      return { ...v, averageRating: avg, reviewCount: vr.length }
    })
    setLiveVenuesJson({ ...venuesJson, data })
  }, [])

  const filteredSortedVenuesJson = useMemo((): VenueJson => {
    let data = liveVenuesJson.data as any[]

    // Filter by search query (name or address)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      data = data.filter((v: any) =>
        v.name?.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sort) data = sortRestaurants(data as any, sort) as any[]

    return { ...liveVenuesJson, data: data as any }
  }, [liveVenuesJson, sort, query])

  return (
    <div>
      {/* Search bar */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600/50 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search restaurants by name or location…"
          className="w-full pl-10 pr-10 py-3 bg-[#0f0f0f] border border-yellow-600/20
                     text-white text-sm placeholder-gray-600
                     focus:outline-none focus:border-yellow-500/60 transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-yellow-500 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Sort bar + result count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-700 tracking-widest">
          {filteredSortedVenuesJson.data.length} restaurant{filteredSortedVenuesJson.data.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 uppercase tracking-widest">Sort by</span>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 bg-[#0f0f0f] border border-yellow-600/20
                         text-yellow-500 text-xs focus:outline-none focus:border-yellow-500/60
                         transition cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-black">{o.label}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-yellow-500/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {filteredSortedVenuesJson.data.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-gray-600 text-sm tracking-widest">No restaurants found for "{query}"</p>
          <button onClick={() => setQuery('')} className="mt-4 text-xs text-yellow-500 hover:text-yellow-400 transition underline">
            Clear search
          </button>
        </div>
      ) : (
        <VenueCatalog venuesJson={filteredSortedVenuesJson} />
      )}
    </div>
  )
}
