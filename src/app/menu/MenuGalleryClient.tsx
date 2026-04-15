'use client'

import { MenuItem } from '@/libs/getMenus'
import MenuCard from '@/components/MenuCard'
import PreorderList from '@/components/PreorderList'
import { useState } from 'react'

interface MenuGalleryClientProps {
  initialMenus: MenuItem[]
}

export default function MenuGalleryClient({ initialMenus }: MenuGalleryClientProps) {
  const [categoryFilter, setCategoryFilter] = useState('')

  const categories = Array.from(new Set(initialMenus.map((m) => m.category))).sort()

  const filtered = categoryFilter
    ? initialMenus.filter((m) => m.category === categoryFilter)
    : initialMenus

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Menu gallery */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl text-yellow-500 font-normal">Menu</h1>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mt-1">
              Browse and add items to your pre-order
            </p>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-3 py-1 text-xs rounded border transition ${
                  !categoryFilter
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 text-xs rounded border transition ${
                    categoryFilter === c
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-500">No menu items available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((menu) => (
                <MenuCard key={menu._id} menu={menu} />
              ))}
            </div>
          )}
        </div>

        {/* Pre-order sidebar */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6">
            <PreorderList />
          </div>
        </div>
      </div>
    </main>
  )
}
