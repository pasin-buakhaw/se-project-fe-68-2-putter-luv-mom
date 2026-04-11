'use client'

import { useState } from 'react'
import { MenuItem, deleteMenu } from '@/libs/getMenus'
import ConfirmDialog from './ConfirmDialog'
import Link from 'next/link'

interface MenuListProps {
  menus: MenuItem[]
  token: string
  onDeleted: (id: string) => void
}

type SortField = 'name' | 'price' | 'category'
type SortOrder = 'asc' | 'desc'

export default function MenuList({ menus, token, onDeleted }: MenuListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const categories = Array.from(new Set(menus.map((m) => m.category))).sort()

  const filtered = menus
    .filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !categoryFilter || m.category === categoryFilter
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      const aVal = sortField === 'price' ? a.price : a[sortField]
      const bVal = sortField === 'price' ? b.price : b[sortField]
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMenu(token, deleteTarget._id)
      onDeleted(deleteTarget._id)
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const sortArrow = (field: SortField) =>
    sortField === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:border-yellow-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500 text-sm py-8 text-center">No menus found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400 text-left">
              <th className="pb-2 pr-4 cursor-pointer hover:text-yellow-400" onClick={() => handleSort('name')}>
                Name{sortArrow('name')}
              </th>
              <th className="pb-2 pr-4 cursor-pointer hover:text-yellow-400" onClick={() => handleSort('category')}>
                Category{sortArrow('category')}
              </th>
              <th className="pb-2 pr-4 cursor-pointer hover:text-yellow-400" onClick={() => handleSort('price')}>
                Price{sortArrow('price')}
              </th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((menu) => (
              <tr key={menu._id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                <td className="py-2 pr-4 text-white">{menu.name}</td>
                <td className="py-2 pr-4 text-zinc-400">{menu.category}</td>
                <td className="py-2 pr-4 text-yellow-400">฿{menu.price.toFixed(2)}</td>
                <td className="py-2 flex gap-2">
                  <Link
                    href={`/admin/menu/${menu._id}/edit`}
                    className="px-3 py-1 text-xs border border-zinc-600 text-zinc-300 rounded hover:bg-zinc-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(menu)}
                    className="px-3 py-1 text-xs border border-red-700 text-red-400 rounded hover:bg-red-900/30 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />
    </div>
  )
}
