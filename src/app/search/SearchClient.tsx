'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, X, Star, MapPin, Phone, Clock,
  BookOpen, SlidersHorizontal, ChevronDown,
} from 'lucide-react'
import {
  applyFilters, extractCategories, extractProvinces, extractDistricts,
  SortOption,
} from '@/libs/searchUtils'
import { RestaurantItem } from '@/libs/getRestaurants'
import { getAllReviewsLocal } from '@/libs/reviewLocalDb'

const RECOMMENDED_THRESHOLD = 4.0
const RECOMMENDED_MAX = 4

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Default',    value: '' },
  { label: 'Rating ↓',  value: 'rating_desc' },
  { label: 'Rating ↑',  value: 'rating_asc' },
  { label: 'Name A–Z',  value: 'name_asc' },
  { label: 'Name Z–A',  value: 'name_desc' },
]

const RATING_OPTIONS = [
  { label: 'Any',      value: '' },
  { label: '4★ & up', value: '4' },
  { label: '3★ & up', value: '3' },
  { label: '2★ & up', value: '2' },
]

export default function SearchClient({ initialRestaurants }: { initialRestaurants: RestaurantItem[] }) {
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [query,       setQuery]       = useState('')
  const [category,   setCategory]    = useState('')
  const [province,   setProvince]    = useState('')
  const [district,   setDistrict]    = useState('')
  const [minRating,  setMinRating]   = useState('')
  const [sort,       setSort]        = useState<SortOption>('')
  const [showFilter, setShowFilter]  = useState(false)

  // Merge localStorage reviews into rating/count on mount
  useEffect(() => {
    const reviews = getAllReviewsLocal()
    setRestaurants(initialRestaurants.map((r) => {
      const vr = reviews.filter((rv) => {
        const rid = typeof rv.restaurant === 'string' ? rv.restaurant : (rv.restaurant as any)?._id
        return rid === r._id
      })
      if (vr.length === 0) return r
      const avg = (vr.reduce((s, rv) => s + rv.rating, 0) / vr.length).toFixed(1)
      return { ...r, averageRating: avg, reviewCount: vr.length }
    }))
  }, [])

  const categories = useMemo(() => extractCategories(restaurants), [restaurants])
  const provinces  = useMemo(() => extractProvinces(restaurants),  [restaurants])
  const districts  = useMemo(() => extractDistricts(restaurants, province || undefined), [restaurants, province])

  const filtered = useMemo(
    () => applyFilters(restaurants, { query, category, province, district, minRating, sort }),
    [restaurants, query, category, province, district, minRating, sort],
  )

  const recommended = useMemo(() => {
    return [...restaurants]
      .filter(r => parseFloat(String(r.averageRating)) >= RECOMMENDED_THRESHOLD)
      .sort((a, b) => parseFloat(String(b.averageRating)) - parseFloat(String(a.averageRating)))
      .slice(0, RECOMMENDED_MAX)
  }, [initialRestaurants])

  const isFiltering = !!(query || category || province || district || minRating || sort)

  // Reset district when province changes
  useEffect(() => { setDistrict('') }, [province])

  const activeFilters: { label: string; onRemove: () => void }[] = []
  if (query)       activeFilters.push({ label: `"${query}"`,         onRemove: () => setQuery('') })
  if (category)    activeFilters.push({ label: category,             onRemove: () => setCategory('') })
  if (province)    activeFilters.push({ label: `📍 ${province}`,    onRemove: () => { setProvince(''); setDistrict('') } })
  if (district)    activeFilters.push({ label: `🏘 ${district}`,    onRemove: () => setDistrict('') })
  if (minRating)   activeFilters.push({ label: `${minRating}★+`,    onRemove: () => setMinRating('') })
  if (sort)        activeFilters.push({ label: SORT_OPTIONS.find(s => s.value === sort)!.label, onRemove: () => setSort('') })

  const filterCount = [category, province, district, minRating].filter(Boolean).length

  function clearAll() {
    setQuery(''); setCategory(''); setProvince(''); setDistrict('')
    setMinRating(''); setSort('')
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <p className="text-yellow-500 text-xs tracking-[0.4em] uppercase mb-4">Discover</p>
          <h1 className="font-playfair text-4xl font-bold text-yellow-500 tracking-widest mb-2">
            Find Your Restaurant
          </h1>
          <div className="flex items-center gap-4 w-48 mx-auto mb-4">
            <div className="flex-1 h-px bg-yellow-500/40" />
            <span className="text-yellow-500/60 text-xs">★</span>
            <div className="flex-1 h-px bg-yellow-500/40" />
          </div>
          <p className="text-gray-500 text-sm tracking-wider">
            Search and filter from our curated collection
          </p>
        </div>

        {/* ── Recommended ────────────────────────────────────────── */}
        {!isFiltering && recommended.length > 0 && (
          <div data-testid="recommended-section" className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-yellow-600/15" />
              <div className="text-center">
                <p className="text-yellow-500 text-xs tracking-[0.35em] uppercase">Top Picks</p>
                <h2 className="font-playfair text-xl font-bold text-white tracking-widest mt-0.5">
                  Recommended
                </h2>
              </div>
              <div className="flex-1 h-px bg-yellow-600/15" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.map((r, i) => {
                const ratingNum = parseFloat(String(r.averageRating))
                return (
                  <div
                    key={r._id}
                    data-testid="recommended-card"
                    data-rating={parseFloat(String(r.averageRating))}
                    className="group relative bg-[#0f0f0f] border border-yellow-600/15
                               hover:border-yellow-500/50 hover:bg-[#141414]
                               transition-all duration-300 p-5 flex flex-col gap-3"
                  >
                    <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-500 flex items-center justify-center">
                      <span className="text-black text-xs font-bold">#{i + 1}</span>
                    </div>

                    <Link href={`/venue/${r._id}`} className="pr-8">
                      <h3 className="font-playfair text-base text-yellow-500 font-bold leading-snug
                                     hover:text-yellow-400 transition line-clamp-2">
                        {r.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={11}
                            className={ratingNum >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}
                          />
                        ))}
                      </div>
                      <span className="text-yellow-400 text-xs font-medium">{ratingNum.toFixed(1)}</span>
                      <span className="text-gray-700 text-xs">({r.reviewCount})</span>
                    </div>

                    <div className="flex items-start gap-1.5 flex-1">
                      <MapPin size={11} className="text-yellow-600/40 mt-0.5 shrink-0" />
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{r.address}</p>
                    </div>

                    <Link
                      href={`/menu?venueId=${r._id}&venueName=${encodeURIComponent(r.name)}`}
                      className="flex items-center justify-center gap-1.5 text-xs py-1.5
                                 text-black bg-yellow-500 hover:bg-yellow-400 transition-all duration-200"
                    >
                      <BookOpen size={11} /> View Menu
                    </Link>
                  </div>
                )
              })}
            </div>

            <div className="h-px bg-yellow-600/10 mt-10" />
          </div>
        )}

        {/* ── Search bar + controls ───────────────────────────────── */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500/50" />
            <input
              data-testid="search-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, address, province…"
              className="w-full pl-10 pr-9 py-3 bg-[#0f0f0f] border border-yellow-600/20 text-white text-sm
                         placeholder-gray-600 focus:outline-none focus:border-yellow-500/60 transition"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition">
                <X size={14} />
              </button>
            )}
          </div>

          <button
            data-testid="filter-toggle-btn"
            onClick={() => setShowFilter(f => !f)}
            className={`flex items-center gap-2 px-4 py-3 border text-sm transition ${
              showFilter || filterCount > 0
                ? 'bg-yellow-500 text-black border-yellow-500'
                : 'border-yellow-600/20 text-yellow-500 hover:border-yellow-500'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {filterCount > 0 && (
              <span className="bg-black/30 text-current text-xs px-1.5 py-0.5 rounded-full">{filterCount}</span>
            )}
          </button>

          <div className="relative">
            <select
              data-testid="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-3 bg-[#0f0f0f] border border-yellow-600/20
                         text-yellow-500 text-sm focus:outline-none focus:border-yellow-500/60 transition cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} className="bg-black">{o.label}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-yellow-500/50 pointer-events-none" />
          </div>
        </div>

        {/* ── Filter panel ────────────────────────────────────────── */}
        {showFilter && (
          <div data-testid="filter-panel" className="mb-4 p-5 bg-[#0f0f0f] border border-yellow-600/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Category */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={!category} onClick={() => setCategory('')} label="ทั้งหมด" />
                {categories.map(c => (
                  <FilterChip key={c} testId="category-chip" active={category === c} onClick={() => setCategory(category === c ? '' : c)} label={c} />
                ))}
              </div>
            </div>

            {/* Province → District hierarchy */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">จังหวัด</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={!province} onClick={() => { setProvince(''); setDistrict('') }} label="ทั้งหมด" />
                  {provinces.map(p => (
                    <FilterChip key={p} active={province === p} onClick={() => setProvince(province === p ? '' : p)} label={p} />
                  ))}
                </div>
              </div>
              {province && districts.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">เขต / อำเภอ</p>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={!district} onClick={() => setDistrict('')} label="ทั้งหมด" />
                    {districts.map(d => (
                      <FilterChip key={d} active={district === d} onClick={() => setDistrict(district === d ? '' : d)} label={d} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rating */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Minimum Rating</p>
              <div className="flex flex-wrap gap-2">
                {RATING_OPTIONS.map(o => (
                  <FilterChip key={o.value} active={minRating === o.value} onClick={() => setMinRating(minRating === o.value ? '' : o.value)} label={o.label} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Active filter chips ─────────────────────────────────── */}
        {activeFilters.length > 0 && (
          <div data-testid="active-filters-bar" className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-gray-600 uppercase tracking-widest">Active:</span>
            {activeFilters.map((f, i) => (
              <button
                key={i}
                onClick={f.onRemove}
                className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30
                           text-yellow-400 text-xs hover:bg-yellow-500/20 transition"
              >
                {f.label} <X size={10} />
              </button>
            ))}
            <button onClick={clearAll} className="text-xs text-gray-600 hover:text-gray-400 transition ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* ── Result count ────────────────────────────────────────── */}
        <p data-testid="result-count" className="text-gray-600 text-xs uppercase tracking-widest mb-6">
          {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* ── Results ─────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div data-testid="no-results" className="py-20 text-center">
            <p className="font-playfair text-2xl text-yellow-600/30 mb-3">No results found</p>
            <p className="text-gray-600 text-sm mb-6">Try adjusting your search or removing some filters.</p>
            <button
              onClick={clearAll}
              className="px-6 py-2 border border-yellow-500/40 text-yellow-500 text-sm hover:bg-yellow-500 hover:text-black transition"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(r => <RestaurantCard key={r._id} r={r} />)}
          </div>
        )}
      </div>
    </main>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FilterChip({
  label, active, onClick, disabled = false, testId,
}: { label: string; active: boolean; onClick: () => void; disabled?: boolean; testId?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      data-active={active ? 'true' : 'false'}
      className={`px-3 py-1 text-xs border transition ${
        active
          ? 'bg-yellow-500 text-black border-yellow-500'
          : disabled
            ? 'border-yellow-600/10 text-gray-700 cursor-not-allowed'
            : 'border-yellow-600/20 text-gray-400 hover:border-yellow-500/50'
      }`}
    >
      {label}
    </button>
  )
}

function RestaurantCard({ r }: { r: RestaurantItem }) {
  const ratingNum = parseFloat(String(r.averageRating))
  const hasRating = !isNaN(ratingNum)

  return (
    <div data-testid="restaurant-card" className="group bg-[#0f0f0f] border border-yellow-600/15 hover:border-yellow-500/50
                    hover:bg-[#141414] transition-all duration-300 p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <Link href={`/venue/${r._id}`} className="flex-1 pr-2">
          <h2 className="font-playfair text-lg text-yellow-500 font-bold leading-snug hover:text-yellow-400 transition">
            {r.name}
          </h2>
          {r.category && (
            <span className="text-xs text-yellow-600/50 uppercase tracking-wider">{r.category}</span>
          )}
        </Link>
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 self-start">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-xs font-medium">{hasRating ? ratingNum.toFixed(1) : '—'}</span>
        </div>
      </div>

      <div className="h-px bg-yellow-600/10 group-hover:bg-yellow-600/20 transition-colors" />

      <div className="flex flex-col gap-2.5 flex-1">
        <div className="flex items-start gap-2">
          <MapPin size={12} className="text-yellow-600/50 mt-0.5 shrink-0" />
          <div>
            <p className="text-gray-400 text-xs leading-relaxed">{r.address}</p>
            {(r.district || r.province) && (
              <p className="text-gray-600 text-xs mt-0.5">
                {[r.district, r.province].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        {r.tel && (
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-yellow-600/50 shrink-0" />
            <p className="text-gray-500 text-xs">{r.tel}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-yellow-600/10">
        <div className="flex items-center gap-1.5">
          <Clock size={11} className="text-green-500/70" />
          <span className="text-green-500/80 text-xs">{r.opentime} – {r.closetime}</span>
        </div>
        <span className="text-gray-700 text-xs">{r.reviewCount} {r.reviewCount === 1 ? 'review' : 'reviews'}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <Link
          href={`/venue/${r._id}`}
          className="flex-1 text-center text-xs py-1.5 px-3 text-yellow-500 border border-yellow-500/40
                     hover:bg-yellow-500 hover:text-black transition-all duration-200"
        >
          View Details
        </Link>
        <Link
          href={`/menu?venueId=${r._id}&venueName=${encodeURIComponent(r.name)}`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 px-3
                     text-black bg-yellow-500 hover:bg-yellow-400 transition-all duration-200"
        >
          <BookOpen size={11} /> Menu
        </Link>
      </div>
    </div>
  )
}
