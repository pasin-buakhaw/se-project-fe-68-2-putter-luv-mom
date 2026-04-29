'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import dayjs, { Dayjs } from 'dayjs'
import {
  LayoutDashboard, UtensilsCrossed, CalendarCheck, Star,
  Plus, Pencil, Trash2, Search, ChevronDown, ChevronRight,
  X, Check, Store, Calendar, User, AlertTriangle, RefreshCw,
  Menu as Bars, ShoppingBag, Minus,
} from 'lucide-react'

import { MenuItem as MenuItemType, getAllMenus, createMenu, updateMenu, deleteMenu } from '@/libs/getMenus'
import { ReviewItem } from '../../interface'
import getAllReviews from '@/libs/getAllReviews'
import getReservations from '@/libs/getReservations'
import updateReservation from '@/libs/updateReservation'
import deleteReservation from '@/libs/deleteReservation'
import DateReserve from '@/components/DateReserve'
import { getAllPreorders, updatePreorderItemQty, removePreorderItem, PreorderData } from '@/libs/getAllPreorders'
import { deleteReviewLocal, updateReviewLocal } from '@/libs/reviewLocalDb'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'overview' | 'menus' | 'reservations' | 'reviews' | 'preorders'

const NAV: { id: Section; label: string; Icon: React.ElementType; sub: string }[] = [
  { id: 'overview',     label: 'Overview',         Icon: LayoutDashboard, sub: 'Dashboard stats'      },
  { id: 'menus',        label: 'Menu Management',  Icon: UtensilsCrossed, sub: 'Add · Edit · Delete'  },
  { id: 'reservations', label: 'Reservations',     Icon: CalendarCheck,   sub: 'All bookings'         },
  { id: 'reviews',      label: 'Reviews',          Icon: Star,            sub: 'Ratings & feedback'   },
  { id: 'preorders',    label: 'Pre-orders',       Icon: ShoppingBag,     sub: 'Orders by restaurant' },
]

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.token ?? ''
  const [active, setActive] = useState<Section>('overview')
  const [slim, setSlim] = useState(false)

  return (
    <div className="flex bg-[#080808] min-h-[calc(100vh-64px)]">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-[#0d0d0d] border-r border-yellow-600/10 flex flex-col z-40 transition-all duration-300 ${
          slim ? 'w-16' : 'w-60'
        }`}
      >
        <div className="p-3 flex justify-end border-b border-yellow-600/10">
          <button
            onClick={() => setSlim(!slim)}
            className="text-zinc-500 hover:text-yellow-500 transition p-1 rounded"
            title={slim ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Bars size={16} />
          </button>
        </div>

        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ id, label, Icon, sub }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded transition-all ${
                active === id
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-600/20'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {!slim && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate leading-tight">{label}</p>
                  <p className="text-[10px] text-zinc-600 truncate mt-0.5">{sub}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {!slim && (
          <div className="p-4 border-t border-yellow-600/10">
            <p className="text-[10px] text-zinc-700 tracking-widest uppercase">Putter Admin v2</p>
          </div>
        )}
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 transition-all duration-300 ${slim ? 'ml-16' : 'ml-60'}`}
      >
        <div className="px-8 py-8 max-w-6xl">
          {/* Section heading */}
          {NAV.filter((n) => n.id === active).map(({ label, sub }) => (
            <div key={label} className="mb-8">
              <h1 className="text-2xl text-yellow-500 font-light tracking-wide">{label}</h1>
              <p className="text-xs text-zinc-600 tracking-widest uppercase mt-1">{sub}</p>
            </div>
          ))}

          {active === 'overview'     && <OverviewSection     token={token} onNavigate={setActive} />}
          {active === 'menus'        && <MenuSection         token={token} />}
          {active === 'reservations' && <ReservationsSection token={token} />}
          {active === 'reviews'      && <ReviewsSection      token={token} />}
          {active === 'preorders'    && <PreordersSection    token={token} />}
        </div>
      </div>
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewSection({ token, onNavigate }: { token: string; onNavigate: (s: Section) => void }) {
  const [stats, setStats] = useState({ menus: 0, reservations: 0, reviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      getAllMenus(token).then((j) => j.data.length).catch(() => 0),
      getReservations(token).then((j: any) => (j.data ?? []).length).catch(() => 0),
      getAllReviews(token).then((j: any) => (j.data ?? []).length).catch(() => 0),
    ]).then(([menus, reservations, reviews]) => {
      setStats({ menus, reservations, reviews })
    }).finally(() => setLoading(false))
  }, [token])

  const cards = [
    { label: 'Menu Items',    value: stats.menus,        Icon: UtensilsCrossed, color: 'text-yellow-400',  bg: 'bg-yellow-500/5',  border: 'border-yellow-600/20' },
    { label: 'Reservations',  value: stats.reservations, Icon: CalendarCheck,   color: 'text-blue-400',    bg: 'bg-blue-500/5',    border: 'border-blue-600/20'   },
    { label: 'Reviews',       value: stats.reviews,      Icon: Star,            color: 'text-purple-400',  bg: 'bg-purple-500/5',  border: 'border-purple-600/20' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} p-6 rounded`}>
            <div className={`${color} mb-4`}><Icon size={22} /></div>
            {loading ? (
              <div className="h-9 w-14 bg-zinc-800 animate-pulse rounded mb-2" />
            ) : (
              <p className="text-4xl font-light text-white">{value}</p>
            )}
            <p className="text-xs text-zinc-600 mt-1 tracking-widest uppercase">{label}</p>
          </div>
        ))}
      </div>

      <div className="border border-yellow-600/10 p-6 rounded bg-[#0d0d0d]">
        <h2 className="text-yellow-500 text-sm mb-3 tracking-widest uppercase">Quick Navigation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {NAV.filter((n) => n.id !== 'overview').map(({ id, label, Icon, sub }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="border border-yellow-600/10 p-4 rounded bg-black/20 hover:border-yellow-500/40 hover:bg-yellow-500/5 transition text-left w-full"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-yellow-600/60" />
                <p className="text-sm text-zinc-300">{label}</p>
              </div>
              <p className="text-xs text-zinc-600">{sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Menu Section (CRUD) ─────────────────────────────────────────────────────

type MenuForm = { name: string; price: string; category: string; description: string; venueId: string }
const EMPTY_MENU_FORM: MenuForm = { name: '', price: '', category: '', description: '', venueId: '' }

function MenuSection({ token }: { token: string }) {
  const [items, setItems] = useState<MenuItemType[]>([])
  const [restaurants, setRestaurants] = useState<{ _id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('')

  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<MenuItemType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MenuItemType | null>(null)
  const [form, setForm] = useState<MenuForm>(EMPTY_MENU_FORM)
  const [formErrors, setFormErrors] = useState<Partial<MenuForm>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = () => {
    setLoading(true)
    Promise.all([
      getAllMenus(token),
      fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/v1/restaurants`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([menuJson, venueRes]) => {
      setItems(menuJson.data)
      setRestaurants(venueRes.data ?? [])
    })
    .catch((e: any) => setError(e.message))
    .finally(() => setLoading(false))
  }

  useEffect(() => { if (token) load() }, [token])

  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items])

  const filtered = useMemo(() =>
    items.filter((i) => {
      const ms = i.name.toLowerCase().includes(search.toLowerCase())
      const mc = catFilter ? i.category === catFilter : true
      const mr = restaurantFilter ? i.venueId === restaurantFilter : true
      return ms && mc && mr
    }), [items, search, catFilter, restaurantFilter])

  function openAdd() {
    setForm(EMPTY_MENU_FORM)
    setFormErrors({})
    setEditTarget(null)
    setDialogMode('add')
  }

  function openEdit(item: MenuItemType) {
    setForm({ name: item.name, price: String(item.price), category: item.category, description: item.description ?? '', venueId: item.venueId })
    setFormErrors({})
    setEditTarget(item)
    setDialogMode('edit')
  }

  function closeDialog() {
    setDialogMode(null)
    setEditTarget(null)
  }

  function validate(): boolean {
    const e: Partial<MenuForm> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Must be a positive number'
    if (!form.category.trim()) e.category = 'Required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category.trim(),
        description: form.description.trim(),
        venueId: form.venueId,
      }
      if (dialogMode === 'edit' && editTarget) {
        const updated = await updateMenu(token, editTarget._id, payload)
        setItems((prev) => prev.map((i) => (i._id === editTarget._id ? updated : i)))
        showToast('Menu item updated')
      } else {
        const created = await createMenu(token, payload)
        setItems((prev) => [...prev, created])
        showToast('Menu item created')
      }
      closeDialog()
    } catch (e: any) {
      setFormErrors({ name: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteMenu(token, deleteTarget._id)
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id))
      showToast(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black text-sm font-medium px-5 py-2.5 shadow-lg">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            placeholder="Search menus…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#111] border border-zinc-800 text-white text-sm pl-8 pr-3 py-2 outline-none focus:border-yellow-500 transition w-52 rounded"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-[#111] border border-zinc-800 text-zinc-300 text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
          className="bg-[#111] border border-zinc-800 text-zinc-300 text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded"
        >
          <option value="">All restaurants</option>
          {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>

        <button
          onClick={load}
          className="p-2 border border-zinc-800 text-zinc-500 hover:text-yellow-500 hover:border-yellow-600/40 transition rounded"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>

        <button
          onClick={openAdd}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition rounded"
        >
          <Plus size={14} /> Add Menu
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 border border-red-900/30 bg-red-900/10 rounded">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 text-zinc-500 text-sm py-12 justify-center">
          <RefreshCw size={16} className="animate-spin" /> Loading menus…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-zinc-600 text-sm py-12 text-center">No menu items found.</p>
      ) : (
        <div className="border border-yellow-600/10 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#111]">
                <tr className="text-zinc-500 text-[10px] tracking-widest uppercase border-b border-yellow-600/10">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Restaurant</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const restaurant = restaurants.find(r => r._id === item.venueId)
                  return (
                    <tr
                      key={item._id}
                      className={`border-b border-yellow-600/5 last:border-0 hover:bg-[#131313] transition ${
                        i % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#080808]'
                      }`}
                    >
                      <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 text-[10px] border border-yellow-600/30 text-yellow-600 tracking-wide uppercase rounded">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-yellow-400 font-mono">฿{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-yellow-500 font-mono">{restaurant ? restaurant.name : '—'}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs max-w-[200px] truncate hidden md:table-cell">
                        {item.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition rounded"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 transition rounded"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-[#0d0d0d] border-t border-yellow-600/10">
            <p className="text-xs text-zinc-600">
              Showing {filtered.length} of {items.length} items
            </p>
          </div>
        </div>
      )}

      {/* ── Add / Edit Dialog ──────────────────────────────────────────────── */}
      {dialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#111] border border-yellow-600/20 w-full max-w-md rounded shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-600/10">
              <h3 className="text-yellow-500 text-base font-light">
                {dialogMode === 'edit' ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button onClick={closeDialog} className="text-zinc-500 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormErrors((fe) => ({ ...fe, name: '' })) }}
                  className={`w-full bg-[#1a1a1a] border text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded ${formErrors.name ? 'border-red-500' : 'border-zinc-700'}`}
                  placeholder="e.g. Pad Thai"
                />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Price (฿) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => { setForm((f) => ({ ...f, price: e.target.value })); setFormErrors((fe) => ({ ...fe, price: '' })) }}
                  className={`w-full bg-[#1a1a1a] border text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded ${formErrors.price ? 'border-red-500' : 'border-zinc-700'}`}
                  placeholder="0.00"
                />
                {formErrors.price && <p className="text-red-400 text-xs mt-1">{formErrors.price}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Category *</label>
                <input
                  value={form.category}
                  onChange={(e) => { setForm((f) => ({ ...f, category: e.target.value })); setFormErrors((fe) => ({ ...fe, category: '' })) }}
                  className={`w-full bg-[#1a1a1a] border text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded ${formErrors.category ? 'border-red-500' : 'border-zinc-700'}`}
                  placeholder="e.g. Main Course"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
                {formErrors.category && <p className="text-red-400 text-xs mt-1">{formErrors.category}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded resize-none"
                  placeholder="Short description (optional)"
                />
              </div>

              {/* Venue / Restaurant */}
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Restaurant *</label>
                <select
                  value={form.venueId}
                  onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded"
                >
                  <option value="">— Select restaurant —</option>
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-yellow-600/10 flex gap-3 justify-end">
              <button onClick={closeDialog} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm hover:text-white transition rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition disabled:opacity-50 flex items-center gap-2 rounded"
              >
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                {dialogMode === 'edit' ? 'Save Changes' : 'Create Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#111] border border-red-900/40 w-full max-w-sm rounded shadow-2xl">
            <div className="px-6 py-4 border-b border-red-900/20 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <h3 className="text-red-400 font-light">Confirm Delete</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Delete <strong className="text-white">"{deleteTarget.name}"</strong>?
                <br />
                <span className="text-zinc-600 text-xs">This action cannot be undone.</span>
              </p>
            </div>
            <div className="px-6 py-4 border-t border-red-900/20 flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm hover:text-white transition rounded">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-500 transition flex items-center gap-2 rounded">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reservations Section ────────────────────────────────────────────────────

function ReservationsSection({ token }: { token: string }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<Dayjs | null>(null)
  const [editTime, setEditTime] = useState('18:00')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const [resData, venueRes] = await Promise.all([
        getReservations(token),
        fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/v1/restaurants`).then(r => r.json()).catch(() => ({ data: [] })),
      ])
      const items: any[] = resData.data ?? []
      setBookings(items)
      const ids = new Set(items.map((b) => b.restaurantId || 'unknown'))
      setExpanded(ids as Set<string>)
      const nameMap: Record<string, string> = {}
      for (const v of venueRes.data ?? []) nameMap[v._id] = v.name
      setRestaurantNames(nameMap)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [token])

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; items: any[] }>()
    for (const b of bookings) {
      const id   = b.restaurantId || 'unknown'
      const name = restaurantNames[id] || id
      if (!map.has(id)) map.set(id, { id, name, items: [] })
      map.get(id)!.items.push(b)
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [bookings, restaurantNames])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this reservation?')) return
    try {
      await deleteReservation(id, token)
      setBookings((prev) => prev.filter((b) => b._id !== id))
    } catch (e: any) { alert(e.message) }
  }

  async function handleSave(id: string) {
    if (!editDate) return
    try {
      const dateStr = `${dayjs(editDate).format('YYYY-MM-DD')}T${editTime}:00.000Z`
      await updateReservation(id, dateStr, editTime, token)
      setEditingId(null)
      load()
    } catch (e: any) { alert(e.message) }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-zinc-500 text-sm py-12 justify-center">
      <RefreshCw size={16} className="animate-spin" /> Loading reservations…
    </div>
  )
  if (bookings.length === 0) return <p className="text-zinc-600 text-sm py-12 text-center">No reservations found.</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">{bookings.length} total · {grouped.length} restaurant(s)</p>
        <div className="flex gap-2">
          <button onClick={() => setExpanded(new Set(grouped.map((g) => g.id)))} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Expand all</button>
          <span className="text-zinc-700">·</span>
          <button onClick={() => setExpanded(new Set())} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Collapse all</button>
        </div>
      </div>

      {grouped.map((group) => (
        <div key={group.id} className="border border-yellow-600/10 rounded overflow-hidden">
          {/* Group Header */}
          <button
            onClick={() => toggle(group.id)}
            className="w-full flex items-center justify-between px-5 py-4 bg-[#111] hover:bg-[#141414] transition text-left"
          >
            <div className="flex items-center gap-3">
              <Store size={15} className="text-yellow-600/50 shrink-0" />
              <div>
                <p className="text-yellow-400 text-sm font-medium">{group.name}</p>
                <p className="text-zinc-600 text-xs mt-0.5">{group.items.length} reservation(s)</p>
              </div>
            </div>
            {expanded.has(group.id)
              ? <ChevronDown size={15} className="text-zinc-500 shrink-0" />
              : <ChevronRight size={15} className="text-zinc-500 shrink-0" />}
          </button>

          {/* Booking rows */}
          {expanded.has(group.id) && (
            <div className="border-t border-yellow-600/10 divide-y divide-yellow-600/5">
              {group.items.map((item) => (
                <div key={item._id} className="px-5 py-4 bg-[#0a0a0a]">
                  {editingId === item._id ? (
                    <div className="flex flex-col gap-3 max-w-sm">
                      <p className="text-[10px] text-yellow-500 uppercase tracking-widest">Editing Reservation</p>
                      <div className="bg-[#111] border border-zinc-700 p-3 rounded">
                        <DateReserve onDateChange={(v) => setEditDate(v)} />
                      </div>
                      <input
                        type="time"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="bg-[#111] border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 [color-scheme:dark] rounded"
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-xs hover:text-white transition rounded">
                          Cancel
                        </button>
                        <button onClick={() => handleSave(item._id)} className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-medium hover:bg-yellow-400 transition flex items-center gap-1.5 rounded">
                          <Check size={12} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-col gap-1.5">
                        {/* Restaurant Name */}
                        <div className="flex items-center gap-2 text-xs text-yellow-500">
                          <Store size={11} className="text-yellow-600/40" />
                          <span className="text-[10px] text-yellow-600 uppercase tracking-widest">Restaurant:</span>
                          <span className="font-mono text-yellow-400 text-xs">{restaurantNames[item.restaurantId] || item.restaurantId || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <User size={11} className="text-yellow-600/40" />
                          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">User ID:</span>
                          <span className="font-mono text-zinc-400 text-xs">{item.userId || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Calendar size={11} className="text-yellow-600/40" />
                          {item.date ? dayjs(item.date).format('DD MMM YYYY') : '—'} · {item.time || '—'}
                        </div>
                        {item.status && (
                          <span className={`text-[10px] uppercase tracking-widest font-mono ${item.status === 'confirmed' ? 'text-green-400' : item.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setEditingId(item._id); setEditDate(null); setEditTime(item.time || '18:00') }}
                          className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition rounded"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 transition rounded"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Pre-orders Section ──────────────────────────────────────────────────────

function PreordersSection({ token }: { token: string }) {
  const [orders, setOrders] = useState<PreorderData[]>([])
  const [venueNames, setVenueNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<{ venueId: string; menuId: string; qty: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [preRes, venueRes] = await Promise.all([
        getAllPreorders(token),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/restaurants`).then((r) => r.json()).catch(() => ({ data: [] })),
      ])
      const items: PreorderData[] = preRes.data ?? []
      setOrders(items)
      setExpanded(new Set(items.map((o) => o.venueId)))

      const nameMap: Record<string, string> = {}
      for (const v of venueRes.data ?? []) {
        nameMap[v._id] = v.name
      }
      setVenueNames(nameMap)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleQtyChange(venueId: string, menuId: string, newQty: number) {
    if (newQty < 1) {
      await handleRemove(venueId, menuId)
      return
    }
    setSaving(true)
    try {
      await updatePreorderItemQty(venueId, menuId, newQty, token)
      setOrders((prev) =>
        prev.map((o) =>
          o.venueId === venueId
            ? { ...o, items: o.items.map((it) => it.menuId === menuId ? { ...it, quantity: newQty } : it) }
            : o
        )
      )
      setEditing(null)
      showToast('Quantity updated')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(venueId: string, menuId: string) {
    if (!confirm('Remove this item from the order?')) return
    setSaving(true)
    try {
      await removePreorderItem(venueId, menuId, token)
      setOrders((prev) =>
        prev.map((o) =>
          o.venueId === venueId
            ? { ...o, items: o.items.filter((it) => it.menuId !== menuId) }
            : o
        ).filter((o) => o.items.length > 0)
      )
      showToast('Item removed')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-zinc-500 text-sm py-12 justify-center">
      <RefreshCw size={16} className="animate-spin" /> Loading pre-orders…
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-2 text-red-400 text-sm p-3 border border-red-900/30 bg-red-900/10 rounded">
      <AlertTriangle size={14} /> {error}
    </div>
  )

  const totalItems = orders.reduce((s, o) => s + o.items.reduce((ss, it) => ss + it.quantity, 0), 0)

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black text-sm font-medium px-5 py-2.5 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest">
          {orders.length} restaurant(s) · {totalItems} item(s) total
        </p>
        <div className="flex gap-3">
          <button onClick={() => setExpanded(new Set(orders.map((o) => o.venueId)))} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Expand all</button>
          <span className="text-zinc-700">·</span>
          <button onClick={() => setExpanded(new Set())} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Collapse all</button>
          <span className="text-zinc-700">·</span>
          <button onClick={load} className="text-xs text-zinc-500 hover:text-yellow-500 transition flex items-center gap-1"><RefreshCw size={11} /> Refresh</button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-zinc-600 text-sm py-12 text-center">No pre-orders found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const name = venueNames[order.venueId] || order.venueId
            const subtotal = order.items.reduce((s, it) => s + it.price * it.quantity, 0)
            return (
              <div key={order.venueId} className="border border-yellow-600/10 rounded overflow-hidden">
                {/* Restaurant header */}
                <button
                  onClick={() => toggle(order.venueId)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#111] hover:bg-[#141414] transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Store size={15} className="text-yellow-600/50 shrink-0" />
                    <div>
                      <p className="text-yellow-400 text-base font-bold mb-0.5">{name}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">
                        {order.items.length} menu item(s) · {order.items.reduce((s, it) => s + it.quantity, 0)} qty total
                      </p>
                      <p className="text-zinc-700 text-[10px] font-mono mt-0.5">Order ID: {order._id}</p>
                      <p className="text-zinc-500 text-xs font-mono mt-0.5">Restaurant ID: {order.venueId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-yellow-400 text-sm font-mono">฿{subtotal.toFixed(2)}</span>
                    {expanded.has(order.venueId)
                      ? <ChevronDown size={15} className="text-zinc-500" />
                      : <ChevronRight size={15} className="text-zinc-500" />}
                  </div>
                </button>

                {/* Items */}
                {expanded.has(order.venueId) && (
                  <div className="border-t border-yellow-600/10 divide-y divide-yellow-600/5">
                    {/* Column header */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-2 bg-[#0d0d0d]">
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Item</span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest text-right w-20">Unit price</span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest text-center w-28">Quantity</span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest text-right w-16">Actions</span>
                    </div>

                    {order.items.map((item) => {
                      const isEditing = editing?.venueId === order.venueId && editing?.menuId === item.menuId
                      return (
                        <div key={item.menuId} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 bg-[#0a0a0a] hover:bg-[#0c0c0c] transition">
                          {/* Name */}
                          <div>
                            <p className="text-white text-sm">{item.name}</p>
                            <p className="text-zinc-600 text-xs font-mono mt-0.5">฿{(item.price * item.quantity).toFixed(2)} subtotal</p>
                          </div>

                          {/* Unit price */}
                          <span className="text-zinc-400 text-sm font-mono text-right w-20">฿{item.price.toFixed(2)}</span>

                          {/* Quantity control */}
                          <div className="flex items-center gap-1.5 w-28 justify-center">
                            {isEditing ? (
                              <>
                                <input
                                  type="number"
                                  min={1}
                                  value={editing.qty}
                                  onChange={(e) => setEditing({ ...editing, qty: Math.max(1, Number(e.target.value)) })}
                                  className="w-14 bg-[#1a1a1a] border border-yellow-500/50 text-white text-sm text-center px-2 py-1 outline-none rounded"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleQtyChange(order.venueId, item.menuId, editing.qty)}
                                  disabled={saving}
                                  className="p-1 text-yellow-500 hover:text-yellow-300 transition"
                                  title="Confirm"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditing(null)}
                                  className="p-1 text-zinc-500 hover:text-white transition"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleQtyChange(order.venueId, item.menuId, item.quantity - 1)}
                                  disabled={saving}
                                  className="p-1 border border-zinc-700 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition rounded"
                                  title="Decrease"
                                >
                                  <Minus size={11} />
                                </button>
                                <button
                                  onClick={() => setEditing({ venueId: order.venueId, menuId: item.menuId, qty: item.quantity })}
                                  className="text-white text-sm font-mono w-8 text-center hover:text-yellow-400 transition"
                                  title="Click to edit"
                                >
                                  {item.quantity}
                                </button>
                                <button
                                  onClick={() => handleQtyChange(order.venueId, item.menuId, item.quantity + 1)}
                                  disabled={saving}
                                  className="p-1 border border-zinc-700 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition rounded"
                                  title="Increase"
                                >
                                  <Plus size={11} />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Delete */}
                          <div className="flex justify-end w-16">
                            <button
                              onClick={() => handleRemove(order.venueId, item.menuId)}
                              disabled={saving}
                              className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 transition rounded"
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Restaurant total */}
                    <div className="px-5 py-3 bg-[#0d0d0d] flex justify-end">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mr-3">Total</p>
                      <p className="text-yellow-400 text-sm font-mono">฿{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Reviews Section ─────────────────────────────────────────────────────────

type ReviewEditForm = { rating: number; description: string }

function ReviewsSection({ token }: { token: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [restaurantNames, setRestaurantNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null)
  const [editTarget, setEditTarget] = useState<ReviewItem | null>(null)
  const [editForm, setEditForm] = useState<ReviewEditForm>({ rating: 5, description: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = () => {
    if (!token) return
    setLoading(true)
    Promise.all([
      getAllReviews(token),
      fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/v1/restaurants`).then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([data, venueRes]: any[]) => {
      const items: ReviewItem[] = data.data ?? []
      setReviews(items)
      const ids = new Set(items.map((r) => typeof r.restaurant === 'string' ? r.restaurant : r.restaurant?._id ?? 'unknown'))
      setExpanded(ids as Set<string>)
      const nameMap: Record<string, string> = {}
      for (const v of venueRes.data ?? []) nameMap[v._id] = v.name
      setRestaurantNames(nameMap)
    })
    .catch((e: any) => setError(e.message))
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const grouped = useMemo(() => {
    const map = new Map<string, { id: string; name: string; reviews: ReviewItem[]; avg: string }>()
    for (const r of reviews) {
      const id   = typeof r.restaurant === 'string' ? r.restaurant : r.restaurant?._id ?? 'unknown'
      const name = restaurantNames[id] || (typeof r.restaurant === 'string' ? r.restaurant : r.restaurant?.name ?? id)
      if (!map.has(id)) map.set(id, { id, name, reviews: [], avg: '0.0' })
      map.get(id)!.reviews.push(r)
    }
    return Array.from(map.values())
      .map((g) => ({ ...g, avg: (g.reviews.reduce((s, r) => s + r.rating, 0) / g.reviews.length).toFixed(1) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [reviews, restaurantNames])

  function toggle(id: string) {
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  function handleDelete() {
    if (!deleteTarget) return
    try {
      deleteReviewLocal(deleteTarget._id)
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id))
      showToast('Review deleted')
      setDeleteTarget(null)
    } catch (e: any) { alert(e.message) }
  }

  async function handleEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      const updated = updateReviewLocal(editTarget._id, editForm.rating, editForm.description)
      setReviews((prev) => prev.map((r) => r._id === editTarget._id ? { ...r, rating: updated.rating, description: updated.description } : r))
      showToast('Review updated')
      setEditTarget(null)
    } catch (e: any) { alert(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-zinc-500 text-sm py-12 justify-center">
      <RefreshCw size={16} className="animate-spin" /> Loading reviews…
    </div>
  )
  if (error) return (
    <div className="flex items-center gap-2 text-red-400 text-sm p-3 border border-red-900/30 bg-red-900/10 rounded">
      <AlertTriangle size={14} /> {error}
    </div>
  )
  if (grouped.length === 0) return <p className="text-zinc-600 text-sm py-12 text-center">No reviews found.</p>

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-yellow-500 text-black text-sm font-medium px-5 py-2.5 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">{reviews.length} total · {grouped.length} restaurant(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setExpanded(new Set(grouped.map((g) => g.id)))} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Expand all</button>
            <span className="text-zinc-700">·</span>
            <button onClick={() => setExpanded(new Set())} className="text-xs text-zinc-500 hover:text-yellow-500 transition">Collapse all</button>
          </div>
        </div>

        {grouped.map((group) => (
          <div key={group.id} className="border border-yellow-600/10 rounded overflow-hidden">
            <button
              onClick={() => toggle(group.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#111] hover:bg-[#141414] transition text-left"
            >
              <div className="flex items-center gap-3">
                <Store size={15} className="text-yellow-600/50 shrink-0" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">{group.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{group.reviews.length} review(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm">{group.avg}</span>
                  <span className="text-zinc-600 text-xs">avg</span>
                </div>
                {expanded.has(group.id) ? <ChevronDown size={15} className="text-zinc-500" /> : <ChevronRight size={15} className="text-zinc-500" />}
              </div>
            </button>

            {expanded.has(group.id) && (
              <div className="border-t border-yellow-600/10 divide-y divide-yellow-600/5">
                {group.reviews.map((r) => {
                  const userId = typeof r.user === 'string' ? r.user : r.user?._id ?? '—'
                  return (
                    <div key={r._id} className="px-5 py-4 bg-[#0a0a0a]">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <User size={11} className="text-yellow-600/40" />
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">User ID:</span>
                            <span className="font-mono text-zinc-400">{userId}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-base leading-none ${r.rating >= s ? 'text-yellow-400' : 'text-zinc-700'}`}>★</span>
                            ))}
                            <span className="ml-2 text-zinc-600 text-xs">{r.rating}/5</span>
                          </div>
                          {r.description && (
                            <p className="text-zinc-500 text-sm leading-relaxed">{r.description.trim()}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-zinc-700 text-[10px] tracking-wide">{dayjs(r.createdAt).format('DD MMM YYYY')}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditTarget(r); setEditForm({ rating: r.rating, description: r.description ?? '' }) }}
                              className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition rounded"
                              title="Edit"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 transition rounded"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#111] border border-yellow-600/20 w-full max-w-md rounded shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-600/10">
              <h3 className="text-yellow-500 text-base font-light">Edit Review</h3>
              <button onClick={() => setEditTarget(null)} className="text-zinc-500 hover:text-white transition"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditForm((f) => ({ ...f, rating: s }))}
                      className={`text-2xl transition ${editForm.rating >= s ? 'text-yellow-400' : 'text-zinc-700 hover:text-zinc-500'}`}
                    >★</button>
                  ))}
                  <span className="ml-2 text-zinc-500 text-sm self-center">{editForm.rating}/5</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 tracking-widest uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1a1a1a] border border-zinc-700 text-white text-sm px-3 py-2 outline-none focus:border-yellow-500 transition rounded resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-yellow-600/10 flex gap-3 justify-end">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm hover:text-white transition rounded">Cancel</button>
              <button
                onClick={handleEdit}
                disabled={saving}
                className="px-4 py-2 bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-400 transition disabled:opacity-50 flex items-center gap-2 rounded"
              >
                {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="bg-[#111] border border-red-900/40 w-full max-w-sm rounded shadow-2xl">
            <div className="px-6 py-4 border-b border-red-900/20 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-400" />
              <h3 className="text-red-400 font-light">Confirm Delete</h3>
            </div>
            <div className="px-6 py-5">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Delete this review (rating: <strong className="text-white">{deleteTarget.rating}★</strong>)?
                <br /><span className="text-zinc-600 text-xs">This action cannot be undone.</span>
              </p>
            </div>
            <div className="px-6 py-4 border-t border-red-900/20 flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 border border-zinc-700 text-zinc-400 text-sm hover:text-white transition rounded">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-500 transition flex items-center gap-2 rounded">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
